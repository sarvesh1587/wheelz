const KYC = require("../models/KYC");
const User = require("../models/User");

// Helper function to get full image URL
// const getFullImageUrl = (req, filePath) => {
//   if (!filePath) return null;
//   const baseUrl = `${req.protocol}://${req.get("host")}`;
//   return `${baseUrl}/${filePath.replace(/\\/g, "/")}`;
// };
// ✅ FIXED: Get full image URL
const getFullImageUrl = (req, filePath) => {
  if (!filePath) return null;

  // Extract just the filename from the path
  const parts = filePath.split("/");
  const filename = parts[parts.length - 1];

  // Return proper URL
  const baseUrl =
    process.env.RENDER_EXTERNAL_URL ||
    `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/uploads/kyc/${filename}`;
};

// ─── USER ROUTES ───────────────────────────────────────────────

// Submit KYC documents
exports.submitKYC = async (req, res) => {
  try {
    const { licenseNumber, aadhaarNumber } = req.body;
    const files = req.files;
    const userId = req.user.id;

    // Validate all files uploaded
    if (
      !files?.drivingLicenseFront ||
      !files?.drivingLicenseBack ||
      !files?.aadhaarFront ||
      !files?.aadhaarBack
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload all required documents (DL front, DL back, Aadhaar front, Aadhaar back)",
      });
    }

    if (!licenseNumber || !aadhaarNumber) {
      return res.status(400).json({
        success: false,
        message: "License number and Aadhaar number are required",
      });
    }

    // Validate Aadhaar format (12 digits)
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number must be exactly 12 digits",
      });
    }

    // Check if KYC already exists
    const existingKYC = await KYC.findOne({ user: userId });

    if (existingKYC && existingKYC.status === "verified") {
      return res.status(400).json({
        success: false,
        message: "Your KYC is already verified",
      });
    }

    const kycData = {
      user: userId,
      drivingLicenseFront: files.drivingLicenseFront[0].path,
      drivingLicenseBack: files.drivingLicenseBack[0].path,
      aadhaarFront: files.aadhaarFront[0].path,
      aadhaarBack: files.aadhaarBack[0].path,
      licenseNumber,
      aadhaarNumber,
      status: "pending",
      rejectionReason: null,
    };

    let kyc;
    if (existingKYC) {
      // Re-submission after rejection
      kyc = await KYC.findOneAndUpdate({ user: userId }, kycData, {
        new: true,
      });
    } else {
      kyc = await KYC.create(kycData);
    }

    // Update user's KYC status
    await User.findByIdAndUpdate(userId, { kycStatus: "pending" });

    res.status(201).json({
      success: true,
      message: "KYC submitted successfully. We'll verify within 24 hours.",
      kyc: { status: kyc.status, submittedAt: kyc.createdAt },
    });
  } catch (error) {
    console.error("KYC Submit Error:", error);
    res.status(500).json({ success: false, message: "Failed to submit KYC" });
  }
};

// Get current user's KYC status
exports.getKYCStatus = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user: req.user.id }).select(
      "status rejectionReason createdAt verifiedAt",
    );

    if (!kyc) {
      return res.json({ success: true, kycStatus: "not_submitted" });
    }

    res.json({
      success: true,
      kycStatus: kyc.status,
      rejectionReason: kyc.rejectionReason,
      submittedAt: kyc.createdAt,
      verifiedAt: kyc.verifiedAt,
    });
  } catch (error) {
    console.error("KYC Status Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Upload KYC documents (separate endpoint)
exports.uploadKYCDocuments = async (req, res) => {
  try {
    const files = req.files || {};

    const uploadedFiles = {
      drivingLicenseFront: files.drivingLicenseFront?.[0]?.path || null,
      drivingLicenseBack: files.drivingLicenseBack?.[0]?.path || null,
      aadhaarFront: files.aadhaarFront?.[0]?.path || null,
      aadhaarBack: files.aadhaarBack?.[0]?.path || null,
    };

    res.json({
      success: true,
      files: uploadedFiles,
      message: "Documents uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN ROUTES ───────────────────────────────────────────────

// Get all KYC submissions (admin)
exports.getAllKYC = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [kycs, total] = await Promise.all([
      KYC.find(query)
        .populate("user", "name email phone role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      KYC.countDocuments(query),
    ]);

    // Add full image URLs
    const kycsWithUrls = kycs.map((kyc) => ({
      ...kyc.toObject(),
      drivingLicenseFrontUrl: getFullImageUrl(req, kyc.drivingLicenseFront),
      drivingLicenseBackUrl: getFullImageUrl(req, kyc.drivingLicenseBack),
      aadhaarFrontUrl: getFullImageUrl(req, kyc.aadhaarFront),
      aadhaarBackUrl: getFullImageUrl(req, kyc.aadhaarBack),
    }));

    res.json({
      success: true,
      kycs: kycsWithUrls,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Get all KYC error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single KYC submission by user ID (admin)
exports.getKYCByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const kyc = await KYC.findOne({ user: userId }).populate(
      "user",
      "name email phone",
    );

    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not found" });
    }

    // Add full image URLs
    const kycWithUrls = {
      ...kyc.toObject(),
      drivingLicenseFrontUrl: getFullImageUrl(req, kyc.drivingLicenseFront),
      drivingLicenseBackUrl: getFullImageUrl(req, kyc.drivingLicenseBack),
      aadhaarFrontUrl: getFullImageUrl(req, kyc.aadhaarFront),
      aadhaarBackUrl: getFullImageUrl(req, kyc.aadhaarBack),
    };

    res.json({ success: true, kyc: kycWithUrls });
  } catch (error) {
    console.error("Get KYC by ID error:", error);
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

    // Update user's KYC status
    await User.findByIdAndUpdate(userId, { kycStatus: "verified" });

    res.json({
      success: true,
      message: "KYC verified successfully",
      kyc,
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

    // Update user's KYC status
    await User.findByIdAndUpdate(userId, { kycStatus: "rejected" });

    res.json({
      success: true,
      message: "KYC rejected",
      kyc,
    });
  } catch (error) {
    console.error("KYC reject error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
