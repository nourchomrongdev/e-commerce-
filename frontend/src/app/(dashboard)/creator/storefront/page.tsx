"use client";

import { useEffect, useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import Link from "next/link";
import { formatCompactCurrency } from "@/lib/formatCurrency";

const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";
const accents = ["from-[#7c5cf3] to-[#4f46e5]", "from-[#ff8a3d] to-[#ff5a1f]", "from-[#19b5a5] to-[#0ea5a4]", "from-[#ec4899] to-[#db2777]"];

type Storefront = {
  displayName: string;
  type: string;
  products: number;
  revenue: string;
  isPublished?: boolean;
  logoUrl?: string;
};

export default function StorefrontPage() {
  const [storefronts, setStorefronts] = useState<Storefront[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");

    fetch(`${apiUrl}/creator/storefronts`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load storefronts");
        return response.json();
      })
      .then((data: { storefronts: Storefront[] }) => setStorefronts(data.storefronts))
      .catch(() => setError("Unable to load storefronts. Check that the backend is running."))
      .finally(() => setLoading(false));
  }, []);

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
              href="/creator/storefront/new"
              className="flex w-full shrink-0 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(255,103,0,0.22)] transition hover:opacity-90 sm:w-auto"
            >
              <PublicIcon name="add" className="mr-2 h-4 w-4" />
              Create New Storefront
            </Link>
          </div>
        </div>

        {/* Storefront Grid */}
        <div className="px-4 pb-6 sm:px-6 lg:px-8">
          {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</p>}
          {loading && <p className="py-12 text-center text-sm text-[#8993aa]">Loading storefronts...</p>}
          {!loading && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {storefronts.map(({ displayName: name, type, products, revenue, isPublished, logoUrl }, index) => {
                const handleLogoError = (event: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = event.currentTarget;
                  if (target.dataset.fallbackApplied === "true") return;
                  target.dataset.fallbackApplied = "true";
                  target.src = "/icon.png";
                };

                return (
                  <div
                    key={name}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e8ecf4] bg-white shadow-[0_4px_20px_rgba(17,27,64,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#dce2ef] hover:shadow-[0_12px_30px_rgba(17,27,64,0.08)]"
                  >
                    {/* Card Header */}
                    <div className={`bg-gradient-to-br ${accents[index % accents.length]} p-4 sm:p-5`}>
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="rounded-md bg-white/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur-sm sm:text-[10px]">
                              Storefront
                            </span>

                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />

                            <span className="text-[10px] font-medium text-white/75">
                              {isPublished === false ? "Inactive" : "Active"}
                            </span>
                          </div>

                          <h3
                            className="truncate text-lg font-bold tracking-tight text-white sm:text-xl"
                            title={name}
                          >
                            {name}
                          </h3>

                          <p className="mt-1 truncate text-xs text-white/70">{type}</p>
                        </div>

                        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/40 bg-white/10 backdrop-blur-sm">
                          <img
                            src={logoUrl || "/icon.png"}
                            alt={`${name} logo`}
                            className="h-full w-full object-cover"
                            onError={handleLogoError}
                          />
                        </div>
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
                            {formatCompactCurrency(revenue)}
                          </p>
                        </div>
                      </div>

                      <div className="my-4 h-px bg-[#edf0f5] sm:my-5" />

                      {/* Card Footer */}
                      <div className="mt-auto flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] text-[#8993aa] sm:text-[11px]">Store status</p>

                          <div className="mt-1 flex items-center gap-1.5">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${isPublished === false ? "bg-slate-400" : "bg-emerald-500"}`} />

                            <span className="text-xs font-semibold text-[#263252]">
                              {isPublished === false ? "Closed" : "Open"}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <Link
                            href={`/creator/storefront/${encodeURIComponent(name)}/overview`}
                            className="flex shrink-0 items-center rounded-lg bg-[#111b40] px-3 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#1c2850] sm:px-4 sm:text-xs"
                          >
                            Open Store

                            <PublicIcon name="arrow-right" className="ml-2 h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Link
                href="/creator/storefront/new"
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
          )}
        </div>
      </section>
    </div>
  );
}