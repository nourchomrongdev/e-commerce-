"use client";

import PublicIcon from "@/components/icons/PublicIcon";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingMessage from "@/components/dashboard/LoadingMessage";

const storefrontNames = new Set([
  "NourChomrong",
  "DevCourses",
  "AI Resources",
  "DesignHub",
]);

const storefronts = [
  {
    name: "NourChomrong",
    type: "Templates",
    products: 24,
    revenue: "$1,284.00",
    status: "Open Store",
    accent: "from-[#7c5cf3] to-[#4f46e5]",
  },
  {
    name: "DevCourses",
    type: "Digital Products",
    products: 12,
    revenue: "$2,450.00",
    status: "Open Store",
    accent: "from-[#ff8a3d] to-[#ff5a1f]",
  },
  {
    name: "AI Resources",
    type: "Bundles",
    products: 7,
    revenue: "$920.00",
    status: "Open Store",
    accent: "from-[#19b5a5] to-[#0ea5a4]",
  },
  {
    name: "DesignHub",
    type: "UI Kits",
    products: 18,
    revenue: "$1,860.00",
    status: "Open Store",
    accent: "from-[#ec4899] to-[#db2777]",
  },
];

export default function StorefrontPage() {
  const router = useRouter();
  const [checkingSelection, setCheckingSelection] = useState(true);

  useEffect(() => {
    const selectedStorefront = window.localStorage.getItem(
      "creator-selected-storefront",
    );

    if (selectedStorefront && storefrontNames.has(selectedStorefront)) {
      router.replace(
        `/creator/storefront/${encodeURIComponent(selectedStorefront)}/overview`,
      );
      return;
    }

    setCheckingSelection(false);
  }, [router]);

  if (checkingSelection) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] w-full items-center justify-center">
        <LoadingMessage label="Loading Storefront Data Overview" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <section>
        {/* Header */}
        <div className="px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-[#111b40] sm:text-[28px]">
                My Storefronts
              </h2>

              <p className="mt-1 text-sm text-[#6d7a96]">
                Manage your storefronts in one place.
              </p>
            </div>

            <Link
              href="/creator/storefront"
              className="flex w-full shrink-0 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(255,103,0,0.22)] transition hover:opacity-90 sm:w-auto"
            >
              <PublicIcon name="add" className="mr-2 h-4 w-4" />
              Create New Storefront
            </Link>
          </div>
        </div>

        {/* Storefront Grid */}
        <div className="px-4 pb-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {storefronts.map(
              ({ name, type, products, revenue, status, accent }) => (
                <div
                  key={name}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e8ecf4] bg-white shadow-[0_4px_20px_rgba(17,27,64,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#dce2ef] hover:shadow-[0_12px_30px_rgba(17,27,64,0.08)]"
                >
                  {/* Card Header */}
                  <div
                    className={`bg-gradient-to-br ${accent} p-4 sm:p-5`}
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="rounded-md bg-white/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur-sm sm:text-[10px]">
                            Storefront
                          </span>

                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />

                          <span className="text-[10px] font-medium text-white/75">
                            Active
                          </span>
                        </div>

                        <h3
                          className="truncate text-lg font-bold tracking-tight text-white sm:text-xl"
                          title={name}
                        >
                          {name}
                        </h3>

                        <p className="mt-1 truncate text-xs text-white/70">
                          {type}
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label={`More options for ${name}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-md transition hover:bg-white/20"
                      >
                        <PublicIcon
                          name="ellipsis-vertical"
                          className="h-5 w-5"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    {/* Stats */}
                    <div className="grid grid-cols-2 divide-x divide-[#edf0f5]">
                      <div className="min-w-0 pr-3 sm:pr-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8993aa] sm:text-[11px]">
                          Products
                        </p>

                        <p className="mt-1 text-xl font-bold tracking-tight text-[#111b40] sm:text-2xl">
                          {products}
                        </p>
                      </div>

                      <div className="min-w-0 pl-3 sm:pl-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8993aa] sm:text-[11px]">
                          Revenue
                        </p>

                        <p
                          className="mt-1 truncate text-xl font-bold tracking-tight text-[#111b40] sm:text-2xl"
                          title={revenue}
                        >
                          {revenue}
                        </p>
                      </div>
                    </div>

                    <div className="my-4 h-px bg-[#edf0f5] sm:my-5" />

                    {/* Card Footer */}
                    <div className="mt-auto flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] text-[#8993aa] sm:text-[11px]">
                          Store status
                        </p>

                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />

                          <span className="text-xs font-semibold text-[#263252]">
                            Open
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/creator/storefront/${encodeURIComponent(name)}/overview`}
                        className="flex shrink-0 items-center rounded-lg bg-[#111b40] px-3 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#1c2850] sm:px-4 sm:text-xs"
                      >
                        {status}

                        <PublicIcon
                          name="arrow-right"
                          className="ml-2 h-3 w-3"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              ),
            )}

            {/* Create New Storefront */}
            <Link
              href="/creator/storefront"
              className="group flex min-h-[270px] min-w-0 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfd6e5] bg-[#fafbfe] p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/[0.02] hover:shadow-[0_12px_30px_rgba(17,27,64,0.06)] sm:p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105 sm:h-14 sm:w-14">
                <PublicIcon
                  name="add"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </div>

              <h3 className="mt-4 text-base font-bold text-[#111b40]">
                Create New Storefront
              </h3>

              <p className="mt-2 max-w-[200px] text-xs leading-5 text-[#7a859d]">
                Start selling your digital products in minutes.
              </p>

              <span className="mt-5 rounded-lg border border-[#e1e5ee] bg-white px-4 py-2 text-xs font-semibold text-[#263252] shadow-sm transition group-hover:border-primary group-hover:text-primary">
                Create Storefront
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}