import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminAPI } from "../services/api";
import { PageHeader, Panel, Row, StatusPill, Segmented, Spinner, Empty, PageLoader } from "../components/ui";
import { DISPUTE_TYPES, PhotoGrid } from "../components/handover/TripPanel";

const inr = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
const dt = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—");
const FILTERS = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Upheld" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
];

function Report({ title, r }) {
  if (!r?.at) return <p className="text-xs text-muted">{title}: not recorded</p>;
  return (
    <div className="space-y-2">
      <p className="eyebrow">{title}</p>
      <p className="text-xs text-muted">
        {dt(r.at)} · {Number(r.odometer).toLocaleString("en-IN")} km · fuel {r.fuelLevel}%
        {r.kmDriven != null ? ` · ${r.kmDriven} km driven` : ""}
        {r.lateMinutes > 0 ? ` · ${Math.round(r.lateMinutes / 60)} h late` : ""}
      </p>
      <PhotoGrid photos={r.photos} />
    </div>
  );
}

// One dispute with the evidence from both handovers side by side.
function DisputeItem({ d, onResolved }) {
  const [decision, setDecision] = useState("resolved");
  const [amount, setAmount] = useState(d.amountClaimed || "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const b = d.booking || {};

  const resolve = async (e) => {
    e.preventDefault();
    if (!note.trim()) return toast.error("Write the reason; both sides will see it");
    setSaving(true);
    try {
      const res = await adminAPI.resolveDispute(d._id, { decision, amountAwarded: decision === "resolved" ? amount : 0, note });
      toast.success(res.data.message);
      onResolved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save the decision");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      title={`${b.bookingRef || "Booking"} · ${b.vehicle?.name || ""}`}
      action={<StatusPill status={d.status === "open" ? "pending" : d.status === "resolved" ? "confirmed" : "rejected"}>{d.status}</StatusPill>}
      className="mb-6"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 text-sm">
          <div>
            <Row label="Type">{DISPUTE_TYPES[d.type] || d.type}</Row>
            <Row label="Raised by">
              {d.raisedBy?.name} ({d.raisedByRole}) · {dt(d.createdAt)}
            </Row>
            <Row label="Renter">{b.customerDetails?.name} · {b.customerDetails?.phone}</Row>
            <Row label="Owner">{b.vendorDetails?.name || "Wheelz fleet"} {b.vendorDetails?.phone ? `· ${b.vendorDetails.phone}` : ""}</Row>
            <Row label="Booking value">{inr(b.finalAmount)}</Row>
            {d.amountClaimed > 0 && <Row label="Claimed" strong>{inr(d.amountClaimed)}</Row>}
          </div>
          <p className="rounded-xl bg-raised p-3">{d.description}</p>
          <PhotoGrid photos={d.photos} />
          {d.response?.note && (
            <div className="rounded-xl border border-line/10 p-3">
              <p className="eyebrow mb-1">Other side's response · {dt(d.response.at)}</p>
              <p>{d.response.note}</p>
              <PhotoGrid photos={d.response.photos} />
            </div>
          )}
          {d.resolution?.note && (
            <div className="rounded-xl border border-accent/40 p-3">
              <p className="eyebrow mb-1">Decision · {dt(d.resolution.at)}</p>
              <p>{d.resolution.note}</p>
              {d.resolution.amountAwarded > 0 && <p className="mt-1 font-medium">{inr(d.resolution.amountAwarded)}</p>}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <Report title="Pickup" r={b.pickupReport} />
          <Report title="Return" r={b.returnReport} />
        </div>
      </div>

      {d.status === "open" && (
        <form onSubmit={resolve} className="mt-8 grid gap-4 border-t border-line/10 pt-6 md:grid-cols-[auto_10rem_1fr_auto] md:items-end">
          <Segmented options={[{ value: "resolved", label: "Uphold" }, { value: "rejected", label: "Reject" }]} value={decision} onChange={setDecision} />
          <input inputMode="numeric" className="field" value={decision === "resolved" ? amount : ""} disabled={decision !== "resolved"} onChange={(e) => setAmount(e.target.value)} placeholder="Amount ₹" />
          <input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason, e.g. scratch visible in return photo 3, not at pickup" />
          <button type="submit" disabled={saving} className="btn-primary">{saving ? <Spinner /> : "Decide"}</button>
        </form>
      )}
    </Panel>
  );
}

export default function AdminDisputes() {
  const [status, setStatus] = useState("open");
  const [disputes, setDisputes] = useState(null);

  const load = (s = status) => {
    setDisputes(null);
    adminAPI
      .getDisputes(s || undefined)
      .then((res) => setDisputes(res.data.disputes))
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to load disputes");
        setDisputes([]);
      });
  };
  useEffect(() => {
    load(status);
  }, [status]);

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader
        index="01"
        eyebrow="Admin"
        title={["Disputes."]}
        lede="Damage, fuel and late-return issues from rentals. Compare pickup and return photos, then decide. Both sides are emailed the outcome."
        actions={<Segmented options={FILTERS} value={status} onChange={setStatus} />}
      />
      {disputes === null ? (
        <PageLoader label="Loading disputes" />
      ) : disputes.length === 0 ? (
        <Empty title={status === "open" ? "Nothing to decide." : "No disputes here."}>Issues raised at pickup or return show up here.</Empty>
      ) : (
        disputes.map((d) => <DisputeItem key={d._id} d={d} onResolved={() => load(status)} />)
      )}
    </div>
  );
}
