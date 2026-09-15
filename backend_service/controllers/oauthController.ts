const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const { sequelize, UserRole, UserInfo, UserAccount, UserAccountRole, OAuthAccount } = require("../models");
const { authResponse, findById, normaliseEmail, requireDatabase } = require("./authHelpers");
const { sendSecurityEmail } = require("../services/mailService");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback");
const oauthStates = new Set();
const paypalOauthStates = new Set();

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

function paypalConfigError() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) return "PayPal OAuth is not configured.";

  const callbackUrl = process.env.PAYPAL_REDIRECT_URL || "http://localhost:5000/api/auth/paypal/callback";
  try {
    const parsedUrl = new URL(callbackUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") throw new Error("Invalid protocol");
  } catch {
    return "PAYPAL_REDIRECT_URL must be a valid HTTP(S) URL.";
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

function paypalStart(req, res) {
  const configurationError = paypalConfigError();
  if (configurationError) return res.status(503).json({ error: configurationError });

  const state = crypto.randomBytes(32).toString("hex");
  paypalOauthStates.add(state);
  setTimeout(() => paypalOauthStates.delete(state), 10 * 60 * 1000);

  const redirectUri = process.env.PAYPAL_REDIRECT_URL || "http://localhost:5000/api/auth/paypal/callback";
  const paypalUrl = new URL("https://www.sandbox.paypal.com/connect");
  paypalUrl.searchParams.set("flowEntry", "static");
  paypalUrl.searchParams.set("client_id", process.env.PAYPAL_CLIENT_ID);
  paypalUrl.searchParams.set("scope", "openid email profile");
  paypalUrl.searchParams.set("redirect_uri", redirectUri);
  paypalUrl.searchParams.set("response_type", "code");
  paypalUrl.searchParams.set("state", state);

  return res.redirect(paypalUrl.toString());
}

async function ensureOAuthUserForPayPal({ email, name, providerAccountId }, transaction) {
  let oauthAccount = await OAuthAccount.findOne({ where: { Provider: "paypal", ProviderAccountId: providerAccountId }, transaction });
  let user = oauthAccount ? await findById(oauthAccount.UserId, transaction) : null;

  if (user) return user;

  const existingInfo = await UserInfo.findOne({ where: { Email: normaliseEmail(email) }, include: [{ model: UserAccount, as: "account" }], transaction });
  let account;

  if (existingInfo?.account) {
    account = existingInfo.account;
    if (!account.Username) {
      account.Username = await googleUsername(name, email, providerAccountId, transaction);
      await account.save({ transaction });
    }
  } else {
    const info = existingInfo || await UserInfo.create({ FullName: name || email, Email: normaliseEmail(email) }, { transaction });
    const role = await UserRole.findOne({ where: { RoleName: "Buyer" }, transaction });
    const username = await googleUsername(name, email, providerAccountId, transaction);
    account = await UserAccount.create({ UserInfoId: info.UserInfoId, Username: username, PasswordHash: null, RoleId: role.UserRoleId, Status: "active" }, { transaction });
    await UserAccountRole.findOrCreate({
      where: { UserId: account.UserId, UserRoleId: role.UserRoleId },
      defaults: { UserId: account.UserId, UserRoleId: role.UserRoleId, CreatedAt: new Date() },
      transaction,
    });
  }

  await OAuthAccount.findOrCreate({
    where: { Provider: "paypal", ProviderAccountId: providerAccountId },
    defaults: { Provider: "paypal", ProviderAccountId: providerAccountId, ProviderEmail: email, UserId: account.UserId },
    transaction,
  });

  return findById(account.UserId, transaction);
}

async function paypalCallback(req, res) {
  const { code, state } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  if (!code || typeof state !== "string" || !paypalOauthStates.delete(state)) return res.status(400).send("Invalid PayPal OAuth callback.");
  if (!requireDatabase(res, sequelize)) return;

  try {
    const redirectUri = process.env.PAYPAL_REDIRECT_URL || "http://localhost:5000/api/auth/paypal/callback";
    const tokenResponse = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: String(code),
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok) {
      throw new Error(tokenData?.error_description || tokenData?.message || "PayPal token exchange failed.");
    }

    const userInfoResponse = await fetch("https://api-m.sandbox.paypal.com/v1/identity/openidconnect/userinfo?schema=openid", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userInfoResponse.json().catch(() => ({}));
    if (!userInfo?.email) throw new Error("PayPal did not return a usable identity.");

    const user = await sequelize.transaction(async (transaction) => ensureOAuthUserForPayPal({
      email: userInfo.email,
      name: userInfo.name || userInfo.given_name || userInfo.email,
      providerAccountId: userInfo.user_id || userInfo.sub || userInfo.email,
    }, transaction));

    await sendSecurityEmail({
      to: normaliseEmail(userInfo.email),
      subject: "New PayPal login to your Digital Products Marketplace account",
      text: "A successful PayPal login was detected. If this was not you, secure your PayPal account immediately.",
    });

    return res.redirect(`${frontendUrl}/oauth/callback#token=${encodeURIComponent(authResponse(user).token)}`);
  } catch (error) {
    console.error("PayPal OAuth failed", error);
    return res.redirect(`${frontendUrl}/login?error=paypal-sign-in-failed`);
  }
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
            defaults: { UserId: account.UserId, UserRoleId: role.UserRoleId, CreatedAt: new Date() },
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

module.exports = { googleStart, googleCallback, paypalStart, paypalCallback };
