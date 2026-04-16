/**
 * Email Service
 * Sends transactional emails using Nodemailer (Gmail SMTP)
 */

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const templates = {
  welcome: (data) => ({
    subject: "🚗 Welcome to Wheelz!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
        <div style="background: #1a1a2e; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">🚗 Wheelz</h1>
          <p style="color: #9ca3af; margin: 8px 0 0;">Premium Vehicle Rentals</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px;">
          <h2 style="color: #1f2937;">Welcome, ${data.name}! 👋</h2>
          <p style="color: #6b7280; line-height: 1.6;">Your account is ready. Explore cars, bikes, and more — all at your fingertips.</p>
          <a href="${process.env.FRONTEND_URL}" style="display: inline-block; background: #f59e0b; color: #1a1a2e; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">Start Exploring →</a>
        </div>
      </div>
    `,
  }),

  bookingConfirmation: (data) => ({
    subject: `✅ Booking Confirmed - ${data.bookingRef}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
        <div style="background: #1a1a2e; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: #f59e0b; margin: 0;">🚗 Wheelz</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px;">
          <h2 style="color: #059669;">✅ Booking Confirmed!</h2>
          <p style="color: #6b7280;">Hi ${data.name}, your booking is confirmed.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Ref:</strong> ${data.bookingRef}</p>
            <p style="margin: 4px 0;"><strong>Vehicle:</strong> ${data.vehicleName}</p>
            <p style="margin: 4px 0;"><strong>From:</strong> ${data.startDate}</p>
            <p style="margin: 4px 0;"><strong>To:</strong> ${data.endDate}</p>
            <p style="margin: 4px 0;"><strong>Duration:</strong> ${data.totalDays} day(s)</p>
            <p style="margin: 4px 0; font-size: 18px;"><strong>Total: ₹${data.finalAmount.toLocaleString()}</strong></p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Free cancellation up to 24 hours before pickup.</p>
        </div>
      </div>
    `,
  }),
};

const sendEmail = async ({ to, subject, template, data, html }) => {
  if (!process.env.EMAIL_USER) {
    console.log(`[Email Skipped] To: ${to} | Subject: ${subject}`);
    return;
  }

  const content = template ? templates[template]?.(data) : { subject, html };

  await transporter.sendMail({
    from: `"Wheelz 🚗" <${process.env.EMAIL_USER}>`,
    to,
    subject: content.subject || subject,
    html: content.html || html,
  });
};

module.exports = { sendEmail };
