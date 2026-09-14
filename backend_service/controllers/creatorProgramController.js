const { CreatorProfile, UserAccount, UserInfo, UserRole, UserAccountRole, sequelize } = require("../models");
const { requireDatabase } = require("./authHelpers");

async function ensureCreatorRoleForUser(userId, transaction) {
  const creatorRole = await UserRole.findOrCreate({
    where: { RoleName: "Creator" },
    defaults: { RoleName: "Creator" },
    transaction,
  });

  const user = await UserAccount.findOne({
    where: { UserId: userId },
    transaction,
  });

  if (!user) return null;

  await UserAccountRole.findOrCreate({
    where: { UserId: user.UserId, UserRoleId: creatorRole[0].UserRoleId },
    defaults: { UserId: user.UserId, UserRoleId: creatorRole[0].UserRoleId, CreatedAt: new Date() },
    transaction,
  });

  return user;
}

async function approveCreatorProfile(req, res) {
  if (!requireDatabase(res, sequelize)) return;

  const targetUserId = Number(req.body?.userId ?? req.params?.userId ?? req.userId ?? 0);
  if (!Number.isFinite(targetUserId) || targetUserId <= 0) {
    return res.status(400).json({ error: "A valid user ID is required." });
  }

  try {
    const adminUser = await UserAccount.findOne({
      where: { UserId: req.userId },
      include: [{ model: UserRole, as: "role" }],
    });
    const adminRole = String(adminUser?.role?.RoleName || "").toLowerCase();
    if (!adminUser || (adminRole !== "admin" && adminRole !== "superadmin")) {
      return res.status(403).json({ error: "Only admins can approve creator accounts." });
    }

    const user = await UserAccount.findOne({
      where: { UserId: targetUserId },
      include: [{ model: UserRole, as: "role" }],
    });
    if (!user) return res.status(404).json({ error: "User account not found." });

    const profile = await CreatorProfile.findOne({ where: { UserId: targetUserId } });
    if (!profile) return res.status(404).json({ error: "Creator profile not found for this user." });

    await sequelize.transaction(async (transaction) => {
      const updatedUser = await ensureCreatorRoleForUser(targetUserId, transaction);
      if (!updatedUser) throw new Error("User account not found during approval");
      await profile.update({ IsVerified: true }, { transaction });
    });

    return res.status(200).json({
      message: "Creator account approved and role upgraded to Creator.",
      user: {
        id: user.UserId,
        role: "creator",
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Creator approval failed", error);
    return res.status(500).json({ error: "Unable to approve this creator account." });
  }
}

async function applyCreatorProgram(req, res) {
  if (!requireDatabase(res, sequelize)) return;

  const phoneNumber = String(req.body.phoneNumber || "").trim() || null;
  const websiteUrl = String(req.body.websiteUrl || "").trim() || null;
  const bio = String(req.body.bio || "").trim() || null;
  const avatarUrl = String(req.body.avatarUrl || "").trim() || null;
  const bannerUrl = String(req.body.bannerUrl || "").trim() || null;
  const socialLinks = req.body.socialLinks && typeof req.body.socialLinks === "object" && !Array.isArray(req.body.socialLinks)
    ? req.body.socialLinks
    : {};

  try {
    const user = await UserAccount.findOne({
      where: { UserId: req.userId },
      include: [{ model: UserInfo, as: "info" }],
    });
    if (!user) return res.status(404).json({ error: "User account not found." });
    const displayName = String(user.info?.FullName || "").trim();
    const username = String(req.body.username || user.Username || "").trim();
    if (!displayName || !username) return res.status(400).json({ error: "Your account profile is missing a name or username." });
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) return res.status(400).json({ error: "Username must be 3-30 characters using only letters, numbers, and underscores." });

    const profile = await sequelize.transaction(async (transaction) => {
      if (user.Username !== username) {
        user.Username = username;
        await user.save({ transaction });
      }
      const [creatorProfile] = await CreatorProfile.findOrCreate({
        where: { UserId: user.UserId },
        defaults: {
          UserId: user.UserId,
          DisplayName: displayName,
          Username: username,
          PhoneNumber: phoneNumber,
          Bio: bio,
          AvatarUrl: avatarUrl,
          BannerUrl: bannerUrl,
          WebsiteUrl: websiteUrl,
          SocialLinks: socialLinks,
        },
        transaction,
      });

      await creatorProfile.update({
        DisplayName: displayName,
        Username: username,
        PhoneNumber: phoneNumber,
        Bio: bio,
        AvatarUrl: avatarUrl,
        BannerUrl: bannerUrl,
        WebsiteUrl: websiteUrl,
        SocialLinks: socialLinks,
      }, { transaction });

      return creatorProfile;
    });

    return res.status(200).json({ profile });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") return res.status(409).json({ error: "A creator profile already exists for this username." });
    console.error("Creator program application failed", error);
    return res.status(500).json({ error: "Unable to save creator profile." });
  }
}

module.exports = { applyCreatorProgram, approveCreatorProfile };