const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
      minlength: [6, "Password must be at least 6 characters"],
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

    // Fraud Detection Fields
    fraudScore: { type: Number, default: 0 },
    cancellationCount: { type: Number, default: 0 },
    flaggedForReview: { type: Boolean, default: false },
    fraudReasons: [String],

    // Vendor Specific Fields
    isVendorApproved: {
      type: Boolean,
      default: false,
    },
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
    totalVehicles: {
      type: Number,
      default: 0,
    },
    vendorSince: Date,

    // Notification Preferences
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

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || "wheelz_secret",
    { expiresIn: process.env.JWT_EXPIRE || "30d" },
  );
};

UserSchema.methods.createPasswordResetToken = function () {
  const crypto = require("crypto");
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

UserSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "user",
  count: true,
});

module.exports = mongoose.model("User", UserSchema);
