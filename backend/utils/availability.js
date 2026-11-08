// Whether a vehicle is free for a time range, worked out from real bookings.
const { Booking } = require("../models/Booking");

// An unpaid booking holds its dates this long so two people can't book and
// pay for the same slot; after that it stops blocking others.
const HOLD_MINUTES = 30;

// Bookings that currently block their dates: paid/confirmed ones, plus fresh
// unpaid ones still inside the hold window.
function blockingFilter(now = new Date()) {
  return {
    status: { $nin: ["cancelled", "completed"] },
    paymentStatus: { $ne: "refunded" },
    $or: [
      { paymentStatus: "paid" },
      { status: { $in: ["confirmed", "active"] } },
      { createdAt: { $gt: new Date(now - HOLD_MINUTES * 60 * 1000) } },
    ],
  };
}

// The time a rental actually occupies the vehicle. Hourly rentals run from
// the pickup time for their hours; a range with no length counts as that day.
function rentalRange({ startDate, endDate, rentalType, hours }) {
  const start = new Date(startDate);
  let end = endDate ? new Date(endDate) : new Date(start);
  if (rentalType === "hourly" && Number(hours) > 0) end = new Date(start.getTime() + Number(hours) * 3600 * 1000);
  if (!(end > start)) end = new Date(start.getTime() + 24 * 3600 * 1000);
  return { start, end };
}

// Blocking bookings that overlap [start, end), ignoring `excludeId`.
// `createdBefore` limits it to bookings made earlier, which decides who wins
// when two requests arrive together.
function findConflicts(vehicleId, start, end, { excludeId, createdBefore } = {}) {
  const query = {
    vehicle: vehicleId,
    startDate: { $lt: end },
    endDate: { $gt: start },
    ...blockingFilter(),
  };
  if (excludeId) query._id = { $ne: excludeId };
  if (createdBefore) query.createdAt = { $lt: createdBefore };
  return Booking.find(query).select("startDate endDate status paymentStatus createdAt").lean();
}

const findConflict = async (...args) => (await findConflicts(...args))[0] || null;

// Can this existing booking still be paid for? Not if a paid/confirmed booking
// overlaps it, or an unpaid one that was made before it is still holding.
async function blocksPayment(booking) {
  const { start, end } = rentalRange(booking);
  const others = await findConflicts(booking.vehicle?._id || booking.vehicle, start, end, { excludeId: booking._id });
  return (
    others.find(
      (o) => o.paymentStatus === "paid" || ["confirmed", "active"].includes(o.status) || o.createdAt < booking.createdAt,
    ) || null
  );
}

// Upcoming blocked ranges for a vehicle (no customer details), for calendars.
async function bookedRanges(vehicleId, days = 120) {
  const now = new Date();
  const until = new Date(now.getTime() + days * 24 * 3600 * 1000);
  const list = await Booking.find({ vehicle: vehicleId, endDate: { $gt: now }, startDate: { $lt: until }, ...blockingFilter(now) })
    .select("startDate endDate")
    .sort({ startDate: 1 })
    .lean();
  return list.map((b) => ({ startDate: b.startDate, endDate: b.endDate }));
}

module.exports = { HOLD_MINUTES, rentalRange, findConflict, findConflicts, blocksPayment, bookedRanges };
