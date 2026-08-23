"use client";

import PublicIcon from "@/components/icons/PublicIcon";
import StorefrontHeader from "@/components/dashboard/StorefrontHeader";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingMessage from "@/components/dashboard/LoadingMessage";

interface StorefrontDetailPageProps {
  params: Promise<{ storefront: string }> | { storefront: string };
}

const storefrontData: Record<string, any> = {
  "NourChomrong": {
    displayName: "NourChomrong",
    type: "Templates",
    description: "Professional templates and design resources for modern websites",
    products: 24,
    revenue: "$1,284.00",
    totalSales: "$1,284",
    customers: 342,
    rating: 4.8,
    status: "Active",
    createdDate: "May 12, 2024",
    storeId: "str_NourChomrong",
  },
  "DevCourses": {
    displayName: "DevCourses",
    type: "Digital Products",
    description: "Online courses and resources for developers to level up their skills",
    products: 12,
    revenue: "$842.00",
    totalSales: "$8,420",
    customers: 174,
    rating: 4.9,
    status: "Active",
    createdDate: "May 12, 2024",
    storeId: "str_2573bdbe",
  },
  "AI Resources": {
    displayName: "AI Resources",
    type: "Bundles",
    description: "AI tools and learning bundles for everyone",
    products: 7,
    revenue: "$920.00",
    totalSales: "$920",
    customers: 89,
    rating: 4.7,
    status: "Active",
    createdDate: "May 12, 2024",
    storeId: "str_AIResources",
  },
  "DesignHub": {
    displayName: "DesignHub",
    type: "UI Kits",
    description: "Beautiful UI kits and design systems",
    products: 18,
    revenue: "$1,860.00",
    totalSales: "$1,860",
    customers: 256,
    rating: 4.6,
    status: "Active",
    createdDate: "May 12, 2024",
    storeId: "str_DesignHub",
  },
};

const topProducts = [
  ["Lapack API Mastery", "$245.00"],
  ["React Code Course", "$198.00"],
  ["React Basics to Advance", "$165.00"],
];

export default function StorefrontDetailPage({
  params,
}: StorefrontDetailPageProps) {
  const router = useRouter();
  const [storefrontName, setStorefrontName] = useState<string | null>(
    typeof params === "object" && params !== null && !("then" in params)
      ? params.storefront
      : null,
  );
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    if (params && typeof (params as Promise<{ storefront: string }>).then === "function") {
      (params as Promise<{ storefront: string }>).then(({ storefront }) => {
        setStorefrontName(storefront);
      });
    }
  }, [params]);

  const storefront = storefrontName
    ? storefrontData[decodeURIComponent(storefrontName)]
    : null;

  useEffect(() => {
    if (!storefront) router.replace("/creator/storefront");
  }, [router, storefront]);

  if (!storefront) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] w-full items-center justify-center">
        <LoadingMessage label="Loading storefront" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <StorefrontHeader
        storefront={storefront}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content */}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left Column - Store Information */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <h2 className="text-lg font-bold text-[#111b40]">Store Information</h2>
          
          <div className="mt-5 space-y-4">
            {/* Store Info Card */}
            <div className="rounded-xl border border-[#e9edf6] bg-[#f9fafc] p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-blue-100 text-lg text-blue-600">
                  📦
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#111b40]">
                    {storefront.displayName}
                  </h3>
                  <p className="mt-1 text-xs text-[#6d7a96]">
                    {storefront.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Store Details */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-[#edf0f5] pb-3">
                <span className="text-[#8993aa]">Store Status</span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-[#263252]">{storefront.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-[#edf0f5] pb-3">
                <span className="text-[#8993aa]">Created on</span>
                <span className="font-medium text-[#111b40]">{storefront.createdDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8993aa]">Store ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#111b40]">{storefront.storeId}</span>
                  <button
                    type="button"
                    className="text-xs text-[#8993aa] hover:text-primary"
                    title="Copy"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column - Store Statistics */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#111b40]">Store Statistics</h2>
            <button
              type="button"
              className="flex items-center justify-center rounded-lg border border-[#e7ebf4] bg-[#f7f9fd] px-3 py-1.5 text-xs font-medium text-[#33405d]"
            >
              This Month 
            <PublicIcon name="down" className="inline-block h-3 w-3" />
            </button>
          </div>

          <div className="grid gap-4">
            {[
              ["Products", storefront.products],
              ["Total Sales", storefront.totalSales],
              ["Customers", storefront.customers],
              ["Store Rating", storefront.rating],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-[#edf0f5] pb-4 last:border-0 last:pb-0"
              >
                <span className="text-xs text-[#8993aa]">{label}</span>
                <span className="text-xl font-bold text-[#111b40]">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sales Overview & Top Products */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Sales Overview */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#111b40]">Sales Overview</h2>
            <button
              type="button"
              className="flex items-center justify-center rounded-lg border border-[#e7ebf4] bg-[#f7f9fd] px-3 py-1.5 text-xs font-medium text-[#33405d]"
            >
                This Month 
              <PublicIcon name="down" className="inline-block h-3 w-3" />
            </button>
          </div>

          <div className="flex h-[200px] items-end gap-3">
            <div className="flex h-full flex-col justify-between pb-8 text-xs text-[#7280a0] w-12">
              <span>$600</span>
              <span>$400</span>
              <span>$200</span>
              <span>$0</span>
            </div>

            <div className="relative flex-1">
              <div className="absolute inset-x-0 top-0 h-px bg-[#edf0f7]" />
              <div className="absolute inset-x-0 top-1/3 h-px bg-[#edf0f7]" />
              <div className="absolute inset-x-0 top-2/3 h-px bg-[#edf0f7]" />
              <svg
                viewBox="0 0 600 180"
                preserveAspectRatio="none"
                className="relative h-[160px] w-full"
                aria-label="Sales chart"
              >
                <defs>
                  <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                    <stop stopColor="#5b6ef5" stopOpacity="0.2" />
                    <stop offset="1" stopColor="#5b6ef5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 130 L60 110 L120 95 L180 120 L240 85 L300 60 L360 75 L420 50 L480 70 L540 45 L600 30 L600 180 L0 180 Z"
                  fill="url(#chartFill)"
                />
                <path
                  d="M0 130 L60 110 L120 95 L180 120 L240 85 L300 60 L360 75 L420 50 L480 70 L540 45 L600 30"
                  fill="none"
                  stroke="#5b6ef5"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="mt-3 flex justify-between text-xs text-[#7280a0]">
                <span>May 15</span>
                <span>May 20</span>
                <span>May 25</span>
                <span>May 30</span>
              </div>
            </div>
          </div>
        </section>

        {/* Top Products */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#111b40]">Top Products</h2>
            <Link
              href="/creator/products"
              className="text-xs font-medium text-primary no-underline hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {topProducts.map(([name, price], idx) => (
              <div
                key={name}
                className="flex items-center gap-3 rounded-lg bg-[#f8f9ff] p-3"
              >
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white text-sm font-bold"
                  style={{
                    background: ["#5b6ef5", "#ec4899", "#f97316"][idx],
                  }}
                >
                  {["📚", "🎓", "📖"][idx]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#111b40] truncate">
                    {name}
                  </p>
                </div>
                <p className="text-xs font-semibold text-[#111b40] whitespace-nowrap">
                  {price}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
