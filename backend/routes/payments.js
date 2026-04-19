const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createOrder,
  verifyPayment,
} = require("../controllers/paymentController");

// Order routes
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

module.exports = router;
