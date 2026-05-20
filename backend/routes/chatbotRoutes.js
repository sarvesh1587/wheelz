const express = require("express");
const router = express.Router();
const { chat, getUserBookings } = require("../controllers/chatbotController");
const { protect } = require("../middleware/auth");

router.post("/chat", protect, chat);
router.get("/my-bookings", protect, getUserBookings);

module.exports = router;
