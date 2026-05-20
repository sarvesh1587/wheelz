const KYC = require("../models/KYC");
const User = require("../models/User");

const requireKYC = async (req, res, next) => {
  try {
    console.log("🔍 KYC Check - User ID:", req.user.id);

    // Skip for admin
    if (req.user.role === "admin") {
      return next();
    }

    // Check user model first
    const user = await User.findById(req.user.id);

    if (user && user.kycStatus === "verified") {
      console.log("✅ KYC verified, allowing booking");
      return next();
    }

    // Check KYC collection
    const kyc = await KYC.findOne({ user: req.user.id });

    if (!kyc) {
      return res.status(403).json({
        success: false,
        message: "Please complete KYC verification before booking",
        redirectTo: "/kyc",
        kycStatus: "not_submitted",
      });
    }

    if (kyc.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "KYC under review. Please wait for verification",
        kycStatus: "pending",
      });
    }

    if (kyc.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: `KYC rejected: ${kyc.rejectionReason}. Please re-upload`,
        redirectTo: "/kyc",
        kycStatus: "rejected",
      });
    }

    if (kyc.status === "verified") {
      // Update user model for future
      await User.findByIdAndUpdate(req.user.id, {
        kycStatus: "verified",
        isKycVerified: true,
      });
      return next();
    }

    next();
  } catch (error) {
    console.error("requireKYC error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking KYC status",
    });
  }
};

module.exports = requireKYC;
