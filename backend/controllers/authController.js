/**
 * Auth Controller
 * Handles registration, login, logout, profile
 */
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { sendEmail } = require("../services/emailService");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      preferences: user.preferences,
      wishlist: user.wishlist,
      fraudScore: user.fraudScore,
      flaggedForReview: user.flaggedForReview,
    },
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    console.log("📝 Registration request for:", email);

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const user = await User.create({
      name,
      email,
      phone: phone || "",
      password,
      role: "customer",
    });

    console.log("✅ User created:", user._id);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "wheelz_secret",
      { expiresIn: "30d" },
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Register error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Account has been deactivated" });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ========== GOOGLE LOGIN ==========

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not found from Google",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: Math.random().toString(36).slice(-12),
        role: "customer",
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        avatar: picture || "",
      });
      console.log("✅ New user created via Google:", user._id);
    } else {
      if (picture && !user.avatar) {
        user.avatar = picture;
        await user.save();
      }
      console.log("✅ Existing user logged in via Google:", user._id);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "wheelz_secret",
      { expiresIn: "30d" },
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      success: false,
      message: "Google login failed. Please try again.",
    });
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "wishlist",
      "name images basePrice category",
    );
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = [
      "name",
      "phone",
      "address",
      "preferences",
      "notifications",
      "avatar",
    ];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.matchPassword(currentPassword))) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email address",
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request - Wheelz",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Reset Your Password</h2>
            <p>You requested a password reset for your Wheelz account.</p>
            <p>Click the button below to reset your password. This link is valid for 10 minutes.</p>
            <a href="${resetURL}" style="display: inline-block; background: #f59e0b; color: #1a1a2e; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
            <hr />
            <p style="font-size: 12px; color: #666;">Wheelz - Premium Vehicle Rentals</p>
          </div>
        `,
      });

      res.json({
        success: true,
        message: "Password reset link sent to your email",
      });
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Error sending email. Please try again later.",
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message:
        "Password reset successful! Please login with your new password.",
    });
  } catch (err) {
    next(err);
  }
};
