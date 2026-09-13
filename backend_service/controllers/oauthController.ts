const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const { sequelize, UserRole, UserInfo, UserAccount, UserAccountRole, OAuthAccount } = require("../models");
const { authResponse, findById, normaliseEmail, requireDatabase } = require("./authHelpers");
const { sendSecurityEmail } = require("../services/mailService");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback");
const oauthStates = new Set();

function googleConfigError() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return "Google OAuth is not configured.";
  if (!process.env.GOOGLE_CALLBACK_URL) return "GOOGLE_CALLBACK_URL is not configured.";
  try {
    const callbackUrl = new URL(process.env.GOOGLE_CALLBACK_URL);
    if (callbackUrl.protocol !== "http:" && callbackUrl.protocol !== "https:") throw new Error("Invalid protocol");
  } catch {
    return "GOOGLE_CALLBACK_URL must be a valid HTTP(S) URL.";
  }
  return null;
}

async function googleUsername(displayName, email, providerAccountId, transaction) {
  const nameUsername = String(displayName || "").trim().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const emailName = normaliseEmail(email).split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
  const baseUsername = (nameUsername.length >= 3 ? nameUsername : emailName.length >= 3 ? emailName : "google_user").slice(0, 22);
  let username = baseUsername;
  const providerSuffix = String(providerAccountId).replace(/[^a-zA-Z0-9]/g, "").slice(-6);
  let attempt = 0;

  while (await UserAccount.findOne({ where: { Username: username }, transaction })) {
    attempt += 1;
    const suffix = `_${providerSuffix}${attempt > 1 ? `_${attempt}` : ""}`;
    username = `${baseUsername.slice(0, 30 - suffix.length)}${suffix}`;
  }

  return username;
}

function googleStart(req, res) {
  const configurationError = googleConfigError();
  if (configurationError) return res.status(503).json({ error: configurationError });
  const state = crypto.randomBytes(32).toString("hex");
  oauthStates.add(state);
  setTimeout(() => oauthStates.delete(state), 10 * 60 * 1000);
  return res.redirect(googleClient.generateAuthUrl({ access_type: "offline", prompt: "select_account", scope: ["openid", "email", "profile"], state }));
}

async function googleCallback(req, res) {
  const { code, state } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  if (!code || typeof state !== "string" || !oauthStates.delete(state)) return res.status(400).send("Invalid Google OAuth callback.");
  if (!requireDatabase(res, sequelize)) return;
  try {
    const { tokens } = await googleClient.getToken(String(code));
    if (!tokens.id_token) return res.status(400).send("Google did not return an identity token.");
    const ticket = await googleClient.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const profile = ticket.getPayload();
    if (!profile?.sub || !profile.email) return res.status(400).send("Google did not return a usable identity.");
    if (!profile.email_verified) return res.status(403).send("Google email is not verified.");

    let oauthAccount = await OAuthAccount.findOne({ where: { Provider: "google", ProviderAccountId: profile.sub } });
    let user = oauthAccount ? await findById(oauthAccount.UserId) : null;
    if (!user) {
      user = await sequelize.transaction(async (transaction) => {
        const existingInfo = await UserInfo.findOne({ where: { Email: normaliseEmail(profile.email) }, include: [{ model: UserAccount, as: "account" }], transaction, lock: { level: transaction.LOCK.UPDATE, of: UserInfo } });
        let account;
        if (existingInfo?.account) {
          account = existingInfo.account;
          if (!account.Username) {
            account.Username = await googleUsername(profile.name, profile.email, profile.sub, transaction);
            await account.save({ transaction });
          }
        } else {
          const info = existingInfo || await UserInfo.create({ FullName: profile.name || profile.email, Email: normaliseEmail(profile.email) }, { transaction });
          const role = await UserRole.findOne({ where: { RoleName: "Buyer" }, transaction });
          const username = await googleUsername(profile.name, profile.email, profile.sub, transaction);
          account = await UserAccount.create({ UserInfoId: info.UserInfoId, Username: username, PasswordHash: null, RoleId: role.UserRoleId, Status: "active" }, { transaction });
          await UserAccountRole.findOrCreate({
            where: { UserId: account.UserId, UserRoleId: role.UserRoleId },
            defaults: { UserId: account.UserId, UserRoleId: role.UserRoleId },
            transaction,
          });
        }
        await OAuthAccount.create({ Provider: "google", ProviderAccountId: profile.sub, ProviderEmail: profile.email, UserId: account.UserId }, { transaction });
        return findById(account.UserId, transaction);
      });
    }
    await sendSecurityEmail({
      to: normaliseEmail(profile.email),
      subject: "New login to your Digital Products Marketplace account",
      text: "A successful Google login was detected on your Digital Products Marketplace account. If this was not you, secure your Google account immediately."
    });
    return res.redirect(`${frontendUrl}/oauth/callback#token=${encodeURIComponent(authResponse(user).token)}`);
  } catch (error) {
    console.error("Google OAuth failed", error);
    if (error.name === "SequelizeUniqueConstraintError") return res.redirect(`${frontendUrl}/login?error=google-account-already-linked`);
    return res.redirect(`${frontendUrl}/login?error=google-sign-in-failed`);
  }
}

module.exports = { googleStart, googleCallback };
