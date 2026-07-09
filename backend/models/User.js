/**
 * User Model — with security hardening fields
 * File: backend/models/User.js
 *
 * Changes from original:
 *  - Added: failedLoginAttempts, lockedUntil, lockoutCount
 *  - Added: passwordResetAttempts (anti-abuse)
 *  - Encrypted: accountNumber, aadharNumber, panNumber fields
 *  - Password min length raised to 8
 *  - Removed duplicate googleId field
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ─── Encrypt/Decrypt helpers for PII fields ──────────────────────────────────
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "wheelz_encrypt_key_change_in_prod";
const ALGORITHM = "aes-256-cbc";

function encrypt(text) {
  if (!text) return text;
  try {
    const key = crypto.scryptSync(ENCRYPTION_KEY, "wheelz_salt", 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  } catch {
    return text;
  }
}

function decrypt(text) {
  if (!text || !text.includes(":")) return text;
  try {
    const [ivHex, encHex] = text.split(":");
    const key = crypto.scryptSync(ENCRYPTION_KEY, "wheelz_salt", 32);
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return text;
  }
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"], // ✅ raised from 6
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },
    phone: { type: String, trim: true },
    avatar: { type: String, default: "" },
    address: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: "India" },
      pincode: String,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    preferences: {
      vehicleType: {
        type: String,
        enum: ["car", "bike", "any"],
        default: "any",
      },
      fuelType: {
        type: String,
        enum: ["petrol", "diesel", "electric", "any"],
        default: "any",
      },
      maxBudget: { type: Number, default: 5000 },
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }],

    isEmailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },

    // ── 🔒 Security Fields ────────────────────────────────────────────────
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lockoutCount: { type: Number, default: 0 }, // # of times locked
    lastFailedLogin: { type: Date, default: null },
    lastLoginIp: { type: String, default: null },
    passwordResetAttempts: { type: Number, default: 0 }, // anti-abuse on reset
    passwordResetLastAt: { type: Date, default: null },

    // ── Fraud Detection ───────────────────────────────────────────────────
    fraudScore: { type: Number, default: 0 },
    cancellationCount: { type: Number, default: 0 },
    flaggedForReview: { type: Boolean, default: false },
    fraudReasons: [String],

    // ── Vendor Fields ─────────────────────────────────────────────────────
    vendorType: {
      type: String,
      enum: ["individual", "business"],
      default: null,
    },
    kycStatus: {
      type: String,
      enum: ["not_submitted", "pending", "verified", "rejected"],
      default: "not_submitted",
    },
    isKycVerified: { type: Boolean, default: false },

    // Individual vendor — PII encrypted at rest
    individualDetails: {
      aadharNumber: { type: String, default: "" }, // stored encrypted
      panNumber: { type: String, default: "" }, // stored encrypted
      address: { type: String, default: "" },
    },

    // Business vendor
    businessDetails: {
      businessName: { type: String, default: "" },
      gstNumber: { type: String, default: "" },
      panNumber: { type: String, default: "" }, // stored encrypted
      businessAddress: { type: String, default: "" },
      registrationCertificate: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    // Bank details — account number encrypted
    bankDetails: {
      accountHolderName: { type: String, default: "" },
      accountNumber: { type: String, default: "" }, // stored encrypted
      ifscCode: { type: String, default: "" },
      bankName: { type: String, default: "" },
    },

    // ── Referral & Wallet ─────────────────────────────────────────────────
    referralCode: { type: String, unique: true, sparse: true, uppercase: true },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    walletBalance: { type: Number, default: 0 },
    totalReferralEarnings: { type: Number, default: 0 },

    promoCodesUsed: [
      {
        code: String,
        usedAt: Date,
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
        discountAmount: Number,
      },
    ],

    isVendorApproved: { type: Boolean, default: false },
    commissionRate: { type: Number, default: 15 },
    vehicleLimit: { type: Number, default: 5 },

    // Legacy vendorDetails (backward compat)
    vendorDetails: {
      businessName: { type: String, default: "" },
      gstNumber: { type: String, default: "" },
      businessAddress: { type: String, default: "" },
      panNumber: { type: String, default: "" },
      phoneNumber: { type: String, default: "" },
      bankAccountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      accountHolderName: { type: String, default: "" },
    },

    totalVehicles: { type: Number, default: 0 },
    vendorSince: Date,
    googleId: { type: String, default: null }, // deduplicated

    notifications: {
      email: { type: Boolean, default: true },
      bookingConfirmation: { type: Boolean, default: true },
    },

    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

UserSchema.index({ location: "2dsphere" });
UserSchema.index({ email: 1 });
UserSchema.index({ lockedUntil: 1 });

// ─── Hash password on save ────────────────────────────────────────────────────
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Encrypt PII fields on save ───────────────────────────────────────────────
UserSchema.pre("save", function (next) {
  // Only encrypt if modified and not already encrypted (check for ':' pattern)
  if (
    this.isModified("individualDetails.aadharNumber") &&
    this.individualDetails?.aadharNumber &&
    !this.individualDetails.aadharNumber.includes(":")
  ) {
    this.individualDetails.aadharNumber = encrypt(
      this.individualDetails.aadharNumber,
    );
  }
  if (
    this.isModified("individualDetails.panNumber") &&
    this.individualDetails?.panNumber &&
    !this.individualDetails.panNumber.includes(":")
  ) {
    this.individualDetails.panNumber = encrypt(
      this.individualDetails.panNumber,
    );
  }
  if (
    this.isModified("businessDetails.panNumber") &&
    this.businessDetails?.panNumber &&
    !this.businessDetails.panNumber.includes(":")
  ) {
    this.businessDetails.panNumber = encrypt(this.businessDetails.panNumber);
  }
  if (
    this.isModified("bankDetails.accountNumber") &&
    this.bankDetails?.accountNumber &&
    !this.bankDetails.accountNumber.includes(":")
  ) {
    this.bankDetails.accountNumber = encrypt(this.bankDetails.accountNumber);
  }
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || "wheelz_super_secret_change_in_production",
    { expiresIn: process.env.JWT_EXPIRE || "30d" },
  );
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
  return resetToken;
};

// ─── Is account currently locked? ────────────────────────────────────────────
UserSchema.methods.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > Date.now();
};

// ─── Record a failed login attempt ───────────────────────────────────────────
UserSchema.methods.recordFailedLogin = async function () {
  this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
  this.lastFailedLogin = new Date();

  // Lock after 5 failed attempts
  if (this.failedLoginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    this.lockoutCount = (this.lockoutCount || 0) + 1;
  }

  await this.save({ validateBeforeSave: false });
};

// ─── Reset failed login counter on success ────────────────────────────────────
UserSchema.methods.resetLoginAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.lockedUntil = null;
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

// ─── Decrypt PII helper ───────────────────────────────────────────────────────
UserSchema.methods.getDecryptedPII = function () {
  return {
    aadharNumber: decrypt(this.individualDetails?.aadharNumber),
    panNumber: decrypt(
      this.individualDetails?.panNumber || this.businessDetails?.panNumber,
    ),
    accountNumber: decrypt(this.bankDetails?.accountNumber),
  };
};

// ─── Virtual: last 4 of account number ───────────────────────────────────────
UserSchema.virtual("maskedAccountNumber").get(function () {
  const dec = decrypt(this.bankDetails?.accountNumber || "");
  return dec ? `****${dec.slice(-4)}` : null;
});

UserSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "user",
  count: true,
});

module.exports = mongoose.model("User", UserSchema);
