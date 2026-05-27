// backend/services/emailService.js
const nodemailer = require("nodemailer");

// Create transporter once and reuse
let transporter = null;

const initTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Add these for better reliability
      pool: true, // Use connection pooling
      maxConnections: 5,
      rateDelta: 1000, // 1 second between messages
      rateLimit: 5, // Max 5 per second
    });
  }
  return transporter;
};

// Email templates
const getEmailTemplate = (template, data) => {
  const templates = {
    bookingConfirmation: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Booking Confirmed!</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${data.name || "Customer"},</h2>
          <p>Your booking has been confirmed successfully!</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📋 Booking Details</h3>
            <p><strong>Booking ID:</strong> ${data.bookingRef || "N/A"}</p>
            <p><strong>Vehicle:</strong> ${data.vehicleName || "N/A"}</p>
            <p><strong>Pickup Date:</strong> ${data.startDate || "N/A"}</p>
            <p><strong>Return Date:</strong> ${data.endDate || "N/A"}</p>
            <p><strong>Total Amount:</strong> ₹${data.finalAmount || "N/A"}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 10px;">
            <p style="margin: 0;"><strong>📍 Pickup Location:</strong> ${data.pickupLocation || "N/A"}</p>
            <p style="margin: 5px 0 0;"><strong>📞 Vendor Contact:</strong> ${data.vendorPhone || "N/A"}</p>
          </div>
          
          <hr style="margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">
            Need help? Contact us at support@wheelz.com
          </p>
        </div>
      </div>
    `,

    paymentSuccess: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 20px; text-align: center;">
          <h1 style="color: white;">✅ Payment Successful!</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Thank you ${data.name || "Customer"}!</h2>
          <p>Your payment has been received and your booking is now confirmed.</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Booking ID:</strong> ${data.bookingRef}</p>
            <p><strong>Amount Paid:</strong> ₹${data.totalAmount}</p>
            <p><strong>Vehicle:</strong> ${data.vehicleName}</p>
          </div>
          
          <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View My Bookings
          </a>
        </div>
      </div>
    `,

    newBookingForVendor: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; padding: 20px; text-align: center;">
          <h1 style="color: white;">🆕 New Booking Received!</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${data.vendorName || "Vendor"},</h2>
          <p>You have received a new booking!</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <h3>Customer Details:</h3>
            <p><strong>Name:</strong> ${data.customerName}</p>
            <p><strong>Phone:</strong> ${data.customerPhone}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Vehicle:</strong> ${data.vehicleName}</p>
            <p><strong>Dates:</strong> ${data.startDate} to ${data.endDate}</p>
            <p><strong>Total Amount:</strong> ₹${data.totalAmount}</p>
          </div>
          
          <a href="${process.env.FRONTEND_URL}/vendor/dashboard" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Dashboard
          </a>
        </div>
      </div>
    `,

    otp: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <div style="background: #f59e0b; padding: 20px;">
          <h1 style="color: white;">Wheelz Verification</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Your OTP Code</h2>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f3f4f6; padding: 20px; border-radius: 10px;">
            ${data.otp}
          </div>
          <p style="margin-top: 20px;">This OTP is valid for 5 minutes.</p>
        </div>
      </div>
    `,
  };

  return templates[template] || `<p>${JSON.stringify(data)}</p>`;
};

// Main send email function
const sendEmail = async ({ to, subject, template, data }) => {
  if (!to) {
    console.error("❌ Email not sent: No recipient address");
    return { success: false, error: "No recipient" };
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials missing!");
    return { success: false, error: "Missing credentials" };
  }

  try {
    const transporter = initTransporter();

    // Verify connection first (optional, helps debug)
    await transporter.verify();

    const htmlContent = getEmailTemplate(template, data);

    const mailOptions = {
      from: `"Wheelz 🚗" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
      // Add text version as fallback
      text: `Booking confirmed! Your booking ID: ${data.bookingRef || "N/A"}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Test function to verify email configuration
const testEmailConfig = async () => {
  console.log("📧 Testing email configuration...");
  console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✅ Set" : "❌ Missing");
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Set" : "❌ Missing");

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials missing in .env");
    return false;
  }

  try {
    const transporter = initTransporter();
    await transporter.verify();
    console.log("✅ Email transporter verified successfully!");
    return true;
  } catch (error) {
    console.error("❌ Email verification failed:", error.message);
    return false;
  }
};

// Run test on module load (only in development)
if (process.env.NODE_ENV === "development") {
  testEmailConfig();
}

module.exports = { sendEmail, testEmailConfig };
