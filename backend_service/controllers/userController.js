const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sequelize, UserInfo, UserAccount } = require("../models");
const { findByToken, requireDatabase, toUser } = require("./authHelpers");
const { sendSecurityEmail } = require("../services/mailService");

const otpLength = Math.max(4, Math.min(8, Number(process.env.PASSWORD_RESET_OTP_LENGTH || 6)));
const otpExpiryMinutes = Math.max(1, Number(process.env.PASSWORD_RESET_OTP_EXPIRES_MINUTES || 15));

function maskEmail(email) {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "your email address";
  const visibleCharacters = localPart.length > 2 ? 1 : 0;
  return `${localPart.slice(0, visibleCharacters)}${"*".repeat(Math.max(3, localPart.length - visibleCharacters))}${localPart.slice(-2)}@${domain}`;
}

async function me(req, res) {
  if (!requireDatabase(res, sequelize)) return;
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Authentication required." });
  try {
    const user = await findByToken(token);
    if (!user) return res.status(401).json({ error: "User account is unavailable." });
    return res.json({ user: toUser(user) });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
}

async function forgotPassword(req, res) {
  if (!requireDatabase(res, sequelize)) return;
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "Email is required." });
  const response = { message: `If the email exists, a ${otpLength}-digit OTP will be sent.`, maskedEmail: maskEmail(email) };

  try {
    const info = await UserInfo.findOne({ where: { Email: email }, include: [{ model: UserAccount, as: "account" }] });
    if (!info?.account) return res.json(response);

    const otp = String(crypto.randomInt(0, 10 ** otpLength)).padStart(otpLength, "0");
    info.account.ResetOtpHash = crypto.createHash("sha256").update(otp).digest("hex");
    info.account.ResetOtpExpiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);
    await info.account.save();
    const emailSent = await sendSecurityEmail({ to: email, subject: "Your password reset code", text: `Your password reset OTP is ${otp}. It expires in ${otpExpiryMinutes} minutes.` });
    if (!emailSent && process.env.NODE_ENV !== "production") {
      response.otp = otp;
    }
    return res.json(response);
  } catch (error) {
    console.error("Forgot password failed", error);
    return res.status(500).json({ error: "Unable to process the password reset request." });
  }
}

async function resetPassword(req, res) {
  if (!requireDatabase(res, sequelize)) return;
  const email = String(req.body.email || "").trim().toLowerCase();
  const otp = String(req.body.otp || "").trim();
  const password = String(req.body.password || "");
  if (!email || otp.length !== otpLength || !/^\d+$/.test(otp) || password.length < 8) return res.status(400).json({ error: `Email, a ${otpLength}-digit OTP, and a password of at least 8 characters are required.` });
  const info = await UserInfo.findOne({ where: { Email: email }, include: [{ model: UserAccount, as: "account" }] });
  const account = info?.account;
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  if (!account || account.ResetOtpHash !== otpHash || !account.ResetOtpExpiresAt || account.ResetOtpExpiresAt <= new Date()) return res.status(400).json({ error: "This OTP is invalid or expired." });
  account.PasswordHash = await bcrypt.hash(password, 12);
  account.ResetOtpHash = null;
  account.ResetOtpExpiresAt = null;
  await account.save();
  await sendSecurityEmail({
    to: email,
    subject: "Your Digital Products Marketplace password was changed",
    text: "Your Digital Products Marketplace password was changed successfully. If this was not you, contact support immediately."
  });
  return res.json({ message: "Password reset successfully." });
}

module.exports = { me, forgotPassword, resetPassword };
