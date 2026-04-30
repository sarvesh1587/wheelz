const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    drivingLicenseFront: {
      type: String, // file path
      required: true,
    },
    drivingLicenseBack: {
      type: String,
      required: true,
    },
    aadhaarFront: {
      type: String,
      required: true,
    },
    aadhaarBack: {
      type: String,
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    aadhaarNumber: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin who verified
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("KYC", kycSchema);
