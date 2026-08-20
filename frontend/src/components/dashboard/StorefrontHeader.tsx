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

  return (
    <>
      <header className="mb-5 flex min-w-0 max-w-full flex-col gap-4 overflow-hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-storefront-blue to-storefront-indigo text-2xl font-semibold text-white">
            {storefront.displayName.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-[#111b40]">{storefront.displayName}</h1>
            <p className="text-xs text-[#8993aa]">{storefront.type}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={storefrontPath}
            className="rounded-lg border border-[#e7ebf4] bg-[#f7f9fd] px-4 py-2 text-xs font-medium text-[#33405d] no-underline transition hover:bg-[#eef1f7]"
          >
            View Store
          </Link>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
          >
            <PublicIcon name="edit" className="h-4 w-4" />
            Edit Store
          </button>
        </div>
      </header>

      <nav className="mb-5 flex min-w-0 max-w-full gap-0 overflow-x-auto border-b border-[#edf0f5] px-1" aria-label="Storefront settings">
        {tabs.map((tab) => {
          const className = `shrink-0 px-4 py-3 text-sm font-medium no-underline transition ${
            activeTab === tab
              ? "border-b-2 border-primary text-primary"
              : "text-[#8993aa] hover:text-[#111b40]"
          }`;

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
              <Link key={tab} href={`${storefrontPath}/payment`} className={className}>
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
            <Link key={tab} href={storefrontPath} className={className}>
              {tab}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
