const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Vendor Registration (Public)
router.post("/register", async (req, res) => {
  try {
    console.log("📝 Vendor registration request received");

    const {
      vendorType,
      name,
      email,
      password,
      phone,
      individualDetails,
      businessDetails,
      bankDetails,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Prepare vendor data based on type
    let vendorData = {
      name,
      email,
      password,
      phone,
      role: "vendor",
      vendorType: vendorType,
      bankDetails: bankDetails,
      isVendorApproved: false,
      vendorSince: new Date(),
      commissionRate: vendorType === "business" ? 10 : 15,
      vehicleLimit: vendorType === "business" ? 999 : 5,
    };

    // Add type-specific details
    if (vendorType === "individual") {
      vendorData.individualDetails = individualDetails;
    } else {
      vendorData.businessDetails = businessDetails;
    }

    const vendor = await User.create(vendorData);

    console.log(`✅ ${vendorType} vendor created: ${vendor.email}`);

    res.status(201).json({
      success: true,
      message: `${vendorType === "business" ? "Business" : "Individual"} vendor registration submitted for approval`,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        vendorType: vendor.vendorType,
        commissionRate: vendor.commissionRate,
        vehicleLimit: vendor.vehicleLimit,
      },
    });
  } catch (error) {
    console.error("❌ Vendor registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

module.exports = router;
