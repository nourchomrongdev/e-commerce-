const express = require("express");

const router = express.Router();

const products = [
  { id: 1, name: "Website Template", price: 15, category: "Templates" },
  { id: 2, name: "E-Book", price: 10, category: "Books" },
];

const storefronts = [
  {
    displayName: "NourChomrong",
    type: "Templates",
    products: 24,
    revenue: "$1,284.00",
    description: "Professional templates and design resources for modern websites",
  },
  {
    displayName: "DevCourses",
    type: "Digital Products",
    products: 12,
    revenue: "$2,450.00",
    description: "Online courses and resources for developers to level up their skills",
  },
  {
    displayName: "AI Resources",
    type: "Bundles",
    products: 7,
    revenue: "$920.00",
    description: "AI tools and learning bundles for everyone",
  },
  {
    displayName: "DesignHub",
    type: "UI Kits",
    products: 18,
    revenue: "$1,860.00",
    description: "Beautiful UI kits and design systems",
  },
];

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

router.post("/auth/login", (req, res) => {
  const { email } = req.body;
  res.json({ user: { email: email || "creator@example.com", role: "creator" }, token: "demo-token" });
});

router.post("/auth/register", (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({ user: { name, email, role: "creator" }, message: "Account created" });
});

router.post("/auth/forgot-password", (req, res) => {
  res.json({ message: "If the email exists, a reset link will be sent." });
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
