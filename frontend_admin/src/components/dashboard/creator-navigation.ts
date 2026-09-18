import PublicIcon, { type PublicIconActionName, type PublicIconSidebarName, type PublicIconName } from "@/components/icons/PublicIcon";

type NavItem = {
  label: string;
  href: string;
  icon: PublicIconSidebarName | PublicIconName | PublicIconActionName;
};



export const creatorNavigation: NavItem[] = [
  { label: "All Stores Overview", href: "/creator/overview", icon: "home" },
];

export const creatorStoreNavigation: NavItem[] = [
  { label: "Storefront Overview", href: "/creator/storefront/TestStore/overview", icon: "store" },
  { label: "Customers", href: "/creator/storefront/TestStore/customer", icon: "user" },
  { label: "Analytics", href: "/creator/storefront/TestStore/analytics", icon: "dashboard" },
  { label: "Verification Status", href: "/creator/verification", icon: "verification" },
  { label: "Payout Information", href: "/creator/payouts", icon: "payout" },
];

export const creatorProductNavigation: NavItem[] = [
  { label: "My Products", href: "/creator/storefront/TestStore/products", icon: "product" },
  { label: "Add Product", href: "/creator/storefront/TestStore/products/new", icon: "add" },
  { label: "Files", href: "/creator/storefront/TestStore/products/files", icon: "file-search-corner" },
  { label: "Version History", href: "/creator/storefront/TestStore/products/versions", icon: "clock-9" },
  { label: "Preview Assets", href: "/creator/storefront/TestStore/preview-assets", icon: "view" },
];

export const creatorLicenseNavigation: NavItem[] = [
  { label: "License Types", href: "/creator/storefront/TestStore/licenses/types", icon: "type" },
  { label: "License Rules", href: "/creator/storefront/TestStore/licenses/rules", icon: "settings" },
  { label: "License Keys", href: "/creator/storefront/TestStore/licenses/keys", icon: "key" },
  { label: "License Activations", href: "/creator/storefront/TestStore/licenses/activations", icon: "shield-check" },
  { label: "Revoked Licenses", href: "/creator/storefront/TestStore/licenses/revoked", icon: "shield-minus" },
];

export const creatorOrderNavigation: NavItem[] = [
  { label: "Orders", href: "/creator/storefront/TestStore/orders", icon: "receipt" },
  { label: "Download Activity", href: "/creator/storefront/TestStore/orders/downloads", icon: "download" },
  { label: "Re-download Requests", href: "/creator/storefront/TestStore/orders/redownloads", icon: "rotate-ccw" },
  { label: "Refund Requests", href: "/creator/storefront/TestStore/orders/refunds", icon: "wallet" },
];

export const creatorReviewNavigation: NavItem[] = [
  { label: "Customer Reviews", href: "/creator/storefront/TestStore/reviews", icon: "user" },
  { label: "My Responses", href: "/creator/storefront/TestStore/reviews/responses", icon: "message-square-reply" },
];

export const creatorAffiliateNavigation: NavItem[] = [
  { label: "Affiliate Dashboard", href: "/creator/affiliate", icon: "dashboard" },
  { label: "My Profile", href: "/creator/affiliate/profile", icon: "user" },
  { label: "Affiliate Status", href: "/creator/affiliate/status", icon: "verification" },
  { label: "Browse Products", href: "/creator/affiliate/products", icon: "product" },
  { label: "Affiliate Links", href: "/creator/affiliate/links", icon: "right" },
  { label: "Create Affiliate Link", href: "/creator/affiliate/links/new", icon: "add" },
  { label: "Clicks", href: "/creator/affiliate/clicks", icon: "up" },
  { label: "Conversions", href: "/creator/affiliate/conversions", icon: "receipt" },
  { label: "Conversion Rate", href: "/creator/affiliate/conversion-rate", icon: "dashboard" },
  { label: "Referral History", href: "/creator/affiliate/referrals", icon: "clock-9" },
  { label: "Commission Earnings", href: "/creator/affiliate/earnings", icon: "dollar" },
  { label: "Commission History", href: "/creator/affiliate/earnings/history", icon: "receipt" },
  { label: "Payout Overview", href: "/creator/affiliate/payout", icon: "payout" },
];

export const creatorUtilityNavigation: NavItem[] = [
  { label: "Help Center", href: "/creator/help", icon: "help" },
] as const;

