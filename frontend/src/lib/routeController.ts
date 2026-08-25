export const routes = {
  home: () => "/",
  marketplace: () => "/marketplace",
  marketplaceStorefront: (storefrontName: string) =>
    `/marketplace/${encodeURIComponent(storefrontName)}`,
  digitalProducts: () => "/marketplace",
  about: () => "/about",
  contact: () => "/contact-us",
  auth: {
    login: () => "/login",
    register: () => "/register",
    forgotPassword: () => "/forgot-password",
    accountCreated: () => "/account-created",
    resetLinkSent: () => "/reset-link-sent",
    verifyEmail: () => "/verify-email",
  },
  admin: {
    dashboard: () => "/admin",
    users: () => "/admin/users",
    roles: () => "/admin/roles",
    contentRights: () => "/admin/content-rights",
    activity: () => "/admin/activity",
    downloads: () => "/admin/downloads",
    licenseActivations: () => "/admin/license-activations",
    refunds: () => "/admin/refunds",
    dmca: () => "/admin/dmca",
    creators: () => "/admin/creators",
    reviewers: () => "/admin/reviewers",
    affiliateProgram: () => "/admin/affiliate-program",
    storefronts: () => "/admin/storefronts",
    verification: () => "/admin/verification",
    payouts: () => "/admin/payouts",
    products: () => "/admin/products",
    files: () => "/admin/files",
    versions: () => "/admin/versions",
    previewAssets: () => "/admin/preview-assets",
    licenseTypes: () => "/admin/license-types",
    licenseKeys: () => "/admin/license-keys",
    activations: () => "/admin/activations",
    revokedLicenses: () => "/admin/revoked-licenses",
    orders: () => "/admin/orders",
    downloadLinks: () => "/admin/download-links",
    analytics: () => "/admin/analytics",
  },
  dashboard: {
    home: () => "/dashboard",
  },
  buyer: {
    dashboard: () => "/dashboard/buyer/overview",
    purchases: () => "/dashboard/buyer/purchases",
    downloads: () => "/dashboard/buyer/downloads",
    licenses: () => "/dashboard/buyer/licenses",
    reviews: () => "/dashboard/buyer/reviews",
    account: () => "/dashboard/buyer/account",
  },
  affiliate: {
    dashboard: () => "/affiliate",
    profile: () => "/affiliate/profile",
    status: () => "/affiliate/status",
    products: () => "/affiliate/products",
    links: () => "/affiliate/links",
    newLink: () => "/affiliate/links/new",
    clicks: () => "/affiliate/clicks",
    conversions: () => "/affiliate/conversions",
    conversionRate: () => "/affiliate/conversion-rate",
    referrals: () => "/affiliate/referrals",
    earnings: () => "/affiliate/earnings",
    earningsHistory: () => "/affiliate/earnings/history",
    payout: () => "/affiliate/payout",
  },
  creator: {
    overview: () => "/creator/overview",
    storefronts: () => "/creator/storefront",
    storefront: (storefrontName: string) =>
      `/creator/storefront/${encodeURIComponent(storefrontName)}`,
    storefrontOverview: (storefrontName: string) =>
      `${routes.creator.storefront(storefrontName)}/overview`,
    storefrontBranding: (storefrontName: string) =>
      `${routes.creator.storefront(storefrontName)}/branding`,
    storefrontSetting: (storefrontName: string) =>
      `${routes.creator.storefront(storefrontName)}/setting`,
    storefrontPayment: (storefrontName: string) =>
      `${routes.creator.storefront(storefrontName)}/payment`,
    storefrontPayouts: (storefrontName: string) =>
      `${routes.creator.storefront(storefrontName)}/payouts`,
    storefrontSummary: (storefrontName: string) =>
      `${routes.creator.storefront(storefrontName)}/summary`,
    storefrontAnalytics: (storefrontName: string) =>
      `${routes.creator.storefront(storefrontName)}/analytics`,
    storefrontCustomers: (storefrontName: string) =>
      `${routes.creator.storefront(storefrontName)}/customer`,
    storefrontLicenses: (storefrontName: string) =>
      `${routes.creator.storefront(storefrontName)}/licenses`,
    storefrontLicenseTypes: (storefrontName: string) =>
      `${routes.creator.storefront(storefrontName)}/licenses/types`,
    storefrontLicenseRules: (storefrontName: string) =>
      `${routes.creator.storefront(storefrontName)}/licenses/rules`,
    storefrontLicenseKeys: (storefrontName: string) =>
      `${routes.creator.storefront(storefrontName)}/licenses/keys`,
    storefrontLicenseActivations: (storefrontName: string) =>
      `${routes.creator.storefront(storefrontName)}/licenses/activations`,
    storefrontRevokedLicenses: (storefrontName: string) =>
      `${routes.creator.storefront(storefrontName)}/licenses/revoked`,
    products: (storefrontName?: string) =>
      storefrontName
        ? `${routes.creator.storefront(storefrontName)}/products`
        : "/creator/storefront",
    orders: (storefrontName?: string) =>
      storefrontName
        ? `${routes.creator.storefront(storefrontName)}/orders`
        : "/creator/storefront",
    verification: () => "/creator/verification",
    help: () => "/creator/help",
    storefrontPage: (storefrontName: string) => `${routes.creator.storefront(storefrontName)}/storefront`,
    storefrontNewProduct: (storefrontName: string) => `${routes.creator.storefront(storefrontName)}/products/new`,
    storefrontProductFiles: (storefrontName: string) => `${routes.creator.storefront(storefrontName)}/products/files`,
    storefrontProductVersions: (storefrontName: string) => `${routes.creator.storefront(storefrontName)}/products/versions`,
    storefrontPreviewAssets: (storefrontName: string) => `${routes.creator.storefront(storefrontName)}/preview-assets`,
    storefrontReviews: (storefrontName: string) => `${routes.creator.storefront(storefrontName)}/reviews`,
    storefrontReviewResponses: (storefrontName: string) => `${routes.creator.storefront(storefrontName)}/reviews/responses`,
    storefrontDownloads: (storefrontName: string) => `${routes.creator.storefront(storefrontName)}/orders/downloads`,
    storefrontRedownloads: (storefrontName: string) => `${routes.creator.storefront(storefrontName)}/orders/redownloads`,
    storefrontRefunds: (storefrontName: string) => `${routes.creator.storefront(storefrontName)}/orders/refunds`,
    storefrontOrderDownloads: (storefrontName: string) => `${routes.creator.storefront(storefrontName)}/orders/downloads`,
    storefrontRedownloadRequests: (storefrontName: string) => `${routes.creator.storefront(storefrontName)}/orders/redownloads`,
    storefrontRefundRequests: (storefrontName: string) => `${routes.creator.storefront(storefrontName)}/orders/refunds`,
  },
  reviewer: {
    dashboard: () => "/reviewer",
    pendingProducts: () => "/reviewer/pending-products",
    productReview: () => "/reviewer/product-review",
    fileReview: () => "/reviewer/file-review",
    previewAssets: () => "/reviewer/preview-assets",
    flaggedContent: () => "/reviewer/flagged-content",
    contentReports: () => "/reviewer/content-reports",
    contentViolations: () => "/reviewer/content-violations",
    customerReviews: () => "/reviewer/customer-reviews",
    reportedReviews: () => "/reviewer/reported-reviews",
    reviewModeration: () => "/reviewer/review-moderation",
    dmca: () => "/reviewer/dmca",
    takedownRequests: () => "/reviewer/takedown-requests",
    counterNotices: () => "/reviewer/counter-notices",
    restoredContent: () => "/reviewer/restored-content",
  },
} as const;

export type PublicRouteKey = "home" | "products" | "creator";

export const publicNavigation = [
  { href: routes.home(), label: "Home", page: "home" },
  { href: routes.marketplace(), label: "Marketplace", page: "products" },
  { href: routes.creator.overview(), label: "Creator", page: "creator" },
] as const;

export function storefrontUrl(storefrontName: string) {
  if (typeof window === "undefined") {
    return routes.creator.storefront(storefrontName);
  }

  return new URL(routes.creator.storefront(storefrontName), window.location.origin).toString();
}
