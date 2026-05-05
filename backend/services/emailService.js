const nodemailer = require("nodemailer");
const paymentSuccessTemplate = require("./emailTemplates/paymentSuccess");
const otpEmailTemplate = require("./emailTemplates/otpEmail");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async ({ to, subject, template, data }) => {
  let htmlContent = "";

  if (template === "paymentSuccess") {
    htmlContent = paymentSuccessTemplate(data);
  } else if (template === "otp") {
    htmlContent = otpEmailTemplate(data);
  }

  const mailOptions = {
    from: `"Wheelz" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
};
