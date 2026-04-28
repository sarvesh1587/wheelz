const paymentSuccessTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Successful - Wheelz</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f3f4f6;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          color: white;
          font-size: 28px;
          margin-bottom: 8px;
        }
        .header p {
          color: rgba(255,255,255,0.9);
          font-size: 14px;
        }
        .success-badge {
          background: #10b981;
          color: white;
          padding: 8px 20px;
          border-radius: 30px;
          display: inline-block;
          font-weight: 600;
          margin-top: 15px;
        }
        .content {
          padding: 30px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .booking-details {
          background: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #f59e0b;
          margin-bottom: 15px;
          border-left: 3px solid #f59e0b;
          padding-left: 10px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-label {
          color: #6b7280;
          font-size: 14px;
        }
        .detail-value {
          font-weight: 500;
          color: #1f2937;
        }
        .price-breakdown {
          background: #fef3c7;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
        }
        .total-amount {
          font-size: 24px;
          font-weight: 700;
          color: #f59e0b;
          text-align: center;
          margin-top: 10px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 10px;
          font-weight: 600;
          margin-top: 20px;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
          }
          .content {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚗 WHEELZ</h1>
          <p>Premium Vehicle Rental Platform</p>
          <div class="success-badge">✅ PAYMENT SUCCESSFUL</div>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hello ${data.name}! 👋
          </div>
          
          <p style="color: #4b5563; margin-bottom: 20px;">
            Your payment has been successfully processed and your booking is now <strong>CONFIRMED</strong>.
            Please find your booking details below.
          </p>
          
          <!-- Booking Details -->
          <div class="booking-details">
            <div class="section-title">📋 Booking Information</div>
            <div class="detail-row">
              <span class="detail-label">Booking ID</span>
              <span class="detail-value">${data.bookingRef}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Date & Time</span>
              <span class="detail-value">${data.paymentDate} at ${data.paymentTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transaction ID</span>
              <span class="detail-value">${data.transactionId}</span>
            </div>
          </div>
          
          <!-- Vehicle Details -->
          <div class="booking-details">
            <div class="section-title">🚗 Vehicle Details</div>
            <div class="detail-row">
              <span class="detail-label">Vehicle</span>
              <span class="detail-value">${data.vehicleName} (${data.vehicleBrand})</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Pickup Date</span>
              <span class="detail-value">${data.startDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Return Date</span>
              <span class="detail-value">${data.endDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Days</span>
              <span class="detail-value">${data.totalDays} days</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Pickup Location</span>
              <span class="detail-value">${data.pickupLocation}</span>
            </div>
          </div>
          
          <!-- Price Breakdown -->
          <div class="price-breakdown">
            <div class="section-title" style="border-left-color: #f59e0b;">💰 Payment Details</div>
            <div class="detail-row">
              <span class="detail-label">Price per day</span>
              <span class="detail-value">₹${data.pricePerDay.toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Number of days</span>
              <span class="detail-value">${data.totalDays} days</span>
            </div>
            <div class="detail-row" style="border-bottom: none;">
              <span class="detail-label" style="font-weight: 600;">Total Paid</span>
              <span class="detail-value" style="font-weight: 700; color: #f59e0b; font-size: 18px;">₹${data.totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <!-- Next Steps -->
          <div style="background: #e0f2fe; border-radius: 12px; padding: 20px; margin-top: 20px;">
            <div class="section-title" style="border-left-color: #0284c7;">📌 Next Steps</div>
            <ul style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-left: 20px;">
              <li>Show this email or your booking confirmation at the pickup location</li>
              <li>Carry a valid driving license and ID proof</li>
              <li>Contact the vendor at the provided number for any assistance</li>
              <li>Download your receipt from the Wheelz dashboard</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="https://wheelz-sand.vercel.app/dashboard" class="button">
              View My Bookings →
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>🚗 Wheelz - Premium Vehicle Rental Platform</p>
          <p>For any queries, contact us at support@wheelz.com | 9876543210</p>
          <p>© 2024 Wheelz. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = paymentSuccessTemplate;
