const express = require("express");
const router = express.Router();
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  checkAvailability,
  getCategoryStats,
} = require("../controllers/vehicleController");
const { protect, authorize, optionalAuth } = require("../middleware/auth");

// Public routes (no authentication needed)
router.get("/", optionalAuth, getVehicles);
router.get("/stats/categories", getCategoryStats);
router.get("/:id", optionalAuth, getVehicle);
router.get("/:id/availability", checkAvailability);

// ✅ Allow both admin AND vendor to create vehicles
router.post("/", protect, authorize("admin", "vendor"), createVehicle);

// Admin only routes
router.put("/:id", protect, authorize("admin"), updateVehicle);
router.delete("/:id", protect, authorize("admin"), deleteVehicle);

module.exports = router;
