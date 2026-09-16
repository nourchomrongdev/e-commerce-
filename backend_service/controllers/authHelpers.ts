const jwt = require("jsonwebtoken");
const { UserRole, UserInfo, UserAccount, UserAccountRole, CreatorProfile } = require("../models");

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
  const roles = (user.roles || [])
    .map((userRole) => userRole.role?.RoleName || userRole.RoleName)
    .filter(Boolean)
    .map((role) => String(role).toLowerCase());
  const primaryRole = String(user.role?.RoleName || user.RoleName || "").toLowerCase();

  if (primaryRole && !roles.includes(primaryRole)) roles.unshift(primaryRole);

  return {
    id: user.UserId,
    name: user.info?.FullName || user.FullName,
    username: user.Username || null,
    email: user.info?.Email || user.Email,
    role: primaryRole,
    roles,
    isVerified: Boolean(user.creatorProfile?.IsVerified),
    hasApplied: Boolean(user.creatorProfile),
  };
}

function authResponse(user) {
  return { token: jwt.sign({ sub: user.UserId, role: user.role?.RoleName || user.RoleName }, jwtSecret, { expiresIn: "1d" }), user: toUser(user) };
}

async function ensureCreatorRoleForUser(user, transaction?: any) {
  if (!user || !user.creatorProfile?.IsVerified) return user;

  const roleNames = [String(user.role?.RoleName || user.RoleName || ""), ...(Array.isArray(user.roles) ? user.roles.map((link) => String(link.role?.RoleName || link.RoleName || "")) : [])]
    .filter(Boolean)
    .map((role) => role.toLowerCase());

  if (roleNames.includes("creator")) return user;

  const [creatorRole] = await UserRole.findOrCreate({
    where: { RoleName: "Creator" },
    defaults: { RoleName: "Creator" },
    transaction,
  });

  await UserAccountRole.findOrCreate({
    where: { UserId: user.UserId, UserRoleId: creatorRole.UserRoleId },
    defaults: { UserId: user.UserId, UserRoleId: creatorRole.UserRoleId, CreatedAt: new Date() },
    transaction,
  });

  user.role = creatorRole;
  user.roles = Array.isArray(user.roles) ? [...user.roles, { role: creatorRole }] : [{ role: creatorRole }];
  return user;
}

async function findById(userId, transaction?: any) {
  const user = await UserAccount.findOne({
    where: { UserId: userId, Status: "active" },
    include: [
      { model: UserInfo, as: "info" },
      { model: UserRole, as: "role" },
      { model: UserAccountRole, as: "roles", include: [{ model: UserRole, as: "role" }] },
      { model: CreatorProfile, as: "creatorProfile" },
    ],
    transaction,
  });

  if (!user) return null;
  return ensureCreatorRoleForUser(user, transaction);
}

function findByToken(token) {
  const payload = jwt.verify(token, jwtSecret);
  return findById(payload.sub);
}

module.exports = { authResponse, ensureCreatorRoleForUser, findById, findByToken, normaliseEmail, requireDatabase, toUser, jwtSecret };
