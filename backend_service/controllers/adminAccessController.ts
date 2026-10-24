const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { sequelize, UserInfo, UserAccount, UserRole, UserAccountRole } = require("../models");

const accountStatuses = ["active", "inactive", "suspended", "banned"];

function hasSuperadminRole(user) {
  const roles = [user?.role?.RoleName, user?.RoleName, ...(user?.roles || []).map((link) => link.role?.RoleName || link.RoleName)];
  return roles.some((role) => String(role || "").toLowerCase() === "superadmin");
}

function serializeRole(role, usersCount = 0) {
  return {
    id: role.UserRoleId,
    name: role.RoleName,
    description: role.Description || "",
    usersCount,
    updatedAt: role.UpdatedAt || role.CreatedAt,
  };
}

function serializeUser(account, currentUserId = null) {
  const roles = (account.roles || [])
    .map((link) => link.role?.RoleName)
    .filter(Boolean);
  const primaryRole = account.role?.RoleName || "";
  if (primaryRole && !roles.includes(primaryRole)) roles.unshift(primaryRole);

  return {
    id: account.UserId,
    name: account.info?.FullName || "",
    username: account.Username || "",
    email: account.info?.Email || "",
    roleId: account.RoleId,
    role: primaryRole,
    roles,
    status: account.Status,
    suspensionMessage: account.SuspensionMessage || "",
    suspensionStartsAt: account.SuspensionStartsAt,
    suspendedUntil: account.SuspendedUntil,
    joinedAt: account.CreatedAt,
    isCurrentUser: account.UserId === currentUserId,
  };
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function listUsers(req, res) {
  try {
    await UserAccount.update(
      { Status: "active", SuspensionMessage: null, SuspensionStartsAt: null, SuspendedUntil: null },
      { where: { Status: { [Op.in]: ["suspended", "banned"] }, SuspendedUntil: { [Op.lte]: new Date() } } },
    );
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(100, parsePositiveInteger(req.query.limit, 10));
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").toLowerCase();
    const roleId = parsePositiveInteger(req.query.roleId, 0);
    if (status && !accountStatuses.includes(status)) {
      return res.status(400).json({ error: "The requested account status is invalid." });
    }
    if (req.query.roleId && !roleId) {
      return res.status(400).json({ error: "The requested role is invalid." });
    }
    const conditions = [];

    if (search) {
      const term = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
      conditions.push({ [Op.or]: [
        { Username: { [Op.iLike]: term } },
        { "$info.FullName$": { [Op.iLike]: term } },
        { "$info.Email$": { [Op.iLike]: term } },
      ] });
    }
    if (accountStatuses.includes(status)) conditions.push({ Status: status });
    if (roleId) conditions.push({ RoleId: roleId });
    const where = conditions.length ? { [Op.and]: conditions } : {};

    const [result, totalUsers, activeUsers, suspendedUsers, newUsers] = await Promise.all([
      UserAccount.findAndCountAll({
        where,
        include: [
          { model: UserInfo, as: "info", required: Boolean(search) },
          { model: UserRole, as: "role" },
          { model: UserAccountRole, as: "roles", include: [{ model: UserRole, as: "role" }] },
        ],
        order: [["CreatedAt", "DESC"], ["UserId", "DESC"]],
        limit,
        offset: (page - 1) * limit,
        distinct: true,
      }),
      UserAccount.count(),
      UserAccount.count({ where: { Status: "active" } }),
      UserAccount.count({ where: { Status: { [Op.in]: ["suspended", "banned"] } } }),
      UserAccount.count({ where: { CreatedAt: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    ]);

    return res.json({
      users: result.rows.map((account) => serializeUser(account, req.userId)),
      pagination: { page, limit, total: result.count, pages: Math.max(1, Math.ceil(result.count / limit)) },
      stats: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, newThisMonth: newUsers },
    });
  } catch (error) {
    console.error("Admin user list failed", error);
    return res.status(500).json({ error: "Unable to load users." });
  }
}

async function createUser(req, res) {
  const name = String(req.body.name || "").trim();
  const username = String(req.body.username || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const roleId = parsePositiveInteger(req.body.roleId, 0);

  if (!name || name.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    return res.status(400).json({ error: "A valid name and email address are required." });
  }
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return res.status(400).json({ error: "Username must be 3-30 characters using only letters, numbers, and underscores." });
  }
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "Password must be 8-128 characters long." });
  }
  if (!roleId) return res.status(400).json({ error: "A valid role is required." });

  try {
    const role = await UserRole.findByPk(roleId);
    if (!role) return res.status(400).json({ error: "The selected role does not exist." });
    if (String(role.RoleName).toLowerCase() === "superadmin") {
      return res.status(403).json({ error: "The Superadmin role cannot be assigned to a user." });
    }
    if (!hasSuperadminRole(req.user) && String(role.RoleName).toLowerCase() === "admin") {
      return res.status(403).json({ error: "Only a Superadmin can create users with an administrative role." });
    }
    const account = await sequelize.transaction(async (transaction) => {
      const info = await UserInfo.create({
        UUID: crypto.randomUUID(),
        FullName: name,
        Email: email,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      }, { transaction });
      const createdAccount = await UserAccount.create({
        UUID: crypto.randomUUID(),
        UserInfoId: info.UserInfoId,
        Username: username,
        PasswordHash: await bcrypt.hash(password, 12),
        RoleId: role.UserRoleId,
        Status: "active",
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      }, { transaction });
      await UserAccountRole.create({
        UserId: createdAccount.UserId,
        UserRoleId: role.UserRoleId,
        CreatedAt: new Date(),
      }, { transaction });
      createdAccount.info = info;
      createdAccount.role = role;
      createdAccount.roles = [{ role }];
      return createdAccount;
    });
    return res.status(201).json({ user: serializeUser(account) });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: error.fields?.Username ? "That username is already taken." : "An account with that email already exists." });
    }
    console.error("Admin user creation failed", error);
    return res.status(500).json({ error: "Unable to create user." });
  }
}

async function updateUser(req, res) {
  const userId = parsePositiveInteger(req.params.userId, 0);
  const roleId = req.body.roleId === undefined ? null : parsePositiveInteger(req.body.roleId, 0);
  const status = req.body.status === undefined ? null : String(req.body.status).toLowerCase();
  const suspensionMessage = String(req.body.suspensionMessage || "").trim();
  const suspensionStartsAt = req.body.startImmediately === true
    ? new Date()
    : req.body.suspensionStartsAt
      ? new Date(req.body.suspensionStartsAt)
      : null;
  const suspendedUntil = req.body.suspendedUntil ? new Date(req.body.suspendedUntil) : null;

  if (!userId || (!roleId && req.body.roleId !== undefined) || (status && !accountStatuses.includes(status))) {
    return res.status(400).json({ error: "A valid user, role, or account status is required." });
  }
  if (userId === req.userId) {
    return res.status(400).json({ error: "You cannot change your own role or status." });
  }

  try {
    const account = await UserAccount.findByPk(userId, {
      include: [
        { model: UserInfo, as: "info" },
        { model: UserRole, as: "role" },
        { model: UserAccountRole, as: "roles", include: [{ model: UserRole, as: "role" }] },
      ],
    });
    if (!account) return res.status(404).json({ error: "User not found." });
    if (hasSuperadminRole(account)) {
      return res.status(403).json({ error: "Superadmin accounts cannot be modified." });
    }

    await sequelize.transaction(async (transaction) => {
      if (roleId) {
        const newRole = await UserRole.findByPk(roleId, { transaction });
        if (!newRole) throw Object.assign(new Error("The selected role does not exist."), { statusCode: 400 });
        if (String(newRole.RoleName).toLowerCase() === "superadmin") {
          throw Object.assign(new Error("The Superadmin role cannot be assigned to a user."), { statusCode: 403 });
        }
        if (!hasSuperadminRole(req.user) && String(newRole.RoleName).toLowerCase() === "admin") {
          throw Object.assign(new Error("Only a Superadmin can assign an administrative role."), { statusCode: 403 });
        }
        const previousRoleId = account.RoleId;
        account.RoleId = newRole.UserRoleId;
        await account.save({ transaction });
        if (previousRoleId !== newRole.UserRoleId) {
          await UserAccountRole.destroy({ where: { UserId: account.UserId, UserRoleId: previousRoleId }, transaction });
          await UserAccountRole.findOrCreate({
            where: { UserId: account.UserId, UserRoleId: newRole.UserRoleId },
            defaults: { UserId: account.UserId, UserRoleId: newRole.UserRoleId, CreatedAt: new Date() },
            transaction,
          });
        }
        account.role = newRole;
      }
      if (status) {
        if (status === "suspended" || status === "banned") {
          const existingStart = account.SuspensionStartsAt ? new Date(account.SuspensionStartsAt) : null;
          const preservingStartedRestriction = Boolean(
            ["suspended", "banned"].includes(account.Status) &&
            existingStart &&
            suspensionStartsAt &&
            !Number.isNaN(existingStart.getTime()) &&
            Math.floor(existingStart.getTime() / 60_000) === Math.floor(suspensionStartsAt.getTime() / 60_000),
          );
          if (
            req.body.suspensionMessage === undefined ||
            !suspensionMessage ||
            suspensionMessage.length > 1000 ||
            !suspensionStartsAt ||
            Number.isNaN(suspensionStartsAt.getTime()) ||
            (req.body.startImmediately !== true && suspensionStartsAt <= new Date() && !preservingStartedRestriction) ||
            (req.body.suspendedUntil && (!suspendedUntil || Number.isNaN(suspendedUntil.getTime()) || suspendedUntil <= suspensionStartsAt))
          ) {
            throw Object.assign(new Error("A reason, future start time, and optional end time after the start are required."), { statusCode: 400 });
          }
          account.SuspensionMessage = suspensionMessage;
          account.SuspensionStartsAt = suspensionStartsAt;
          account.SuspendedUntil = suspendedUntil;
        } else if (status !== "suspended") {
          account.SuspensionMessage = null;
          account.SuspensionStartsAt = null;
          account.SuspendedUntil = null;
        }
        account.Status = status;
        await account.save({ transaction });
      }
    });

    const updated = await UserAccount.findByPk(userId, {
      include: [
        { model: UserInfo, as: "info" },
        { model: UserRole, as: "role" },
        { model: UserAccountRole, as: "roles", include: [{ model: UserRole, as: "role" }] },
      ],
    });
    return res.json({ user: serializeUser(updated, req.userId) });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
    console.error("Admin user update failed", error);
    return res.status(500).json({ error: "Unable to update user." });
  }
}

async function deleteUser(req, res) {
  const userId = parsePositiveInteger(req.params.userId, 0);
  if (!userId) return res.status(400).json({ error: "A valid user is required." });
  if (userId === req.userId) return res.status(400).json({ error: "You cannot delete your own account." });

  try {
    await sequelize.transaction(async (transaction) => {
      const account = await UserAccount.findByPk(userId, {
        include: [
          { model: UserRole, as: "role" },
          { model: UserAccountRole, as: "roles", include: [{ model: UserRole, as: "role" }] },
        ],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!account) throw Object.assign(new Error("User not found."), { statusCode: 404 });
      if (hasSuperadminRole(account)) {
        throw Object.assign(new Error("Superadmin accounts are protected and cannot be deleted."), { statusCode: 403 });
      }

      const userInfoId = account.UserInfoId;
      await account.destroy({ transaction });
      await UserInfo.destroy({ where: { UserInfoId: userInfoId }, transaction });
    });
    return res.json({ message: "User account deleted." });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(409).json({ error: "This account has orders or licenses and cannot be permanently deleted." });
    }
    console.error("Admin user deletion failed", error);
    return res.status(500).json({ error: "Unable to delete user account." });
  }
}

async function listRoles(req, res) {
  try {
    const roles = await UserRole.findAll({ order: [["RoleName", "ASC"]] });
    const serialized = await Promise.all(roles.map(async (role) => {
      const [primaryCount, additionalCount] = await Promise.all([
        UserAccount.count({ where: { RoleId: role.UserRoleId } }),
        UserAccountRole.count({
          where: { UserRoleId: role.UserRoleId },
          include: [{ model: UserAccount, as: "user", where: { RoleId: { [Op.ne]: role.UserRoleId } } }],
        }),
      ]);
      return serializeRole(role, primaryCount + additionalCount);
    }));
    return res.json({ roles: serialized, canManageRoles: hasSuperadminRole(req.user) });
  } catch (error) {
    console.error("Admin role list failed", error);
    return res.status(500).json({ error: "Unable to load roles." });
  }
}

async function createRole(req, res) {
  const name = String(req.body.name || "").trim();
  const description = String(req.body.description || "").trim();
  if (!name || name.length > 100) return res.status(400).json({ error: "Role name must be between 1 and 100 characters." });
  if (name.toLowerCase() === "superadmin") return res.status(403).json({ error: "The Superadmin role is protected and cannot be created or replaced." });
  if (description.length > 500) return res.status(400).json({ error: "Role description must be 500 characters or fewer." });
  try {
    const existingRole = await UserRole.findOne({ where: { RoleName: { [Op.iLike]: name } } });
    if (existingRole) return res.status(409).json({ error: "A role with that name already exists." });
    const now = new Date();
    const role = await UserRole.create({ UUID: crypto.randomUUID(), RoleName: name, Description: description, CreatedAt: now, UpdatedAt: now });
    return res.status(201).json({ role: serializeRole(role) });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") return res.status(409).json({ error: "A role with that name already exists." });
    console.error("Admin role creation failed", error);
    return res.status(500).json({ error: "Unable to create role." });
  }
}

async function updateRole(req, res) {
  const roleId = parsePositiveInteger(req.params.roleId, 0);
  const name = String(req.body.name || "").trim();
  const description = String(req.body.description || "").trim();
  if (!roleId || !name || name.length > 100) return res.status(400).json({ error: "Role name must be between 1 and 100 characters." });
  if (description.length > 500) return res.status(400).json({ error: "Role description must be 500 characters or fewer." });
  try {
    const role = await UserRole.findByPk(roleId);
    if (!role) return res.status(404).json({ error: "Role not found." });
    if (String(role.RoleName).toLowerCase() === "superadmin") {
      return res.status(403).json({ error: "The Superadmin role is protected and cannot be updated." });
    }
    const existingRole = await UserRole.findOne({
      where: { RoleName: { [Op.iLike]: name }, UserRoleId: { [Op.ne]: roleId } },
    });
    if (existingRole) return res.status(409).json({ error: "A role with that name already exists." });
    role.RoleName = name;
    role.Description = description;
    role.UpdatedAt = new Date();
    await role.save();
    return res.json({ role: serializeRole(role) });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") return res.status(409).json({ error: "A role with that name already exists." });
    console.error("Admin role update failed", error);
    return res.status(500).json({ error: "Unable to update role." });
  }
}

async function deleteRole(req, res) {
  const roleId = parsePositiveInteger(req.params.roleId, 0);
  if (!roleId) return res.status(400).json({ error: "A valid role is required." });
  try {
    const role = await UserRole.findByPk(roleId);
    if (!role) return res.status(404).json({ error: "Role not found." });
    if (String(role.RoleName).toLowerCase() === "superadmin") {
      return res.status(400).json({ error: "The Superadmin role cannot be deleted." });
    }
    const [primaryCount, assignedCount] = await Promise.all([
      UserAccount.count({ where: { RoleId: roleId } }),
      UserAccountRole.count({ where: { UserRoleId: roleId } }),
    ]);
    if (primaryCount + assignedCount > 0) {
      return res.status(409).json({ error: "This role is assigned to users and cannot be deleted." });
    }
    await role.destroy();
    return res.json({ message: "Role deleted." });
  } catch (error) {
    console.error("Admin role deletion failed", error);
    return res.status(500).json({ error: "Unable to delete role." });
  }
}

module.exports = { createRole, createUser, deleteRole, deleteUser, listRoles, listUsers, updateRole, updateUser };
