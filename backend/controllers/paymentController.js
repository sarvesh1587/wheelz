const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Booking } = require("../models/Booking");
const sendEmail = require("../services/emailService");

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

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "paid",
        razorpayPaymentId,
        paidAt: new Date(),
        status: "confirmed",
      },
      { new: true },
    ).populate("vehicle user");

    // Payment receipt email
    sendEmail({
      to: booking.user?.email,
      subject: `💰 Payment Successful - ${booking.bookingRef}`,
      html: `<h1>Payment Received!</h1><p>Amount: ₹${booking.finalAmount?.toLocaleString()}</p><p>Vehicle: ${booking.vehicle?.name}</p><p>Ref: ${booking.bookingRef}</p><p>Transaction: ${razorpayPaymentId}</p>`,
    }).catch(() => {});

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
