const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/google-login", async (req, res) => {
  try {
    const { googleToken } = req.body;

    console.log("📝 Google login request");

    if (!googleToken) {
      return res
        .status(400)
        .json({ success: false, message: "Google token required" });
    }

    // Fetch user info from Google using the access token
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user info from Google");
    }

    const userInfo = await response.json();
    const { email, name, picture, sub } = userInfo;

    console.log(`👤 Google user: ${email}`);

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name,
        email: email,
        password: Math.random().toString(36).slice(-16),
        avatar: picture,
        googleId: sub,
        role: "customer",
        isActive: true,
      });
      console.log(`✅ New user created: ${email}`);
    } else {
      console.log(`✅ Existing user: ${email}`);
      if (!user.googleId) {
        user.googleId = sub;
        await user.save();
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("❌ Google login error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
