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

  bookingConfirmationWithVendor: (data) => ({
    subject: `✅ Booking Confirmed - ${data.bookingRef}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 30px; text-align: center;">
          <h1 style="color: #f59e0b;">🚗 Wheelz</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px;">
          <h2 style="color: #059669;">✅ Booking Confirmed!</h2>
          <p>Hi ${data.name}, your booking is confirmed.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Booking Details</h3>
            <p><strong>Ref:</strong> ${data.bookingRef}</p>
            <p><strong>Vehicle:</strong> ${data.vehicleName}</p>
            <p><strong>From:</strong> ${data.startDate}</p>
            <p><strong>To:</strong> ${data.endDate}</p>
            <p><strong>Duration:</strong> ${data.totalDays} day(s)</p>
            <p><strong>Total:</strong> ₹${data.finalAmount.toLocaleString()}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">📍 Vendor Details (For Pickup)</h3>
            <p><strong>Vendor:</strong> ${data.vendorName}</p>
            <p><strong>Phone:</strong> ${data.vendorPhone}</p>
            <p><strong>Address:</strong> ${data.vendorAddress}</p>
            <p><strong>Pickup Location:</strong> ${data.pickupLocation}</p>
            <p><strong>Instructions:</strong> ${data.pickupInstructions}</p>
          </div>
          
          <p>Please contact the vendor to coordinate pickup.</p>
        </div>
      </div>
    `,
  }),

  newBookingForVendor: (data) => ({
    subject: `📅 New Booking Received - ${data.vehicleName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 30px; text-align: center;">
          <h1 style="color: #f59e0b;">🚗 Wheelz</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px;">
          <h2 style="color: #059669;">📅 New Booking Received!</h2>
          <p>Dear ${data.vendorName},</p>
          <p>A new booking has been made for your vehicle.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Customer Details</h3>
            <p><strong>Name:</strong> ${data.customerName}</p>
            <p><strong>Phone:</strong> ${data.customerPhone}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Address:</strong> ${data.customerAddress}</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Booking Details</h3>
            <p><strong>Vehicle:</strong> ${data.vehicleName}</p>
            <p><strong>From:</strong> ${data.startDate}</p>
            <p><strong>To:</strong> ${data.endDate}</p>
            <p><strong>Duration:</strong> ${data.totalDays} day(s)</p>
            <p><strong>Amount:</strong> ₹${data.totalAmount.toLocaleString()}</p>
            <p><strong>Pickup Location:</strong> ${data.pickupLocation}</p>
          </div>
          
          <p>Please contact the customer to coordinate delivery.</p>
          <p>Your earnings will be credited after the rental period.</p>
        </div>
      </div>
    `,
  }),

  paymentSuccess: (data) => ({
    subject: `✅ Payment Successful - ${data.bookingRef}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 30px; text-align: center;">
          <h1 style="color: #f59e0b;">🚗 Wheelz</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px;">
          <h2 style="color: #059669;">✅ Payment Successful!</h2>
          <p>Hi ${data.name}, your payment has been received.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Booking Details</h3>
            <p><strong>Ref:</strong> ${data.bookingRef}</p>
            <p><strong>Vehicle:</strong> ${data.vehicleName}</p>
            <p><strong>From:</strong> ${data.startDate}</p>
            <p><strong>To:</strong> ${data.endDate}</p>
            <p><strong>Amount Paid:</strong> ₹${data.totalAmount?.toLocaleString() || data.finalAmount?.toLocaleString()}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">📍 Vendor Contact Details</h3>
            <p><strong>Vendor:</strong> ${data.vendorName}</p>
            <p><strong>Phone:</strong> ${data.vendorPhone}</p>
            <p><strong>Address:</strong> ${data.vendorAddress}</p>
            <p><strong>Pickup Location:</strong> ${data.pickupLocation}</p>
          </div>
          
          <p>Please contact the vendor to coordinate vehicle pickup.</p>
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

  if (!content) {
    console.log(`[Email Error] Template '${template}' not found`);
    return;
  }

  await transporter.sendMail({
    from: `"Wheelz 🚗" <${process.env.EMAIL_USER}>`,
    to,
    subject: content.subject || subject,
    html: content.html || html,
  });
};

module.exports = { sendEmail };
