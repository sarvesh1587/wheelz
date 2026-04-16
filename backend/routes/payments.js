const express = require("express");
const paymentsRouter = express.Router();
const { protect } = require("../middleware/auth");
const { Booking } = require("../models/Booking");

paymentsRouter.post("/create-intent", protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    const mockIntent = {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret_mock`,
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

paymentsRouter.post("/confirm", protect, async (req, res) => {
  try {
    const { bookingId, paymentMethod = "mock" } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    booking.paymentStatus = "paid";
    booking.paymentMethod = paymentMethod;
    booking.paidAt = new Date();
    booking.status = "confirmed";
    await booking.save();

    res.json({ success: true, message: "Payment confirmed!", booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = paymentsRouter;
