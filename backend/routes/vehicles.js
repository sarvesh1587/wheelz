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
  getVendorVehicles, // ✅ Make sure this is imported
  getVehicleImage,
} = require("../controllers/vehicleController");
const { protect, authorize, optionalAuth } = require("../middleware/auth");

// Public routes
router.get("/", optionalAuth, getVehicles);
router.get("/stats/categories", getCategoryStats);
router.get("/:id", optionalAuth, getVehicle);
router.get("/:id/availability", checkAvailability);
router.get("/:id/images/:index", getVehicleImage);

// ✅ ADD THIS ROUTE
router.get(
  "/vendor/my-vehicles",
  protect,
  authorize("vendor"),
  getVendorVehicles,
);

// Allow both admin AND vendor to create vehicles
router.post("/", protect, authorize("admin", "vendor"), createVehicle);

// Allow vendors to update their own vehicles
router.put("/:id", protect, authorize("admin", "vendor"), updateVehicle);

// Admin only - delete vehicle
router.delete("/:id", protect, authorize("admin"), deleteVehicle);

module.exports = router;
