const express = require("express");
const crypto = require("crypto");
const { UserAccount, UserRole, UserAccountRole, CreatorProfile, Storefront, CreatorPayoutInfo, CardInfo, Product, Order, OrderItem } = require("../models");
const authRoutes = require("./authRoutes");
const { createPaymentOrder, capturePaymentOrder } = require("../controllers/paymentController");
const { applyCreatorProgram, approveCreatorProfile } = require("../controllers/creatorProgramController");
const { ensureCreatorRoleForUser, findByToken } = require("../controllers/authHelpers");
const { deleteEncryptedImage, readEncryptedImage, saveEncryptedImage } = require("../services/encryptedImageService");
const { setupPaymentToken } = require("../services/paypalService");

const router = express.Router();
const encryptionKey = crypto.createHash("sha256").update(process.env.JWT_SECRET || "local-development-secret-change-me").digest();

function encryptSensitiveValue(value) {
  if (value === null || value === undefined) return "";
  const normalized = String(value);
  if (!normalized.trim()) return "";

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(normalized, "utf8")), cipher.final()]);

  return JSON.stringify({
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: encrypted.toString("base64"),
  });
}

function decryptSensitiveValue(value) {
  if (typeof value !== "string" || !value.trim()) return value;

  try {
    const parsed = JSON.parse(value);
    if (parsed && parsed.iv && parsed.tag && parsed.data) {
      const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, Buffer.from(parsed.iv, "base64"));
      decipher.setAuthTag(Buffer.from(parsed.tag, "base64"));
      const decrypted = Buffer.concat([decipher.update(Buffer.from(parsed.data, "base64")), decipher.final()]);
      return decrypted.toString("utf8");
    }
  } catch {
    return value;
  }

  return value;
}

function isKnownPayPalSandboxCardNumber(cardNumber) {
  const digits = String(cardNumber || "").replace(/\D/g, "");
  const approvedSandboxNumbers = new Set([
    "4111111111111111",
    "4242424242424242",
    "4005519200000004",
    "5555555555554444",
    "5555555555554444",
    "378282246310005",
    "371449635398431",
    "6011111111111117",
    "6011000990139424",
  ]);

  return approvedSandboxNumbers.has(digits);
}

async function requireUser(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Authentication required." });

  try {
    const user = await findByToken(token);
    if (!user) return res.status(401).json({ error: "User account is unavailable." });
    req.userId = user.UserId;
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
}

async function requireCreatorAccess(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Authentication required." });

  try {
    const user = await findByToken(token);
    if (!user) return res.status(401).json({ error: "User account is unavailable." });

    const verifiedUser = await ensureCreatorRoleForUser(user);
    let role = String(verifiedUser.role?.RoleName || verifiedUser.RoleName || "").toLowerCase();
    const isVerified = Boolean(verifiedUser.creatorProfile?.IsVerified);
    let roleLinks = await UserAccountRole.findAll({
      where: { UserId: verifiedUser.UserId },
      include: [{ model: UserRole, as: "role" }],
    });
    const hasCreatorRole = roleLinks.some((link) => String(link.role?.RoleName || "").toLowerCase() === "creator");

    if (isVerified && role !== "creator" && !hasCreatorRole) {
      const creatorRole = await UserRole.findOrCreate({
        where: { RoleName: "Creator" },
        defaults: { RoleName: "Creator" },
      });
      await UserAccountRole.findOrCreate({
        where: { UserId: verifiedUser.UserId, UserRoleId: creatorRole[0].UserRoleId },
        defaults: { UserId: verifiedUser.UserId, UserRoleId: creatorRole[0].UserRoleId, CreatedAt: new Date() },
      });
      roleLinks = [...roleLinks, { role: creatorRole[0] }];
      role = "creator";
    }

    const hasCreatorAccess = role === "creator" || roleLinks.some((link) => String(link.role?.RoleName || "").toLowerCase() === "creator");
    if (!hasCreatorAccess || !isVerified) {
      return res.status(403).json({ error: "Creator access requires an approved creator profile." });
    }

    req.userId = user.UserId;
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
}

async function requireAdmin(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Authentication required." });

  try {
    const user = await findByToken(token);
    if (!user) return res.status(401).json({ error: "User account is unavailable." });

    const role = String(user.role?.RoleName || user.RoleName || "").toLowerCase();
    if (role !== "admin" && role !== "superadmin") {
      return res.status(403).json({ error: "Admin access required." });
    }

    req.userId = user.UserId;
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
}

const products = [
  { id: 1, name: "Website Template", price: 15, category: "Templates" },
  { id: 2, name: "E-Book", price: 10, category: "Books" },
];

let storefronts = [
  {
    id: 1,
    displayName: "NourChomrong",
    slug: "nourchomrong",
    type: "Templates",
    products: 24,
    revenue: "$1,284.00",
    description: "Professional templates and design resources for modern websites",
  },
  {
    id: 2,
    displayName: "DevCourses",
    slug: "devcourses",
    type: "Digital Products",
    products: 12,
    revenue: "$2,450.00",
    description: "Online courses and resources for developers to level up their skills",
  },
  {
    id: 3,
    displayName: "AI Resources",
    slug: "ai-resources",
    type: "Bundles",
    products: 7,
    revenue: "$920.00",
    description: "AI tools and learning bundles for everyone",
  },
  {
    id: 4,
    displayName: "DesignHub",
    slug: "designhub",
    type: "UI Kits",
    products: 18,
    revenue: "$1,860.00",
    description: "Beautiful UI kits and design systems",
  },
];

// Storefronts are created through the API; keep runtime state empty on startup.
storefronts = [];

const storefrontState = new Map(
  storefronts.map((storefront) => [storefront.displayName, {
    branding: {
      storeName: storefront.displayName,
      description: storefront.description,
      accentColor: "#5b6ef5",
      bannerEnabled: true,
      bannerImage: "",
    },
    settings: {
      email: "devcourses@gmail.com",
      phone: "+855 12 345 678",
      country: "Cambodia",
      timezone: "(GMT+07:00) Indochina Time (ICT)",
      language: "English",
      automaticStorefront: false,
      socialLinks: {},
    },
  }]),
);

function findStorefront(name, res) {
  const storefrontName = decodeURIComponent(name);
  const storefront = storefronts.find((item) => item.displayName === storefrontName);

  if (!storefront) {
    res.status(404).json({ error: "Storefront not found" });
    return null;
  }

  return { storefrontName, storefront };
}

function hasLogoReference(imageUrl, ignoredStorefront) {
  return storefronts.some((storefront) => storefront !== ignoredStorefront && storefront.logoUrl === imageUrl);
}

function mediaUrl(req, imageUrl) {
  return imageUrl.startsWith("/") ? `${req.protocol}://${req.get("host")}${imageUrl}` : imageUrl;
}

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "marketplace-api" });
});

router.get("/products", (req, res) => {
  res.json({ products });
});

router.get("/marketplace", (req, res) => {
  res.json({ products, storefronts });
});

router.get("/media/storefronts/:fileName", async (req, res) => {
  try {
    const image = await readEncryptedImage(req.params.fileName);
    res.type(image.mimeType).send(image.buffer);
  } catch {
    res.status(404).json({ error: "Image not found." });
  }
});

router.use("/auth", authRoutes);
router.post("/creator-program/apply", requireUser, applyCreatorProgram);
router.post("/creator-program/approve", requireAdmin, approveCreatorProfile);
router.post("/payments/paypal/order", createPaymentOrder);
router.post("/payments/paypal/capture", capturePaymentOrder);
router.use("/creator", requireCreatorAccess);

async function databaseStorefront(req) {
  const profile = await CreatorProfile.findOne({ where: { UserId: req.userId } });
  if (!profile) return { profile: null, storefront: null };
  const storefront = await Storefront.findOne({ where: { CreatorProfileId: profile.CreatorProfileId } });
  return { profile, storefront };
}

function serializeStorefront(storefront) {
  if (!storefront) return null;
  return {
    id: storefront.StorefrontId,
    displayName: storefront.StoreName,
    slug: storefront.StoreSlug,
    type: "Digital Products",
    products: 0,
    revenue: "$0.00",
    description: storefront.Description || "",
    isPublished: storefront.IsPublished,
    logoUrl: storefront.LogoUrl || "",
    bannerUrl: storefront.BannerUrl || "",
    websiteUrl: storefront.WebsiteUrl || "",
    themeSettings: storefront.ThemeSettings || {},
  };
}

router.get("/creator/storefronts", async (req, res) => {
  const { storefront } = await databaseStorefront(req);
  return res.json({ storefronts: storefront ? [serializeStorefront(storefront)] : [] });
});

router.get("/creator/storefronts/:storefrontName", async (req, res) => {
  const { storefront } = await databaseStorefront(req);
  if (!storefront || storefront.StoreName !== decodeURIComponent(req.params.storefrontName)) return res.status(404).json({ error: "Storefront not found" });
  return res.json({ storefront: serializeStorefront(storefront) });
});

router.post("/creator/storefronts", async (req, res) => {
  try {
    const { profile, storefront: existing } = await databaseStorefront(req);
    if (!profile) return res.status(404).json({ error: "Creator profile not found." });
    if (existing) return res.status(409).json({ error: "Your creator account already has a storefront." });
    const storeName = String(req.body.storeName || "").trim();
    const slug = String(req.body.slug || "").trim().toLowerCase();
    const description = String(req.body.description || "").trim();
    if (!storeName || !slug || !description) return res.status(400).json({ error: "Store name, URL, and description are required." });
    const created = await Storefront.create({ CreatorProfileId: profile.CreatorProfileId, StoreName: storeName, StoreSlug: slug, Description: description, LogoUrl: req.body.logoUrl || null, IsPublished: Boolean(req.body.isPublished), ThemeSettings: {} });
    return res.status(201).json({ storefront: serializeStorefront(created) });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to create storefront." });
  }
});

router.put("/creator/storefronts/:storefrontName", async (req, res) => {
  const { storefront } = await databaseStorefront(req);
  if (!storefront || storefront.StoreName !== decodeURIComponent(req.params.storefrontName)) return res.status(404).json({ error: "Storefront not found" });
  await storefront.update({ StoreName: String(req.body.storeName ?? storefront.StoreName).trim(), Description: String(req.body.description ?? storefront.Description).trim(), LogoUrl: req.body.logoUrl ?? storefront.LogoUrl, IsPublished: req.body.isPublished ?? storefront.IsPublished });
  return res.json({ storefront: serializeStorefront(storefront) });
});

router.delete("/creator/storefronts/:storefrontName", async (req, res) => {
  const { storefront } = await databaseStorefront(req);
  if (!storefront || storefront.StoreName !== decodeURIComponent(req.params.storefrontName)) return res.status(404).json({ error: "Storefront not found" });
  await storefront.destroy();
  return res.status(204).send();
});

router.get("/creator/storefronts/:storefrontName/overview", async (req, res) => {
  const { storefront } = await databaseStorefront(req);
  if (!storefront || storefront.StoreName !== decodeURIComponent(req.params.storefrontName)) return res.status(404).json({ error: "Storefront not found" });
  const productCount = await Product.count({ where: { StorefrontId: storefront.StorefrontId } });
  const revenue = Number(await OrderItem.sum("TotalAmount", { where: { StorefrontId: storefront.StorefrontId } })) || 0;
  const orders = await OrderItem.count({ distinct: true, col: "OrderId", where: { StorefrontId: storefront.StorefrontId } });
  const recentProducts = await Product.findAll({ where: { StorefrontId: storefront.StorefrontId }, order: [["CreatedAt", "DESC"]], limit: 5 });
  return res.json({ storefront: serializeStorefront(storefront), stats: { products: productCount, revenue, orders, conversion: 0 }, recentProducts: recentProducts.map((product) => ({ name: product.ProductName, status: product.Status, sales: "Database product" })) });
});

router.get("/creator/storefronts/:storefrontName/branding", async (req, res) => {
  const { storefront } = await databaseStorefront(req);
  if (!storefront) return res.status(404).json({ error: "Storefront not found" });
  return res.json({ storefrontName: storefront.StoreName, storefront: serializeStorefront(storefront), branding: { storeName: storefront.StoreName, description: storefront.Description, ...(storefront.ThemeSettings || {}) } });
});

router.put("/creator/storefronts/:storefrontName/branding", async (req, res) => {
  const { storefront } = await databaseStorefront(req);
  if (!storefront) return res.status(404).json({ error: "Storefront not found" });
  const themeSettings = { ...(storefront.ThemeSettings || {}), ...req.body };
  await storefront.update({ StoreName: String(req.body.storeName ?? storefront.StoreName).trim(), Description: String(req.body.description ?? storefront.Description).trim(), ThemeSettings: themeSettings });
  return res.json({ storefrontName: storefront.StoreName, branding: { storeName: storefront.StoreName, description: storefront.Description, ...themeSettings } });
});

router.get("/creator/storefronts/:storefrontName/settings", async (req, res) => {
  const { storefront } = await databaseStorefront(req);
  if (!storefront) return res.status(404).json({ error: "Storefront not found" });
  return res.json({ storefrontName: storefront.StoreName, settings: { ...(storefront.ThemeSettings || {}), storeUrl: `${req.protocol}://${req.get("host")}/marketplace/${storefront.StoreName}` } });
});

router.put("/creator/storefronts/:storefrontName/settings", async (req, res) => {
  const { storefront } = await databaseStorefront(req);
  if (!storefront) return res.status(404).json({ error: "Storefront not found" });
  await storefront.update({ ThemeSettings: { ...(storefront.ThemeSettings || {}), ...req.body } });
  return res.json({ storefrontName: storefront.StoreName, settings: storefront.ThemeSettings });
});

router.get("/creator/storefronts/:storefrontName/payment", async (req, res) => {
  const { profile, storefront } = await databaseStorefront(req);
  if (!storefront) return res.status(404).json({ error: "Storefront not found" });
  const payout = await CreatorPayoutInfo.findOne({ where: { CreatorProfileId: profile.CreatorProfileId } });
  const allCards = await CardInfo.findAll({ where: { CreatorProfileId: profile.CreatorProfileId } });

  let paymentDetails = { methods: [], taxId: "", cardName: "", paypalEmail: "", stripeEmail: "", stripeAccountId: "", cardNumber: "", cardExpiry: "", cardCvc: "", cardBrand: "", provider: "PayPal" };
  let savedCards = [];

  if (allCards.length > 0) {
    // Build array of all saved cards
    savedCards = allCards.map((card) => ({
      id: card.CardInfoId,
      cardName: decryptSensitiveValue(card.CardName),
      cardNumber: decryptSensitiveValue(card.CardNumber),
      cardExpiry: decryptSensitiveValue(card.CardExpiry),
      cardCvc: decryptSensitiveValue(card.CardCvc),
      cardBrand: decryptSensitiveValue(card.CardBrand),
      provider: String(card.Provider || "PayPal"),
      isPrimary: card.PrimaryMethod === "Credit Card",
    }));

    // Use the first card as default for form
    const primaryCard = allCards.find((c) => c.PrimaryMethod === "Credit Card") || allCards[0];
    paymentDetails = {
      methods: Array.isArray(primaryCard.Methods) ? primaryCard.Methods : [],
      taxId: decryptSensitiveValue(primaryCard.TaxId),
      cardName: decryptSensitiveValue(primaryCard.CardName),
      paypalEmail: decryptSensitiveValue(primaryCard.PaypalEmail),
      stripeEmail: decryptSensitiveValue(primaryCard.StripeEmail),
      stripeAccountId: decryptSensitiveValue(primaryCard.StripeAccountId),
      cardNumber: decryptSensitiveValue(primaryCard.CardNumber),
      cardExpiry: decryptSensitiveValue(primaryCard.CardExpiry),
      cardCvc: decryptSensitiveValue(primaryCard.CardCvc),
      cardBrand: decryptSensitiveValue(primaryCard.CardBrand),
      provider: String(primaryCard.Provider || "PayPal"),
    };
  } else if (payout?.AccountIdentifier) {
    try {
      const parsedIdentifier = decryptSensitiveValue(payout.AccountIdentifier);
      const parsed = typeof parsedIdentifier === "string" ? JSON.parse(parsedIdentifier) : parsedIdentifier;
      if (parsed && typeof parsed === "object") {
        paymentDetails = {
          methods: Array.isArray(parsed.methods) ? parsed.methods : [],
          taxId: String(parsed.taxId || ""),
          cardName: String(parsed.cardName || ""),
          paypalEmail: String(parsed.paypalEmail || ""),
          stripeEmail: String(parsed.stripeEmail || ""),
          stripeAccountId: String(parsed.stripeAccountId || ""),
          cardNumber: String(parsed.cardNumber || ""),
          cardExpiry: String(parsed.cardExpiry || ""),
          cardCvc: String(parsed.cardCvc || ""),
          cardBrand: String(parsed.cardBrand || ""),
          provider: String(parsed.provider || "PayPal"),
        };
      }
    } catch {
      paymentDetails.methods = [];
    }
  }

  const responsePayment = {
    methods: paymentDetails.methods,
    primaryMethod: allCards.length > 0 ? (allCards[0]?.PrimaryMethod || payout?.PayoutMethod || "") : (payout?.PayoutMethod || ""),
    provider: paymentDetails.provider || "PayPal",
    taxId: paymentDetails.taxId,
    cardName: paymentDetails.cardName || "",
    paypalEmail: paymentDetails.paypalEmail || "",
    stripeEmail: paymentDetails.stripeEmail || "",
    stripeAccountId: paymentDetails.stripeAccountId || "",
    cardNumber: paymentDetails.cardNumber || "",
    cardExpiry: paymentDetails.cardExpiry || "",
    cardCvc: paymentDetails.cardCvc || "",
    cardBrand: paymentDetails.cardBrand || "",
    accountName: payout?.AccountName || paymentDetails.cardName || "",
    accountIdentifier: payout?.AccountIdentifier ? decryptSensitiveValue(payout.AccountIdentifier) : null,
    savedCards,
  };

  return res.json({ storefrontName: storefront.StoreName, payment: responsePayment });
});

router.put("/creator/storefronts/:storefrontName/payment", async (req, res) => {
  try {
    const { profile, storefront } = await databaseStorefront(req);
    if (!storefront) return res.status(404).json({ error: "Storefront not found" });

  const payment = req.body || {};
  const cardInfoId = payment.cardInfoId ? Number(payment.cardInfoId) : null;
  const methods = Array.isArray(payment.methods)
    ? payment.methods.filter((method) => typeof method === "string" && method.trim())
    : [];
  const primaryMethod = payment.primaryMethod || methods[0] || "Platform";
  const provider = String(payment.provider || "PayPal").trim() || "PayPal";
  const taxId = String(payment.taxId || "").trim();
  const cardName = String(payment.cardName || "").trim();
  const paypalEmail = String(payment.paypalEmail || "").trim();
  const stripeEmail = String(payment.stripeEmail || "").trim();
  const stripeAccountId = String(payment.stripeAccountId || "").trim();
  const cardNumber = String(payment.cardNumber || "").trim();
  const cardExpiry = String(payment.cardExpiry || "").trim();
  const cardCvc = String(payment.cardCvc || "").trim();
  const cardBrand = String(payment.cardBrand || "").trim();

  if (provider === "PayPal" && cardNumber) {
    try {
      const expiryMonth = String(cardExpiry).split("/")[0]?.trim();
      const expiryYear = String(cardExpiry).split("/")[1]?.trim();
      const tokenResult = await setupPaymentToken({
        cardNumber,
        cardExpiry: `${expiryMonth}/${expiryYear}`,
        cardCvc,
        cardName,
      });

      if (!tokenResult?.id) {
        return res.status(400).json({ error: "PayPal sandbox rejected this card." });
      }
    } catch (error) {
      const message = error?.details?.message || error?.message || "PayPal sandbox rejected this card.";
      return res.status(400).json({ error: message });
    }
  }

  const payout = await CreatorPayoutInfo.findOne({ where: { CreatorProfileId: profile.CreatorProfileId } });
  
  // If cardInfoId provided, update existing card; otherwise create new one
  let cardInfo = null;
  if (cardInfoId) {
    cardInfo = await CardInfo.findOne({ where: { CardInfoId: cardInfoId, CreatorProfileId: profile.CreatorProfileId } });
  }

  const cardValues = {
    CreatorProfileId: profile.CreatorProfileId,
    CardName: encryptSensitiveValue(cardName),
    CardNumber: encryptSensitiveValue(cardNumber),
    CardExpiry: encryptSensitiveValue(cardExpiry),
    CardCvc: encryptSensitiveValue(cardCvc),
    CardBrand: encryptSensitiveValue(cardBrand),
    Provider: provider,
    Methods: methods,
    PrimaryMethod: primaryMethod,
    TaxId: encryptSensitiveValue(taxId),
    PaypalEmail: encryptSensitiveValue(paypalEmail),
    StripeEmail: encryptSensitiveValue(stripeEmail),
    StripeAccountId: encryptSensitiveValue(stripeAccountId),
    Metadata: {
      provider,
      taxId,
      cardBrand,
    },
  };

  let savedCardInfo;
  try {
    // Store card without PayPal pre-validation
    // PayPal will validate the card when it's used for actual payment
    savedCardInfo = cardInfo
      ? await cardInfo.update(cardValues)
      : await CardInfo.create(cardValues);
  } catch (error) {
    console.error("CardInfo create error:", error.message, error.sql);
    throw error;
  }

  const accountIdentifier = encryptSensitiveValue(JSON.stringify({
    methods,
    provider,
    taxId,
    cardName,
    paypalEmail,
    stripeEmail,
    stripeAccountId,
    cardNumber,
    cardExpiry,
    cardCvc,
    cardBrand,
  }));

  const values = {
    CreatorProfileId: profile.CreatorProfileId,
    PayoutMethod: primaryMethod,
    AccountName: cardName || paypalEmail || stripeEmail || cardNumber || stripeAccountId || "",
    AccountIdentifier: accountIdentifier,
    Currency: "USD",
  };

  const saved = payout ? await payout.update(values) : await CreatorPayoutInfo.create(values);

  return res.json({
    storefrontName: storefront.StoreName,
    payment: {
      methods,
      primaryMethod,
      provider,
      taxId,
      cardName,
      paypalEmail,
      stripeEmail,
      stripeAccountId,
      cardNumber,
      cardExpiry,
      cardCvc,
      cardBrand,
      accountName: values.AccountName,
      accountIdentifier: decryptSensitiveValue(saved.AccountIdentifier),
      cardInfoId: savedCardInfo.CardInfoId,
    },
  });
  } catch (error) {
    console.error("Payment route error:", error.message);
    return res.status(500).json({
      error: error.message || "Unable to save payment settings",
    });
  }
});

router.post("/creator/storefronts/:storefrontName/payment/paypal", async (req, res) => {
  const { storefront } = await databaseStorefront(req);
  if (!storefront) return res.status(404).json({ error: "Storefront not found" });

  const paypalEmail = String(req.body.paypalEmail || "").trim();

  if (!paypalEmail) {
    return res.status(400).json({ error: "PayPal email is required." });
  }

  return res.json({
    connected: true,
    provider: "PayPal",
    paypalEmail,
  });
});

router.get("/creator/storefronts/:storefrontName/summary", async (req, res) => {
  const { storefront } = await databaseStorefront(req);
  if (!storefront) return res.status(404).json({ error: "Storefront not found" });
  const buyerPayments = Number(await OrderItem.sum("TotalAmount", { where: { StorefrontId: storefront.StorefrontId } })) || 0;
  const systemFees = Number((buyerPayments * 0.1).toFixed(2));
  const transactions = await OrderItem.findAll({ where: { StorefrontId: storefront.StorefrontId }, include: [{ model: Order, as: "order" }], order: [["CreatedAt", "DESC"]], limit: 10 });
  return res.json({ storefrontName: storefront.StoreName, summary: { totalEarnings: buyerPayments - systemFees, buyerPayments, systemFees, creatorEarnings: buyerPayments - systemFees, payouts: [], transactions: transactions.map((item) => ({ description: item.ProductName, amount: Number(item.TotalAmount), date: item.CreatedAt, status: item.order?.Status || "completed" })) } });
});

router.get("/creator/overview", (req, res) => {
  res.json({
    stats: {
      totalSales: "$1,284.50",
      revenue: "$1,152.30",
      products: 24,
      customers: 386,
    },
    products,
  });
});

router.get("/creator/storefronts", (req, res) => {
  res.json({ storefronts });
});

router.post("/creator/storefronts", async (req, res) => {
  const { storeName, slug, description, theme = "default", isPublished = false, isFeatured = false, guestPurchase = true, logoUrl = "" } = req.body;
  const displayName = String(storeName || "").trim();
  const storeSlug = String(slug || "").trim().toLowerCase();

  if (!displayName || !storeSlug || !String(description || "").trim()) {
    return res.status(400).json({ error: "Store name, URL, and description are required" });
  }

  if (storefronts.some((storefront) => storefront.slug === storeSlug)) {
    return res.status(409).json({ error: "That store URL is already in use" });
  }

  const storefront = {
    id: Math.max(0, ...storefronts.map((item) => item.id)) + 1,
    displayName,
    slug: storeSlug,
    type: "Digital Products",
    products: 0,
    revenue: "$0.00",
    description: String(description).trim(),
    theme,
    isPublished: Boolean(isPublished),
    isFeatured: Boolean(isFeatured),
    guestPurchase: Boolean(guestPurchase),
    logoUrl: "",
  };

  try {
    storefront.logoUrl = logoUrl ? mediaUrl(req, await saveEncryptedImage(logoUrl)) : "";
    storefronts = [...storefronts, storefront];
    storefrontState.set(displayName, { branding: { storeName: displayName, description: storefront.description }, settings: {} });
    return res.status(201).json({ storefront });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to save store logo." });
  }
});

router.put("/creator/storefronts/:storefrontName", async (req, res) => {
  const result = findStorefront(req.params.storefrontName, res);
  if (!result) return;

  const index = storefronts.findIndex((item) => item.displayName === result.storefrontName);
  const current = storefronts[index];
  let next = {
    ...current,
    displayName: String(req.body.storeName ?? current.displayName).trim(),
    description: String(req.body.description ?? current.description).trim(),
    theme: req.body.theme ?? current.theme,
    isPublished: req.body.isPublished ?? current.isPublished,
    isFeatured: req.body.isFeatured ?? current.isFeatured,
    guestPurchase: req.body.guestPurchase ?? current.guestPurchase,
    logoUrl: current.logoUrl,
  };

  if (!next.displayName || !next.description) {
    return res.status(400).json({ error: "Store name and description are required" });
  }

  try {
    if (req.body.logoUrl !== undefined && req.body.logoUrl !== current.logoUrl) {
      next = { ...next, logoUrl: req.body.logoUrl ? mediaUrl(req, await saveEncryptedImage(req.body.logoUrl)) : "" };
      if (current.logoUrl && current.logoUrl !== next.logoUrl && !hasLogoReference(current.logoUrl, current)) {
        await deleteEncryptedImage(current.logoUrl);
      }
    }
    storefronts = storefronts.map((item, itemIndex) => (itemIndex === index ? next : item));
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to save store logo." });
  }
  if (result.storefrontName !== next.displayName) {
    const state = storefrontState.get(result.storefrontName);
    storefrontState.delete(result.storefrontName);
    storefrontState.set(next.displayName, state || { branding: {}, settings: {} });
  }
  return res.json({ storefront: next });
});

router.delete("/creator/storefronts/:storefrontName", async (req, res) => {
  const result = findStorefront(req.params.storefrontName, res);
  if (!result) return;

  storefronts = storefronts.filter((item) => item.displayName !== result.storefrontName);
  storefrontState.delete(result.storefrontName);
  if (result.storefront.logoUrl && !hasLogoReference(result.storefront.logoUrl)) {
    await deleteEncryptedImage(result.storefront.logoUrl);
  }
  return res.status(204).send();
});

router.get("/creator/storefronts/:storefrontName", (req, res) => {
  const result = findStorefront(req.params.storefrontName, res);
  if (!result) return;

  res.json({ storefront: result.storefront });
});

function registerStorefrontSection(section) {
  router.get(`/creator/storefronts/:storefrontName/${section}`, (req, res) => {
    const result = findStorefront(req.params.storefrontName, res);
    if (!result) return;

    const state = storefrontState.get(result.storefrontName);
    res.json({ storefrontName: result.storefrontName, [section]: state[section] });
  });

  router.put(`/creator/storefronts/:storefrontName/${section}`, (req, res) => {
    const result = findStorefront(req.params.storefrontName, res);
    if (!result) return;

    const state = storefrontState.get(result.storefrontName);
    state[section] = {
      ...state[section],
      ...req.body,
      ...(section === "settings" && req.body.socialLinks
        ? { socialLinks: { ...state.settings.socialLinks, ...req.body.socialLinks } }
        : {}),
    };

    res.json({ storefrontName: result.storefrontName, [section]: state[section] });
  });
}

["branding", "settings"].forEach(registerStorefrontSection);

module.exports = router;
