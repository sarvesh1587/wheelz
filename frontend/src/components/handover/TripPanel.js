import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Copy, MapPin, ShieldCheck } from "lucide-react";
import { handoverAPI } from "../../services/api";
import { Row, StatusPill, Spinner } from "../ui";
import PhotoSlots, { appendPhotos } from "./PhotoSlots";

const dt = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—");
const inr = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
export const lateText = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);

export const DISPUTE_TYPES = {
  damage: "Damage",
  fuel: "Fuel",
  late_return: "Late return",
  extra_km: "Extra distance",
  cleanliness: "Cleanliness",
  not_as_described: "Report disputed",
  theft: "Theft / not returned",
  other: "Other",
};
const ACK = { pending: ["Awaiting renter", "pending"], agreed: ["Renter agreed", "positive"], disputed: ["Renter disputed", "negative"] };

export function PhotoGrid({ photos = [] }) {
  if (!photos.length) return null;
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {photos.map((p, i) => (
        <a key={i} href={p.url} target="_blank" rel="noreferrer" className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-raised">
          <img src={p.url} alt={p.label} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">{p.label}</span>
        </a>
      ))}
    </div>
  );
}

export function ReportView({ title, report }) {
  if (!report?.at) return null;
  const [ackLabel, ackTone] = ACK[report.customerAck?.status || "pending"];
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="eyebrow">{title}</h4>
        <StatusPill tone={ackTone}>{ackLabel}</StatusPill>
      </div>
      <div className="text-sm">
        <Row label="Recorded">{dt(report.at)}</Row>
        <Row label="Odometer">{Number(report.odometer).toLocaleString("en-IN")} km</Row>
        <Row label="Fuel / charge">{report.fuelLevel}%</Row>
        {report.kmDriven != null && <Row label="Distance driven">{report.kmDriven} km</Row>}
        {report.lateMinutes > 0 && <Row label="Returned late">{lateText(report.lateMinutes)}</Row>}
        {report.notes && <Row label="Notes">{report.notes}</Row>}
        {report.location?.lat && (
          <Row label="Location">
            <a href={`https://maps.google.com/?q=${report.location.lat},${report.location.lng}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-accent">
              <MapPin size={12} /> Open map
            </a>
          </Row>
        )}
        {report.customerAck?.note && <Row label="Renter's note">{report.customerAck.note}</Row>}
      </div>
      <PhotoGrid photos={report.photos} />
    </section>
  );
}

function IssueForm({ role, onSubmit, submitLabel = "Raise issue", withType = true, placeholder }) {
  const [type, setType] = useState(role === "vendor" ? "damage" : "other");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [photos, setPhotos] = useState({});
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (description.trim().length < 10) return toast.error("Describe it in a few words");
    setSaving(true);
    const fd = new FormData();
    appendPhotos(fd, photos);
    fd.append("type", type);
    fd.append("description", description);
    fd.append("note", description);
    if (amount) fd.append("amountClaimed", amount);
    try {
      await onSubmit(fd);
      setDescription("");
      setAmount("");
      setPhotos({});
    } finally {
      setSaving(false);
    }
  };
  const types = role === "vendor" ? ["damage", "fuel", "late_return", "extra_km", "cleanliness", "theft", "other"] : ["not_as_described", "damage", "cleanliness", "other"];
  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line/10 p-4">
      {withType && (
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button key={t} type="button" onClick={() => setType(t)} aria-pressed={type === t} className={`chip !py-1 text-xs ${type === t ? "!border-ink !text-ink" : ""}`}>
              {DISPUTE_TYPES[t]}
            </button>
          ))}
        </div>
      )}
      <textarea className="field min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={placeholder || "What happened? Refer to photos where you can."} />
      {withType && role !== "customer" && (
        <input inputMode="numeric" className="field" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount claimed (₹, optional)" />
      )}
      <PhotoSlots slots={[]} value={photos} onChange={setPhotos} />
      <button type="submit" disabled={saving} className="btn-primary !py-2 text-sm">
        {saving ? <Spinner /> : submitLabel}
      </button>
    </form>
  );
}

// Everything about a booking's handover for the renter or the owner.
export default function TripPanel({ bookingId, onChanged }) {
  const [data, setData] = useState(null);
  const [acking, setAcking] = useState(null); // "pickup" | "return" while objecting
  const [raising, setRaising] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    handoverAPI
      .get(bookingId)
      .then((res) => setData(res.data.handover))
      .catch((err) => toast.error(err.response?.data?.message || "Couldn't load trip details"));
  }, [bookingId]);
  useEffect(() => {
    load();
  }, [load]);

  const after = (message) => {
    toast.success(message);
    setAcking(null);
    setRaising(false);
    load();
    onChanged?.();
  };
  const fail = (err) => toast.error(err.response?.data?.message || "Something went wrong");

  const agree = async (stage) => {
    setBusy(true);
    const fd = new FormData();
    fd.append("stage", stage);
    fd.append("agree", "true");
    try {
      const res = await handoverAPI.acknowledge(bookingId, fd);
      after(res.data.message);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  if (!data) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  const { role } = data;
  const isCustomer = role === "customer";
  const ackPending = (r) => isCustomer && r?.at && (!r.customerAck?.status || r.customerAck.status === "pending");

  return (
    <div className="space-y-8">
      {data.pickupCode && data.status === "confirmed" && (
        <section className="rounded-2xl border border-dashed border-accent p-5 text-center">
          <p className="eyebrow">Pickup code</p>
          <button type="button" onClick={() => navigator.clipboard?.writeText(data.pickupCode).then(() => toast.success("Copied"))} className="display mt-2 inline-flex items-center gap-3 font-mono text-4xl tracking-[0.3em]">
            {data.pickupCode} <Copy size={16} className="text-muted" />
          </button>
          <p className="mx-auto mt-3 max-w-sm text-xs text-muted">
            <ShieldCheck size={12} className="-mt-0.5 mr-1 inline" />
            Give this to the owner only in person, after you've both checked the vehicle and they've seen your licence. Never share it on a call or message.
          </p>
        </section>
      )}

      {!data.pickupReport && !data.pickupCode && <p className="text-sm text-muted">The pickup hasn't been recorded yet.</p>}

      <ReportView title="At pickup" report={data.pickupReport} />
      {ackPending(data.pickupReport) && acking !== "pickup" && (
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => agree("pickup")} className="btn-primary !py-2 text-sm">Looks right</button>
          <button type="button" onClick={() => setAcking("pickup")} className="chip">Report a problem</button>
        </div>
      )}
      {acking === "pickup" && (
        <IssueForm role={role} withType={false} submitLabel="Send" placeholder="What's wrong with the pickup report? e.g. a scratch not in the photos"
          onSubmit={async (fd) => { fd.append("stage", "pickup"); fd.append("agree", "false"); try { after((await handoverAPI.acknowledge(bookingId, fd)).data.message); } catch (e) { fail(e); } }} />
      )}

      <ReportView title="At return" report={data.returnReport} />
      {ackPending(data.returnReport) && acking !== "return" && (
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => agree("return")} className="btn-primary !py-2 text-sm">Looks right</button>
          <button type="button" onClick={() => setAcking("return")} className="chip">Report a problem</button>
        </div>
      )}
      {acking === "return" && (
        <IssueForm role={role} withType={false} submitLabel="Send" placeholder="What's wrong with the return report?"
          onSubmit={async (fd) => { fd.append("stage", "return"); fd.append("agree", "false"); try { after((await handoverAPI.acknowledge(bookingId, fd)).data.message); } catch (e) { fail(e); } }} />
      )}

      {data.disputes.length > 0 && (
        <section className="space-y-4">
          <h4 className="eyebrow">Issues</h4>
          {data.disputes.map((d) => (
            <DisputeCard key={d._id} d={d} role={role} bookingId={bookingId} onDone={after} onFail={fail} />
          ))}
        </section>
      )}

      {data.canDispute && !raising && (
        <button type="button" onClick={() => setRaising(true)} className="link-underline text-sm text-muted hover:text-ink">
          Report an issue with this ride
        </button>
      )}
      {raising && (
        <IssueForm role={role} onSubmit={async (fd) => { try { after((await handoverAPI.raise(bookingId, fd)).data.message); } catch (e) { fail(e); } }} />
      )}
    </div>
  );
}

function DisputeCard({ d, role, bookingId, onDone, onFail }) {
  const [replying, setReplying] = useState(false);
  const mine = d.raisedByRole === role;
  return (
    <article className="space-y-3 rounded-2xl border border-line/10 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">
          {DISPUTE_TYPES[d.type] || d.type} · <span className="text-muted">raised by {mine ? "you" : d.raisedByRole === "customer" ? "the renter" : "the owner"}</span>
        </p>
        <StatusPill status={d.status === "open" ? "pending" : d.status === "resolved" ? "confirmed" : "rejected"}>{d.status}</StatusPill>
      </div>
      <p>{d.description}</p>
      {d.amountClaimed > 0 && <p className="text-muted">Claimed: {inr(d.amountClaimed)}</p>}
      <PhotoGrid photos={d.photos} />
      {d.response?.note && (
        <div className="rounded-xl bg-raised p-3">
          <p className="eyebrow mb-1">Response</p>
          <p>{d.response.note}</p>
          <PhotoGrid photos={d.response.photos} />
        </div>
      )}
      {d.resolution?.note && (
        <div className="rounded-xl border border-accent/40 p-3">
          <p className="eyebrow mb-1">Wheelz decision</p>
          <p>{d.resolution.note}</p>
          {d.resolution.amountAwarded > 0 && <p className="mt-1 font-medium">Amount: {inr(d.resolution.amountAwarded)}</p>}
        </div>
      )}
      {d.status === "open" && !mine && !d.response?.note && role !== "admin" && (
        replying ? (
          <IssueForm role={role} withType={false} submitLabel="Send response" placeholder="Your side, with photos if you have them"
            onSubmit={async (fd) => { try { onDone((await handoverAPI.respond(bookingId, d._id, fd)).data.message); } catch (e) { onFail(e); } }} />
        ) : (
          <button type="button" onClick={() => setReplying(true)} className="chip">Respond</button>
        )
      )}
    </article>
  );
}

