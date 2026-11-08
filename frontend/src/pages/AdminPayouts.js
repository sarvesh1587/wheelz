import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Copy } from "lucide-react";
import { adminAPI } from "../services/api";
import { PageHeader, Panel, Row, Stat, Modal, Empty, PageLoader, Spinner, Segmented } from "../components/ui";

const inr = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
const date = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
const METHODS = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];

function copy(text, label) {
  navigator.clipboard?.writeText(text).then(
    () => toast.success(`${label} copied`),
    () => toast.error("Couldn't copy"),
  );
}

// Admin: pay vendors what they've earned from finished, paid rentals.
export default function AdminPayouts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null); // vendor row being paid
  const [form, setForm] = useState({ method: "bank_transfer", reference: "", note: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await adminAPI.getPayouts();
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openPay = (v) => {
    setForm({ method: "bank_transfer", reference: "", note: "" });
    setPaying(v);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.method !== "cash" && !form.reference.trim()) {
      toast.error("Add the UTR or transaction reference");
      return;
    }
    setSaving(true);
    try {
      const res = await adminAPI.createPayout({ vendorId: paying._id, ...form });
      toast.success(res.data.message);
      setPaying(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record payout");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader label="Loading payouts" />;

  const vendors = data?.vendors || [];
  const owed = vendors.filter((v) => v.summary.ready > 0);
  const totals = vendors.reduce(
    (t, v) => ({ ready: t.ready + v.summary.ready, upcoming: t.upcoming + v.summary.upcoming, commission: t.commission + v.summary.commission, paidOut: t.paidOut + v.summary.paidOut }),
    { ready: 0, upcoming: 0, commission: 0, paidOut: 0 },
  );

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader index="01" eyebrow="Admin" title={["Payouts."]} lede="Send vendors what they've earned once paid rides finish, and keep a record of every transfer." />

      <div className="mb-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        <Stat label="To pay now" value={inr(totals.ready)} hint={`${owed.length} vendor${owed.length === 1 ? "" : "s"}`} />
        <Stat label="Upcoming" value={inr(totals.upcoming)} hint="Paid rides still running" />
        <Stat label="Paid out" value={inr(totals.paidOut)} />
        <Stat label="Wheelz commission" value={inr(totals.commission)} hint="On paid bookings" />
      </div>

      <Panel index="02" title="Vendors" className="mb-10" bodyClassName="-mx-6 overflow-x-auto md:-mx-8">
        {vendors.length === 0 ? (
          <div className="px-6 md:px-8">
            <Empty title="No vendors yet.">Vendors appear here once they register.</Empty>
          </div>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                <th className="px-6 pb-3 font-normal md:pl-8">Vendor</th>
                <th className="pb-3 font-normal">Bank account</th>
                <th className="pb-3 text-right font-normal">Upcoming</th>
                <th className="pb-3 text-right font-normal">Paid out</th>
                <th className="pb-3 text-right font-normal">To pay</th>
                <th className="px-6 pb-3 md:pr-8" />
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v._id} className="border-t border-line/10 align-top">
                  <td className="px-6 py-4 md:pl-8">
                    <p className="font-medium">{v.businessName || v.name}</p>
                    <p className="text-xs text-muted">{v.email} · {v.commissionRate}% commission</p>
                  </td>
                  <td className="py-4 text-xs text-muted">
                    {v.bank.accountNumber ? (
                      <>
                        <p className="text-ink">{v.bank.accountHolderName}</p>
                        <p>{v.bank.bankName} · {v.bank.ifscCode}</p>
                        <p>•••• {v.bank.accountNumber.slice(-4)}</p>
                      </>
                    ) : (
                      "Not added"
                    )}
                  </td>
                  <td className="py-4 text-right text-muted">{inr(v.summary.upcoming)}</td>
                  <td className="py-4 text-right text-muted">{inr(v.summary.paidOut)}</td>
                  <td className="py-4 text-right">
                    <p className="font-semibold">{inr(v.summary.ready)}</p>
                    {v.summary.readyCount > 0 && <p className="text-xs text-muted">{v.summary.readyCount} ride{v.summary.readyCount === 1 ? "" : "s"}</p>}
                  </td>
                  <td className="px-6 py-4 text-right md:pr-8">
                    <button type="button" onClick={() => openPay(v)} disabled={v.summary.ready <= 0} className="btn-primary !px-4 !py-2 text-xs disabled:opacity-40">
                      Mark paid
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel index="03" title="Recent payouts">
        {(data?.payouts || []).length === 0 ? (
          <p className="text-sm text-muted">No payouts recorded yet.</p>
        ) : (
          data.payouts.map((p) => (
            <Row key={p._id} label={`${date(p.paidAt)} · ${p.vendor?.name || "Vendor"} · ${p.method.replace("_", " ")}${p.reference ? ` · ${p.reference}` : ""}`} strong>
              {inr(p.amount)}
            </Row>
          ))
        )}
      </Panel>

      <Modal open={!!paying} onClose={() => !saving && setPaying(null)} eyebrow="Record payout" title={paying ? `Pay ${paying.businessName || paying.name}` : ""}>
        {paying && (
          <form onSubmit={submit} className="space-y-6">
            <div>
              <Row label="Amount" strong>{inr(paying.summary.ready)}</Row>
              <Row label="Bookings">{paying.summary.readyCount}</Row>
              {paying.bank.accountNumber && (
                <>
                  <Row label="Account holder">{paying.bank.accountHolderName}</Row>
                  <Row label="Account number">
                    <button type="button" onClick={() => copy(paying.bank.accountNumber, "Account number")} className="inline-flex items-center gap-1.5 hover:text-accent">
                      {paying.bank.accountNumber} <Copy size={12} />
                    </button>
                  </Row>
                  <Row label="IFSC">
                    <button type="button" onClick={() => copy(paying.bank.ifscCode, "IFSC")} className="inline-flex items-center gap-1.5 hover:text-accent">
                      {paying.bank.ifscCode} <Copy size={12} />
                    </button>
                  </Row>
                  <Row label="Bank">{paying.bank.bankName}</Row>
                </>
              )}
            </div>
            <p className="text-xs text-muted">Send the money first, then record it here. The vendor gets an email with the breakdown.</p>
            <div>
              <p className="field-label mb-2">Method</p>
              <Segmented options={METHODS} value={form.method} onChange={(method) => setForm({ ...form, method })} />
            </div>
            <div>
              <label className="field-label" htmlFor="payout-ref">UTR / reference</label>
              <input id="payout-ref" className="field" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. 412345678901" />
            </div>
            <div>
              <label className="field-label" htmlFor="payout-note">Note (optional)</label>
              <input id="payout-note" className="field" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
              {saving ? <Spinner /> : `Record ${inr(paying.summary.ready)} payout`}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
