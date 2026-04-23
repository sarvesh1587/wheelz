const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { Booking } = require("../models/Booking");

// Create payment intent (mock)
router.post("/create-order", protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const mockIntent = {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret`,
      amount: booking.finalAmount * 100,
      currency: "inr",
      status: "requires_payment_method",
    };

    res.json({
      success: true,
      paymentIntent: mockIntent,
      amount: booking.finalAmount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Confirm payment - ADD THIS ROUTE
router.post("/confirm/:bookingId", protect, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { method } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    booking.paymentStatus = "paid";
    booking.paymentMethod = method || "mock";
    booking.paidAt = new Date();
    booking.status = "confirmed";
    await booking.save();

    res.json({ success: true, message: "Payment confirmed!", booking });
  } catch (error) {
    console.error("Payment confirm error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify payment
router.post("/verify", protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    await booking.save();

    res.json({ success: true, message: "Payment verified!", booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create QR Code
router.post("/create-qr", protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    res.json({
      success: true,
      qrCodeId: `qr_${Date.now()}`,
      qrImageUrl:
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay",
      shortUrl: `https://rzp.io/i/${bookingId.slice(-6)}`,
      amount: booking.finalAmount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check QR status
router.get("/qr-status/:qrCodeId", protect, async (req, res) => {
  res.json({ success: true, status: "active", paymentsReceived: 0 });
});

module.exports = router;
