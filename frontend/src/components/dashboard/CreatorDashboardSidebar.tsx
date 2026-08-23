"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PublicIcon from "@/components/icons/PublicIcon";
import {
  creatorNavigation,
  creatorLicenseNavigation,
  creatorOrderNavigation,
  creatorProductNavigation,
  creatorReviewNavigation,
  creatorStoreNavigation,
  creatorUtilityNavigation,
} from "./creator-navigation";

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
  const matches = pathname.match(/^\/creator\/storefront\/([^/]+)(?:\/|$)/) ?? pathname.match(/^\/creator\/([^/]+)(?:\/|$)/);
  const reserved = new Set([
    "overview",
    "storefront",
    "verification",
    "products",
    "orders",
    "payouts",
    "help",
  ]);
  const selectedStorefront = matches && !reserved.has(matches[1]) ? matches[1] : null;
  const storefrontBasePath = selectedStorefront ? `/creator/storefront/${selectedStorefront}` : "/creator/storefront";
  const storefrontSection = selectedStorefront && pathname.startsWith(`${storefrontBasePath}/`)
    ? pathname.slice(`${storefrontBasePath}/`.length).split("/")[0]
    : null;
  const isStorefrontOverviewSection = !storefrontSection || ["overview", "branding", "setting", "payment", "summary"].includes(storefrontSection);

  const storefrontRoutes: Record<string, string> = {
    Storefront: storefrontBasePath,
    "Storefront Overview": selectedStorefront ? `${storefrontBasePath}/overview` : storefrontBasePath,
    "Store Settings": selectedStorefront ? `${storefrontBasePath}/setting` : "/creator/storefront",
    Customers: selectedStorefront ? `${storefrontBasePath}/customer` : "/creator/storefront",
    Analytics: selectedStorefront ? `${storefrontBasePath}/analytics` : "/creator/storefront",
    "Payout Information": "/creator/payouts",
    "My Products": selectedStorefront ? `${storefrontBasePath}/products` : "/creator/storefront",
    "Add Product": selectedStorefront ? `${storefrontBasePath}/products` : "/creator/storefront",
    Files: selectedStorefront ? `${storefrontBasePath}/products` : "/creator/storefront",
    "Version History": selectedStorefront ? `${storefrontBasePath}/products` : "/creator/storefront",
    "Preview Assets": selectedStorefront ? `${storefrontBasePath}/storefront` : "/creator/storefront",
    "License Types": selectedStorefront ? `${storefrontBasePath}/setting` : "/creator/storefront",
    "License Rules": selectedStorefront ? `${storefrontBasePath}/setting` : "/creator/storefront",
    "License Keys": selectedStorefront ? `${storefrontBasePath}/setting` : "/creator/storefront",
    "License Activations": selectedStorefront ? `${storefrontBasePath}/analytics` : "/creator/storefront",
    "Revoked Licenses": selectedStorefront ? `${storefrontBasePath}/setting` : "/creator/storefront",
    Orders: selectedStorefront ? `${storefrontBasePath}/orders` : "/creator/storefront",
    "Download Activity": selectedStorefront ? `${storefrontBasePath}/orders` : "/creator/storefront",
    "Re-download Requests": selectedStorefront ? `${storefrontBasePath}/orders` : "/creator/storefront",
    "Refund Requests": selectedStorefront ? `${storefrontBasePath}/orders` : "/creator/storefront",
    "Customer Reviews": selectedStorefront ? `${storefrontBasePath}/customer` : "/creator/storefront",
    "My Responses": selectedStorefront ? `${storefrontBasePath}/customer` : "/creator/storefront",
  };

  const links = (
    items: readonly { label: string; href: string; icon: string }[],
  ) =>
    items.map(({ label, href, icon }) => {
      const itemHref = storefrontRoutes[label] ?? href;
      const storefrontDependent = !["All Stores Overview", "Storefront Overview", "Verification Status", "Payout Information", "Help Center"].includes(label);
      const isActive = label === "All Stores Overview"
        ? pathname === href
        : label === "Storefront Overview"
          ? isStorefrontOverviewSection && (pathname === itemHref || Boolean(selectedStorefront && storefrontSection))
        : ["Storefront", "Storefront Overview", "Store Settings", "Customers", "Analytics", "Verification Status", "Payout Information", "My Products", "Preview Assets", "License Activations", "Orders", "Customer Reviews"].includes(label)
          && (!storefrontDependent || Boolean(selectedStorefront))
          ? pathname === itemHref || pathname.startsWith(`${itemHref}/`)
          : false;

      return (
      <Link
        href={itemHref}
        key={label}
        onClick={onClose}
        className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm no-underline ${isActive ? "bg-accent-light font-medium text-primary" : "text-[#1d294b] hover:bg-slate-50"}`}
      >
        <PublicIcon name={icon as any} />
        {label}
      </Link>
      );
    });

  return (
    <>
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
        <div className="space-y-1">{links(creatorNavigation)}</div>
        <div className="my-5 border-t border-[#e9ebf2]" />
        <SidebarSection title="My Storefront">{links(creatorStoreNavigation)}</SidebarSection>
        <SidebarSection title="Products">{links(creatorProductNavigation)}</SidebarSection>
        <SidebarSection title="Licenses & DRM">{links(creatorLicenseNavigation)}</SidebarSection>
        <SidebarSection title="Orders & Delivery">{links(creatorOrderNavigation)}</SidebarSection>
        <SidebarSection title="Reviews">{links(creatorReviewNavigation)}</SidebarSection>
        <SidebarSection title="Support">{links(creatorUtilityNavigation)}</SidebarSection>
        <div className="mt-auto rounded-xl bg-gradient-to-br from-primary to-secondary p-5 shadow-sm">
          <p className="flex items-center gap-2 font-semibold text-white">
            Become a Verified Creator
            <PublicIcon name="verification" className="ml-2 h-6 w-6" />
          </p>
          <p className="mt-4 text-xs leading-5 text-white/90">
            Unlock more features and build trust with customers.
          </p>
          <Link
            href="/creator/verification"
            onClick={onClose}
            className="mt-5 block rounded-lg bg-white py-2.5 text-center text-xs font-semibold text-primary no-underline transition hover:bg-gray-100"
          >
            Get Verified <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
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
