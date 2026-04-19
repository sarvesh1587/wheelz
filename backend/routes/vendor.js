const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");

// Vendor Registration (Public)
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      businessName,
      gstNumber,
      businessAddress,
      panNumber,
      bankAccountNumber,
      ifscCode,
      accountHolderName,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User already exists with this email",
        });
    }

    // Create vendor user
    const vendor = await User.create({
      name,
      email,
      password,
      phone,
      role: "vendor",
      isVendorApproved: false,
      vendorDetails: {
        businessName,
        gstNumber,
        businessAddress,
        panNumber,
        phoneNumber: phone,
        bankAccountNumber,
        ifscCode,
        accountHolderName,
      },
      vendorSince: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Vendor registration submitted for approval",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
      },
    });
  } catch (error) {
    console.error("Vendor registration error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
