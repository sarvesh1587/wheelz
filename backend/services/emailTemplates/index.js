// Transactional email templates. Inline styles only: most mail clients strip
// <style> blocks. Every value that came from a user goes through esc().

const APP_URL = () => process.env.FRONTEND_URL || "https://wheelz-sand.vercel.app";

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
  subject: `Booking received · ${b.bookingRef}`,
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
    subject: `Payment successful · Receipt ${b.bookingRef}`,
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
  subject: `Your ride is confirmed · ${b.vehicle?.name || b.bookingRef}`,
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
      note("Bring your <b>original driving licence</b> and a government ID. Check the vehicle and note any damage before you drive off."),
    cta: { label: "View trip details", href: `${APP_URL()}/dashboard` },
  }),
});

exports.bookingCancelled = (b) => ({
  subject: `Booking cancelled · ${b.bookingRef}`,
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
  subject: `New booking request · ${b.vehicle?.name || b.bookingRef}`,
  html: layout({
    preheader: `${b.customerDetails?.name || "A customer"} booked ${b.vehicle?.name || "your vehicle"}.`,
    title: "New booking request.",
    intro: `Hi ${esc(vendor.name)}, ${esc(b.customerDetails?.name || "a customer")} has booked your ${esc(b.vehicle?.name || "vehicle")}. It's confirmed once they pay; we'll email you then.`,
    body: rows(tripRows(b), { total: ["Booking value", inr(b.finalAmount)] }),
    cta: { label: "Open vendor dashboard", href: `${APP_URL()}/vendor/dashboard` },
  }),
});

exports.vendorBookingPaid = (b, vendor) => ({
  subject: `Booking confirmed and paid · ${b.bookingRef}`,
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
  subject: `Booking cancelled · ${b.bookingRef}`,
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
  subject: `New vendor request · ${vendor.businessDetails?.businessName || vendor.name}`,
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
  subject: `Payment received ${inr(b.finalAmount)} · ${b.bookingRef}`,
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
