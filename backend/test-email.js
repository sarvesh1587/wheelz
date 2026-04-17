require("dotenv").config();
const { sendEmail } = require("./services/emailService");

async function testEmail() {
  try {
    await sendEmail({
      to: "your_test_email@gmail.com", // Change to your email
      subject: "Test Email from Wheelz",
      html: "<h1>✅ Test Successful!</h1><p>Your email service is working!</p>",
    });
    console.log("✅ Email sent successfully!");
  } catch (err) {
    console.error("❌ Email failed:", err.message);
  }
}

testEmail();
