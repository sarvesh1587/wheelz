// Sends one test email using the configured transport.
//   node test-email.js someone@example.com
require("dotenv").config();
const sendEmail = require("./services/emailService");

const to = process.argv[2] || process.env.ADMIN_EMAIL || "hm2300439@gmail.com";
sendEmail({
  to,
  subject: "Test email from Wheelz",
  html: "<h1>It works.</h1><p>Your Wheelz email service is sending mail.</p>",
}).then((info) => {
  console.log(info ? `Sent to ${to}` : "Not sent, see the log above.");
  process.exit(info ? 0 : 1);
});
