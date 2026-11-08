import React from "react";
import { Banknote, Info } from "lucide-react";
import { Panel, Row, Stat, StatusPill, Empty } from "../ui";

const inr = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
const date = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");

export const STAGES = {
  upcoming: { label: "Upcoming", tone: "pending" },
  on_hold: { label: "On hold (issue open)", tone: "negative" },
  ready: { label: "Ready for payout", tone: "positive" },
  paid_out: { label: "Paid out", tone: "neutral" },
  unpaid: { label: "Awaiting payment", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "negative" },
};

// Vendor's money view: what they've earned, Wheelz's cut, what's been paid
// out and what is on its way.
export default function EarningsTab({ data }) {
  if (!data) return <Empty title="Earnings unavailable.">We couldn't load your earnings. Try refreshing the page.</Empty>;

  const { summary, commissionRate, bookings, payouts, bank } = data;
  const earning = bookings.filter((b) => ["upcoming", "on_hold", "ready", "paid_out"].includes(b.earningStage));

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        <Stat label="Your earnings" value={inr(summary.net)} hint={`${summary.paidBookings} paid booking${summary.paidBookings === 1 ? "" : "s"}`} />
        <Stat label="Ready for payout" value={inr(summary.ready)} hint={`${summary.readyCount} finished ride${summary.readyCount === 1 ? "" : "s"}`} />
        <Stat label="Upcoming" value={inr(summary.upcoming + (summary.onHold || 0))} hint={summary.onHold ? `${inr(summary.onHold)} on hold for an open issue` : "Rides not finished yet"} />
        <Stat label="Paid out" value={inr(summary.paidOut)} hint={`${payouts.length} payout${payouts.length === 1 ? "" : "s"}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="How it adds up" className="lg:col-span-2">
          <Row label="Customers paid">{inr(summary.gross)}</Row>
          <Row label={`Wheelz commission (${commissionRate}%)`}>− {inr(summary.commission)}</Row>
          <Row label="Your earnings" strong>{inr(summary.net)}</Row>
          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted">
            <Info size={14} className="mt-0.5 shrink-0" />
            Earnings become ready for payout 24 hours after you record the return (3 days after the end date if you
            don't), and wait while an issue is open. Wheelz sends them to your bank account and emails you the details.
          </p>
        </Panel>

        <Panel title="Payout account">
          {bank.accountLast4 ? (
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-raised">
                <Banknote size={18} className="text-accent" />
              </span>
              <div className="text-sm">
                <p className="font-medium">{bank.bankName || "Bank account"}</p>
                <p className="text-muted">•••• {bank.accountLast4} · {bank.ifscCode}</p>
                <p className="text-muted">{bank.accountHolderName}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">No bank account on file. Contact support to add one.</p>
          )}
        </Panel>
      </div>

      <Panel title="Earnings by booking" bodyClassName="-mx-6 overflow-x-auto md:-mx-8">
        {earning.length === 0 ? (
          <p className="px-6 text-sm text-muted md:px-8">No paid bookings yet. Earnings show up here once customers pay.</p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                <th className="px-6 pb-3 font-normal md:pl-8">Booking</th>
                <th className="pb-3 font-normal">Dates</th>
                <th className="pb-3 text-right font-normal">Paid</th>
                <th className="pb-3 text-right font-normal">Commission</th>
                <th className="pb-3 text-right font-normal">You earn</th>
                <th className="px-6 pb-3 text-right font-normal md:pr-8">Status</th>
              </tr>
            </thead>
            <tbody>
              {earning.map((b) => (
                <tr key={b._id} className="border-t border-line/10">
                  <td className="px-6 py-3 md:pl-8">
                    <p className="font-medium">{b.vehicle?.name || "Vehicle"}</p>
                    <p className="font-mono text-[11px] text-muted">{b.bookingRef} · {b.customerName}</p>
                  </td>
                  <td className="py-3 text-muted">{date(b.startDate)} – {date(b.endDate)}</td>
                  <td className="py-3 text-right">{inr(b.finalAmount)}</td>
                  <td className="py-3 text-right text-muted">− {inr(b.commissionAmount)} <span className="text-[11px]">({b.commissionRate}%)</span></td>
                  <td className="py-3 text-right font-medium">{inr(b.vendorEarning)}</td>
                  <td className="px-6 py-3 text-right md:pr-8">
                    <StatusPill tone={STAGES[b.earningStage]?.tone}>{STAGES[b.earningStage]?.label}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Payout history">
        {payouts.length === 0 ? (
          <p className="text-sm text-muted">No payouts yet.</p>
        ) : (
          payouts.map((p) => (
            <Row key={p._id} label={`${date(p.paidAt)} · ${p.bookings.length} booking${p.bookings.length === 1 ? "" : "s"}${p.reference ? ` · Ref ${p.reference}` : ""}`} strong>
              {inr(p.amount)}
            </Row>
          ))
        )}
      </Panel>
    </div>
  );
}
