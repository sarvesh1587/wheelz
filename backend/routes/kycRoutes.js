const express = require("express");
const router = express.Router();
const {
  submitKYC,
  getKYCStatus,
  getAllKYC,
  verifyKYC,
  rejectKYC,
} = require("../controllers/kycController");
const { protect, authorize } = require("../middleware/auth");
const kycUpload = require("../middleware/uploadKYC");

// User routes
router.post("/submit", protect, kycUpload, submitKYC);
router.get("/status", protect, getKYCStatus);

// Admin routes
router.get("/admin/all", protect, authorize("admin"), getAllKYC);
router.put("/admin/:userId/verify", protect, authorize("admin"), verifyKYC);
router.put("/admin/:userId/reject", protect, authorize("admin"), rejectKYC);

module.exports = router;
