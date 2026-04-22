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

router.get("/", optionalAuth, getVehicles);
router.get("/stats/categories", getCategoryStats);
router.get("/:id", optionalAuth, getVehicle);
router.get("/:id/availability", checkAvailability);
// router.post("/", protect, authorize("admin"), createVehicle);
router.post("/", protect, authorize("admin", "vendor"), createVehicle);
router.put("/:id", protect, authorize("admin"), updateVehicle);
router.delete("/:id", protect, authorize("admin"), deleteVehicle);

module.exports = router;
