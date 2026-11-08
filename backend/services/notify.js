// Who gets which email. Controllers call these and move on: every function
// catches its own errors so a mail problem never breaks a booking or payment.
const sendEmail = require("./emailService");
const tpl = require("./emailTemplates");
const User = require("../models/User");

// ADMIN_EMAIL (comma separated) plus every admin account, without duplicates.
async function adminEmails() {
  const fromEnv = (process.env.ADMIN_EMAIL || "hm2300439@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const admins = await User.find({ role: "admin", isActive: { $ne: false } }).select("email").lean();
  return [...new Set([...fromEnv, ...admins.map((a) => a.email?.toLowerCase()).filter(Boolean)])];
}

// Booking with vehicle loaded, plus the vehicle's owner if a vendor listed it.
async function loadBooking(booking) {
  if (!booking.vehicle?.name) await booking.populate("vehicle");
  let vendor = null;
  const vendorId = booking.vehicle?.vendor?._id || booking.vehicle?.vendor;
  if (vendorId) vendor = await User.findById(vendorId).select("name email phone role").lean();
  if (vendor && vendor.role !== "vendor") vendor = null; // admin-owned fleet
  return { b: booking, vendor };
}

const send = (to, { subject, html }) => sendEmail({ to, subject, html });

function safely(name, fn) {
  return (...args) =>
    Promise.resolve()
      .then(() => fn(...args))
      .catch((err) => console.error(`❌ notify.${name} failed:`, err.message));
}

exports.welcome = safely("welcome", (user) => send(user.email, tpl.welcome(user)));

exports.bookingCreated = safely("bookingCreated", async (booking) => {
  const { b, vendor } = await loadBooking(booking);
  await Promise.all([
    send(b.customerDetails?.email, tpl.bookingCreated(b)),
    vendor && send(vendor.email, tpl.vendorNewBooking(b, vendor)),
  ]);
});

// Payment done: receipt and ride confirmation to the customer, a heads-up to
// the vendor and a payment alert to the admins.
exports.paymentSucceeded = safely("paymentSucceeded", async (booking, payment = {}) => {
  const { b, vendor } = await loadBooking(booking);
  const customer = b.customerDetails?.email || (await User.findById(b.user).select("email").lean())?.email;
  const admins = await adminEmails();
  await Promise.all([
    send(customer, tpl.paymentReceipt(b, payment)),
    send(customer, tpl.rideConfirmed(b, vendor)),
    vendor && send(vendor.email, tpl.vendorBookingPaid(b, vendor)),
    send(admins, tpl.adminPayment(b, payment)),
  ]);
});

exports.bookingCancelled = safely("bookingCancelled", async (booking) => {
  const { b, vendor } = await loadBooking(booking);
  await Promise.all([
    send(b.customerDetails?.email, tpl.bookingCancelled(b)),
    vendor && send(vendor.email, tpl.vendorBookingCancelled(b, vendor)),
  ]);
});

exports.vendorApplied = safely("vendorApplied", async (vendor) => {
  const admins = await adminEmails();
  await Promise.all([send(vendor.email, tpl.vendorApplicationReceived(vendor)), send(admins, tpl.adminVendorRequest(vendor))]);
});

exports.vendorStatusChanged = safely("vendorStatusChanged", (vendor, approved) =>
  send(vendor.email, approved ? tpl.vendorApproved(vendor) : tpl.vendorRevoked(vendor)),
);

exports.adminEmails = adminEmails;
