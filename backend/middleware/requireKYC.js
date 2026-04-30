const KYC = require("../models/KYC");

const requireKYC = async (req, res, next) => {
  try {
    // Skip KYC check for admin users (optional)
    if (req.user.role === "admin") {
      return next();
    }

    const kyc = await KYC.findOne({ user: req.user.id });

    if (!kyc) {
      return res.status(403).json({
        success: false,
        message:
          "KYC verification required. Please complete your KYC before booking.",
        redirectTo: "/kyc",
        kycStatus: "not_submitted",
      });
    }

    if (kyc.status === "pending") {
      return res.status(403).json({
        success: false,
        message:
          "Your KYC is under review. Please wait for verification before booking.",
        kycStatus: "pending",
      });
    }

    if (kyc.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: `Your KYC was rejected: ${kyc.rejectionReason}. Please re-upload documents.`,
        redirectTo: "/kyc",
        kycStatus: "rejected",
      });
    }

    // KYC is verified
    next();
  } catch (error) {
    console.error("requireKYC error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking KYC status. Please try again.",
    });
  }
};

module.exports = requireKYC;
