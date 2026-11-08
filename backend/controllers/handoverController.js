// Pickup and return of a rented vehicle, with photo evidence on both sides
// and a dispute process.
//
// 1. Payment gives the customer a 6-digit pickup code (only they see it).
// 2. Pickup: the owner checks the renter's licence against the KYC photo,
//    takes at least 4 photos with odometer and fuel, and enters the code.
//    The booking becomes "active".
// 3. Return: the owner records the same; km driven and lateness are worked
//    out, damage can be flagged. The booking becomes "completed".
// 4. The customer can agree with either report or dispute it. Disputes are
//    decided by an admin. Earnings stay on hold while one is open.
const crypto = require("crypto");
const { Booking } = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const KYC = require("../models/KYC");
const Dispute = require("../models/Dispute");
const notify = require("../services/notify");
const { uploadedPhotos } = require("../middleware/uploadHandover");

const HOUR = 3600 * 1000;
const MIN_PHOTOS = 4;
const PICKUP_EARLY_HOURS = 12; // how long before the start a pickup can be recorded
const DISPUTE_WINDOW_HOURS = 24; // after the return

const fail = (res, status, message, code) => res.status(status).json({ success: false, message, ...(code && { code }) });

exports.newPickupCode = () => String(crypto.randomInt(0, 1e6)).padStart(6, "0");

// Gives a paid booking its pickup code if it has none. Returns the code.
exports.ensurePickupCode = async (booking) => {
  const existing = await Booking.findById(booking._id).select("+pickupCode").lean();
  if (existing?.pickupCode) return (booking.pickupCode = existing.pickupCode);
  const code = exports.newPickupCode();
  await Booking.updateOne({ _id: booking._id }, { pickupCode: code });
  return (booking.pickupCode = code);
};

// Loads the booking and works out who is asking: its customer, the owner of
// the vehicle (a vendor, or an admin for Wheelz's own fleet) or an admin.
async function access(req, { withCode = false } = {}) {
  const query = Booking.findById(req.params.id).populate("vehicle", "name brand images vendor city locationName");
  if (withCode) query.select("+pickupCode");
  const booking = await query;
  if (!booking) return { error: [404, "Booking not found"] };
  const uid = String(req.user._id);
  const vendorId = booking.vehicle?.vendor ? String(booking.vehicle.vendor) : null;
  let role = null;
  if (String(booking.user) === uid) role = "customer";
  else if (vendorId && vendorId === uid) role = "vendor";
  else if (req.user.role === "admin") role = "admin";
  if (!role) return { error: [403, "You can't access this booking"] };
  // Admins can act as the owner (Wheelz's own fleet, or helping a vendor).
  const isOwner = role === "vendor" || role === "admin";
  return { booking, role, isOwner };
}

function numberIn(value, min, max) {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

function location(body) {
  const lat = numberIn(body.lat, -90, 90);
  const lng = numberIn(body.lng, -180, 180);
  return lat !== null && lng !== null ? { lat, lng, accuracy: numberIn(body.accuracy, 0, 1e6) ?? undefined } : undefined;
}

// GET /bookings/:id/handover — everything the screen needs for this person.
exports.getHandover = async (req, res) => {
  try {
    const { booking, role, isOwner, error } = await access(req, { withCode: true });
    if (error) return fail(res, ...error);

    const disputes = await Dispute.find({ booking: booking._id }).sort({ createdAt: -1 }).lean();
    const b = booking.toObject();
    const out = {
      _id: b._id,
      bookingRef: b.bookingRef,
      vehicle: b.vehicle,
      startDate: b.startDate,
      endDate: b.endDate,
      status: b.status,
      paymentStatus: b.paymentStatus,
      pickupLocation: b.pickupLocation,
      pickupReport: b.pickupReport || null,
      returnReport: b.returnReport || null,
      disputes,
      role,
      canDispute: canDispute(b, role),
    };
    // Only the customer (and admins) may see the code; the owner must ask for it.
    if ((role === "customer" || role === "admin") && b.paymentStatus === "paid") out.pickupCode = b.pickupCode || null;

    // The owner needs to check the renter is who they say they are.
    if (isOwner && b.paymentStatus === "paid" && ["confirmed", "active"].includes(b.status)) {
      const kyc = await KYC.findOne({ user: b.user }).select("drivingLicenseFront licenseNumber status").lean();
      out.renter = {
        name: b.customerDetails?.name,
        phone: b.customerDetails?.phone,
        email: b.customerDetails?.email,
        kycStatus: kyc?.status || "missing",
        licenseNumber: kyc?.licenseNumber || "",
        licensePhoto: kyc?.drivingLicenseFront || null,
      };
    }
    res.json({ success: true, handover: out });
  } catch (err) {
    console.error("Get handover error:", err);
    fail(res, 500, err.message);
  }
};

// Validates the form; returns { report } or { error: [status, message] }.
function readReport(req, { previousOdometer } = {}) {
  const photos = uploadedPhotos(req);
  if (photos.length < MIN_PHOTOS) return { error: [400, `Add at least ${MIN_PHOTOS} photos: front, back, both sides, odometer and fuel gauge`] };
  const odometer = numberIn(req.body.odometer, 0, 2e6);
  if (odometer === null) return { error: [400, "Enter the odometer reading"] };
  if (previousOdometer != null && odometer < previousOdometer)
    return { error: [400, `Odometer can't be less than at pickup (${previousOdometer} km)`] };
  const fuelLevel = numberIn(req.body.fuelLevel, 0, 100);
  if (fuelLevel === null) return { error: [400, "Enter the fuel level"] };
  return { report: {
    at: new Date(),
    by: req.user._id,
    odometer,
    fuelLevel,
    photos,
    notes: String(req.body.notes || "").slice(0, 1000),
    location: location(req.body),
    customerAck: { status: "pending" },
  } };
}

// POST /bookings/:id/pickup — the owner hands the vehicle over.
exports.recordPickup = async (req, res) => {
  try {
    const { booking, isOwner, error } = await access(req, { withCode: true });
    if (error) return fail(res, ...error);
    if (!isOwner) return fail(res, 403, "Only the vehicle owner can record the pickup");
    if (booking.paymentStatus !== "paid") return fail(res, 400, "This booking hasn't been paid");
    if (booking.status !== "confirmed") return fail(res, 400, booking.status === "pending" ? "This booking isn't confirmed yet" : `This booking is already ${booking.status}`);
    const now = Date.now();
    if (now < new Date(booking.startDate).getTime() - PICKUP_EARLY_HOURS * HOUR)
      return fail(res, 400, `Pickup opens ${PICKUP_EARLY_HOURS} hours before the booking starts`);
    if (now > new Date(booking.endDate).getTime()) return fail(res, 400, "This booking has already ended");
    if (!booking.pickupCode || String(req.body.code || "").trim() !== booking.pickupCode)
      return fail(res, 400, "Pickup code doesn't match. Ask the renter for the 6-digit code in their booking.", "BAD_CODE");

    const { report, error: invalid } = readReport(req);
    if (invalid) return fail(res, ...invalid);

    // Only the first pickup counts, even if two requests arrive together.
    const updated = await Booking.findOneAndUpdate(
      { _id: booking._id, status: "confirmed" },
      { pickupReport: report, status: "active" },
      { new: true },
    ).populate("vehicle", "name");
    if (!updated) return fail(res, 409, "Pickup was already recorded");
    notify.rideStarted(updated);
    res.json({ success: true, message: "Ride started", booking: updated });
  } catch (err) {
    console.error("Record pickup error:", err);
    fail(res, 500, err.message);
  }
};

// POST /bookings/:id/return — the owner takes the vehicle back.
exports.recordReturn = async (req, res) => {
  try {
    const { booking, isOwner, error } = await access(req);
    if (error) return fail(res, ...error);
    if (!isOwner) return fail(res, 403, "Only the vehicle owner can record the return");
    if (booking.status !== "active") return fail(res, 400, "The ride hasn't been started with a pickup");

    const { report, error: invalid } = readReport(req, { previousOdometer: booking.pickupReport?.odometer });
    if (invalid) return fail(res, ...invalid);
    report.kmDriven = report.odometer - (booking.pickupReport?.odometer || report.odometer);
    report.lateMinutes = Math.max(0, Math.round((report.at - new Date(booking.endDate)) / 60000));
    report.damageReported = req.body.damage === "true" || req.body.damage === true;

    const updated = await Booking.findOneAndUpdate(
      { _id: booking._id, status: "active" },
      { returnReport: report, status: "completed" },
      { new: true },
    ).populate("vehicle", "name vendor");
    if (!updated) return fail(res, 409, "Return was already recorded");

    let dispute = null;
    if (report.damageReported) {
      dispute = await Dispute.create({
        booking: booking._id,
        raisedBy: req.user._id,
        raisedByRole: req.user.role === "admin" ? "admin" : "vendor",
        type: "damage",
        description: String(req.body.damageDescription || "Damage found at return").slice(0, 2000),
        amountClaimed: numberIn(req.body.damageAmount, 0, 1e7) || 0,
        photos: report.photos,
      });
    }
    notify.rideReturned(updated, dispute);
    if (dispute) notify.disputeOpened(updated, dispute);
    res.json({ success: true, message: "Ride completed", booking: updated, dispute });
  } catch (err) {
    console.error("Record return error:", err);
    fail(res, 500, err.message);
  }
};

// POST /bookings/:id/acknowledge — the customer agrees with a report or
// objects to it (which opens a dispute).
exports.acknowledge = async (req, res) => {
  try {
    const { booking, role, error } = await access(req);
    if (error) return fail(res, ...error);
    if (role !== "customer") return fail(res, 403, "Only the renter can respond to a report");
    const stage = req.body.stage === "return" ? "return" : "pickup";
    const report = booking[`${stage}Report`];
    if (!report?.at) return fail(res, 400, `There is no ${stage} report yet`);
    if (report.customerAck?.status && report.customerAck.status !== "pending") return fail(res, 400, "You've already responded to this report");

    const agree = req.body.agree === true || req.body.agree === "true";
    const note = String(req.body.note || "").slice(0, 2000);
    if (!agree && !note.trim()) return fail(res, 400, "Tell us what's wrong with the report");
    booking[`${stage}Report`].customerAck = { status: agree ? "agreed" : "disputed", note, at: new Date() };
    await booking.save();

    let dispute = null;
    if (!agree) {
      dispute = await Dispute.create({
        booking: booking._id,
        raisedBy: req.user._id,
        raisedByRole: "customer",
        type: "not_as_described",
        description: `${stage === "pickup" ? "Pickup" : "Return"} report disputed: ${note}`,
        photos: uploadedPhotos(req),
      });
      notify.disputeOpened(booking, dispute);
    }
    res.json({ success: true, message: agree ? "Thanks for confirming" : "We've opened a dispute and will look into it", dispute });
  } catch (err) {
    console.error("Acknowledge error:", err);
    fail(res, 500, err.message);
  }
};

function canDispute(b, role) {
  if (role === "admin") return true;
  if (b.paymentStatus !== "paid" || b.status === "cancelled") return false;
  const returnedAt = b.returnReport?.at ? new Date(b.returnReport.at).getTime() : null;
  const windowOpen = !returnedAt || Date.now() < returnedAt + DISPUTE_WINDOW_HOURS * HOUR;
  if (role === "vendor") return Boolean(b.pickupReport?.at) && windowOpen;
  if (role === "customer") return Boolean(b.pickupReport?.at) && windowOpen;
  return false;
}

const TYPES = ["damage", "fuel", "late_return", "extra_km", "cleanliness", "not_as_described", "theft", "other"];

// POST /bookings/:id/disputes — either side raises an issue.
exports.openDispute = async (req, res) => {
  try {
    const { booking, role, error } = await access(req);
    if (error) return fail(res, ...error);
    if (!canDispute(booking.toObject(), role))
      return fail(res, 400, `Issues can be raised from pickup until ${DISPUTE_WINDOW_HOURS} hours after the return`);
    const description = String(req.body.description || "").trim();
    if (description.length < 10) return fail(res, 400, "Describe the issue in a few words");
    const dispute = await Dispute.create({
      booking: booking._id,
      raisedBy: req.user._id,
      raisedByRole: role,
      type: TYPES.includes(req.body.type) ? req.body.type : "other",
      description: description.slice(0, 2000),
      amountClaimed: numberIn(req.body.amountClaimed, 0, 1e7) || 0,
      photos: uploadedPhotos(req),
    });
    notify.disputeOpened(booking, dispute);
    res.status(201).json({ success: true, message: "Issue raised. Our team will review it.", dispute });
  } catch (err) {
    console.error("Open dispute error:", err);
    fail(res, 500, err.message);
  }
};

// POST /bookings/:id/disputes/:disputeId/respond — the other side's answer.
exports.respondToDispute = async (req, res) => {
  try {
    const { booking, role, error } = await access(req);
    if (error) return fail(res, ...error);
    const dispute = await Dispute.findOne({ _id: req.params.disputeId, booking: booking._id });
    if (!dispute) return fail(res, 404, "Issue not found");
    if (dispute.status !== "open") return fail(res, 400, "This issue is already closed");
    if (dispute.raisedByRole === role || String(dispute.raisedBy) === String(req.user._id))
      return fail(res, 400, "You raised this issue; wait for the other side or our team");
    const note = String(req.body.note || "").trim();
    if (!note) return fail(res, 400, "Write your response");
    dispute.response = { note: note.slice(0, 2000), photos: uploadedPhotos(req), at: new Date(), by: req.user._id };
    await dispute.save();
    res.json({ success: true, message: "Response added", dispute });
  } catch (err) {
    fail(res, 500, err.message);
  }
};

// Admin: list and decide disputes.
exports.listDisputes = async (req, res) => {
  try {
    const status = ["open", "resolved", "rejected"].includes(req.query.status) ? req.query.status : undefined;
    const disputes = await Dispute.find(status ? { status } : {})
      .sort({ status: 1, createdAt: -1 })
      .limit(200)
      .populate({ path: "booking", select: "bookingRef vehicle startDate endDate customerDetails vendorDetails finalAmount pickupReport returnReport status", populate: { path: "vehicle", select: "name" } })
      .populate("raisedBy", "name email role")
      .lean();
    res.json({ success: true, disputes });
  } catch (err) {
    fail(res, 500, err.message);
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.disputeId);
    if (!dispute) return fail(res, 404, "Dispute not found");
    if (dispute.status !== "open") return fail(res, 400, "This dispute is already closed");
    const decision = req.body.decision === "rejected" ? "rejected" : "resolved";
    const note = String(req.body.note || "").trim();
    if (!note) return fail(res, 400, "Explain the decision; both sides will see it");
    dispute.status = decision;
    dispute.resolution = {
      amountAwarded: decision === "resolved" ? numberIn(req.body.amountAwarded, 0, 1e7) || 0 : 0,
      note: note.slice(0, 2000),
      at: new Date(),
      by: req.user._id,
    };
    await dispute.save();
    const booking = await Booking.findById(dispute.booking).populate("vehicle", "name vendor");
    notify.disputeResolved(booking, dispute);
    res.json({ success: true, message: `Dispute ${decision}`, dispute });
  } catch (err) {
    fail(res, 500, err.message);
  }
};

exports.MIN_PHOTOS = MIN_PHOTOS;
exports.DISPUTE_WINDOW_HOURS = DISPUTE_WINDOW_HOURS;
