const express = require("express");
const authRoutes = require("./authRoutes");
const { createPaymentOrder, capturePaymentOrder } = require("../controllers/paymentController");
const { applyCreatorProgram } = require("../controllers/creatorProgramController");
const { findByToken } = require("../controllers/authHelpers");

const router = express.Router();

async function requireUser(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Authentication required." });

  try {
    const user = await findByToken(token);
    if (!user) return res.status(401).json({ error: "User account is unavailable." });
    req.userId = user.UserId;
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

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "marketplace-api" });
});

router.get("/products", (req, res) => {
  res.json({ products });
});

router.get("/marketplace", (req, res) => {
  res.json({ products, storefronts });
});

router.use("/auth", authRoutes);
router.post("/creator-program/apply", requireUser, applyCreatorProgram);
router.post("/payments/paypal/order", createPaymentOrder);
router.post("/payments/paypal/capture", capturePaymentOrder);

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

router.post("/creator/storefronts", (req, res) => {
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
    logoUrl,
  };

  storefronts = [...storefronts, storefront];
  storefrontState.set(displayName, { branding: { storeName: displayName, description: storefront.description }, settings: {} });
  return res.status(201).json({ storefront });
});

router.put("/creator/storefronts/:storefrontName", (req, res) => {
  const result = findStorefront(req.params.storefrontName, res);
  if (!result) return;

  const index = storefronts.findIndex((item) => item.displayName === result.storefrontName);
  const current = storefronts[index];
  const next = {
    ...current,
    displayName: String(req.body.storeName ?? current.displayName).trim(),
    description: String(req.body.description ?? current.description).trim(),
    theme: req.body.theme ?? current.theme,
    isPublished: req.body.isPublished ?? current.isPublished,
    isFeatured: req.body.isFeatured ?? current.isFeatured,
    guestPurchase: req.body.guestPurchase ?? current.guestPurchase,
    logoUrl: req.body.logoUrl ?? current.logoUrl,
  };

  if (!next.displayName || !next.description) {
    return res.status(400).json({ error: "Store name and description are required" });
  }

  storefronts = storefronts.map((item, itemIndex) => (itemIndex === index ? next : item));
  if (result.storefrontName !== next.displayName) {
    const state = storefrontState.get(result.storefrontName);
    storefrontState.delete(result.storefrontName);
    storefrontState.set(next.displayName, state || { branding: {}, settings: {} });
  }
  return res.json({ storefront: next });
});

router.delete("/creator/storefronts/:storefrontName", (req, res) => {
  const result = findStorefront(req.params.storefrontName, res);
  if (!result) return;

  storefronts = storefronts.filter((item) => item.displayName !== result.storefrontName);
  storefrontState.delete(result.storefrontName);
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
