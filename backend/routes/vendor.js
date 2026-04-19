const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  registerVendor,
  approveVendor,
  addVehicle,
  getMyVehicles,
  updateVehicle,
  getPendingVehicles,
  approveVehicle,
  getAllVendors,
  getVendorStats,
} = require("../controllers/vendorController");

// Public routes
router.post("/register", registerVendor);

// Protected vendor routes
router.use(protect);
router.post("/vehicles", authorize("vendor"), addVehicle);
router.get("/my-vehicles", authorize("vendor"), getMyVehicles);
router.put("/vehicles/:vehicleId", authorize("vendor"), updateVehicle);
router.get("/dashboard/stats", authorize("vendor"), getVendorStats);

// Admin only routes
router.put("/approve/:vendorId", authorize("admin"), approveVendor);
router.get("/pending-vehicles", authorize("admin"), getPendingVehicles);
router.put("/approve-vehicle/:vehicleId", authorize("admin"), approveVehicle);
router.get("/all-vendors", authorize("admin"), getAllVendors);

module.exports = router;
