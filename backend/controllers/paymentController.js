const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Booking } = require("../models/Booking");
const notify = require("../services/notify");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (!booking.user.equals(req.user._id))
      return res.status(403).json({ success: false, message: "Not your booking" });
    if (booking.paymentStatus === "paid")
      return res.status(400).json({ success: false, message: "Booking is already paid" });
    if (booking.status === "cancelled")
      return res.status(400).json({ success: false, message: "Booking is cancelled" });
    const amountInPaise = Math.round(booking.finalAmount * 100);
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `wlz_${bookingId.toString().slice(-10)}_${Date.now().toString().slice(-6)}`,
      notes: {
        bookingId: bookingId.toString(),
        userId: req.user._id.toString(),
        bookingRef: booking.bookingRef,
      },
    });
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
    if (expectedSignature !== razorpaySignature)
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });

    // The order must have been created for this booking, by this user.
    const order = await razorpay.orders.fetch(razorpayOrderId);
    if (order.notes?.bookingId !== String(bookingId) || order.notes?.userId !== String(req.user._id))
      return res.status(400).json({ success: false, message: "Order does not match this booking" });

    // Only the first verify flips the booking to paid, so a retry or double
    // click doesn't send the emails twice.
    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, paymentStatus: { $ne: "paid" } },
      {
        paymentStatus: "paid",
        razorpayOrderId,
        razorpayPaymentId,
        paidAt: new Date(),
        status: "confirmed",
      },
      { new: true },
    );
    if (!booking) {
      const existing = await Booking.findById(bookingId);
      if (!existing)
        return res.status(404).json({ success: false, message: "Booking not found" });
      return res.json({ success: true, message: "Payment already verified", booking: existing });
    }

    notify.paymentSucceeded(booking, { paymentId: razorpayPaymentId, method: "Razorpay" });

    res.json({ success: true, message: "Payment verified!", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.confirm = async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.bookingId,
    { paymentStatus: "paid", paidAt: new Date(), status: "confirmed" },
    { new: true },
  );
  res.json({ success: true, booking });
};
