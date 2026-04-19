const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Booking } = require("../models/Booking");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create an order for payment
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

// ============ SIMPLIFIED UPI QR CODE ============
// Generate UPI QR Code using UPI Intent + Order
exports.createQRCode = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // First create a payment order
    const options = {
      amount: Math.round(booking.finalAmount * 100),
      currency: "INR",
      receipt: `qr_${bookingId}`,
      notes: {
        bookingId: bookingId.toString(),
        userId: req.user._id.toString(),
        payment_type: "upi_qr",
      },
    };

    const order = await razorpay.orders.create(options);

    // Create a UPI QR Code using order ID
    const qrCodeOptions = {
      type: "upi_qr",
      name: `Wheelz_${bookingId.slice(-6)}`,
      usage: "single_use",
      fixed_amount: true,
      payment_amount: Math.round(booking.finalAmount * 100),
      description: `Booking #${booking.bookingRef || bookingId.slice(-6)}`,
      notes: {
        bookingId: bookingId.toString(),
        orderId: order.id,
      },
    };

    try {
      const qrCode = await razorpay.qrCode.create(qrCodeOptions);

      res.json({
        success: true,
        qrCodeId: qrCode.id,
        qrImageUrl: qrCode.image_url,
        shortUrl: qrCode.short_url,
        amount: booking.finalAmount,
        orderId: order.id,
      });
    } catch (qrError) {
      // Fallback: If QR API fails, provide UPI payment link
      console.log("QR API error, falling back to UPI link");
      const upiLink = `upi://pay?pa=${encodeURIComponent("wheelz@razorpay")}&pn=Wheelz&am=${booking.finalAmount}&cu=INR`;

      res.json({
        success: true,
        fallback: true,
        upiLink: upiLink,
        amount: booking.finalAmount,
        orderId: order.id,
      });
    }
  } catch (error) {
    console.error("QR Code creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check payment status for QR
exports.checkQRPaymentStatus = async (req, res) => {
  try {
    const { qrCodeId } = req.params;

    // Try to fetch QR code status
    try {
      const qrCode = await razorpay.qrCode.fetch(qrCodeId);
      res.json({
        success: true,
        status: qrCode.status,
        paymentsReceived: qrCode.payments_received || 0,
        amountReceived: qrCode.amount_paid || 0,
      });
    } catch (error) {
      // If QR API fails, return pending status
      res.json({
        success: true,
        status: "pending",
        paymentsReceived: 0,
        amountReceived: 0,
      });
    }
  } catch (error) {
    console.error("Status check error:", error);
    res.json({ success: true, status: "pending", paymentsReceived: 0 });
  }
};
