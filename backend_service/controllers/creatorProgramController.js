const { CreatorProfile, UserAccount, UserInfo, sequelize } = require("../models");
const { requireDatabase } = require("./authHelpers");

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

module.exports = { applyCreatorProgram };