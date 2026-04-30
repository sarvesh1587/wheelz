const express = require("express");
const router = express.Router();
const KYC = require("../models/KYC");
const kycUpload = require("../middleware/uploadKYC");
const { protect, authorize } = require("../middleware/auth");

// ─── USER ROUTES ───────────────────────────────────────────────

// POST /api/kyc/submit — Submit KYC documents
router.post("/submit", protect, kycUpload, async (req, res) => {
  try {
    const { licenseNumber, aadhaarNumber } = req.body;
    const files = req.files;

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
        message: "License number and Aadhaar number are required",
      });
    }

    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number must be exactly 12 digits",
      });
    }

    const existingKYC = await KYC.findOne({ user: req.user.id });
    if (existingKYC && existingKYC.status === "verified") {
      return res.status(400).json({
        success: false,
        message: "Your KYC is already verified",
      });
    }

    const kycData = {
      user: req.user.id,
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
      kyc = await KYC.findOneAndUpdate({ user: req.user.id }, kycData, {
        new: true,
      });
    } else {
      kyc = await KYC.create(kycData);
    }

    res.status(201).json({
      success: true,
      message: "KYC submitted successfully. We'll verify within 24 hours.",
      kyc: { status: kyc.status, submittedAt: kyc.createdAt },
    });
  } catch (error) {
    console.error("KYC Submit Error:", error);
    res.status(500).json({ success: false, message: "Failed to submit KYC" });
  }
});

// GET /api/kyc/status — Get current user's KYC status
router.get("/status", protect, async (req, res) => {
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
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────

// GET /api/kyc/admin/all — List all KYC submissions
router.get("/admin/all", protect, authorize("admin"), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const kycs = await KYC.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: kycs.length, kycs });
  } catch (error) {
    console.error("Get all KYC error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/kyc/admin/:userId — Get one user's KYC details
router.get("/admin/:userId", protect, authorize("admin"), async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user: req.params.userId }).populate(
      "user",
      "name email phone",
    );
    if (!kyc)
      return res.status(404).json({ success: false, message: "KYC not found" });
    res.json({ success: true, kyc });
  } catch (error) {
    console.error("Get KYC by ID error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/kyc/admin/:userId/verify — Approve KYC
router.put(
  "/admin/:userId/verify",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const kyc = await KYC.findOneAndUpdate(
        { user: req.params.userId },
        {
          status: "verified",
          verifiedAt: new Date(),
          verifiedBy: req.user.id,
          rejectionReason: null,
        },
        { new: true },
      );
      if (!kyc)
        return res
          .status(404)
          .json({ success: false, message: "KYC not found" });
      res.json({ success: true, message: "KYC verified successfully", kyc });
    } catch (error) {
      console.error("KYC verify error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

// PUT /api/kyc/admin/:userId/reject — Reject KYC
router.put(
  "/admin/:userId/reject",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { reason } = req.body;
      if (!reason) {
        return res
          .status(400)
          .json({ success: false, message: "Rejection reason is required" });
      }

      const kyc = await KYC.findOneAndUpdate(
        { user: req.params.userId },
        { status: "rejected", rejectionReason: reason, verifiedAt: null },
        { new: true },
      );
      if (!kyc)
        return res
          .status(404)
          .json({ success: false, message: "KYC not found" });
      res.json({ success: true, message: "KYC rejected", kyc });
    } catch (error) {
      console.error("KYC reject error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

module.exports = router;
