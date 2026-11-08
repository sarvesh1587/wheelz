// Transactional email templates. Inline styles only: most mail clients strip
// <style> blocks. Every value that came from a user goes through esc().

const { siteUrl: APP_URL } = require("../../utils/siteUrl");

const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const date = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "—";
const dateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      })
    : "—";

const AMBER = "#ee9106";
const INK = "#0e0e10";
const MUTED = "#6b6b70";
const LINE = "#ececec";

function layout({ preheader = "", title, intro, body = "", cta }) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f3f0;font-family:Arial,Helvetica,sans-serif;color:${INK};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f0;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:${INK};padding:22px 28px;">
<span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Wheelz<span style="color:${AMBER};">.</span></span>
</td></tr>
<tr><td style="padding:28px 28px 8px;">
<h1 style="margin:0 0 10px;font-size:24px;line-height:1.25;color:${INK};">${title}</h1>
<p style="margin:0;font-size:15px;line-height:1.6;color:${MUTED};">${intro}</p>
</td></tr>
<tr><td style="padding:12px 28px 4px;">${body}</td></tr>
${
  cta
    ? `<tr><td style="padding:12px 28px 28px;"><a href="${cta.href}" style="display:inline-block;background:${AMBER};color:${INK};font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:999px;">${esc(cta.label)}</a></td></tr>`
    : `<tr><td style="padding:8px 28px 20px;"></td></tr>`
}
<tr><td style="padding:18px 28px;border-top:1px solid ${LINE};font-size:12px;line-height:1.6;color:${MUTED};">
Wheelz · Car and bike rental · <a href="${APP_URL()}" style="color:${MUTED};">${APP_URL().replace(/^https?:\/\//, "")}</a><br>
This is an automated email about your Wheelz account.
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// Two-column key/value table.
function rows(list, { total } = {}) {
  const items = list
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:9px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${MUTED};">${esc(k)}</td><td align="right" style="padding:9px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK};">${v}</td></tr>`,
    )
    .join("");
  const totalRow = total
    ? `<tr><td style="padding:12px 0 0;font-size:15px;font-weight:700;">${esc(total[0])}</td><td align="right" style="padding:12px 0 0;font-size:18px;font-weight:800;">${total[1]}</td></tr>`
    : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 14px;">${items}${totalRow}</table>`;
}

const note = (html) =>
  `<p style="margin:6px 0 14px;padding:12px 14px;background:#fff7e8;border-radius:10px;font-size:13px;line-height:1.6;color:${INK};">${html}</p>`;

const extrasList = (extras = {}) =>
  [extras.insurance && "Insurance", extras.gps && "GPS", extras.childSeat && "Child seat", extras.driver && "Driver"]
    .filter(Boolean)
    .join(", ");

const tripRows = (b) => [
  ["Booking ref", `<b>${esc(b.bookingRef)}</b>`],
  ["Vehicle", esc(b.vehicle?.name || "")],
  ["Pickup", esc(b.pickupLocation)],
  ["From", b.rentalType === "hourly" ? dateTime(b.startDate) : date(b.startDate)],
  ["To", b.rentalType === "hourly" ? `${b.hours} hour${b.hours > 1 ? "s" : ""}` : date(b.endDate)],
  ["Extras", esc(extrasList(b.extras))],
];

// ── Customer ────────────────────────────────────────────────────────────────

exports.welcome = (user) => ({
  subject: "Welcome to Wheelz",
  html: layout({
    preheader: "Your account is ready. Find a car or bike near you.",
    title: `Welcome, ${esc(user.name)}.`,
    intro: "Your Wheelz account is ready. Rent cars and bikes from verified owners, or share a ride and split the cost.",
    body: rows([
      ["Email", esc(user.email)],
      ["Next step", "Complete KYC once to start booking"],
    ]),
    cta: { label: "Find a ride", href: `${APP_URL()}/vehicles` },
  }),
});

exports.bookingCreated = (b) => ({
  subject: `Booking received - ${b.bookingRef}`,
  html: layout({
    preheader: `We're holding ${b.vehicle?.name || "your vehicle"} for you. Complete payment to confirm.`,
    title: "Booking received.",
    intro: `Hi ${esc(b.customerDetails?.name || "there")}, we've got your booking. Complete the payment to confirm your ride.`,
    body: rows(tripRows(b), { total: ["Amount due", inr(b.finalAmount)] }) + note("Your booking is <b>pending</b> until payment is done."),
    cta: { label: "Pay now", href: `${APP_URL()}/dashboard` },
  }),
});

exports.paymentReceipt = (b, payment = {}) => {
  const extras = Math.max(0, (b.totalAmount || 0) - (b.pricePerDay || 0) * (b.totalDays || 0));
  const isHourly = b.rentalType === "hourly";
  return {
    subject: `Payment successful - Receipt ${b.bookingRef}`,
    html: layout({
      preheader: `${inr(b.finalAmount)} paid for ${b.vehicle?.name || "your booking"}.`,
      title: "Payment successful.",
      intro: `Hi ${esc(b.customerDetails?.name || "there")}, we received your payment. Here's your receipt.`,
      body:
        rows([
          ["Receipt no.", `<b>${esc(b.bookingRef)}</b>`],
          ["Paid on", dateTime(b.paidAt || new Date())],
          ["Transaction ID", esc(payment.paymentId || b.razorpayPaymentId || "")],
          ["Method", esc(payment.method || "Razorpay")],
          ["Vehicle", esc(b.vehicle?.name || "")],
          ["Period", isHourly ? `${dateTime(b.startDate)} · ${b.hours} h` : `${date(b.startDate)} → ${date(b.endDate)}`],
        ]) +
        rows(
          [
            [
              "Rental",
              isHourly ? inr(b.totalAmount - extras) : `${inr(b.pricePerDay)} × ${b.totalDays} day${b.totalDays > 1 ? "s" : ""}`,
            ],
            ["Extras", extras > 0 ? inr(extras) : ""],
            ["Discount", b.discount > 0 ? `− ${inr(b.discount)}` : ""],
          ],
          { total: ["Total paid", inr(b.finalAmount)] },
        ),
      cta: { label: "View booking", href: `${APP_URL()}/dashboard` },
    }),
  };
};

exports.rideConfirmed = (b, vendor) => ({
  subject: `Your ride is confirmed - ${b.vehicle?.name || b.bookingRef}`,
  html: layout({
    preheader: `${b.vehicle?.name || "Your vehicle"} is reserved for ${date(b.startDate)}.`,
    title: "Your ride is confirmed.",
    intro: `${esc(b.vehicle?.name || "Your vehicle")} is reserved for you. Here's everything you need for pickup.`,
    body:
      rows([
        ...tripRows(b),
        ["Owner", esc(vendor?.name || b.vendorDetails?.name || "")],
        ["Owner phone", esc(vendor?.phone || b.vendorDetails?.phone || "")],
      ]) +
      (b.pickupCode
        ? `<p style="margin:6px 0 14px;padding:16px;border:1px dashed ${AMBER};border-radius:12px;text-align:center;">
<span style="display:block;font-size:12px;color:${MUTED};letter-spacing:1px;text-transform:uppercase;">Pickup code</span>
<span style="display:block;font-size:32px;font-weight:800;letter-spacing:8px;color:${INK};">${esc(b.pickupCode)}</span>
<span style="display:block;font-size:12px;color:${MUTED};">Tell this to the owner only when you're with the vehicle. Never share it on a call.</span></p>`
        : "") +
      note("Bring your <b>original driving licence</b>; the owner will match it to your KYC. Walk around the vehicle with the owner and check their photos before you drive off."),
    cta: { label: "View trip details", href: `${APP_URL()}/dashboard` },
  }),
});

exports.bookingCancelled = (b) => ({
  subject: `Booking cancelled - ${b.bookingRef}`,
  html: layout({
    preheader: `Booking ${b.bookingRef} has been cancelled.`,
    title: "Booking cancelled.",
    intro: `Booking <b>${esc(b.bookingRef)}</b> for ${esc(b.vehicle?.name || "your vehicle")} has been cancelled.`,
    body:
      rows(tripRows(b)) +
      (b.paymentStatus === "paid" ? note("You paid for this booking. Any refund is processed to the original payment method.") : ""),
    cta: { label: "Find another ride", href: `${APP_URL()}/vehicles` },
  }),
});

// ── Vendor ──────────────────────────────────────────────────────────────────

exports.vendorNewBooking = (b, vendor) => ({
  subject: `New booking request - ${b.vehicle?.name || b.bookingRef}`,
  html: layout({
    preheader: `${b.customerDetails?.name || "A customer"} booked ${b.vehicle?.name || "your vehicle"}.`,
    title: "New booking request.",
    intro: `Hi ${esc(vendor.name)}, ${esc(b.customerDetails?.name || "a customer")} has booked your ${esc(b.vehicle?.name || "vehicle")}. It's confirmed once they pay; we'll email you then.`,
    body: rows(tripRows(b), { total: ["Booking value", inr(b.finalAmount)] }),
    cta: { label: "Open vendor dashboard", href: `${APP_URL()}/vendor/dashboard` },
  }),
});

exports.vendorBookingPaid = (b, vendor) => ({
  subject: `Booking confirmed and paid - ${b.bookingRef}`,
  html: layout({
    preheader: `Get ${b.vehicle?.name || "your vehicle"} ready for ${date(b.startDate)}.`,
    title: "Booking confirmed.",
    intro: `Hi ${esc(vendor.name)}, the customer has paid. Please have the ${esc(b.vehicle?.name || "vehicle")} ready for pickup.`,
    body:
      rows([
        ...tripRows(b),
        ["Customer", esc(b.customerDetails?.name || "")],
        ["Customer phone", esc(b.customerDetails?.phone || "")],
        ["Customer email", esc(b.customerDetails?.email || "")],
      ], { total: ["Paid", inr(b.finalAmount)] }) +
      note("Check the customer's driving licence at pickup and record the fuel level and odometer."),
    cta: { label: "Open vendor dashboard", href: `${APP_URL()}/vendor/dashboard` },
  }),
});

exports.vendorBookingCancelled = (b, vendor) => ({
  subject: `Booking cancelled - ${b.bookingRef}`,
  html: layout({
    preheader: `${b.vehicle?.name || "Your vehicle"} is free again for these dates.`,
    title: "A booking was cancelled.",
    intro: `Hi ${esc(vendor.name)}, booking <b>${esc(b.bookingRef)}</b> for your ${esc(b.vehicle?.name || "vehicle")} was cancelled. Those dates are free again.`,
    body: rows(tripRows(b)),
    cta: { label: "Open vendor dashboard", href: `${APP_URL()}/vendor/dashboard` },
  }),
});

exports.vendorApplicationReceived = (vendor) => ({
  subject: "We received your vendor application",
  html: layout({
    preheader: "Our team reviews applications within 24–48 hours.",
    title: "Application received.",
    intro: `Hi ${esc(vendor.name)}, thanks for applying to list your vehicles on Wheelz. Our team reviews applications within 24–48 hours and we'll email you as soon as you're approved.`,
    body: rows([
      ["Account type", vendor.vendorType === "business" ? "Business" : "Individual"],
      ["Business name", esc(vendor.businessDetails?.businessName || "")],
      ["Email", esc(vendor.email)],
      ["Status", "Pending review"],
    ]),
  }),
});

exports.vendorApproved = (vendor) => ({
  subject: "You're approved to list on Wheelz",
  html: layout({
    preheader: "Add your first vehicle and start earning.",
    title: "You're approved.",
    intro: `Congratulations ${esc(vendor.name)}, your vendor account is approved. You can now add vehicles and start taking bookings.`,
    cta: { label: "Add your first vehicle", href: `${APP_URL()}/vendor/dashboard` },
  }),
});

exports.vendorRevoked = (vendor) => ({
  subject: "Your Wheelz vendor account is on hold",
  html: layout({
    preheader: "Your listings are paused while we review your account.",
    title: "Your vendor account is on hold.",
    intro: `Hi ${esc(vendor.name)}, your vendor account has been set back to pending review, so you can't add or manage listings for now. Reply to this email if you think this is a mistake.`,
  }),
});

// ── Admin ───────────────────────────────────────────────────────────────────

exports.adminVendorRequest = (vendor) => ({
  subject: `New vendor request - ${vendor.businessDetails?.businessName || vendor.name}`,
  html: layout({
    preheader: `${vendor.name} wants to list vehicles on Wheelz.`,
    title: "New vendor request.",
    intro: `${esc(vendor.name)} has applied to become a vendor and is waiting for approval.`,
    body: rows([
      ["Name", esc(vendor.name)],
      ["Type", vendor.vendorType === "business" ? "Business" : "Individual"],
      ["Business name", esc(vendor.businessDetails?.businessName || "")],
      ["GST", esc(vendor.businessDetails?.gstNumber || "")],
      ["Email", esc(vendor.email)],
      ["Phone", esc(vendor.phone || "")],
      ["Applied", dateTime(vendor.createdAt || new Date())],
    ]),
    cta: { label: "Review vendor", href: `${APP_URL()}/admin/vendors` },
  }),
});

exports.adminPayment = (b, payment = {}) => ({
  subject: `Payment received Rs. ${Number(b.finalAmount || 0).toLocaleString("en-IN")} - ${b.bookingRef}`,
  html: layout({
    preheader: `${b.customerDetails?.name || "A customer"} paid for ${b.vehicle?.name || "a booking"}.`,
    title: `${inr(b.finalAmount)} received.`,
    intro: `A booking has been paid and confirmed.`,
    body: rows([
      ...tripRows(b),
      ["Customer", `${esc(b.customerDetails?.name || "")}<br><span style="color:${MUTED};">${esc(b.customerDetails?.email || "")}</span>`],
      ["Vendor", esc(b.vendorDetails?.name || "Wheelz fleet")],
      ["Transaction ID", esc(payment.paymentId || b.razorpayPaymentId || "")],
      ["Paid on", dateTime(b.paidAt || new Date())],
    ], { total: ["Amount", inr(b.finalAmount)] }),
    cta: { label: "Open admin", href: `${APP_URL()}/admin/reports` },
  }),
});

exports.vendorPayout = (vendor, payout, bookings = []) => ({
  subject: `Payout sent - Rs. ${Number(payout.amount || 0).toLocaleString("en-IN")}`,
  html: layout({
    preheader: `${inr(payout.amount)} for ${bookings.length} booking${bookings.length === 1 ? "" : "s"}.`,
    title: `${inr(payout.amount)} paid out.`,
    intro: `Hi ${esc(vendor.name)}, we've sent your earnings for ${bookings.length} finished booking${bookings.length === 1 ? "" : "s"}.`,
    body:
      rows([
        ["Paid on", dateTime(payout.paidAt)],
        ["Method", esc(String(payout.method || "").replace("_", " "))],
        ["Reference", esc(payout.reference || "")],
        ["Note", esc(payout.note || "")],
      ]) +
      rows(
        bookings.map((b) => [
          `${esc(b.bookingRef)} · ${esc(b.vehicle?.name || "")}`,
          `${inr(b.finalAmount)} − ${b.commissionRate}% = <b>${inr(b.vendorEarning)}</b>`,
        ]),
        { total: ["Total", inr(payout.amount)] },
      ),
    cta: { label: "View earnings", href: `${APP_URL()}/vendor/dashboard` },
  }),
});


// ── Handover ────────────────────────────────────────────────────────────────

const reportRows = (r) => [
  ["Recorded", dateTime(r?.at)],
  ["Odometer", r?.odometer != null ? `${Number(r.odometer).toLocaleString("en-IN")} km` : ""],
  ["Fuel", r?.fuelLevel != null ? `${r.fuelLevel}%` : ""],
  ["Photos", r?.photos?.length ? `${r.photos.length}` : ""],
  ["Notes", esc(r?.notes || "")],
];

exports.rideStarted = (b) => ({
  subject: `Ride started - ${b.vehicle?.name || b.bookingRef}`,
  html: layout({
    preheader: "Check the pickup photos and confirm the vehicle's condition.",
    title: "Your ride has started.",
    intro: `The owner recorded the pickup of ${esc(b.vehicle?.name || "your vehicle")}. Please check their photos and readings. If anything is missing or wrong, report it now so you aren't charged for it later.`,
    body: rows([["Booking ref", `<b>${esc(b.bookingRef)}</b>`], ...reportRows(b.pickupReport), ["Return by", dateTime(b.endDate)]]),
    cta: { label: "Review pickup report", href: `${APP_URL()}/dashboard` },
  }),
});

exports.rideReturned = (b, dispute, forVendor = false) => ({
  subject: `Ride completed - ${b.bookingRef}`,
  html: layout({
    preheader: dispute ? "Damage was reported at return." : "Thanks for riding with Wheelz.",
    title: "Ride completed.",
    intro: forVendor
      ? `The return of ${esc(b.vehicle?.name || "your vehicle")} is recorded. You can raise an issue for ${24} hours.`
      : `${esc(b.vehicle?.name || "Your vehicle")} has been returned. Please check the return report.${dispute ? " The owner has reported damage; you can respond from your dashboard." : ""}`,
    body:
      rows([
        ["Booking ref", `<b>${esc(b.bookingRef)}</b>`],
        ...reportRows(b.returnReport),
        ["Distance driven", b.returnReport?.kmDriven != null ? `${b.returnReport.kmDriven} km` : ""],
        ["Returned late by", b.returnReport?.lateMinutes > 0 ? `${Math.round(b.returnReport.lateMinutes / 60)} h ${b.returnReport.lateMinutes % 60} min` : ""],
      ]) + (dispute ? note(`<b>Damage reported:</b> ${esc(dispute.description)}${dispute.amountClaimed ? ` (claimed ${inr(dispute.amountClaimed)})` : ""}`) : ""),
    cta: { label: forVendor ? "Open vendor dashboard" : "Review return report", href: `${APP_URL()}/${forVendor ? "vendor/dashboard" : "dashboard"}` },
  }),
});

const DISPUTE_TYPES = {
  damage: "Damage",
  fuel: "Fuel",
  late_return: "Late return",
  extra_km: "Extra distance",
  cleanliness: "Cleanliness",
  not_as_described: "Report disputed",
  theft: "Theft / not returned",
  other: "Other",
};

exports.disputeOpened = (b, d, audience) => ({
  subject: `${audience === "admin" ? "New dispute" : "An issue was raised"} - ${b.bookingRef}`,
  html: layout({
    preheader: `${DISPUTE_TYPES[d.type] || "Issue"} on ${b.vehicle?.name || "a booking"}.`,
    title: audience === "admin" ? "New dispute to review." : "An issue was raised on your booking.",
    intro:
      audience === "admin"
        ? `The ${esc(d.raisedByRole)} raised an issue on booking <b>${esc(b.bookingRef)}</b>.`
        : `The ${d.raisedByRole === "customer" ? "renter" : "owner"} raised an issue on booking <b>${esc(b.bookingRef)}</b>. You can add your side from your dashboard; our team decides within 2 working days.`,
    body: rows([
      ["Type", DISPUTE_TYPES[d.type] || d.type],
      ["Details", esc(d.description)],
      ["Amount claimed", d.amountClaimed ? inr(d.amountClaimed) : ""],
      ["Photos", d.photos?.length ? `${d.photos.length}` : ""],
    ]),
    cta: {
      label: audience === "admin" ? "Review dispute" : "Respond",
      href: `${APP_URL()}/${audience === "admin" ? "admin/disputes" : audience === "vendor" ? "vendor/dashboard" : "dashboard"}`,
    },
  }),
});

exports.disputeResolved = (b, d) => ({
  subject: `Dispute ${d.status === "resolved" ? "decided" : "closed"} - ${b.bookingRef}`,
  html: layout({
    preheader: d.resolution?.note || "",
    title: d.status === "resolved" ? "We've decided the dispute." : "The dispute was closed.",
    intro: `Our team reviewed the ${esc((DISPUTE_TYPES[d.type] || "issue").toLowerCase())} raised on booking <b>${esc(b.bookingRef)}</b>.`,
    body: rows([
      ["Decision", d.status === "resolved" ? "Upheld" : "Rejected"],
      ["Amount", d.status === "resolved" && d.resolution?.amountAwarded ? inr(d.resolution.amountAwarded) : ""],
      ["Reason", esc(d.resolution?.note || "")],
    ]),
  }),
});

// Tiered overdue alerts: level 1 to renter and owner, level 2 to admins.
exports.overdue = (b, level, audience) => {
  const late = Math.max(1, Math.round((Date.now() - new Date(b.endDate)) / 3600000));
  const toRenter = audience === "customer";
  return {
    subject: `${level >= 2 ? "URGENT: " : ""}Vehicle not returned - ${b.bookingRef}`,
    html: layout({
      preheader: `${b.vehicle?.name || "The vehicle"} is ${late} hour${late === 1 ? "" : "s"} past its return time.`,
      title: toRenter ? "Your rental is overdue." : `${esc(b.vehicle?.name || "Vehicle")} is overdue.`,
      intro: toRenter
        ? `${esc(b.vehicle?.name || "Your vehicle")} was due back on ${dateTime(b.endDate)}. Please return it now or call the owner. Late returns are charged, and a vehicle not returned may be reported to the police.`
        : level >= 2
          ? `Booking <b>${esc(b.bookingRef)}</b> is ${late} hours overdue with no return recorded. Call the renter, and if they can't be reached, treat it as a possible theft: share the KYC details with the police and file an FIR.`
          : `Booking <b>${esc(b.bookingRef)}</b> was due back ${late} hour${late === 1 ? "" : "s"} ago. Contact the renter. If you already have the vehicle, record the return so this stops.`,
      body: rows([
        ["Booking ref", `<b>${esc(b.bookingRef)}</b>`],
        ["Vehicle", esc(b.vehicle?.name || "")],
        ["Due back", dateTime(b.endDate)],
        ["Renter", toRenter ? "" : `${esc(b.customerDetails?.name || "")} · ${esc(b.customerDetails?.phone || "")}`],
        ["Owner", esc(b.vendorDetails?.name || "")],
        ["Owner phone", esc(b.vendorDetails?.phone || "")],
      ]),
      cta: { label: toRenter ? "View booking" : "Open bookings", href: `${APP_URL()}/${toRenter ? "dashboard" : audience === "admin" ? "admin/disputes" : "vendor/dashboard"}` },
    }),
  };
};
