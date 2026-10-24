const bcrypt = require("bcryptjs");
const { sequelize, UserInfo, UserAccount, UserRole, UserAccountRole } = require("../models");
const { authResponse, normaliseEmail, requireDatabase, restoreExpiredSuspension } = require("./authHelpers");
const { sendSecurityEmail } = require("../services/mailService");

async function login(req, res) {
  if (!requireDatabase(res, sequelize)) return;
  const email = normaliseEmail(req.body.email);
  const password = String(req.body.password || "");
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
  try {
    const info = await UserInfo.findOne({ where: { Email: email }, include: [{ model: UserAccount, as: "account", include: [{ model: UserRole, as: "role" }] }] });
    const user = info?.account;
    if (!user || !user.PasswordHash || !(await bcrypt.compare(password, user.PasswordHash))) return res.status(401).json({ error: "Invalid email or password." });
    const isActive = await restoreExpiredSuspension(user);
    if (!isActive) {
      if (user.Status === "suspended" || user.Status === "banned") {
        return res.status(403).json({
          error: user.Status === "banned" ? "Your account has been banned." : "Your account has been disabled.",
          code: user.Status === "banned" ? "ACCOUNT_BANNED" : "ACCOUNT_SUSPENDED",
          message: user.SuspensionMessage || "Your account access has been temporarily disabled.",
          name: info.FullName || "",
          username: user.Username || "",
          email: info.Email || email,
          startsAt: user.SuspensionStartsAt,
          suspendedUntil: user.SuspendedUntil,
        });
      }
      return res.status(403).json({ error: "This account is not active." });
    }
    user.info = info;
    await sendSecurityEmail({
      to: email,
      subject: "New login to your Digital Products Marketplace account",
      text: `A successful login was detected on your Digital Products Marketplace account. If this was not you, reset your password immediately.`
    });
    return res.json(authResponse(user));
  } catch (error) {
    console.error("Login failed", error);
    return res.status(500).json({ error: "Unable to sign in." });
  }
}

async function adminLogin(req, res) {
  if (!requireDatabase(res, sequelize)) return;
  const email = normaliseEmail(req.body.email);
  const password = String(req.body.password || "");
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  try {
    const info = await UserInfo.findOne({
      where: { Email: email },
      include: [{
        model: UserAccount,
        as: "account",
        include: [
          { model: UserRole, as: "role" },
          { model: UserAccountRole, as: "roles", include: [{ model: UserRole, as: "role" }] },
        ],
      }],
    });
    const user = info?.account;
    const passwordMatches = Boolean(user?.PasswordHash) && await bcrypt.compare(password, user.PasswordHash);
    if (!user || !passwordMatches || user.Status !== "active") {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const roleNames = [user.role?.RoleName, ...(user.roles || []).map((link) => link.role?.RoleName)]
      .filter(Boolean)
      .map((role) => String(role).toLowerCase());
    if (!roleNames.includes("admin") && !roleNames.includes("superadmin")) {
      return res.status(403).json({ error: "This account does not have admin access." });
    }

    user.info = info;
    return res.json(authResponse(user));
  } catch (error) {
    console.error("Admin login failed", error);
    return res.status(500).json({ error: "Unable to sign in." });
  }
}

module.exports = { adminLogin, login };
