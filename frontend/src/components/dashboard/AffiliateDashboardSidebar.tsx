"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBrand from "@/components/AppBrand";
import PublicIcon, { type PublicIconProps } from "@/components/icons/PublicIcon";

type AffiliateNavItem = {
  label: string;
  href: string;
  icon: PublicIconProps["name"];
};

const sections: { title?: string; items: AffiliateNavItem[] }[] = [
  { items: [{ label: "Dashboard", href: "/affiliate", icon: "dashboard" }] },
  {
    title: "Affiliate",
    items: [
      { label: "My Profile", href: "/affiliate/profile", icon: "user" },
      { label: "Affiliate Status", href: "/affiliate/status", icon: "verification" },
    ],
  },
  {
    title: "Promotion",
    items: [
      { label: "Browse Products", href: "/affiliate/products", icon: "product" },
      { label: "Affiliate Links", href: "/affiliate/links", icon: "right" },
      { label: "Create Affiliate Link", href: "/affiliate/links/new", icon: "add" },
    ],
  },
  {
    title: "Performance",
    items: [
      { label: "Clicks", href: "/affiliate/clicks", icon: "up" },
      { label: "Conversions", href: "/affiliate/conversions", icon: "receipt" },
      { label: "Conversion Rate", href: "/affiliate/conversion-rate", icon: "percent" },
      { label: "Referral History", href: "/affiliate/referrals", icon: "clock-9" },
    ],
  },
  {
    title: "Commissions",
    items: [
      { label: "Commission Earnings", href: "/affiliate/earnings", icon: "dollar" },
      { label: "Commission History", href: "/affiliate/earnings/history", icon: "receipt" },
    ],
  },
  {
    title: "Payouts",
    items: [{ label: "Payout Overview", href: "/affiliate/payout", icon: "payout" }],
  },
];

export default function AffiliateDashboardSidebar({
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

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close dashboard navigation"
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-[1px] transition-opacity duration-300 min-[901px]:hidden"
        />
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`fixed top-20 z-[60] grid h-9 w-9 place-items-center rounded-br-lg border-b border-r border-[#e1e5ee] bg-white text-xl shadow-md transition-[left] duration-300 hover:bg-accent-light max-[900px]:hidden ${collapsed ? "left-0" : "left-[228px]"}`}
      >
        <PublicIcon name={collapsed ? "right" : "left"} className="h-4 w-4" />
      </button>
      <aside
        className={`scrollbar-hidden fixed inset-y-0 left-0 z-[80] flex w-[70%] max-w-[28rem] flex-col overflow-y-auto border-r border-[#eaebf5] bg-white px-5 py-5 shadow-xl transition-[width,transform,padding] duration-300 min-[901px]:sticky min-[901px]:top-20 min-[901px]:h-[calc(100vh-5rem)] min-[901px]:translate-x-0 min-[901px]:shadow-none ${open ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "min-[901px]:w-0 min-[901px]:overflow-hidden min-[901px]:border-r-0 min-[901px]:px-0" : "min-[901px]:w-[264px]"}`}
      >
        <button type="button" onClick={onClose} className="mb-4 self-end text-lg min-[901px]:hidden" aria-label="Close dashboard navigation">
          <PublicIcon name="x" className="h-4 w-4" />
        </button>
        <Link href="/" onClick={onClose} className="mb-5 flex items-center no-underline min-[901px]:hidden"><AppBrand className="min-w-0" textClassName="text-lg" logoClassName="h-9 w-9" /></Link>
        <nav aria-label="Affiliate dashboard navigation" className="space-y-5">
          {sections.map(({ title, items }) => (
            <section key={title ?? "dashboard"}>
              {title && <h2 className="mb-1 px-4 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#8993aa]">{title}</h2>}
              <div className="space-y-1">
                {items.map(({ label, href, icon }) => {
                  const isActive = pathname === href || (href !== "/affiliate" && pathname.startsWith(`${href}/`));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm no-underline ${isActive ? "bg-accent-light font-medium text-primary" : "text-[#1d294b] hover:bg-slate-50"}`}
                    >
                      <PublicIcon name={icon} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
      </aside>
    </>
  );
}
