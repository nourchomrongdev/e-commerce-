"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import { Toast } from "@/components/ui";
import {
  creatorNavigation,
  creatorLicenseNavigation,
  creatorOrderNavigation,
  creatorProductNavigation,
  creatorReviewNavigation,
  creatorStoreNavigation,
  creatorUtilityNavigation,
} from "./creator-navigation";

const storefrontOptions = [
  { name: "NourChomrong", products: 24, href: "/creator/storefront/NourChomrong/overview" },
  { name: "DevCourses", products: 12, href: "/creator/storefront/DevCourses/overview" },
  { name: "AI Resources", products: 7, href: "/creator/storefront/AI%20Resources/overview" },
  { name: "DesignHub", products: 12, href: "/creator/storefront/DesignHub/overview" },
] as const;

export default function CreatorDashboardSidebar({
  open,
  collapsed,
  onClose,
  onToggle,
}: {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const affiliateApproved = true;
  const [storedStorefront, setStoredStorefront] = useState("");
  const [storefrontMenuOpen, setStorefrontMenuOpen] = useState(false);
  const [showStorefrontToast, setShowStorefrontToast] = useState(false);
  const matches = pathname.match(/^\/creator\/storefront\/([^/]+)(?:\/|$)/) ?? pathname.match(/^\/creator\/([^/]+)(?:\/|$)/);
  const reserved = new Set([
    "overview",
    "storefront",
    "verification",
    "products",
    "orders",
    "payouts",
    "help",
    "affiliate",
  ]);
  const currentStorefront = matches && !reserved.has(matches[1]) ? decodeURIComponent(matches[1]) : null;
  const selectedStorefront = pathname === "/creator/overview"
    ? null
    : (currentStorefront ?? storedStorefront) || null;
  const storefrontBasePath = selectedStorefront
    ? `/creator/storefront/${encodeURIComponent(selectedStorefront)}`
    : "/creator/storefront";
  const storefrontSection = selectedStorefront && pathname.startsWith(`${storefrontBasePath}/`)
    ? pathname.slice(`${storefrontBasePath}/`.length).split("/")[0]
    : null;
  const isStorefrontOverviewSection = !storefrontSection || ["overview", "branding", "setting", "payment", "summary"].includes(storefrontSection);

  useEffect(() => {
    const savedStorefront = window.localStorage.getItem("creator-selected-storefront");
    if (savedStorefront && !reserved.has(savedStorefront) && savedStorefront !== "All Stores Overview") {
      setStoredStorefront(savedStorefront);
    } else {
      setStoredStorefront("");
    }
  }, [pathname]);

  useEffect(() => {
    if (!showStorefrontToast) return;

    const timeout = window.setTimeout(() => setShowStorefrontToast(false), 3000);
    return () => window.clearTimeout(timeout);
  }, [showStorefrontToast]);

  useEffect(() => {
    if (!storefrontMenuOpen) return;

    const closeStorefrontMenu = () => setStorefrontMenuOpen(false);
    window.addEventListener("scroll", closeStorefrontMenu, { passive: true });
    return () => window.removeEventListener("scroll", closeStorefrontMenu);
  }, [storefrontMenuOpen]);

  const storefrontRoutes: Record<string, string> = {
    Storefront: storefrontBasePath,
    "Storefront Overview": selectedStorefront ? `${storefrontBasePath}/overview` : storefrontBasePath,
    "Store Settings": selectedStorefront ? `${storefrontBasePath}/setting` : "/creator/storefront",
    Customers: selectedStorefront ? `${storefrontBasePath}/customer` : "/creator/storefront",
    Analytics: selectedStorefront ? `${storefrontBasePath}/analytics` : "/creator/storefront",
    "Payout Information": "/creator/payouts",
    "My Products": selectedStorefront ? `${storefrontBasePath}/products` : "/creator/storefront",
    "Add Product": selectedStorefront ? `${storefrontBasePath}/products/new` : "/creator/storefront",
    Files: selectedStorefront ? `${storefrontBasePath}/products/files` : "/creator/storefront",
    "Version History": selectedStorefront ? `${storefrontBasePath}/products/versions` : "/creator/storefront",
    "Preview Assets": selectedStorefront ? `${storefrontBasePath}/preview-assets` : "/creator/storefront",
    "License Types": selectedStorefront ? `${storefrontBasePath}/licenses/types` : "/creator/storefront",
    "License Rules": selectedStorefront ? `${storefrontBasePath}/licenses/rules` : "/creator/storefront",
    "License Keys": selectedStorefront ? `${storefrontBasePath}/licenses/keys` : "/creator/storefront",
    "License Activations": selectedStorefront ? `${storefrontBasePath}/licenses/activations` : "/creator/storefront",
    "Revoked Licenses": selectedStorefront ? `${storefrontBasePath}/licenses/revoked` : "/creator/storefront",
    Orders: selectedStorefront ? `${storefrontBasePath}/orders` : "/creator/storefront",
    "Download Activity": selectedStorefront ? `${storefrontBasePath}/orders/downloads` : "/creator/storefront",
    "Re-download Requests": selectedStorefront ? `${storefrontBasePath}/orders/redownloads` : "/creator/storefront",
    "Refund Requests": selectedStorefront ? `${storefrontBasePath}/orders/refunds` : "/creator/storefront",
    "Customer Reviews": selectedStorefront ? `${storefrontBasePath}/reviews` : "/creator/storefront",
    "My Responses": selectedStorefront ? `${storefrontBasePath}/reviews/responses` : "/creator/storefront",
  };

  const links = (
    items: readonly { label: string; href: string; icon: string }[],
  ) =>
    items.map(({ label, href, icon }) => {
      const itemHref = storefrontRoutes[label] ?? href;
      const affiliateLabel = label.startsWith("Affiliate") || label === "My Profile" || label === "Browse Products" || label === "Create Affiliate Link" || label === "Clicks" || label === "Conversions" || label === "Conversion Rate" || label === "Referral History" || label === "Commission Earnings" || label === "Commission History" || label === "Payout Overview";
      const storefrontDependent = !["All Stores Overview", "Storefront", "Storefront Overview", "Verification Status", "Payout Information", "Help Center"].includes(label) && !affiliateLabel;
      const isProductCreationPage = pathname.endsWith("/products/new");
      const isFilesPage = pathname.endsWith("/products/files");
      const isVersionHistoryPage = pathname.endsWith("/products/versions");
      const isPreviewAssetsPage = pathname.endsWith("/preview-assets");
      const isLicensePage = pathname.includes("/licenses/");
      const isDownloadsPage = pathname.endsWith("/orders/downloads");
      const isRedownloadsPage = pathname.endsWith("/orders/redownloads");
      const isRefundsPage = pathname.endsWith("/orders/refunds");
      const isReviewsPage = pathname.endsWith("/reviews");
      const isResponsesPage = pathname.endsWith("/reviews/responses");
      const isAffiliatePage = pathname.startsWith("/creator/affiliate");
      const affiliateRouteByLabel: Record<string, string> = {
        "Affiliate Dashboard": "/affiliate",
        "My Profile": "/creator/affiliate/profile",
        "Affiliate Status": "/creator/affiliate/status",
        "Browse Products": "/creator/affiliate/products",
        "Affiliate Links": "/creator/affiliate/links",
        "Create Affiliate Link": "/creator/affiliate/links/new",
        Clicks: "/creator/affiliate/clicks",
        Conversions: "/creator/affiliate/conversions",
        "Conversion Rate": "/creator/affiliate/conversion-rate",
        "Referral History": "/creator/affiliate/referrals",
        "Commission Earnings": "/creator/affiliate/earnings",
        "Commission History": "/creator/affiliate/earnings/history",
        "Payout Overview": "/creator/affiliate/payout",
      };
      const licenseRouteByLabel: Record<string, string> = {
        "License Types": "types",
        "License Rules": "rules",
        "License Keys": "keys",
        "License Activations": "activations",
        "Revoked Licenses": "revoked",
      };
      const isActive = label === "All Stores Overview"
        ? pathname === href
        : label === "Storefront Overview"
          ? isStorefrontOverviewSection && (pathname === itemHref || Boolean(selectedStorefront && storefrontSection))
        : ["Storefront", "Storefront Overview", "Store Settings", "Customers", "Analytics", "Verification Status", "Payout Information", "My Products", "Add Product", "Files", "Version History", "Preview Assets", "License Types", "License Rules", "License Keys", "License Activations", "Revoked Licenses", "Orders", "Download Activity", "Re-download Requests", "Refund Requests", "Customer Reviews", "My Responses", "Affiliate Dashboard", "My Profile", "Affiliate Status", "Browse Products", "Affiliate Links", "Create Affiliate Link", "Clicks", "Conversions", "Conversion Rate", "Referral History", "Commission Earnings", "Commission History", "Payout Overview"].includes(label)
          && (!storefrontDependent || Boolean(selectedStorefront))
          && (!isProductCreationPage || label === "Add Product")
          && (!isFilesPage || label === "Files")
          && (!isVersionHistoryPage || label === "Version History")
          && (!isPreviewAssetsPage || label === "Preview Assets")
          && (!isLicensePage || pathname.endsWith(`/${licenseRouteByLabel[label] ?? ""}`))
          && (!isDownloadsPage || label === "Download Activity")
          && (!isRedownloadsPage || label === "Re-download Requests")
          && (!isRefundsPage || label === "Refund Requests")
          && (!isResponsesPage || label === "My Responses")
          && (!isReviewsPage || label === "Customer Reviews")
          && (!isAffiliatePage || pathname === affiliateRouteByLabel[label] || pathname.startsWith(`${affiliateRouteByLabel[label] ?? ""}/`))
          ? pathname === itemHref || pathname.startsWith(`${itemHref}/`)
          : false;

      return (
      <Link
        href={itemHref}
        key={label}
        onClick={(event) => {
          if (!selectedStorefront && storefrontDependent) {
            event.preventDefault();
            setShowStorefrontToast(true);
          }
          onClose();
        }}
        className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm no-underline ${isActive ? "bg-accent-light font-medium text-primary" : "text-[#1d294b] hover:bg-slate-50"}`}
      >
        <PublicIcon name={icon as any} />
        {label}
      </Link>
      );
    });

  return (
    <>
      {showStorefrontToast && (
        <Toast
          variant="warning"
          message="Please select a storefront first."
          onClose={() => setShowStorefrontToast(false)}
        />
      )}
      {open && (
        <button
          type="button"
          aria-label="Close dashboard navigation"
          onClick={onClose}
          className="fixed inset-x-0 bottom-0 top-20 z-30 bg-slate-950/30 lg:hidden"
        />
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`fixed top-20 z-[60] hidden h-9 w-9 place-items-center rounded-br-lg border-b border-r border-[#e1e5ee] bg-white text-xl shadow-md transition-[left] duration-300 hover:bg-accent-light lg:grid ${collapsed ? "left-0" : "left-[228px]"}`}
      >
        {collapsed ? "›" : "‹"}
      </button>
      <aside
        onScroll={() => setStorefrontMenuOpen(false)}
        className={`scrollbar-hidden fixed bottom-0 left-0 top-20 z-40 flex w-[85%] flex-col overflow-y-auto overscroll-contain border-r border-[#eaebf5] bg-white px-5 py-5 shadow-xl transition-[width,transform,padding] duration-300 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "lg:w-0 lg:overflow-hidden lg:border-r-0 lg:px-0" : "lg:w-[264px]"}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="mb-4 self-end text-lg lg:hidden"
          aria-label="Close dashboard navigation"
        >
          ×
        </button>
        <div className="relative mb-5 lg:hidden">
          <button
            type="button"
            onClick={() => setStorefrontMenuOpen((isOpen) => !isOpen)}
            aria-expanded={storefrontMenuOpen}
            className="flex w-full items-center gap-3 rounded-lg border border-[#e9edf6] bg-[#f4f7ff] px-3 py-2 text-left text-primary shadow-sm"
          >
            <PublicIcon name="store" className="h-6 w-6" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">My Storefront</span>
              <span className="block truncate text-[11px] text-gray-500">{selectedStorefront ?? "All Stores Overview"}</span>
            </span>
            <PublicIcon name="down" className={`h-4 w-4 transition-transform ${storefrontMenuOpen ? "rotate-180" : ""}`} />
          </button>
          {storefrontMenuOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
              <Link href="/creator/overview" onClick={() => setStorefrontMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50">
                <PublicIcon name="home" className="h-5 w-5 text-gray-500" />
                All Stores Overview
              </Link>
              {storefrontOptions.map(({ name, products, href }) => (
                <Link key={name} href={href} onClick={() => setStorefrontMenuOpen(false)} className="flex items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50">
                  <PublicIcon name="store" className="h-5 w-5 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{name}</span>
                    <span className="block text-xs text-gray-500">{products} products</span>
                  </span>
                </Link>
              ))}
              <Link href="/creator/storefront" onClick={() => setStorefrontMenuOpen(false)} className="flex items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <PublicIcon name="settings" className="h-5 w-5 text-gray-500" />
                Manage Storefronts
              </Link>
              <Link href="/creator/storefront" onClick={() => setStorefrontMenuOpen(false)} className="flex items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm font-medium text-primary hover:bg-blue-50">
                <PublicIcon name="add" className="h-5 w-5" />
                Create New Storefront
              </Link>
            </div>
          )}
        </div>
        <div className="space-y-1">{links(creatorNavigation)}</div>
        <div className="my-5 border-t border-[#e9ebf2]" />
        <SidebarSection title="My Storefront">{links(creatorStoreNavigation)}</SidebarSection>
        <SidebarSection title="Products">{links(creatorProductNavigation)}</SidebarSection>
        <SidebarSection title="Licenses & DRM">{links(creatorLicenseNavigation)}</SidebarSection>
        <SidebarSection title="Orders & Delivery">{links(creatorOrderNavigation)}</SidebarSection>
        <SidebarSection title="Reviews">{links(creatorReviewNavigation)}</SidebarSection>
        {affiliateApproved && (
          <SidebarSection title="Affiliate">
            <Link
              href="/affiliate"
              onClick={onClose}
              className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm no-underline transition ${pathname === "/affiliate" || pathname.startsWith("/affiliate/") ? "bg-accent-light font-medium text-primary" : "text-[#1d294b] hover:bg-slate-50"}`}
            >
              <PublicIcon name="dashboard" />
              Affiliate Studio
            </Link>
          </SidebarSection>
        )}
        <SidebarSection title="Support">{links(creatorUtilityNavigation)}</SidebarSection>
      </aside>
    </>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 first:mt-0">
      <h2 className="mb-1 px-4 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#8993aa]">{title}</h2>
      <div className="space-y-1">{children}</div>
    </section>
  );
}
