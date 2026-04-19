const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createOrder,
  verifyPayment,
  createQRCode,
  checkQRPaymentStatus,
  createUPIIntent,
} = require("../controllers/paymentController");

// Card / Normal Payment
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

// UPI QR Code Payment
router.post("/create-qr", protect, createQRCode);
router.get("/qr-status/:qrCodeId", protect, checkQRPaymentStatus);

// UPI Intent Payment
router.post("/create-upi-intent", protect, createUPIIntent);

module.exports = router;
