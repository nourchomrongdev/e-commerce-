"use client";

import Link from "next/link";
import PublicIcon from "@/components/icons/PublicIcon";
import { routes } from "@/lib/routeController";

const tabs = ["Overview", "Branding", "Settings", "Payment", "Summary"];

type StorefrontHeaderProps = {
  storefront: {
    displayName: string;
    type: string;
  };
  activeTab: string;
  onTabChange?: (tab: string) => void;
};

export default function StorefrontHeader({
  storefront,
  activeTab,
  onTabChange,
}: StorefrontHeaderProps) {
  const storefrontPath = routes.creator.storefront(storefront.displayName);
  const storefrontOverviewPath = routes.creator.storefrontOverview(storefront.displayName);

  return (
    <div className="mb-5 w-full rounded-2xl bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex min-w-0 flex-col gap-4 overflow-hidden sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#4d5ae8] to-[#3e4dda] text-2xl font-bold text-white shadow-sm sm:h-12 sm:w-12">
              {storefront.displayName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[2.05rem] font-bold leading-none tracking-[-0.02em] text-[#1d2438]">
                {storefront.displayName}
              </h1>
              <p className="mt-1 text-sm text-[#6b7280]">{storefront.type}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={storefrontOverviewPath}
              className="inline-flex items-center justify-center rounded-xl border border-[#dfe3ee] bg-white px-4 py-2.5 text-sm font-medium text-[#3a4662] no-underline transition hover:bg-[#f7f9fd]"
            >
              View Store
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f58b2b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
            >
              <PublicIcon name="edit" className="h-4 w-4" />
              Edit Store
            </button>
          </div>
        </header>

        <nav className="mt-5 flex min-w-0 max-w-full gap-6 overflow-x-auto border-b border-[#edf0f5] pb-0" aria-label="Storefront settings">
          {tabs.map((tab) => {
            const className = `shrink-0 px-0 pb-3 pt-2 text-[1.05rem] font-medium no-underline transition ${
              activeTab === tab
                ? "border-b-2 border-[#3d5af1] text-[#3d5af1]"
                : "text-[#757d8f] hover:text-[#1f2433]"
            }`;

            if (tab === "Overview") {
              return (
                <Link key={tab} href={storefrontOverviewPath} className={className}>
                  {tab}
                </Link>
              );
            }

            if (tab === "Branding") {
              return (
                <Link key={tab} href={routes.creator.storefrontBranding(storefront.displayName)} className={className}>
                  {tab}
                </Link>
              );
            }

            if (tab === "Settings") {
              return (
                <Link key={tab} href={routes.creator.storefrontSetting(storefront.displayName)} className={className}>
                  {tab}
                </Link>
              );
            }

            if (tab === "Payment") {
              return (
                <Link key={tab} href={routes.creator.storefrontPayment(storefront.displayName)} className={className}>
                  {tab}
                </Link>
              );
            }

            if (tab === "Summary") {
              return (
                <Link key={tab} href={routes.creator.storefrontSummary(storefront.displayName)} className={className}>
                  {tab}
                </Link>
              );
            }

            if (onTabChange) {
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onTabChange(tab)}
                  className={className}
                >
                  {tab}
                </button>
              );
            }

            return (
              <Link key={tab} href={storefrontOverviewPath} className={className}>
                {tab}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
