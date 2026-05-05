const OTP = require("../models/OTP");
const User = require("../models/User");
const otpGenerator = require("otp-generator");
const { sendEmail } = require("../services/emailService");

// Generate 6-digit OTP
const generateOTP = () => {
  return otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

// Send OTP via Email
const sendOTPByEmail = async (email, otp, purpose, name = "User") => {
  try {
    await sendEmail({
      to: email,
      subject: `🔐 Your OTP for ${purpose} - Wheelz`,
      template: "otp",
      data: {
        name: name,
        otp: otp,
        purpose: purpose,
        redirectUrl:
          process.env.FRONTEND_URL || "https://wheelz-sand.vercel.app",
      },
    });
    console.log(`✅ OTP email sent to ${email}: ${otp}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email, purpose = "registration", name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Delete any existing OTP for this email and purpose
    await OTP.deleteMany({ email, purpose, isVerified: false });

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    await OTP.create({
      email,
      otp,
      purpose,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send OTP via email
    const sent = await sendOTPByEmail(email, otp, purpose, name);

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }

    res.json({
      success: true,
      message: "OTP sent successfully to your email",
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose = "registration" } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      purpose,
      isVerified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Update attempts
    otpRecord.attempts += 1;
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    await otpRecord.save();

    // Mark OTP as verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    // Update user's email verification if purpose is registration
    if (purpose === "registration") {
      await User.findOneAndUpdate(
        { email },
        { isEmailVerified: true, emailVerifiedAt: new Date() },
      );
    }

    res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email, purpose = "registration", name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    // Delete old OTPs
    await OTP.deleteMany({ email, purpose, isVerified: false });

    // Generate new OTP
    const otp = generateOTP();

    // Save to database
    await OTP.create({
      email,
      otp,
      purpose,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send OTP via email
    const sent = await sendOTPByEmail(email, otp, purpose, name);

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    res.json({
      success: true,
      message: "OTP resent successfully to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};

// Check if email is verified
exports.isEmailVerified = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const user = await User.findOne({ email, isEmailVerified: true });

    res.json({
      success: true,
      isVerified: !!user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check email status",
    });
  }
};
