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
  { label: "Storefront Overview", href: "/creator/storefront/NourChomrong/overview", icon: "store" },
  { label: "Customers", href: "/creator/storefront/NourChomrong/customer", icon: "user" },
  { label: "Analytics", href: "/creator/storefront/NourChomrong/analytics", icon: "dashboard" },
  { label: "Verification Status", href: "/creator/verification", icon: "verification" },
  { label: "Payout Information", href: "/creator/payouts", icon: "payout" },
];

export const creatorProductNavigation: NavItem[] = [
  { label: "My Products", href: "/creator/storefront/NourChomrong/products", icon: "product" },
  { label: "Add Product", href: "/creator/storefront/NourChomrong/products", icon: "add" },
  { label: "Files", href: "/creator/storefront/NourChomrong/products", icon: "file-search-corner" },
  { label: "Version History", href: "/creator/storefront/NourChomrong/products", icon: "clock-9" },
  { label: "Preview Assets", href: "/creator/storefront/NourChomrong/storefront", icon: "view" },
];

export const creatorLicenseNavigation: NavItem[] = [
  { label: "License Types", href: "/creator/storefront/NourChomrong/setting", icon: "type" },
  { label: "License Rules", href: "/creator/storefront/NourChomrong/setting", icon: "settings" },
  { label: "License Keys", href: "/creator/storefront/NourChomrong/setting", icon: "key" },
  { label: "License Activations", href: "/creator/storefront/NourChomrong/analytics", icon: "shield-check" },
  { label: "Revoked Licenses", href: "/creator/storefront/NourChomrong/setting", icon: "shield-minus" },
];

export const creatorOrderNavigation: NavItem[] = [
  { label: "Orders", href: "/creator/storefront/NourChomrong/orders", icon: "receipt" },
  { label: "Download Activity", href: "/creator/storefront/NourChomrong/orders", icon: "download" },
  { label: "Re-download Requests", href: "/creator/storefront/NourChomrong/orders", icon: "rotate-ccw" },
  { label: "Refund Requests", href: "/creator/storefront/NourChomrong/orders", icon: "wallet" },
];

export const creatorReviewNavigation: NavItem[] = [
  { label: "Customer Reviews", href: "/creator/storefront/NourChomrong/customer", icon: "user" },
  { label: "My Responses", href: "/creator/storefront/NourChomrong/customer", icon: "message-square-reply" },
];

export const creatorUtilityNavigation: NavItem[] = [
  { label: "Help Center", href: "/creator/help", icon: "help" },
] as const;

