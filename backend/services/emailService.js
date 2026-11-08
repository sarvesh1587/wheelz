// backend/services/emailService.js
//
// Render's free plan blocks outbound SMTP (ports 25/465/587), so in production
// mail goes out through the Gmail API over HTTPS, sent as the Gmail account
// that authorised the refresh token. SMTP is kept as a fallback for local dev.
//
// Gmail API env: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
// SMTP env:      EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
// Sender:        EMAIL_FROM (defaults to EMAIL_USER)
const nodemailer = require("nodemailer");
const MailComposer = require("nodemailer/lib/mail-composer");
const { OAuth2Client } = require("google-auth-library");

const FROM_ADDRESS = process.env.EMAIL_FROM || process.env.EMAIL_USER;
const FROM = FROM_ADDRESS ? `"Wheelz" <${FROM_ADDRESS}>` : undefined;

let gmail = null;
if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
  gmail = new OAuth2Client(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET);
  gmail.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
}

let smtp = null;
if (!gmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  const port = Number(process.env.EMAIL_PORT) || 587;
  smtp = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    connectionTimeout: 10000,
  });
}

if (gmail) console.log(`📧 Email: Gmail API as ${FROM_ADDRESS}`);
else if (smtp) console.log(`📧 Email: SMTP as ${FROM_ADDRESS}`);
else console.warn("⚠️ Email: not configured, emails will be skipped");

// Plain-text copy of an HTML email. Mail with a text part is less likely to
// be flagged as spam, and it is what text-only clients show.
function htmlToText(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<span style="display:none[\s\S]*?<\/span>/gi, "")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => `${label.replace(/<[^>]+>/g, "").trim()}: ${href}`)
    .replace(/<\/td>\s*<td[^>]*>/gi, ": ")
    .replace(/<(br|\/p|\/tr|\/h1|\/h2)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function sendViaGmail(mail) {
  const raw = await new MailComposer(mail).compile().build();
  const res = await gmail.request({
    url: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    method: "POST",
    data: { raw: raw.toString("base64url") },
  });
  return { messageId: res.data.id };
}

// Never throws: a failed email must not fail the request that triggered it.
const sendEmail = async ({ to, subject, html, text, attachments }) => {
  const recipients = [].concat(to || []).filter(Boolean);
  if (!recipients.length) {
    console.warn(`⚠️ Email skipped (no recipient): "${subject}"`);
    return null;
  }
  if (!gmail && !smtp) {
    console.warn(`⚠️ Email skipped (not configured): "${subject}"`);
    return null;
  }
  const mail = {
    from: FROM,
    replyTo: FROM_ADDRESS,
    to: recipients.join(", "),
    subject,
    html,
    text: text || (html ? htmlToText(html) : undefined),
    attachments,
  };
  try {
    const info = gmail ? await sendViaGmail(mail) : await smtp.sendMail(mail);
    console.log(`✅ Email sent: "${subject}" → ${mail.to}`);
    return info;
  } catch (error) {
    const detail = error.response?.data?.error?.message || error.message;
    console.error(`❌ Email failed: "${subject}" → ${mail.to}: ${detail}`);
    return null;
  }
};

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
