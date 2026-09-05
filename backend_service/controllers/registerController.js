const bcrypt = require("bcryptjs");
const { sequelize, UserRole, UserInfo, UserAccount } = require("../models");
const { authResponse, requireDatabase } = require("./authHelpers");

async function register(req, res) {
  if (!requireDatabase(res, sequelize)) return;
  const name = String(req.body.name || "").trim();
  const username = String(req.body.username || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!name || !username || !email || password.length < 8) return res.status(400).json({ error: "Name, username, a valid email, and a password of at least 8 characters are required." });
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) return res.status(400).json({ error: "Username must be 3-30 characters using only letters, numbers, and underscores." });
  try {
    const user = await sequelize.transaction(async (transaction) => {
      const info = await UserInfo.create({ FullName: name, Email: email }, { transaction });
      const role = await UserRole.findOne({ where: { RoleName: "Buyer" }, transaction });
      const account = await UserAccount.create({ UserInfoId: info.UserInfoId, Username: username, PasswordHash: await bcrypt.hash(password, 12), RoleId: role.UserRoleId, Status: true }, { transaction });
      account.info = info;
      account.role = role;
      return account;
    });
    return res.status(201).json(authResponse(user));
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") return res.status(409).json({ error: error.fields?.Username ? "That username is already taken." : "An account with that email already exists." });
    console.error("Registration failed", error);
    return res.status(500).json({ error: "Unable to create account." });
  }
}

module.exports = { register };
