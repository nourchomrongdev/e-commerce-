const nodemailer = require("nodemailer");

function mailTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

async function sendSecurityEmail({ to, subject, text }) {
  const transport = mailTransport();
  if (!transport) return false;

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text
    });
    return true;
  } catch (error) {
    console.error("Security email failed", error);
    return false;
  }
}

module.exports = { sendSecurityEmail };