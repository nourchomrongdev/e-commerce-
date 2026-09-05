const jwt = require("jsonwebtoken");
const { UserRole, UserInfo, UserAccount } = require("../models");

const jwtSecret = process.env.JWT_SECRET || "local-development-secret-change-me";

function requireDatabase(res, sequelize) {
  if (sequelize) return true;
  res.status(503).json({ error: "Authentication database is not configured." });
  return false;
}

function normaliseEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function toUser(user) {
  return {
    id: user.UserId,
    name: user.info?.FullName || user.FullName,
    username: user.Username || null,
    email: user.info?.Email || user.Email,
    role: (user.role?.RoleName || user.RoleName).toLowerCase(),
  };
}

function authResponse(user) {
  return { token: jwt.sign({ sub: user.UserId, role: user.role?.RoleName || user.RoleName }, jwtSecret, { expiresIn: "1d" }), user: toUser(user) };
}

function findById(userId, transaction) {
  return UserAccount.findOne({ where: { UserId: userId, Status: true }, include: [{ model: UserInfo, as: "info" }, { model: UserRole, as: "role" }], transaction });
}

function findByToken(token) {
  const payload = jwt.verify(token, jwtSecret);
  return findById(payload.sub);
}

module.exports = { authResponse, findById, findByToken, normaliseEmail, requireDatabase, toUser, jwtSecret };
