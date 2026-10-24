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

async function restoreExpiredSuspension(account, transaction?: any) {
  if (account?.Status === "active") return true;
  if (!["suspended", "banned"].includes(account?.Status)) return false;

  const now = new Date();
  const startsAt = account.SuspensionStartsAt ? new Date(account.SuspensionStartsAt) : null;
  const suspendedUntil = account.SuspendedUntil ? new Date(account.SuspendedUntil) : null;
  if (startsAt && startsAt > now) return true;

  if (!suspendedUntil || Number.isNaN(suspendedUntil.getTime()) || suspendedUntil > now) return false;

  account.Status = "active";
  account.SuspensionMessage = null;
  account.SuspensionStartsAt = null;
  account.SuspendedUntil = null;
  await account.save({ transaction });
  return true;
}

async function restrictionForToken(token) {
  const payload = jwt.verify(token, jwtSecret);
  const account = await UserAccount.findByPk(payload.sub, {
    include: [{ model: UserInfo, as: "info" }],
  });
  if (!account || await restoreExpiredSuspension(account)) return null;
  if (!["suspended", "banned"].includes(account.Status)) return null;

  return {
    status: account.Status,
    message: account.SuspensionMessage || "Your account access has been restricted.",
    name: account.info?.FullName || "",
    username: account.Username || "",
    email: account.info?.Email || "",
    startsAt: account.SuspensionStartsAt,
    endsAt: account.SuspendedUntil,
  };
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
    where: { UserId: userId },
    include: [
      { model: UserInfo, as: "info" },
      { model: UserRole, as: "role" },
      { model: UserAccountRole, as: "roles", include: [{ model: UserRole, as: "role" }] },
      { model: CreatorProfile, as: "creatorProfile" },
    ],
    transaction,
  });

  if (!user) return null;
  if (!(await restoreExpiredSuspension(user, transaction))) return null;
  return ensureCreatorRoleForUser(user, transaction);
}

function findByToken(token) {
  const payload = jwt.verify(token, jwtSecret);
  return findById(payload.sub);
}

module.exports = { authResponse, ensureCreatorRoleForUser, findById, findByToken, normaliseEmail, requireDatabase, restrictionForToken, restoreExpiredSuspension, toUser, jwtSecret };
