import PublicIcon, { type PublicIconSidebarName , type PublicIconName} from "@/components/icons/PublicIcon";

type NavItem = {
  label: string;
  href: string;
  icon: PublicIconSidebarName | PublicIconName;
};


export const creatorNavigation: NavItem[] = [
  {label: "Back To MarketPlace", href: "/", icon: "home"},
  { label: "Dashboard", href: "/creator/overview", icon: "dashboard" },
  { label: "My Storefront", href: "/creator/storefront", icon: "store" },
  { label: "Products", href: "/creator/products", icon: "product" },
  { label: "Orders", href: "/creator/orders", icon: "receipt" },
  { label: "Payouts", href: "/creator/payouts", icon: "payout" },
  { label: "Verification", href: "/creator/verification", icon: "verification" },
];


export const creatorUtilityNavigation: NavItem[] = [
  { label: "Help Center", href: "/creator/help", icon: "help" },
] as const;

