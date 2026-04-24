const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google-login", async (req, res) => {
  try {
    const { googleToken } = req.body;

    console.log("📝 Google login request received");

    if (!googleToken) {
      return res
        .status(400)
        .json({ success: false, message: "Google token required" });
    }

    // For authorization code flow, exchange code for tokens
    let payload;

    // Check if it's an authorization code (starts with 4/0 or 4/1)
    if (googleToken.startsWith("4/")) {
      console.log("🔐 Exchanging authorization code for tokens...");

      // Exchange code for tokens
      const { tokens } = await client.getToken({
        code: googleToken,
        redirect_uri: "postmessage", // Special URI for client-side flow
      });

      // Verify the ID token
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      payload = ticket.getPayload();
    } else {
      // Direct ID token verification (for implicit flow)
      console.log("🔐 Verifying ID token directly...");
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      payload = ticket.getPayload();
    }

    const { email, name, picture, sub: googleId } = payload;

    console.log(`👤 Google user: ${email} (${name})`);

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      console.log(`📝 Creating new user for ${email}`);
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
      console.log(`✅ Existing user found: ${email}`);
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.avatar && picture) user.avatar = picture;
        await user.save();
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "30d" },
    );

    console.log(`✅ Google login successful for ${email}`);

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
    console.error("Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Google authentication failed",
    });
  }
});

module.exports = router;
