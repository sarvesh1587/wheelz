const express = require("express");
const router = express.Router();
const {
  chat,
  smartSearch,
  getRecommendations,
  getFraudAlerts,
  resolveFraudAlert,
} = require("../controllers/aiController");
const { protect, authorize, optionalAuth } = require("../middleware/auth");

router.post("/chat", chat);
router.post("/smart-search", smartSearch);
router.get("/recommendations", optionalAuth, getRecommendations);
router.get("/fraud-alerts", protect, authorize("admin"), getFraudAlerts);
router.put(
  "/fraud-alerts/:bookingId/resolve",
  protect,
  authorize("admin"),
  resolveFraudAlert,
);

module.exports = router;
