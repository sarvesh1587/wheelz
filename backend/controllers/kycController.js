const KYC = require("../models/KYC");
const User = require("../models/User");

// Submit KYC
exports.submitKYC = async (req, res) => {
  try {
    const { licenseNumber, aadhaarNumber } = req.body;
    const files = req.files;
    const userId = req.user.id;

    if (
      !files?.drivingLicenseFront ||
      !files?.drivingLicenseBack ||
      !files?.aadhaarFront ||
      !files?.aadhaarBack
    ) {
      return res.status(400).json({
        success: false,
        message: "Please upload all required documents",
      });
    }

    if (!licenseNumber || !aadhaarNumber) {
      return res.status(400).json({
        success: false,
        message: "License and Aadhaar numbers are required",
      });
    }

    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number must be 12 digits",
      });
    }

    const existingKYC = await KYC.findOne({ user: userId });

    const kycData = {
      user: userId,
      drivingLicenseFront: files.drivingLicenseFront[0].path,
      drivingLicenseBack: files.drivingLicenseBack[0].path,
      aadhaarFront: files.aadhaarFront[0].path,
      aadhaarBack: files.aadhaarBack[0].path,
      licenseNumber,
      aadhaarNumber,
      status: "pending",
    };

    let kyc;
    if (existingKYC) {
      kyc = await KYC.findOneAndUpdate({ user: userId }, kycData, {
        new: true,
      });
    } else {
      kyc = await KYC.create(kycData);
    }

    // Update user KYC status
    await User.findByIdAndUpdate(userId, { kycStatus: "pending" });

    res.status(201).json({
      success: true,
      message: "KYC submitted successfully",
      kyc: { status: kyc.status },
    });
  } catch (error) {
    console.error("KYC Submit Error:", error);
    res.status(500).json({ success: false, message: "Failed to submit KYC" });
  }
};

// Get KYC status
exports.getKYCStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user?.kycStatus === "verified") {
      return res.json({ success: true, kycStatus: "verified" });
    }

    const kyc = await KYC.findOne({ user: req.user.id });

    if (!kyc) {
      return res.json({ success: true, kycStatus: "not_submitted" });
    }

    res.json({
      success: true,
      kycStatus: kyc.status,
      rejectionReason: kyc.rejectionReason,
    });
  } catch (error) {
    console.error("KYC Status Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all KYC (admin)
exports.getAllKYC = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const kycs = await KYC.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    const baseUrl =
      process.env.RENDER_EXTERNAL_URL || "https://wheelz-ldq2.onrender.com";

    const kycsWithUrls = kycs.map((kyc) => ({
      ...kyc.toObject(),
      drivingLicenseFrontUrl: kyc.drivingLicenseFront
        ? `${baseUrl}${kyc.drivingLicenseFront}`
        : null,
      drivingLicenseBackUrl: kyc.drivingLicenseBack
        ? `${baseUrl}${kyc.drivingLicenseBack}`
        : null,
      aadhaarFrontUrl: kyc.aadhaarFront
        ? `${baseUrl}${kyc.aadhaarFront}`
        : null,
      aadhaarBackUrl: kyc.aadhaarBack ? `${baseUrl}${kyc.aadhaarBack}` : null,
    }));

    res.json({ success: true, kycs: kycsWithUrls });
  } catch (error) {
    console.error("Get all KYC error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify KYC (admin)
exports.verifyKYC = async (req, res) => {
  try {
    const { userId } = req.params;

    const kyc = await KYC.findOneAndUpdate(
      { user: userId },
      {
        status: "verified",
        verifiedAt: new Date(),
        verifiedBy: req.user.id,
        rejectionReason: null,
      },
      { new: true },
    );

    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not found" });
    }

    // ✅ Update user model
    await User.findByIdAndUpdate(userId, {
      kycStatus: "verified",
      isKycVerified: true,
    });

    res.json({
      success: true,
      message: "KYC verified successfully",
    });
  } catch (error) {
    console.error("KYC verify error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject KYC (admin)
exports.rejectKYC = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const kyc = await KYC.findOneAndUpdate(
      { user: userId },
      {
        status: "rejected",
        rejectionReason: reason,
        verifiedAt: null,
        verifiedBy: null,
      },
      { new: true },
    );

    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not found" });
    }

    // ✅ Update user model
    await User.findByIdAndUpdate(userId, {
      kycStatus: "rejected",
      isKycVerified: false,
    });

    res.json({
      success: true,
      message: "KYC rejected",
    });
  } catch (error) {
    console.error("KYC reject error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
