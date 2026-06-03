const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Booking } = require("../models/Booking");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const sendEmail = require("../services/emailService"); // ✅ Fixed: removed destructuring

// ✅ Log keys on startup so you can verify in terminal
console.log(
  "💳 Razorpay Key ID:",
  process.env.RAZORPAY_KEY_ID
    ? process.env.RAZORPAY_KEY_ID.slice(0, 15) + "..."
    : "❌ MISSING",
);
console.log(
  "💳 Razorpay Secret:",
  process.env.RAZORPAY_KEY_SECRET ? "✅ Set" : "❌ MISSING",
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Create Razorpay Order ───────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res
        .status(400)
        .json({ success: false, message: "Booking ID is required" });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // ✅ Ensure amount is a positive integer in paise (₹1 = 100 paise)
    const amountInPaise = Math.round(booking.finalAmount * 100);

    if (amountInPaise <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking amount" });
    }

    // ✅ Razorpay receipt must be max 40 chars
    const receipt = `wlz_${bookingId.toString().slice(-10)}_${Date.now().toString().slice(-6)}`;

    console.log("🔍 Creating Razorpay order:");
    console.log("   Booking ID:", bookingId);
    console.log("   Amount (₹):", booking.finalAmount);
    console.log("   Amount (paise):", amountInPaise);
    console.log("   Receipt:", receipt);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt,
      payment_capture: 1,
      notes: {
        bookingId: bookingId.toString(),
        userId: req.user._id.toString(), // ✅ Fixed: was req.user.id
        bookingRef: booking.bookingRef || "",
      },
    };

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
    console.error("❌ Razorpay createOrder error:");
    console.error("   Message:", error.message);
    console.error("   Error detail:", error.error);
    console.error("   Status code:", error.statusCode);

    res.status(500).json({
      success: false,
      message:
        error.error?.description ||
        error.message ||
        "Payment initialization failed",
      detail: error.error || null,
    });
  }
};

// ─── Verify Payment Signature ────────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment verification data" });
    }

    // ✅ Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      console.error("❌ Signature mismatch");
      console.error("   Expected:", expectedSignature);
      console.error("   Received:", razorpaySignature);
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    console.log("✅ Payment signature verified for order:", razorpayOrderId);

    // ✅ Update booking status
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "paid",
        paymentMethod: "razorpay",
        stripePaymentIntentId: razorpayPaymentId, // reusing field to store razorpay payment ID
        paidAt: new Date(),
        status: "confirmed",
      },
      { new: true },
    ).populate("vehicle user");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found after payment" });
    }

    // ✅ Send confirmation email
    try {
      await sendEmail({
        to: booking.user?.email,
        subject: `Payment Successful — ${booking.bookingRef}`,
        html: `
          <h2>Payment Confirmed! ✅</h2>
          <p>Hi ${booking.user?.name},</p>
          <p>Your payment of <strong>₹${booking.finalAmount?.toLocaleString()}</strong> for booking <strong>${booking.bookingRef}</strong> has been received.</p>
          <p><strong>Vehicle:</strong> ${booking.vehicle?.name}</p>
          <p><strong>Pickup:</strong> ${new Date(booking.startDate).toDateString()}</p>
          <p><strong>Return:</strong> ${new Date(booking.endDate).toDateString()}</p>
          <p>Thank you for choosing Wheelz!</p>
        `,
      });
    } catch (emailErr) {
      console.warn("⚠️ Payment confirmation email failed:", emailErr.message);
    }

    res.json({
      success: true,
      message: "Payment verified and booking confirmed!",
      booking,
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Create QR Code (UPI) ────────────────────────────────────────────────────
exports.createQRCode = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    const amountInPaise = Math.round(booking.finalAmount * 100);

    // Razorpay QR Code API
    const qrCode = await razorpay.qrCode.create({
      type: "upi_qr",
      name: "Wheelz Payment",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: amountInPaise,
      description: `Booking ${booking.bookingRef}`,
      close_by: Math.floor(Date.now() / 1000) + 600, // 10 min expiry
      notes: { bookingId: bookingId.toString() },
    });

    res.json({ success: true, qrCode });
  } catch (error) {
    console.error("QR Code error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Confirm Mock Payment (for testing without real payment) ─────────────────
exports.confirm = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { method } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "paid",
        paymentMethod: method || "mock",
        paidAt: new Date(),
        status: "confirmed",
      },
      { new: true },
    ).populate("vehicle user");

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    res.json({ success: true, message: "Payment confirmed", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
