const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Booking } = require("../models/Booking");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const { sendEmail } = require("../services/emailService");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a REAL Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Convert amount to paise
    const amountInPaise = Math.round(booking.finalAmount * 100);

    console.log("🔍 Creating Razorpay order for booking:", bookingId);
    console.log("🔍 Amount (₹):", booking.finalAmount);
    console.log("🔍 Amount (paise):", amountInPaise);

    // ✅ Short receipt ID (max 40 characters)
    // Take only last 10 chars of bookingId + timestamp (last 8 digits)
    const shortId = bookingId.slice(-10);
    const timestamp = Date.now().toString().slice(-8);
    const receipt = `rcpt_${shortId}_${timestamp}`; // ~25 characters max

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt,
      notes: {
        bookingId: bookingId.toString(),
      },
    };

    console.log("🔍 Razorpay Options:", options);

    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay order created:", order.id);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Razorpay order error:", error);
    console.error("❌ Error details:", error.error);
    res.status(500).json({
      success: false,
      message: error.error?.description || error.message,
    });
  }
};
// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // Update booking
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "paid",
        paymentMethod: "razorpay",
        paidAt: new Date(),
        status: "confirmed",
      },
      { new: true },
    ).populate("vehicle user");

    res.json({
      success: true,
      message: "Payment verified!",
      booking,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
