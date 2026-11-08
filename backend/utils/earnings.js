// Vendor earnings: how a paid booking is split between Wheelz and the vendor,
// and where that money is in the payout cycle.
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const { Booking } = require("../models/Booking");
const Dispute = require("../models/Dispute");

const DEFAULT_RATE = 15;
const HOUR = 3600 * 1000;
// Earnings wait this long after a recorded return, the window for raising issues.
const RETURN_HOLD_HOURS = 24;
// Without a recorded return (owner skipped the handover screens) they wait longer.
const NO_RETURN_HOLD_HOURS = 72;
const round2 = (n) => Math.round(n * 100) / 100;

function split(amount, rate) {
  const commission = round2(((amount || 0) * rate) / 100);
  return { commissionAmount: commission, vendorEarning: round2((amount || 0) - commission) };
}

// Called once a booking is paid: records the vendor and freezes the split at
// the vendor's current commission rate, so later rate changes don't rewrite
// history. Admin-owned vehicles have no vendor and nothing to split.
async function settle(booking) {
  const vehicle = await Vehicle.findById(booking.vehicle?._id || booking.vehicle).select("vendor").lean();
  if (!vehicle?.vendor) return booking;
  const vendor = await User.findById(vehicle.vendor).select("role commissionRate").lean();
  if (!vendor || vendor.role !== "vendor") return booking;
  const rate = vendor.commissionRate ?? DEFAULT_RATE;
  Object.assign(booking, { vendor: vendor._id, commissionRate: rate, ...split(booking.finalAmount, rate) });
  await Booking.updateOne(
    { _id: booking._id },
    { vendor: booking.vendor, commissionRate: rate, commissionAmount: booking.commissionAmount, vendorEarning: booking.vendorEarning },
  );
  return booking;
}

// unpaid    – not paid yet, nothing earned
// cancelled – cancelled or refunded, nothing owed
// upcoming  – paid, rental not finished (or still inside the issue window)
// on_hold   – an open dispute; waits for an admin decision
// ready     – paid and finished, owed to the vendor
// paid_out  – included in a payout
function stage(b, now = new Date(), disputed = false) {
  if (b.status === "cancelled" || b.paymentStatus === "refunded") return "cancelled";
  if (b.paymentStatus !== "paid") return "unpaid";
  if (b.payout) return "paid_out";
  if (disputed) return "on_hold";
  const t = new Date(now).getTime();
  if (b.returnReport?.at) return t >= new Date(b.returnReport.at).getTime() + RETURN_HOLD_HOURS * HOUR ? "ready" : "upcoming";
  if (b.status === "active") return "upcoming"; // picked up, not returned yet
  return t >= new Date(b.endDate).getTime() + NO_RETURN_HOLD_HOURS * HOUR ? "ready" : "upcoming";
}

// Bookings paid before splits were recorded get one computed on the fly.
function withSplit(b, fallbackRate) {
  if (b.vendorEarning != null) return b;
  const rate = b.commissionRate ?? fallbackRate ?? DEFAULT_RATE;
  return { ...b, commissionRate: rate, ...split(b.finalAmount, rate) };
}

// All bookings on a vendor's vehicles, with split and stage.
async function vendorBookings(vendorId, rate) {
  const vehicleIds = await Vehicle.find({ vendor: vendorId }).distinct("_id");
  const bookings = await Booking.find({ $or: [{ vendor: vendorId }, { vehicle: { $in: vehicleIds } }] })
    .populate("vehicle", "name brand")
    .sort({ startDate: -1 })
    .lean();
  const disputed = new Set(
    (await Dispute.find({ booking: { $in: bookings.map((b) => b._id) }, status: "open" }).distinct("booking")).map(String),
  );
  const now = new Date();
  return bookings.map((b) => {
    const s = withSplit(b, rate);
    return { ...s, earningStage: stage(s, now, disputed.has(String(b._id))) };
  });
}

function summarise(bookings) {
  const sum = (list, key) => round2(list.reduce((t, b) => t + (b[key] || 0), 0));
  const earning = bookings.filter((b) => ["upcoming", "on_hold", "ready", "paid_out"].includes(b.earningStage));
  const by = (st) => earning.filter((b) => b.earningStage === st);
  return {
    gross: sum(earning, "finalAmount"),
    commission: sum(earning, "commissionAmount"),
    net: sum(earning, "vendorEarning"),
    paidOut: sum(by("paid_out"), "vendorEarning"),
    ready: sum(by("ready"), "vendorEarning"),
    upcoming: sum(by("upcoming"), "vendorEarning"),
    onHold: sum(by("on_hold"), "vendorEarning"),
    readyCount: by("ready").length,
    paidBookings: earning.length,
  };
}

module.exports = { DEFAULT_RATE, split, settle, stage, withSplit, vendorBookings, summarise };
