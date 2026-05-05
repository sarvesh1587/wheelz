const otpEmailTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Verification - Wheelz</title>
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
          max-width: 500px;
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
        .content {
          padding: 30px;
        }
        .otp-code {
          background: #fef3c7;
          text-align: center;
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
        }
        .otp-number {
          font-size: 36px;
          font-weight: 700;
          color: #f59e0b;
          letter-spacing: 5px;
          font-family: monospace;
        }
        .expiry {
          text-align: center;
          color: #9ca3af;
          font-size: 12px;
          margin-top: 20px;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚗 WHEELZ</h1>
          <p>Premium Vehicle Rental Platform</p>
        </div>
        
        <div class="content">
          <p style="font-size: 16px; color: #1f2937;">Hello ${data.name || "User"},</p>
          
          <p style="color: #4b5563; margin: 15px 0;">
            Your One-Time Password (OTP) for ${data.purpose === "registration" ? "account verification" : data.purpose === "login" ? "login" : "booking confirmation"} is:
          </p>
          
          <div class="otp-code">
            <div class="otp-number">${data.otp}</div>
          </div>
          
          <p style="color: #4b5563; font-size: 14px;">
            This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.
          </p>
          
          <div style="text-align: center;">
            <a href="${data.redirectUrl || "https://wheelz-sand.vercel.app"}" class="button">
              Continue to Wheelz →
            </a>
          </div>
        </div>
        
        <div class="expiry">
          ⏰ This OTP expires in 5 minutes
        </div>
        
        <div class="footer">
          <p>Wheelz - Premium Vehicle Rental Platform</p>
          <p>For any queries, contact us at support@wheelz.com</p>
          <p>© 2024 Wheelz. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = otpEmailTemplate;
