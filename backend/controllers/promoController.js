/**
 * Promo & Referral Controller
 * File: backend/controllers/promoController.js
 */

const {
  PromoCode,
  Referral,
  WalletTransaction,
  PromoUsage,
} = require("../models/PromoCode");
const User = require("../models/User");
const crypto = require("crypto");

// ─── GENERATE REFERRAL CODE ──────────────────────────────────────────────────
exports.generateReferralCode = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.referralCode) {
      return res.json({ success: true, referralCode: user.referralCode });
    }

    // Generate unique code: First4CharsOfName + Random4Chars
    const namePart = (user.name || "USER")
      .replace(/\s/g, "")
      .substring(0, 4)
      .toUpperCase();
    const randomPart = crypto.randomBytes(2).toString("hex").toUpperCase();
    const referralCode = `${namePart}${randomPart}`;

    user.referralCode = referralCode;
    await user.save();

    res.json({
      success: true,
      referralCode,
      message: "Referral code generated!",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── APPLY REFERRAL CODE (During Signup) ─────────────────────────────────────
exports.applyReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res
        .status(400)
        .json({ success: false, message: "Referral code required" });
    }

    // Find referrer
    const referrer = await User.findOne({
      referralCode: referralCode.toUpperCase(),
    });
    if (!referrer) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid referral code" });
    }

    if (referrer._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot use your own referral code" });
    }

    // Check if already referred
    const existing = await Referral.findOne({ referred: req.user._id });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Already used a referral code" });
    }

    // Create referral record
    const referral = await Referral.create({
      referrer: referrer._id,
      referred: req.user._id,
      referralCode,
      deviceFingerprint: req.body.deviceFingerprint || "",
      ipAddress: req.ip,
    });

    // Create welcome promo codes for both
    const welcomeCode = `WELCOME${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    await PromoCode.create({
      code: welcomeCode,
      description: "Welcome bonus - Referral",
      discountType: "fixed",
      discountValue: 100,
      maxUses: 1,
      maxUsesPerUser: 1,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      forSpecificUsers: [referrer._id, req.user._id],
      promoType: "welcome",
    });

    res.json({
      success: true,
      message: "Referral applied! ₹100 welcome bonus credited to both.",
      welcomeCode,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CREATE PROMO CODE (Admin) ───────────────────────────────────────────────
exports.createPromoCode = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderAmount,
      maxUses,
      validUntil,
      forNewUsersOnly,
    } = req.body;

    const existing = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Promo code already exists" });
    }

    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount: maxDiscount || null,
      minOrderAmount: minOrderAmount || 0,
      maxUses: maxUses || null,
      validUntil: new Date(validUntil),
      forNewUsersOnly: forNewUsersOnly || false,
      promoType: "admin",
      createdBy: req.user._id,
    });

    res
      .status(201)
      .json({ success: true, promo, message: "Promo code created!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── VALIDATE PROMO CODE ─────────────────────────────────────────────────────
exports.validatePromoCode = async (req, res) => {
  try {
    const { code, amount } = req.body;

    if (!code || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "Code and amount required" });
    }

    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (!promo) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid or expired promo code" });
    }

    // Check usage limits
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return res
        .status(400)
        .json({ success: false, message: "Promo code exhausted" });
    }

    // Check per-user limit
    const userUsage = await PromoUsage.countDocuments({
      user: req.user._id,
      promoCode: promo._id,
    });
    if (userUsage >= promo.maxUsesPerUser) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You've already used this promo code",
        });
    }

    // Check minimum order
    if (amount < promo.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount ₹${promo.minOrderAmount} required`,
      });
    }

    // Check new user only
    if (promo.forNewUsersOnly) {
      const userBookings = await require("../models/Booking").countDocuments({
        user: req.user._id,
      });
      if (userBookings > 0) {
        return res
          .status(400)
          .json({ success: false, message: "This code is for new users only" });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discountType === "percentage") {
      discountAmount = Math.round((amount * promo.discountValue) / 100);
      if (promo.maxDiscount) {
        discountAmount = Math.min(discountAmount, promo.maxDiscount);
      }
    } else {
      discountAmount = promo.discountValue;
    }

    // Don't exceed original amount
    discountAmount = Math.min(discountAmount, amount);

    res.json({
      success: true,
      promo: {
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount,
        finalAmount: amount - discountAmount,
      },
      message: `🎉 You save ₹${discountAmount}!`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── APPLY PROMO CODE ────────────────────────────────────────────────────────
exports.applyPromoCode = async (req, res) => {
  try {
    const { code, bookingId, amount } = req.body;
    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!promo) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid promo code" });
    }

    // Calculate discount (same as validate)
    let discountAmount = 0;
    if (promo.discountType === "percentage") {
      discountAmount = Math.round((amount * promo.discountValue) / 100);
      if (promo.maxDiscount)
        discountAmount = Math.min(discountAmount, promo.maxDiscount);
    } else {
      discountAmount = promo.discountValue;
    }
    discountAmount = Math.min(discountAmount, amount);

    // Record usage
    await PromoUsage.create({
      user: req.user._id,
      promoCode: promo._id,
      booking: bookingId,
      discountAmount,
    });

    // Update count
    promo.usedCount += 1;
    await promo.save();

    res.json({
      success: true,
      discountAmount,
      finalAmount: amount - discountAmount,
      message: `Promo applied! You saved ₹${discountAmount}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL PROMOS (Admin) ──────────────────────────────────────────────────
exports.getAllPromoCodes = async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.json({ success: true, promos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE PROMO ────────────────────────────────────────────────────────────
exports.deletePromoCode = async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Promo code deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── REFERRAL STATS ──────────────────────────────────────────────────────────
exports.getReferralStats = async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id });
    const credited = referrals.filter(
      (r) => r.referrerReward.status === "credited",
    );

    const totalEarned = credited.reduce(
      (sum, r) => sum + r.referrerReward.amount,
      0,
    );
    const pending = referrals.filter(
      (r) => r.referrerReward.status === "pending",
    ).length;

    res.json({
      success: true,
      stats: {
        totalReferrals: referrals.length,
        totalEarned,
        pendingReferrals: pending,
        referralCode: req.user.referralCode,
      },
      referrals,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── REFERRAL HISTORY ────────────────────────────────────────────────────────
exports.getReferralHistory = async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate("referred", "name email createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, referrals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── WALLET BALANCE ──────────────────────────────────────────────────────────
exports.getWalletBalance = async (req, res) => {
  try {
    const lastTx = await WalletTransaction.findOne({ user: req.user._id }).sort(
      { createdAt: -1 },
    );

    res.json({
      success: true,
      balance: lastTx?.balance || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── WALLET TRANSACTIONS ─────────────────────────────────────────────────────
exports.getWalletTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
