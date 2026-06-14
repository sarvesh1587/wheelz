/**
 * Promo & Referral Routes
 * File: backend/routes/promo.js
 */

const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  createPromoCode,
  validatePromoCode,
  applyPromoCode,
  getAllPromoCodes,
  deletePromoCode,
  generateReferralCode,
  applyReferralCode,
  getReferralStats,
  getReferralHistory,
  getWalletBalance,
  getWalletTransactions,
} = require("../controllers/promoController");

// ─── Admin Routes ────────────────────────────────────────────────────────────
router.post("/admin/create", protect, adminOnly, createPromoCode);
router.get("/admin/all", protect, adminOnly, getAllPromoCodes);
router.delete("/admin/:id", protect, adminOnly, deletePromoCode);

// ─── User Routes ─────────────────────────────────────────────────────────────
router.post("/validate", protect, validatePromoCode);
router.post("/apply", protect, applyPromoCode);
router.post("/referral/generate", protect, generateReferralCode);
router.post("/referral/apply", protect, applyReferralCode);
router.get("/referral/stats", protect, getReferralStats);
router.get("/referral/history", protect, getReferralHistory);
router.get("/wallet/balance", protect, getWalletBalance);
router.get("/wallet/transactions", protect, getWalletTransactions);

module.exports = router;
