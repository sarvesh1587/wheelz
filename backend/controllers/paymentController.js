const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Booking } = require("../models/Booking");

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

    const options = {
      amount: Math.round(booking.finalAmount * 100), // amount in paise
      currency: "INR",
      receipt: `receipt_${bookingId}`,
      notes: {
        bookingId: bookingId.toString(),
        userId: req.user._id.toString(),
      },
    };

    // ✅ Create REAL order with Razorpay
    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id, // Real Razorpay order ID (starts with 'order_')
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify payment after successful transaction
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

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "paid",
        paymentMethod: "razorpay",
        paidAt: new Date(),
        status: "confirmed",
      },
      { new: true },
    );

    res.json({ success: true, message: "Payment verified!", booking });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
