const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  toggleUserActive,
  getRevenueBreakdown,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));
router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/toggle-active", toggleUserActive);
router.get("/revenue/breakdown", getRevenueBreakdown);
// Approve vendor
router.put(
  "/approve-vendor/:vendorId",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const vendor = await User.findByIdAndUpdate(
        req.params.vendorId,
        { isVendorApproved: true },
        { new: true },
      );
      if (!vendor) {
        return res
          .status(404)
          .json({ success: false, message: "Vendor not found" });
      }
      res.json({ success: true, message: "Vendor approved successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);
module.exports = router;
