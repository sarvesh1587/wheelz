const KYC = require("../models/KYC");

const requireKYC = async (req, res, next) => {
  try {
    const kyc = await KYC.findOne({ user: req.user.id });

    if (!kyc) {
      return res.status(403).json({
        success: false,
        message: "KYC verification required. Please upload your documents.",
        kycStatus: "not_submitted",
        redirectTo: "/kyc",
      });
    }

    if (kyc.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your KYC is under review. Please wait for verification.",
        kycStatus: "pending",
      });
    }

    if (kyc.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: `Your KYC was rejected: ${kyc.rejectionReason}. Please re-upload documents.`,
        kycStatus: "rejected",
        redirectTo: "/kyc",
      });
    }

    // KYC is verified
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
