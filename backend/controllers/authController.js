const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const sendEmail = require("../services/emailService");
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
    },
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email and password are required",
        });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const user = await User.create({
      name,
      email,
      phone: phone || "",
      password,
      role: "customer",
    });

    // Welcome email
    sendEmail({
      to: user.email,
      subject: "🎉 Welcome to Wheelz!",
      html: `<h1>Welcome ${user.name}!</h1><p>Start renting vehicles or sharing rides today!</p>`,
    }).catch((err) => console.log("Welcome email failed:", err.message));

    sendTokenResponse(user, 201, res);
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    if (!user.isActive)
      return res
        .status(403)
        .json({ success: false, message: "Account deactivated" });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential)
      return res
        .status(400)
        .json({ success: false, message: "Google credential required" });
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture } = ticket.getPayload();
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
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: "Google login failed" });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "wishlist",
    "name images basePrice category",
  );
  res.json({ success: true, user });
};

exports.updateProfile = async (req, res) => {
  const allowed = [
    "name",
    "phone",
    "address",
    "preferences",
    "notifications",
    "avatar",
  ];
  const updates = {};
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, user });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword)))
    return res
      .status(401)
      .json({ success: false, message: "Current password incorrect" });
  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();
  res.json({ success: true, message: "Password updated" });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email required" });
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(200)
        .json({
          success: true,
          message: "If that email exists, a reset link has been sent.",
        });
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const resetURL = `${process.env.FRONTEND_URL || "https://wheelz-sand.vercel.app"}/reset-password/${resetToken}`;

    sendEmail({
      to: user.email,
      subject: "🔑 Wheelz Password Reset",
      html: `<h2>Reset Your Password</h2><p>Click below to reset:</p><a href="${resetURL}" style="background:#f59e0b;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a><p>Link valid for 10 minutes.</p>`,
    }).catch((err) => console.log("Reset email failed:", err.message));

    res.json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6)
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters",
        });
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({ success: true, message: "Password reset successful!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
