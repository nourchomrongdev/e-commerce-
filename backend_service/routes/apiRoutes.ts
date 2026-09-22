const express = require("express");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { sequelize, UserAccount, UserRole, UserAccountRole, CreatorProfile, Storefront, CreatorPayoutInfo, CardInfo, Product, ProductFile, ProductPreview, ProductVersion, Order, OrderItem } = require("../models");
const authRoutes = require("./authRoutes");
const { createPaymentOrder, capturePaymentOrder } = require("../controllers/paymentController");
const { applyCreatorProgram, approveCreatorProfile } = require("../controllers/creatorProgramController");
const { ensureCreatorRoleForUser, findByToken } = require("../controllers/authHelpers");
const { deleteEncryptedImage, readEncryptedImage, saveEncryptedImage } = require("../services/encryptedImageService");
const { saveProductFile } = require("../services/productFileService");
const { setupPaymentToken } = require("../services/paypalService");

const router = express.Router();
const MARKETPLACE_FEE_RATE = 0.2;
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

function isValidCardNumber(cardNumber) {
  const digits = String(cardNumber || "").replace(/\D/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
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

type LegacyStorefront = {
  id: number;
  displayName: string;
  slug: string;
  type: string;
  products: number;
  revenue: string;
  description: string;
  theme?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  guestPurchase?: boolean;
  logoUrl?: string;
};

const products = [
  { id: 1, name: "Website Template", price: 15, category: "Templates" },
  { id: 2, name: "E-Book", price: 10, category: "Books" },
];

let storefronts: LegacyStorefront[] = [
  {
    id: 1,
    displayName: "TestStore",
    slug: "teststore",
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

const storefrontState = new Map<string, { branding: Record<string, unknown>; settings: Record<string, unknown> }>(
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

function hasLogoReference(imageUrl: string, ignoredStorefront?: LegacyStorefront) {
  return storefronts.some((storefront) => storefront !== ignoredStorefront && storefront.logoUrl === imageUrl);
}

function mediaUrl(req, imageUrl) {
  return imageUrl.startsWith("/") ? `${req.protocol}://${req.get("host")}${imageUrl}` : imageUrl;
}

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "marketplace-api" });
});

router.get("/products", async (req, res) => {
  try {
    const databaseProducts = await Product.findAll({ order: [["CreatedAt", "DESC"]] });
    return res.json({ products: databaseProducts.map(serializeProduct) });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to load products." });
  }
});

function serializeProduct(product) {
  return {
    id: product.ProductId,
    uuid: product.UUID,
    name: product.ProductName,
    slug: product.Slug,
    shortDescription: product.ShortDescription || "",
    description: product.Description || "",
    productType: product.ProductType,
    price: Number(product.Price || 0),
    discount: Number(product.DiscountPercent || 0),
    discountType: product.DiscountType || "none",
    discountAmount: Number(product.DiscountAmount || 0),
    currency: product.Currency || "USD",
    status: String(product.Status || "draft").toLowerCase(),
    storefrontId: product.StorefrontId,
    createdAt: product.CreatedAt,
    updatedAt: product.UpdatedAt,
  };
}

function parseDiscount(body, price, fallback: { type?: string; amount?: number } = {}) {
  const discountType = String(body.discountType || fallback.type || "none").toLowerCase();
  const requestedAmount = Number(body.discountAmount ?? body.discount ?? fallback.amount ?? 0);
  if (!["none", "percentage", "fixed"].includes(discountType) || !Number.isFinite(requestedAmount) || requestedAmount < 0) {
    throw new Error("Discount must be a valid percentage or fixed amount.");
  }
  if (discountType === "percentage" && requestedAmount > 100) throw new Error("Percentage discount must be between 0 and 100.");
  if (discountType === "fixed" && requestedAmount + price * MARKETPLACE_FEE_RATE >= price) {
    throw new Error("Fixed discount plus the 20% marketplace fee must be less than the product price.");
  }
  return {
    type: discountType,
    amount: discountType === "none" ? 0 : requestedAmount,
    percent: discountType === "fixed" && price > 0 ? (requestedAmount / price) * 100 : discountType === "percentage" ? requestedAmount : 0,
  };
}

router.get("/admin/products", requireAdmin, async (req, res) => {
  try {
    const databaseProducts = await Product.findAll({ order: [["CreatedAt", "DESC"]] });
    return res.json({ products: databaseProducts.map(serializeProduct) });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to load products." });
  }
});

router.post("/admin/products", requireAdmin, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    assertTextLimit("Product name", name, 40);
    assertTextLimit("Short description", req.body.shortDescription, 50);
    assertWordLimit("Product description", req.body.description, 50);
    assertTextLimit("Product price", req.body.price, 20);
    const slug = await uniqueProductSlug(req.body.slug || name);
    const price = Number(req.body.price);
    const discount = parseDiscount(req.body, price);
    let storefrontId = Number(req.body.storefrontId);
    let categoryId = Number(req.body.categoryId);
    if (!storefrontId) {
      const [storefronts] = await sequelize.query('SELECT "StorefrontId" FROM "Storefronts" ORDER BY "CreatedAt" ASC LIMIT 1');
      storefrontId = Number(storefronts[0]?.StorefrontId);
    }
    if (!categoryId) categoryId = await resolveCategoryId(req.body.categoryName);
    if (!name || !slug || !Number.isFinite(price) || price < 0 || !storefrontId || !categoryId) {
      return res.status(400).json({ error: "Name, price, storefront, and category are required." });
    }
    const created = await Product.create({
      UUID: crypto.randomUUID(),
      StorefrontId: storefrontId,
      CategoryId: categoryId,
      ProductName: name,
      Slug: slug,
      ShortDescription: String(req.body.shortDescription || "").trim(),
      Description: String(req.body.description || "").trim(),
      ProductType: String(req.body.productType || "Digital Download"),
      Price: price,
      DiscountPercent: discount.percent,
      DiscountType: discount.type,
      DiscountAmount: discount.amount,
      Currency: String(req.body.currency || "USD").slice(0, 3).toUpperCase(),
      Status: String(req.body.status || "draft").toLowerCase(),
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    });
    return res.status(201).json({ product: serializeProduct(created) });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to create product." });
  }
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

router.get("/creator/catalog-options", async (req, res) => {
  try {
    const [categories] = await sequelize.query('SELECT "CategoryId" AS id, "CategoryName" AS name FROM "Categories" WHERE "IsActive" = TRUE AND "ParentCategoryId" IS NULL ORDER BY "CategoryName" ASC');
    let subcategories = [];
    try {
      [subcategories] = await sequelize.query('SELECT "SubcategoryId" AS id, "CategoryId" AS "categoryId", "SubcategoryName" AS name FROM "Subcategories" WHERE "IsActive" = TRUE ORDER BY "SubcategoryName" ASC');
    } catch {
      subcategories = [];
    }
    let productTypes = [];
    try {
      [productTypes] = await sequelize.query('SELECT "TypeName" AS name, "Description" AS description FROM "ProductTypes" WHERE "IsActive" = TRUE ORDER BY "TypeName" ASC');
    } catch {
      productTypes = [];
    }
    return res.json({ categories, subcategories, productTypes });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to load catalog options." });
  }
});

router.post("/creator/catalog-options", async (req, res) => {
  try {
    const kind = String(req.body.kind || "").toLowerCase();
    const name = String(req.body.name || "").trim();
    if (!name || !["category", "subcategory", "producttype"].includes(kind)) return res.status(400).json({ error: "A valid catalog type and name are required." });
    if (kind === "producttype") {
      const [rows] = await sequelize.query('INSERT INTO "ProductTypes" ("TypeName") VALUES (:name) ON CONFLICT ("TypeName") DO UPDATE SET "IsActive" = TRUE RETURNING "TypeName" AS name', { replacements: { name } });
      return res.status(201).json({ option: rows[0] });
    }
    const parentName = String(req.body.parentName || "").trim();
    const parent = parentName ? (await sequelize.query('SELECT "CategoryId" FROM "Categories" WHERE lower("CategoryName") = lower(:name) AND "ParentCategoryId" IS NULL LIMIT 1', { replacements: { name: parentName } }))[0][0] : null;
    if (kind === "subcategory") {
      if (!parent) return res.status(400).json({ error: "A parent category is required for a subcategory." });
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "subcategory";
      const [rows] = await sequelize.query('INSERT INTO "Subcategories" ("CategoryId", "SubcategoryName", "Slug") VALUES (:categoryId, :name, :slug) ON CONFLICT ("CategoryId", "SubcategoryName") DO UPDATE SET "IsActive" = TRUE RETURNING "SubcategoryId" AS id, "CategoryId" AS "categoryId", "SubcategoryName" AS name', { replacements: { categoryId: parent.CategoryId, name, slug } });
      return res.status(201).json({ option: rows[0] });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "category";
    const [rows] = await sequelize.query('INSERT INTO "Categories" ("CategoryName", "Slug", "ParentCategoryId") VALUES (:name, :slug, :parentId) ON CONFLICT ("Slug") DO UPDATE SET "IsActive" = TRUE RETURNING "CategoryId" AS id, "CategoryName" AS name, "ParentCategoryId" AS "parentId"', { replacements: { name, slug, parentId: parent?.CategoryId || null } });
    return res.status(201).json({ option: rows[0] });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to add catalog option." });
  }
});

async function databaseStorefront(req) {
  const profile = await CreatorProfile.findOne({ where: { UserId: req.userId } });
  if (!profile) return { profile: null, storefront: null };
  const storefrontName = req.params.storefrontName;
  const storefront = await Storefront.findOne({
    where: storefrontName
      ? { CreatorProfileId: profile.CreatorProfileId, [require("sequelize").Op.or]: [{ StoreName: storefrontName }, { StoreSlug: storefrontName }] }
      : { CreatorProfileId: profile.CreatorProfileId },
    order: [["CreatedAt", "ASC"]],
  });
  return { profile, storefront };
}

function serializePreview(preview) {
  return {
    id: preview.ProductPreviewId,
    type: preview.PreviewType,
    title: preview.Title || "",
    url: preview.PreviewUrl,
    sortOrder: preview.SortOrder,
    isActive: preview.IsActive,
  };
}

async function resolveCategoryId(categoryName, parentCategoryName?: string) {
  const normalizedName = String(categoryName || "Uncategorized").trim() || "Uncategorized";
  const parent = parentCategoryName ? (await sequelize.query('SELECT "CategoryId" FROM "Categories" WHERE lower("CategoryName") = lower(:parentCategoryName) AND "ParentCategoryId" IS NULL LIMIT 1', { replacements: { parentCategoryName } }))[0][0] : null;
  const [existing] = await sequelize.query('SELECT "CategoryId" FROM "Categories" WHERE lower("CategoryName") = lower(:categoryName) AND ("ParentCategoryId" = :parentId OR (:parentId IS NULL AND "ParentCategoryId" IS NULL)) LIMIT 1', { replacements: { categoryName: normalizedName, parentId: parent?.CategoryId || null } });
  if (existing[0]?.CategoryId) return Number(existing[0].CategoryId);
  const slug = normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "uncategorized";
  const categorySlug = parent ? `${slug}-${parent.CategoryId}` : slug;
  await sequelize.query('INSERT INTO "Categories" ("CategoryName", "Slug", "ParentCategoryId", "Description") VALUES (:categoryName, :slug, :parentId, :description) ON CONFLICT ("Slug") DO NOTHING', { replacements: { categoryName: normalizedName, slug: categorySlug, parentId: parent?.CategoryId || null, description: `${normalizedName} products` } });
  const [created] = await sequelize.query('SELECT "CategoryId" FROM "Categories" WHERE "Slug" = :slug LIMIT 1', { replacements: { slug: categorySlug } });
  return Number(created[0]?.CategoryId || 0);
}

async function resolveSubcategoryId(subcategoryName, categoryName) {
  const normalizedName = String(subcategoryName || "").trim();
  if (!normalizedName) return null;
  const parentId = await resolveCategoryId(categoryName);
  const [rows] = await sequelize.query('SELECT "SubcategoryId" FROM "Subcategories" WHERE "CategoryId" = :categoryId AND lower("SubcategoryName") = lower(:subcategoryName) LIMIT 1', { replacements: { categoryId: parentId, subcategoryName: normalizedName } });
  return rows[0]?.SubcategoryId ? Number(rows[0].SubcategoryId) : null;
}

async function uniqueProductSlug(requestedSlug) {
  const baseSlug = String(requestedSlug || "product").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "") || "product";
  let candidate = baseSlug;
  let suffix = 2;
  while (await Product.count({ where: { Slug: candidate } })) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function previewDataSize(dataUrl) {
  const encoded = String(dataUrl || "").split(",")[1] || "";
  return Buffer.byteLength(encoded, "base64");
}

function assertTextLimit(label, value, maximum) {
  if (String(value || "").length > maximum)
    throw new Error(`${label} must be ${maximum} characters or fewer.`);
}

function assertWordLimit(label, value, maximum) {
  const text = String(value || "");
  const words = text.match(/[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+/g) || [];
  if (words.length > maximum || text.length > 500)
    throw new Error(`${label} must be ${maximum} words or fewer and no more than 500 characters.`);
}

function isSafeProductStorageKey(value) {
  return /^[a-f0-9]{64}\.[a-z0-9]+$/i.test(String(value || ""));
}

const MAX_PRODUCT_FILES = 10;

function releasePayload(body) {
  let releases;
  const productPrice = Number(body.price || 0);
  if (Array.isArray(body.versions)) {
    releases = body.versions.map((release) => ({
      id: release.id ? Number(release.id) : undefined,
      version: String(release.version || "").trim(),
      price: productPrice,
      isFree: productPrice === 0,
      license: String(release.license || body.license || "All").replace(/\s+License$/i, "").trim(),
      licenses: Array.isArray(release.licenses) ? release.licenses.slice(0, 4).map((license) => ({ name: String(license.name || "All").replace(/\s+License$/i, "").trim(), price: productPrice, access: String(license.access || "Lifetime Access"), downloadLimit: license.downloadLimit ? Number(license.downloadLimit) : null })) : [],
      releaseNotes: String(release.releaseNotes || release.summary || "").trim(),
      current: release.current !== false,
      files: Array.isArray(release.files) ? release.files.filter((file) => isSafeProductStorageKey(file?.storageKey) && file?.fileName) : [],
      previews: Array.isArray(release.previews) ? release.previews.filter((preview) => preview?.url) : [],
    })).filter((release) => release.version);
  } else {
    releases = [{ version: String(body.version || "1.0.0").trim(), price: Number(body.price || 0), isFree: Number(body.price || 0) === 0, license: String(body.license || "All").replace(/\s+License$/i, "").trim(), licenses: [], releaseNotes: String(body.releaseNotes || "Initial release.").trim(), current: true, files: Array.isArray(body.files) ? body.files.filter((file) => isSafeProductStorageKey(file?.storageKey) && file?.fileName) : [], previews: Array.isArray(body.previews) ? body.previews.filter((preview) => preview?.url) : [] }];
  }
  releases.forEach((release) => {
    if (!release.licenses.length) release.licenses = [{ name: release.license, price: release.isFree ? 0 : release.price, access: "Lifetime Access", downloadLimit: null }];
    release.licenses = release.licenses.filter((license, index, all) => license.name && Number.isFinite(license.price) && license.price >= 0 && all.findIndex((item) => item.name.toLowerCase() === license.name.toLowerCase()) === index).slice(0, 4);
    if (!release.licenses.length) throw new Error("Choose at least one licence for every product version.");
    release.license = release.licenses[0]?.name ?? null;
    if (release.files.length > MAX_PRODUCT_FILES)
      throw new Error(`A product version can contain at most ${MAX_PRODUCT_FILES} files.`);
    assertTextLimit("Product price", release.price, 10);
    assertTextLimit("Product version", release.version, 10);
    assertTextLimit("Release notes", release.releaseNotes, 100);
  });
  return releases;
}

async function resolveLicenseTypeId(licenseName) {
  const normalized = String(licenseName || "All").replace(/\s+License$/i, "").trim();
  const [rows] = await sequelize.query('SELECT "LicenseTypeId" FROM "LicenseTypes" WHERE lower("LicenseName") IN (lower(:licenseName), lower(:licenseName) || \' license\') AND "IsActive" = TRUE LIMIT 1', { replacements: { licenseName: normalized } });
  return rows[0]?.LicenseTypeId ? Number(rows[0].LicenseTypeId) : null;
}

async function replaceReleaseLicenses(versionId, licenses) {
  await sequelize.query('DELETE FROM "ProductVersionLicenses" WHERE "ProductVersionId" = :versionId', { replacements: { versionId } });
  for (const license of licenses) {
    const licenseTypeId = await resolveLicenseTypeId(license.name);
    if (!licenseTypeId) throw new Error(`The ${license.name} licence is not available.`);
    await sequelize.query('INSERT INTO "ProductVersionLicenses" ("ProductVersionId", "LicenseTypeId", "Price", "AccessType", "DownloadLimit") VALUES (:versionId, :licenseTypeId, :price, :accessType, :downloadLimit)', { replacements: { versionId, licenseTypeId, price: license.price, accessType: license.access, downloadLimit: license.downloadLimit } });
  }
}

async function replaceReleaseAssets(productId, versionId, files, previews, now) {
  if (previews.some((preview) => previewDataSize(preview.url) > 10 * 1024 * 1024)) throw new Error("Preview images must be smaller than 10 MB.");
  await ProductFile.destroy({ where: { ProductId: productId, ProductVersionId: versionId } });
  await ProductPreview.destroy({ where: { ProductId: productId, ProductVersionId: versionId } });
  if (files.length) await ProductFile.bulkCreate(files.map((file) => ({ ProductId: productId, ProductVersionId: versionId, FileName: String(file.fileName).slice(0, 255), StorageKey: String(file.storageKey), FileSize: Number(file.fileSize || 0), MimeType: String(file.mimeType || "application/octet-stream"), CreatedAt: now })));
  if (previews.length) await ProductPreview.bulkCreate(previews.map((preview, index) => ({ ProductId: productId, ProductVersionId: versionId, PreviewType: String(preview.type || "image"), Title: String(preview.title || "").trim(), PreviewUrl: String(preview.url), SortOrder: Number(preview.sortOrder ?? index), CreatedAt: now })));
}

async function storefrontHasProductName(storefrontId, name, ignoredProductId) {
  const products = await Product.findAll({
    where: { StorefrontId: storefrontId },
    attributes: ["ProductId", "ProductName"],
  });
  const normalizedName = String(name).trim().toLocaleLowerCase();
  return products.some((product) => product.ProductId !== ignoredProductId && String(product.ProductName).trim().toLocaleLowerCase() === normalizedName);
}

async function creatorProduct(req) {
  const { storefront } = await databaseStorefront(req);
  if (!storefront) return { storefront: null, product: null };
  const productKey = String(req.params.productId || "");
  const product = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productKey)
    ? await Product.findOne({ where: { UUID: productKey, StorefrontId: storefront.StorefrontId } })
    : await Product.findOne({ where: { ProductId: productKey, StorefrontId: storefront.StorefrontId } });
  return { storefront, product };
}

router.post("/creator/storefronts/:storefrontName/products", async (req, res) => {
  try {
    const { storefront } = await databaseStorefront(req);
    if (!storefront) return res.status(404).json({ error: "Storefront not found." });
    const name = String(req.body.name || "").trim();
    assertTextLimit("Product name", name, 40);
    assertTextLimit("Short description", req.body.shortDescription, 50);
    assertWordLimit("Product description", req.body.description, 50);
    assertTextLimit("Product price", req.body.price, 20);
    const price = Number(req.body.price || 0);
    if (!name || !Number.isFinite(price) || price < 0) return res.status(400).json({ error: "Product name and a valid price are required." });
    const discount = parseDiscount(req.body, price);
    if (await storefrontHasProductName(storefront.StorefrontId, name, undefined)) return res.status(409).json({ error: "A product with this name already exists in this storefront." });
    const categoryId = Number(req.body.categoryId || await resolveCategoryId(req.body.categoryName));
    const slug = await uniqueProductSlug(req.body.slug || name);
    const now = new Date();
    const releases = releasePayload(req.body);
    const isPublished = String(req.body.status || "draft").toLowerCase() === "published";
    if (!releases.length || releases.some((release) => !release.files.length)) return res.status(400).json({ error: "Add at least one product file to every version before saving." });
    if (releases.some((release) => !release.previews.length)) return res.status(400).json({ error: "Add at least one preview asset to every version before saving." });
    if (releases.some((release) => !Number.isFinite(release.price) || release.price < 0)) return res.status(400).json({ error: "Each product version must have a valid price." });
    if (new Set(releases.map((release) => release.version)).size !== releases.length) return res.status(400).json({ error: "Each product version must have a unique version number." });
    const product = await Product.create({ UUID: crypto.randomUUID(), StorefrontId: storefront.StorefrontId, CategoryId: categoryId, ProductName: name, Slug: slug, ShortDescription: String(req.body.shortDescription || "").trim(), Description: String(req.body.description || "").trim(), ProductType: String(req.body.productType || "Digital Download"), Price: price, DiscountPercent: discount.percent, DiscountType: discount.type, DiscountAmount: discount.amount, Currency: String(req.body.currency || "USD").slice(0, 3).toUpperCase(), Status: String(req.body.status || "draft").toLowerCase(), CreatedAt: now, UpdatedAt: now });
    const currentReleaseIndex = Math.max(0, releases.findIndex((release) => release.current));
    for (const [index, release] of releases.entries()) {
      const version = await ProductVersion.create({ UUID: crypto.randomUUID(), ProductId: product.ProductId, VersionNumber: release.version, Price: release.isFree ? 0 : release.price, IsFree: release.isFree, LicenseTypeId: release.license ? await resolveLicenseTypeId(release.license) : null, ReleaseNotes: release.releaseNotes, IsCurrent: index === currentReleaseIndex, CreatedAt: now });
      await replaceReleaseLicenses(version.ProductVersionId, release.licenses);
      await replaceReleaseAssets(product.ProductId, version.ProductVersionId, release.files, release.previews, now);
    }
    return res.status(201).json({ product: serializeProduct(product) });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to create product." });
  }
});

router.put("/creator/storefronts/:storefrontName/products/:productId", async (req, res) => {
  try {
    const { product } = await creatorProduct(req);
    if (!product) return res.status(404).json({ error: "Product not found." });
    const files = Array.isArray(req.body.files) ? req.body.files.filter((file) => isSafeProductStorageKey(file?.storageKey) && file?.fileName) : [];
    if (req.body.files !== undefined && !files.length) return res.status(400).json({ error: "At least one product file is required." });
    const price = req.body.price === undefined ? product.Price : Number(req.body.price);
    if (req.body.price !== undefined) assertTextLimit("Product price", req.body.price, 20);
    if (!Number.isFinite(price) || price < 0) return res.status(400).json({ error: "Price must be a valid value." });
    const discount = parseDiscount(req.body, price, { type: product.DiscountType, amount: product.DiscountAmount ?? product.DiscountPercent });
    const name = req.body.name === undefined ? product.ProductName : String(req.body.name).trim();
    if (!name) return res.status(400).json({ error: "Product name is required." });
    assertTextLimit("Product name", name, 40);
    assertWordLimit(
      "Product description",
      req.body.description === undefined ? product.Description : req.body.description,
      50,
    );
    if (req.body.shortDescription !== undefined) assertTextLimit("Short description", req.body.shortDescription, 50);
    if (await storefrontHasProductName(product.StorefrontId, name, product.ProductId)) return res.status(409).json({ error: "A product with this name already exists in this storefront." });
    const requestedSlug = String(req.body.slug || "").trim();
    const slug = requestedSlug && requestedSlug !== product.Slug ? await uniqueProductSlug(requestedSlug) : product.Slug;
    const categoryId = req.body.categoryName === undefined ? product.CategoryId : Number(req.body.categoryId || await resolveCategoryId(req.body.categoryName));
    const releases = Array.isArray(req.body.versions) ? releasePayload(req.body) : null;
    const isPublished = String(req.body.status === undefined ? product.Status : req.body.status).toLowerCase() === "published";
    if (releases && (!releases.length || releases.some((release) => !release.files.length))) return res.status(400).json({ error: "Add at least one product file to every version before saving." });
    if (releases && releases.some((release) => !release.previews.length)) return res.status(400).json({ error: "Add at least one preview asset to every version before saving." });
    if (releases && new Set(releases.map((release) => release.version)).size !== releases.length) return res.status(400).json({ error: "Each product version must have a unique version number." });
    if (releases && releases.some((release) => !Number.isFinite(release.price) || release.price < 0)) return res.status(400).json({ error: "Each product version must have a valid price." });
    const version = String(req.body.version || "").trim();
    if (!releases && version && await ProductVersion.findOne({ where: { ProductId: product.ProductId, VersionNumber: version } })) return res.status(409).json({ error: `Version ${version} already exists for this product.` });
    await product.update({
      ProductName: name,
      Slug: slug,
      CategoryId: categoryId,
      ShortDescription: req.body.shortDescription === undefined ? product.ShortDescription : String(req.body.shortDescription).trim(),
      Description: req.body.description === undefined ? product.Description : String(req.body.description).trim(),
      ProductType: req.body.productType === undefined ? product.ProductType : String(req.body.productType),
      Price: price,
      DiscountPercent: discount.percent,
      DiscountType: discount.type,
      DiscountAmount: discount.amount,
      Currency: req.body.currency === undefined ? product.Currency : String(req.body.currency).slice(0, 3).toUpperCase(),
      Status: req.body.status === undefined ? product.Status : String(req.body.status).toLowerCase(),
      UpdatedAt: new Date(),
    });
    if (releases) {
      const existingVersions = await ProductVersion.findAll({ where: { ProductId: product.ProductId } });
      const existingById = new Map<number, any>(existingVersions.map((item) => [Number(item.ProductVersionId), item]));
      await ProductVersion.update({ IsCurrent: false }, { where: { ProductId: product.ProductId } });
      const currentReleaseIndex = Math.max(0, releases.findIndex((release) => release.current));
      for (const [index, release] of releases.entries()) {
        const existing = release.id ? existingById.get(release.id) : undefined;
        if (release.id && !existing) throw new Error("A product version could not be found.");
        if (existing) {
          await existing.update({ VersionNumber: release.version, Price: release.isFree ? 0 : release.price, IsFree: release.isFree, LicenseTypeId: release.license ? await resolveLicenseTypeId(release.license) : null, ReleaseNotes: release.releaseNotes, IsCurrent: index === currentReleaseIndex });
          await replaceReleaseLicenses(existing.ProductVersionId, release.licenses);
          await replaceReleaseAssets(product.ProductId, existing.ProductVersionId, release.files, release.previews, new Date());
        } else {
          const created = await ProductVersion.create({ UUID: crypto.randomUUID(), ProductId: product.ProductId, VersionNumber: release.version, Price: release.isFree ? 0 : release.price, IsFree: release.isFree, LicenseTypeId: release.license ? await resolveLicenseTypeId(release.license) : null, ReleaseNotes: release.releaseNotes, IsCurrent: index === currentReleaseIndex, CreatedAt: new Date() });
          await replaceReleaseLicenses(created.ProductVersionId, release.licenses);
          await replaceReleaseAssets(product.ProductId, created.ProductVersionId, release.files, release.previews, new Date());
        }
      }
    } else if (req.body.files !== undefined) {
      await ProductFile.destroy({ where: { ProductId: product.ProductId } });
      await ProductFile.bulkCreate(files.map((file) => ({ ProductId: product.ProductId, FileName: String(file.fileName).slice(0, 255), StorageKey: String(file.storageKey), FileSize: Number(file.fileSize || 0), MimeType: String(file.mimeType || "application/octet-stream"), CreatedAt: new Date() })));
    }
    if (!releases && req.body.previews !== undefined) {
      const previews = Array.isArray(req.body.previews) ? req.body.previews.filter((preview) => preview?.url).map((preview, index) => ({ ProductId: product.ProductId, PreviewType: String(preview.type || "image"), Title: String(preview.title || "").trim(), PreviewUrl: String(preview.url), SortOrder: Number(preview.sortOrder ?? index), CreatedAt: new Date() })) : [];
      if (previews.some((preview) => previewDataSize(preview.PreviewUrl) > 10 * 1024 * 1024)) return res.status(400).json({ error: "Preview images must be smaller than 10 MB." });
      await ProductPreview.destroy({ where: { ProductId: product.ProductId } });
      if (previews.length) await ProductPreview.bulkCreate(previews);
    }
    if (!releases && version) {
      await ProductVersion.update({ IsCurrent: false }, { where: { ProductId: product.ProductId } });
      await ProductVersion.create({ UUID: crypto.randomUUID(), ProductId: product.ProductId, VersionNumber: version, ReleaseNotes: String(req.body.releaseNotes || "").trim(), IsCurrent: true, CreatedAt: new Date() });
    }
    return res.json({ product: serializeProduct(product) });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to update product." });
  }
});

router.delete("/creator/storefronts/:storefrontName/products/:productId", async (req, res) => {
  try {
    const { product } = await creatorProduct(req);
    if (!product) return res.status(404).json({ error: "Product not found." });
    await product.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to delete product." });
  }
});

router.get("/creator/storefronts/:storefrontName/products", async (req, res) => {
  try {
    const { storefront } = await databaseStorefront(req);
    if (!storefront) return res.status(404).json({ error: "Storefront not found." });
    const databaseProducts = await Product.findAll({
      where: { StorefrontId: storefront.StorefrontId },
      order: [["CreatedAt", "DESC"]],
    });
    const products = await Promise.all(databaseProducts.map(async (product) => {
      const currentVersion = await ProductVersion.findOne({
        where: { ProductId: product.ProductId, IsCurrent: true },
        attributes: ["VersionNumber"],
      });
      const latestVersion = await ProductVersion.findOne({
        where: { ProductId: product.ProductId },
        attributes: ["VersionNumber"],
        order: [["CreatedAt", "DESC"], ["ProductVersionId", "DESC"]],
      });
      return {
        ...serializeProduct(product),
        currentVersion: currentVersion?.VersionNumber || null,
        latestVersion: latestVersion?.VersionNumber || null,
      };
    }));
    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to load storefront products." });
  }
});

router.post("/creator/storefronts/:storefrontName/product-files", async (req, res) => {
  try {
    const { storefront } = await databaseStorefront(req);
    if (!storefront) return res.status(404).json({ error: "Storefront not found." });
    const file = await saveProductFile(req.body.data, req.body.fileName, req.body.mimeType, storefront.StorefrontId);
    return res.status(201).json({ file });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to upload product file." });
  }
});

router.get("/creator/storefronts/:storefrontName/products/:productId/previews", async (req, res) => {
  const { product } = await creatorProduct(req);
  if (!product) return res.status(404).json({ error: "Product not found." });
  const previews = await ProductPreview.findAll({ where: { ProductId: product.ProductId, IsActive: true }, order: [["SortOrder", "ASC"]] });
  return res.json({ previews: previews.map(serializePreview) });
});

router.get("/creator/storefronts/:storefrontName/products/:productId/versions", async (req, res) => {
  const { product } = await creatorProduct(req);
  if (!product) return res.status(404).json({ error: "Product not found." });
  const versions = await ProductVersion.findAll({ where: { ProductId: product.ProductId }, order: [["CreatedAt", "DESC"]] });
  const [licenseTypes] = await sequelize.query('SELECT "LicenseTypeId", "LicenseName" FROM "LicenseTypes" WHERE "IsActive" = TRUE');
  const licenseNames = new Map(licenseTypes.map((licenseType) => [Number(licenseType.LicenseTypeId), licenseType.LicenseName]));
  const versionIds = versions.map((version) => Number(version.ProductVersionId)).filter((id) => Number.isFinite(id));
  const [files, previews, versionLicenses] = await Promise.all([
    ProductFile.findAll({ where: { ProductId: product.ProductId, IsActive: true }, order: [["CreatedAt", "ASC"]] }),
    ProductPreview.findAll({ where: { ProductId: product.ProductId, IsActive: true }, order: [["SortOrder", "ASC"]] }),
    versionIds.length ? sequelize.query('SELECT "ProductVersionId", "LicenseTypeId", "Price", "AccessType", "DownloadLimit" FROM "ProductVersionLicenses" WHERE "ProductVersionId" IN (:versionIds) ORDER BY "ProductVersionId", "ProductVersionLicenseId"', { replacements: { versionIds } }).then(([rows]) => rows) : Promise.resolve([]),
  ]);
  const licensesByVersion = new Map();
  versionLicenses.forEach((item) => {
    const versionId = Number(item.ProductVersionId);
    licensesByVersion.set(versionId, [...(licensesByVersion.get(versionId) || []), { name: String(licenseNames.get(Number(item.LicenseTypeId)) || "All").replace(/\s+License$/i, ""), price: Number(item.Price || 0), access: item.AccessType || "Lifetime Access", downloadLimit: item.DownloadLimit ? Number(item.DownloadLimit) : undefined }]);
  });

  const currentVersionId = versions.find((version) => version.IsCurrent)?.ProductVersionId ?? versions[0]?.ProductVersionId ?? null;
  const filesByVersion = new Map();
  const previewsByVersion = new Map();

  versions.forEach((version) => {
    const versionId = Number(version.ProductVersionId);
    filesByVersion.set(versionId, []);
    previewsByVersion.set(versionId, []);
  });

  files.forEach((file) => {
    const fileVersionId = Number(file.ProductVersionId ?? currentVersionId);
    if (!Number.isFinite(fileVersionId)) return;
    const targetVersion = versions.some((version) => Number(version.ProductVersionId) === fileVersionId)
      ? fileVersionId
      : currentVersionId ?? fileVersionId;
    const nextEntry = { fileName: file.FileName, storageKey: file.StorageKey, fileSize: Number(file.FileSize || 0), mimeType: file.MimeType };
    const key = Number(targetVersion);
    filesByVersion.set(key, [...(filesByVersion.get(key) || []), nextEntry]);
  });

  previews.forEach((preview) => {
    const previewVersionId = Number(preview.ProductVersionId ?? currentVersionId);
    if (!Number.isFinite(previewVersionId)) return;
    const targetVersion = versions.some((version) => Number(version.ProductVersionId) === previewVersionId)
      ? previewVersionId
      : currentVersionId ?? previewVersionId;
    const nextEntry = { id: String(preview.ProductPreviewId), title: preview.Title || "", type: preview.PreviewType, url: preview.PreviewUrl };
    const key = Number(targetVersion);
    previewsByVersion.set(key, [...(previewsByVersion.get(key) || []), nextEntry]);
  });

  return res.json({ versions: versions.map((version) => { const isFree = Boolean(version.IsFree) || Number(version.Price || 0) === 0; const licenses = licensesByVersion.get(Number(version.ProductVersionId)) || [{ name: String(licenseNames.get(Number(version.LicenseTypeId)) || "ALL").replace(/\s+License$/i, ""), price: isFree ? 0 : Number(version.Price || 0), access: "Lifetime Access" }]; return { id: version.ProductVersionId, version: version.VersionNumber, price: Number(version.Price || 0), isFree, license: licenses[0]?.name ?? null, licenses, releaseNotes: version.ReleaseNotes || "", current: version.IsCurrent, createdAt: version.CreatedAt, files: filesByVersion.get(Number(version.ProductVersionId)) || [], previewAssets: previewsByVersion.get(Number(version.ProductVersionId)) || [] }; }) });
});

router.post("/creator/storefronts/:storefrontName/products/:productId/versions", async (req, res) => {
  try {
    const { product } = await creatorProduct(req);
    if (!product) return res.status(404).json({ error: "Product not found." });
    const version = String(req.body.version || "").trim();
    if (!version) return res.status(400).json({ error: "Version number is required." });
    assertTextLimit("Product version", version, 40);
    assertTextLimit("Release notes", req.body.summary, 100);
    if (req.body.description !== undefined) assertWordLimit("Product description", req.body.description, 50);
    const price = Number(req.body.price ?? product.Price ?? 0);
    if (!Number.isFinite(price) || price < 0) return res.status(400).json({ error: "A valid version price is required." });
    if (await ProductVersion.findOne({ where: { ProductId: product.ProductId, VersionNumber: version } })) return res.status(409).json({ error: `Version ${version} already exists for this product.` });

    const now = new Date();
    const files = Array.isArray(req.body.files) ? req.body.files.filter((file) => isSafeProductStorageKey(file?.storageKey) && file?.fileName) : [];
    const previews = Array.isArray(req.body.previews) ? req.body.previews.filter((preview) => preview?.url) : [];
    if (previews.some((preview) => previewDataSize(preview.url) > 10 * 1024 * 1024)) return res.status(400).json({ error: "Preview images must be smaller than 10 MB." });
    const isCurrent = req.body.current !== false;

    if (req.body.description !== undefined) await product.update({ Description: String(req.body.description).trim(), UpdatedAt: now });
    if (isCurrent) await ProductVersion.update({ IsCurrent: false }, { where: { ProductId: product.ProductId } });
    const isFreeVersion = price === 0;
    const created = await ProductVersion.create({ UUID: crypto.randomUUID(), ProductId: product.ProductId, VersionNumber: version, Price: price, IsFree: isFreeVersion, LicenseTypeId: isFreeVersion ? null : await resolveLicenseTypeId(req.body.license), ReleaseNotes: String(req.body.summary || "").trim(), IsCurrent: isCurrent, CreatedAt: now });
    const requestedLicenses = Array.isArray(req.body.licenses) ? req.body.licenses.slice(0, 4).map((license) => ({ name: String(license.name || "All").replace(/\s+License$/i, "").trim(), price: isFreeVersion ? 0 : price, access: String(license.access || "Lifetime Access"), downloadLimit: license.downloadLimit ? Number(license.downloadLimit) : null })) : [{ name: String(req.body.license || "All").replace(/\s+License$/i, "").trim(), price: isFreeVersion ? 0 : price, access: "Lifetime Access", downloadLimit: null }];
    await replaceReleaseLicenses(created.ProductVersionId, requestedLicenses);
    await replaceReleaseAssets(product.ProductId, created.ProductVersionId, files, previews, now);
    return res.status(201).json({ version: { id: created.ProductVersionId, version: created.VersionNumber, price: Number(created.Price || 0), summary: created.ReleaseNotes || "", current: created.IsCurrent, createdAt: created.CreatedAt } });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to add version." });
  }
});

router.get("/creator/storefronts/:storefrontName/products/:productId/files", async (req, res) => {
  const { product } = await creatorProduct(req);
  if (!product) return res.status(404).json({ error: "Product not found." });
  const files = await ProductFile.findAll({ where: { ProductId: product.ProductId, IsActive: true }, order: [["CreatedAt", "ASC"]] });
  return res.json({ files: files.map((file) => ({ id: file.UUID, productVersionId: file.ProductVersionId, fileName: file.FileName, storageKey: file.StorageKey, fileSize: Number(file.FileSize || 0), mimeType: file.MimeType, createdAt: file.CreatedAt, url: `/creator/storefronts/${encodeURIComponent(req.params.storefrontName)}/products/${product.UUID || product.ProductId}/files/${file.UUID}/content` })) });
});

router.post("/creator/storefronts/:storefrontName/products/:productId/files", async (req, res) => {
  try {
    const { product } = await creatorProduct(req);
    if (!product) return res.status(404).json({ error: "Product not found." });
    const versionId = Number(req.body.productVersionId);
    const version = await ProductVersion.findOne({ where: { ProductVersionId: versionId, ProductId: product.ProductId } });
    if (!version) return res.status(400).json({ error: "A valid product version is required." });
    const fileData = await saveProductFile(req.body.data, req.body.fileName, req.body.mimeType, product.StorefrontId);
    const file = await ProductFile.create({ UUID: crypto.randomUUID(), ProductId: product.ProductId, ProductVersionId: version.ProductVersionId, FileName: fileData.fileName, StorageKey: fileData.storageKey, FileSize: fileData.fileSize, MimeType: fileData.mimeType, CreatedAt: new Date() });
    return res.status(201).json({ file: { id: file.UUID, productVersionId: file.ProductVersionId, fileName: file.FileName, fileSize: Number(file.FileSize), mimeType: file.MimeType, createdAt: file.CreatedAt } });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to add product file." });
  }
});

router.put("/creator/storefronts/:storefrontName/products/:productId/files/:fileId", async (req, res) => {
  const { product } = await creatorProduct(req);
  if (!product) return res.status(404).json({ error: "Product not found." });
  const file = await ProductFile.findOne({ where: { UUID: req.params.fileId, ProductId: product.ProductId, IsActive: true } });
  if (!file) return res.status(404).json({ error: "File not found." });
  const fileName = String(req.body.fileName || "").trim();
  if (!fileName) return res.status(400).json({ error: "File name is required." });
  await file.update({ FileName: fileName.slice(0, 255) });
  return res.json({ file: { id: file.UUID, fileName: file.FileName } });
});

router.delete("/creator/storefronts/:storefrontName/products/:productId/files/:fileId", async (req, res) => {
  const { product } = await creatorProduct(req);
  if (!product) return res.status(404).json({ error: "Product not found." });
  const file = await ProductFile.findOne({ where: { UUID: req.params.fileId, ProductId: product.ProductId, IsActive: true } });
  if (!file) return res.status(404).json({ error: "File not found." });
  const fileCount = await ProductFile.count({ where: { ProductId: product.ProductId, ProductVersionId: file.ProductVersionId, IsActive: true } });
  if (fileCount <= 1) return res.status(400).json({ error: "Each product version must keep at least one file." });
  await file.update({ IsActive: false });
  return res.json({ success: true });
});

router.get("/creator/storefronts/:storefrontName/products/:productId/files/:fileId/content", async (req, res) => {
  const { product } = await creatorProduct(req);
  if (!product) return res.status(404).json({ error: "Product not found." });
  const file = await ProductFile.findOne({ where: { UUID: req.params.fileId, ProductId: product.ProductId, IsActive: true } });
  if (!file) return res.status(404).json({ error: "File not found." });
  if (path.basename(file.StorageKey) !== file.StorageKey) return res.status(404).json({ error: "File not found." });
  try {
    const filePath = path.resolve(__dirname, "../uploads/products", file.StorageKey);
    res.type(file.MimeType || "application/octet-stream").send(await fs.readFile(filePath));
  } catch {
    return res.status(404).json({ error: "File content is unavailable." });
  }
});

router.post("/creator/storefronts/:storefrontName/products/:productId/previews", async (req, res) => {
  const { product } = await creatorProduct(req);
  if (!product) return res.status(404).json({ error: "Product not found." });
  const versionId = req.body.productVersionId || req.body.versionId;
  let productVersionId = null;
  if (versionId) {
    const version = await ProductVersion.findOne({ where: { ProductVersionId: versionId, ProductId: product.ProductId } });
    if (!version) return res.status(400).json({ error: "Selected version does not belong to this product." });
    productVersionId = version.ProductVersionId;
  }
  const url = String(req.body.url || "");
  assertTextLimit("Preview title", req.body.title, 40);
  if (!url || previewDataSize(url) > 10 * 1024 * 1024) return res.status(400).json({ error: "A preview image smaller than 10 MB is required." });
  const preview = await ProductPreview.create({ ProductId: product.ProductId, ProductVersionId: productVersionId, PreviewType: String(req.body.type || "image"), Title: String(req.body.title || "").trim(), PreviewUrl: url, SortOrder: Number(req.body.sortOrder || 0), CreatedAt: new Date() });
  return res.status(201).json({ preview: serializePreview(preview) });
});

router.put("/creator/storefronts/:storefrontName/products/:productId/previews/:previewId", async (req, res) => {
  const { product } = await creatorProduct(req);
  if (!product) return res.status(404).json({ error: "Product not found." });
  const preview = await ProductPreview.findOne({ where: { ProductPreviewId: req.params.previewId, ProductId: product.ProductId } });
  if (!preview) return res.status(404).json({ error: "Preview not found." });
  if (req.body.title !== undefined) assertTextLimit("Preview title", req.body.title, 40);
  await preview.update({ PreviewType: req.body.type ?? preview.PreviewType, Title: req.body.title ?? preview.Title, PreviewUrl: req.body.url ?? preview.PreviewUrl, SortOrder: req.body.sortOrder ?? preview.SortOrder, IsActive: req.body.isActive ?? preview.IsActive });
  return res.json({ preview: serializePreview(preview) });
});

router.delete("/creator/storefronts/:storefrontName/products/:productId/previews/:previewId", async (req, res) => {
  const { product } = await creatorProduct(req);
  if (!product) return res.status(404).json({ error: "Product not found." });
  const deleted = await ProductPreview.destroy({ where: { ProductPreviewId: req.params.previewId, ProductId: product.ProductId } });
  return deleted ? res.status(204).send() : res.status(404).json({ error: "Preview not found." });
});

function serializeStorefront(storefront, productCount = 0) {
  if (!storefront) return null;
  return {
    id: storefront.StorefrontId,
    displayName: storefront.StoreName,
    slug: storefront.StoreSlug,
    type: "Digital Products",
    products: productCount,
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
  const profile = await CreatorProfile.findOne({ where: { UserId: req.userId } });
  if (!profile) return res.json({ storefronts: [] });
  const storefronts = await Storefront.findAll({ where: { CreatorProfileId: profile.CreatorProfileId }, order: [["CreatedAt", "ASC"]], });
  const serializedStorefronts = await Promise.all(storefronts.map(async (storefront) => {
    const productCount = await Product.count({ where: { StorefrontId: storefront.StorefrontId } });
    return serializeStorefront(storefront, productCount);
  }));
  return res.json({ storefronts: serializedStorefronts });
});

router.get("/creator/storefronts/:storefrontName", async (req, res) => {
  const { storefront } = await databaseStorefront(req);
  if (!storefront) return res.status(404).json({ error: "Storefront not found" });
  const productCount = await Product.count({ where: { StorefrontId: storefront.StorefrontId } });
  return res.json({ storefront: serializeStorefront(storefront, productCount) });
});

router.post("/creator/storefronts", async (req, res) => {
  try {
    const { profile } = await databaseStorefront(req);
    if (!profile) return res.status(404).json({ error: "Creator profile not found." });
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
  if (!storefront) return res.status(404).json({ error: "Storefront not found" });
  await storefront.update({ StoreName: String(req.body.storeName ?? storefront.StoreName).trim(), Description: String(req.body.description ?? storefront.Description).trim(), LogoUrl: req.body.logoUrl ?? storefront.LogoUrl, IsPublished: req.body.isPublished ?? storefront.IsPublished });
  return res.json({ storefront: serializeStorefront(storefront) });
});

router.delete("/creator/storefronts/:storefrontName", async (req, res) => {
  const { storefront } = await databaseStorefront(req);
  if (!storefront) return res.status(404).json({ error: "Storefront not found" });
  await storefront.destroy();
  return res.status(204).send();
});

router.get("/creator/storefronts/:storefrontName/overview", async (req, res) => {
  const { storefront } = await databaseStorefront(req);
  if (!storefront) return res.status(404).json({ error: "Storefront not found" });
  const productCount = await Product.count({ where: { StorefrontId: storefront.StorefrontId } });
  const revenue = Number(await OrderItem.sum("TotalAmount", { where: { StorefrontId: storefront.StorefrontId } })) || 0;
  const orders = await OrderItem.count({ distinct: true, col: "OrderId", where: { StorefrontId: storefront.StorefrontId } });
  const recentProducts = await Product.findAll({ where: { StorefrontId: storefront.StorefrontId }, order: [["CreatedAt", "DESC"]], limit: 5 });
  return res.json({ storefront: serializeStorefront(storefront), stats: { products: productCount, revenue, orders, conversion: 0 }, recentProducts: recentProducts.map((product) => ({ name: product.ProductName, status: product.Status, sales: "Database product" })) });
});

router.get("/creator/storefronts/:storefrontName/branding", async (req, res) => {
  try {
    const { storefront } = await databaseStorefront(req);
    if (!storefront) return res.status(404).json({ error: "Storefront not found" });
    return res.json({ storefrontName: storefront.StoreName, storefront: serializeStorefront(storefront), branding: { storeName: storefront.StoreName, description: storefront.Description, ...(storefront.ThemeSettings || {}) } });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to load storefront branding." });
  }
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
  const allCards = await CardInfo.findAll({
    where: { CreatorProfileId: profile.CreatorProfileId, StorefrontId: storefront.StorefrontId },
    order: [["CreatedAt", "ASC"]],
  });

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

  const hasPayPalAccountConnection = Boolean(paypalEmail) && !cardNumber && !cardExpiry && !cardCvc;

  if (provider === "PayPal" && cardNumber) {
    if (!isValidCardNumber(cardNumber)) {
      return res.status(400).json({
        error: "Use a valid card number.",
      });
    }

    // A Sandbox-account card is valid test data, but PayPal's Vault endpoint
    // only accepts a separate limited card set. This screen only records a
    // creator's Sandbox payment setup; it does not charge or vault the card.
    // Therefore, skip the Vault call in Sandbox and keep the test flow usable.
    if (String(process.env.PAYPAL_ENVIRONMENT || "sandbox").toLowerCase() !== "sandbox") {
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
          return res.status(400).json({ error: "PayPal rejected this card." });
        }
      } catch (error) {
        const detail = error?.details?.details?.[0];
        const message = detail?.issue || error?.details?.message || error?.message || "PayPal rejected this card.";

        if (String(message).toLowerCase().includes("insufficient permissions") || String(message).toLowerCase().includes("not authorized")) {
          return res.status(400).json({
            error: "PayPal account is not configured for card processing. Enable Advanced Credit and Debit Card Payments before using card entry in production.",
          });
        }

        return res.status(400).json({ error: message });
      }
    }
  }

  if (provider === "PayPal" && hasPayPalAccountConnection) {
    const nextMethods = methods.length ? methods : ["PayPal"];
    const nextPrimaryMethod = primaryMethod || "PayPal";
    const payout = await CreatorPayoutInfo.findOne({ where: { CreatorProfileId: profile.CreatorProfileId } });
    const accountIdentifier = encryptSensitiveValue(JSON.stringify({
      methods: nextMethods,
      provider,
      taxId,
      cardName,
      paypalEmail,
      stripeEmail,
      stripeAccountId,
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
      cardBrand: "",
    }));

    const values = {
      CreatorProfileId: profile.CreatorProfileId,
      PayoutMethod: nextPrimaryMethod,
      AccountName: paypalEmail || cardName || stripeEmail || "",
      AccountIdentifier: accountIdentifier,
      Currency: "USD",
    };

    const saved = payout ? await payout.update(values) : await CreatorPayoutInfo.create(values);

    return res.json({
      storefrontName: storefront.StoreName,
      payment: {
        methods: nextMethods,
        primaryMethod: nextPrimaryMethod,
        provider,
        taxId,
        cardName,
        paypalEmail,
        stripeEmail,
        stripeAccountId,
        cardNumber: "",
        cardExpiry: "",
        cardCvc: "",
        cardBrand: "",
        accountName: values.AccountName,
        accountIdentifier: decryptSensitiveValue(saved.AccountIdentifier),
      },
    });
  }

  const payout = await CreatorPayoutInfo.findOne({ where: { CreatorProfileId: profile.CreatorProfileId } });
  
  // If cardInfoId provided, update existing card; otherwise create new one
  let cardInfo = null;
  if (cardInfoId) {
    cardInfo = await CardInfo.findOne({
      where: { CardInfoId: cardInfoId, CreatorProfileId: profile.CreatorProfileId, StorefrontId: storefront.StorefrontId },
    });
  }

  const existingCardCount = await CardInfo.count({
    where: { CreatorProfileId: profile.CreatorProfileId, StorefrontId: storefront.StorefrontId },
  });
  const cardValues = {
    CreatorProfileId: profile.CreatorProfileId,
    StorefrontId: storefront.StorefrontId,
    CardName: encryptSensitiveValue(cardName),
    CardNumber: encryptSensitiveValue(cardNumber),
    CardExpiry: encryptSensitiveValue(cardExpiry),
    CardCvc: encryptSensitiveValue(cardCvc),
    CardBrand: encryptSensitiveValue(cardBrand),
    Provider: provider,
    Methods: methods,
    PrimaryMethod: existingCardCount === 0 ? primaryMethod : "Secondary",
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

router.patch("/creator/storefronts/:storefrontName/payment/cards/:cardInfoId/primary", async (req, res) => {
  const { profile, storefront } = await databaseStorefront(req);
  if (!storefront) return res.status(404).json({ error: "Storefront not found" });

  const where = { CreatorProfileId: profile.CreatorProfileId, StorefrontId: storefront.StorefrontId };
  const card = await CardInfo.findOne({ where: { ...where, CardInfoId: Number(req.params.cardInfoId) } });
  if (!card) return res.status(404).json({ error: "Card not found" });

  await CardInfo.update({ PrimaryMethod: "Secondary" }, { where });
  await card.update({ PrimaryMethod: "Credit Card" });
  return res.json({ cardInfoId: card.CardInfoId, primaryMethod: "Credit Card" });
});

router.delete("/creator/storefronts/:storefrontName/payment/cards/:cardInfoId", async (req, res) => {
  const { profile, storefront } = await databaseStorefront(req);
  if (!storefront) return res.status(404).json({ error: "Storefront not found" });

  const cards = await CardInfo.findAll({
    where: { CreatorProfileId: profile.CreatorProfileId, StorefrontId: storefront.StorefrontId },
    order: [["CreatedAt", "ASC"]],
  });
  if (cards.length <= 1) {
    return res.status(409).json({ error: "A storefront must keep at least one card." });
  }

  const card = cards.find((item) => item.CardInfoId === Number(req.params.cardInfoId));
  if (!card) return res.status(404).json({ error: "Card not found" });

  if (card.PrimaryMethod === "Credit Card") {
    return res.status(409).json({ error: "The primary card cannot be removed. Set another card as primary first." });
  }

  await card.destroy();

  return res.status(204).send();
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
    storefront.logoUrl = logoUrl ? mediaUrl(req, await saveEncryptedImage(logoUrl, displayName)) : "";
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
      next = { ...next, logoUrl: req.body.logoUrl ? mediaUrl(req, await saveEncryptedImage(req.body.logoUrl, next.displayName)) : "" };
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
  if (result.storefront.logoUrl && !hasLogoReference(result.storefront.logoUrl, undefined)) {
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
    const existingSocialLinks = state.settings.socialLinks && typeof state.settings.socialLinks === "object"
      ? state.settings.socialLinks as Record<string, unknown>
      : {};
    state[section] = {
      ...state[section],
      ...req.body,
      ...(section === "settings" && req.body.socialLinks
        ? { socialLinks: { ...existingSocialLinks, ...req.body.socialLinks } }
        : {}),
    };

    res.json({ storefrontName: result.storefrontName, [section]: state[section] });
  });
}

["branding", "settings"].forEach(registerStorefrontSection);

module.exports = router;
