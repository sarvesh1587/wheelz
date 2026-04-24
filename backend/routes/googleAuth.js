const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Google Login - Frontend token verification
router.post("/google-login", async (req, res) => {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res
        .status(400)
        .json({ success: false, message: "Google token required" });
    }

    // Verify Google token
    const { OAuth2Client } = require("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name: name,
        email: email,
        password: Math.random().toString(36).slice(-16),
        avatar: picture,
        googleId: googleId,
        role: "customer",
        isActive: true,
      });
      console.log(`✅ New user created via Google: ${email}`);
    } else {
      // Update googleId if not set
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.avatar && picture) user.avatar = picture;
        await user.save();
      }
      console.log(`✅ Existing user logged in via Google: ${email}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "30d" },
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
    console.error("Google login error:", error);
    res
      .status(500)
      .json({ success: false, message: "Google authentication failed" });
  }
});

module.exports = router;
