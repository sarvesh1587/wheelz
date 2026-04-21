// Approve vendor - FIXED
router.put(
  "/approve-vendor/:vendorId",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const User = require("../models/User");
      const vendor = await User.findByIdAndUpdate(
        req.params.vendorId,
        {
          isVendorApproved: true,
          isActive: true,
        },
        { new: true },
      );

      if (!vendor) {
        return res
          .status(404)
          .json({ success: false, message: "Vendor not found" });
      }

      res.json({
        success: true,
        message: `${vendor.vendorType === "individual" ? "Individual" : "Business"} vendor approved successfully`,
        vendor,
      });
    } catch (error) {
      console.error("Approve vendor error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
);
