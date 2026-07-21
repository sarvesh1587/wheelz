// backend/services/emailService.js
// At the TOP of emailService.js, add:
console.log("📧 Email Config Check:");
console.log("  HOST:", process.env.EMAIL_HOST || "NOT SET");
console.log("  PORT:", process.env.EMAIL_PORT || "NOT SET");
console.log("  USER:", process.env.EMAIL_USER || "NOT SET");
console.log("  PASS:", process.env.EMAIL_PASS ? "SET" : "NOT SET");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection on startup
transporter
  .verify()
  .then(() => console.log("✅ Email service ready"))
  .catch((err) => console.error("❌ Email config error:", err.message));

const sendEmail = async ({ to, subject, html }) => {
  if (!to) {
    console.log("⚠️ No recipient email provided");
    return;
  }

  try {
    const mailOptions = {
      from: `"Wheelz" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    // Don't throw - just log, so app doesn't crash
    return null;
  }
};

module.exports = sendEmail;
