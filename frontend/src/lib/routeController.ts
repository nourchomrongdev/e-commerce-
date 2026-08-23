export const routes = {
  home: () => "/",
  marketplace: () => "/marketplace",
  marketplaceStorefront: (storefrontName: string) =>
    `/marketplace/${encodeURIComponent(storefrontName)}`,
  digitalProducts: () => "/digital-products",
  about: () => "/about",
  contact: () => "/contact-us",
  auth: {
    login: () => "/login",
    register: () => "/register",
    forgotPassword: () => "/forgot-password",
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
    products: (storefrontName?: string) =>
      storefrontName
        ? `${routes.creator.storefront(storefrontName)}/products`
        : "/creator/storefront",
    orders: (storefrontName?: string) =>
      storefrontName
        ? `${routes.creator.storefront(storefrontName)}/orders`
        : "/creator/storefront",
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
