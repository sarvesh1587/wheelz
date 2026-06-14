/**
 * PromoCode & Referral Models
 * File: backend/models/PromoCode.js
 */

const mongoose = require("mongoose");

// ─── PromoCode Schema ────────────────────────────────────────────────────────
const PromoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: "" },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true }, // % or ₹
    maxDiscount: { type: Number, default: null }, // cap for percentage
    minOrderAmount: { type: Number, default: 0 },

    // Usage limits
    maxUses: { type: Number, default: null }, // null = unlimited
    maxUsesPerUser: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },

    // Validity
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },

    // Targeting
    forNewUsersOnly: { type: Boolean, default: false },
    forSpecificUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Type
    promoType: {
      type: String,
      enum: ["admin", "referral", "seasonal", "welcome"],
      default: "admin",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// ─── Referral Schema ─────────────────────────────────────────────────────────
const ReferralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referred: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referralCode: { type: String, required: true },

    // Rewards status
    referrerReward: {
      amount: { type: Number, default: 100 },
      status: {
        type: String,
        enum: ["pending", "credited", "cancelled"],
        default: "pending",
      },
      creditedAt: { type: Date },
    },
    referredReward: {
      amount: { type: Number, default: 100 },
      status: {
        type: String,
        enum: ["pending", "credited", "cancelled"],
        default: "pending",
      },
      creditedAt: { type: Date },
    },

    // Condition: referred user must complete 1 trip/booking
    qualifyingBooking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    qualifiedAt: { type: Date },

    // Fraud prevention
    deviceFingerprint: { type: String },
    ipAddress: { type: String },
    isSuspicious: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ─── User Wallet Transactions ────────────────────────────────────────────────
const WalletTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: [
        "referral_credit",
        "promo_credit",
        "refund",
        "purchase",
        "withdrawal",
        "expired",
      ],
      required: true,
    },
    description: { type: String },
    reference: { type: String }, // PromoCode or Referral ID
    balance: { type: Number, required: true }, // Running balance
  },
  { timestamps: true },
);

// ─── User Promo Usage Tracker ────────────────────────────────────────────────
const PromoUsageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  promoCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PromoCode",
    required: true,
  },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  discountAmount: { type: Number, required: true },
  usedAt: { type: Date, default: Date.now },
});

// Indexes
PromoCodeSchema.index({ code: 1, isActive: 1 });
ReferralSchema.index({ referrer: 1, referred: 1 });
WalletTransactionSchema.index({ user: 1, createdAt: -1 });

const PromoCode = mongoose.model("PromoCode", PromoCodeSchema);
const Referral = mongoose.model("Referral", ReferralSchema);
const WalletTransaction = mongoose.model(
  "WalletTransaction",
  WalletTransactionSchema,
);
const PromoUsage = mongoose.model("PromoUsage", PromoUsageSchema);

module.exports = { PromoCode, Referral, WalletTransaction, PromoUsage };
