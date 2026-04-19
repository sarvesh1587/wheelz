const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Booking } = require("../models/Booking");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create an order for payment (Card & UPI Intent)
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
      amount: Math.round(booking.finalAmount * 100),
      currency: "INR",
      receipt: `receipt_${bookingId}`,
      notes: {
        bookingId: bookingId.toString(),
        userId: req.user._id.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
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

// ============ NEW: UPI QR Code Payment ============

// Create Dynamic QR Code for UPI Payment
exports.createQRCode = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Create a QR Code for UPI payment
    const qrCodeOptions = {
      type: "upi_qr", // UPI QR Code type
      name: `Wheelz_${bookingId.slice(-6)}`,
      usage: "single_use", // Single use for this booking
      fixed_amount: true,
      payment_amount: Math.round(booking.finalAmount * 100),
      description: `Payment for booking ${booking.bookingRef || bookingId}`,
      notes: {
        bookingId: bookingId.toString(),
        userId: req.user._id.toString(),
      },
      close_by: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
    };

    const qrCode = await razorpay.qrCode.create(qrCodeOptions);

    res.json({
      success: true,
      qrCodeId: qrCode.id,
      qrImageUrl: qrCode.image_url,
      shortUrl: `https://rzp.io/i/${qrCode.id.slice(-6)}`,
      amount: booking.finalAmount,
    });
  } catch (error) {
    console.error("QR Code creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check QR Code payment status
exports.checkQRPaymentStatus = async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    const qrCode = await razorpay.qrCode.fetch(qrCodeId);

    res.json({
      success: true,
      status: qrCode.status,
      paymentsReceived: qrCode.payments?.length || 0,
      amountReceived: qrCode.amount_paid || 0,
    });
  } catch (error) {
    console.error("QR Code status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create UPI Intent Payment (Alternative to QR)
exports.createUPIIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const options = {
      amount: Math.round(booking.finalAmount * 100),
      currency: "INR",
      receipt: `receipt_${bookingId}`,
      payment_capture: 1,
      notes: {
        bookingId: bookingId.toString(),
        userId: req.user._id.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("UPI Intent error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
