const bcrypt = require("bcryptjs");
const { sequelize, UserInfo, UserAccount, UserRole } = require("../models");
const { authResponse, normaliseEmail, requireDatabase } = require("./authHelpers");

async function login(req, res) {
  if (!requireDatabase(res, sequelize)) return;
  const email = normaliseEmail(req.body.email);
  const password = String(req.body.password || "");
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
  try {
    const info = await UserInfo.findOne({ where: { Email: email }, include: [{ model: UserAccount, as: "account", include: [{ model: UserRole, as: "role" }] }] });
    const user = info?.account;
    if (!user || !user.PasswordHash || !(await bcrypt.compare(password, user.PasswordHash))) return res.status(401).json({ error: "Invalid email or password." });
    user.info = info;
    return res.json(authResponse(user));
  } catch (error) {
    console.error("Login failed", error);
    return res.status(500).json({ error: "Unable to sign in." });
  }
}

module.exports = { login };
