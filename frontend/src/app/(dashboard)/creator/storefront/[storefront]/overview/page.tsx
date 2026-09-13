"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import { Toast } from "@/components/ui";
import { formatCompactCurrency } from "@/lib/formatCurrency";

const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";

const getStoredToastState = (key: string, fallback: boolean) => {
  if (typeof window === "undefined") return fallback;
  const storedValue = window.sessionStorage.getItem(key);
  return storedValue === null ? fallback : storedValue === "true";
};

const clearStoredToastState = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem("storefront-branding-toast");
  window.sessionStorage.removeItem("storefront-settings-toast");
  window.sessionStorage.removeItem("storefront-payment-toast");
};

const storefrontData: Record<string, { displayName: string; type: string; description: string }> = {
  NourChomrong: {
    displayName: "NourChomrong",
    type: "Templates",
    description: "Professional templates and design resources for modern websites",
  },
  DevCourses: {
    displayName: "DevCourses",
    type: "Digital Products",
    description: "Online courses and resources for developers to level up their skills",
  },
  "AI Resources": {
    displayName: "AI Resources",
    type: "Bundles",
    description: "AI tools and learning bundles for everyone",
  },
  DesignHub: {
    displayName: "DesignHub",
    type: "UI Kits",
    description: "Beautiful UI kits and design systems",
  },
};

const overviewCards = [
  { label: "Products", value: "24", detail: "Published and draft listings", icon: "product", tone: "bg-[#edf5ff] text-blue-700" },
  { label: "Revenue", value: "$1,284.00", detail: "Compared to last month", icon: "dollar", tone: "bg-[#effaf5] text-emerald-700" },
  { label: "Orders", value: "186", detail: "Confirmed from buyers", icon: "receipt", tone: "bg-[#fff3e9] text-primary" },
  { label: "Conversion", value: "3.4%", detail: "Avg. on public storefront", icon: "up", tone: "bg-[#f7f2ff] text-violet-700" },
];

export default function StorefrontOverviewPage({
  params,
}: {
  params: Promise<{ storefront: string }>;
}) {
  const [storefrontParam, setStorefrontParam] = useState("");
  const [storefront, setStorefront] = useState(storefrontData.NourChomrong);
  const [stats, setStats] = useState({ products: 0, revenue: 0, orders: 0, conversion: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [recentItems, setRecentItems] = useState<{ name: string; status: string; sales: string }[]>([]);
  const [brandingIncomplete, setBrandingIncomplete] = useState(false);
  const [settingsIncomplete, setSettingsIncomplete] = useState(false);
  const [paymentIncomplete, setPaymentIncomplete] = useState(false);
  const [showBrandingToast, setShowBrandingToast] = useState(() => getStoredToastState("storefront-branding-toast", true));
  const [showSettingsToast, setShowSettingsToast] = useState(() => getStoredToastState("storefront-settings-toast", true));
  const [showPaymentToast, setShowPaymentToast] = useState(() => getStoredToastState("storefront-payment-toast", true));

  useEffect(() => {
    const handleBeforeUnload = () => clearStoredToastState();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    Promise.resolve(params).then(({ storefront: nextName }) => {
      const decodedName = decodeURIComponent(nextName);
      setStorefrontParam(decodedName);
      const token = window.localStorage.getItem("marketplace-token");
      setIsLoading(true);

      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/overview`, { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => response.json())
        .then((data) => { if (data.storefront) setStorefront({ displayName: data.storefront.displayName, type: data.storefront.type, description: data.storefront.description }); if (data.stats) setStats(data.stats); if (data.recentProducts) setRecentItems(data.recentProducts); })
        .catch(() => undefined);

      Promise.all([
        fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/branding`, { headers: { Authorization: `Bearer ${token}` } })
          .then(async (response) => {
            const data = await response.json();
            if (!response.ok) return {};
            return data.branding || {};
          }),
        fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/settings`, { headers: { Authorization: `Bearer ${token}` } })
          .then(async (response) => {
            const data = await response.json();
            if (!response.ok) return {};
            return data.settings || {};
          }),
        fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/payment`, { headers: { Authorization: `Bearer ${token}` } })
          .then(async (response) => {
            const data = await response.json();
            if (!response.ok) return {};
            return data.payment || {};
          }),
      ])
        .then(([branding, settings, payment]) => {
          const nextBrandingIncomplete = !String(branding?.storeName ?? "").trim() || !String(branding?.description ?? "").trim();
          const nextSettingsIncomplete = !String(settings?.email ?? "").trim() || !String(settings?.phone ?? "").trim() || !String(settings?.country ?? "").trim() || !String(settings?.timezone ?? "").trim() || !String(settings?.language ?? "").trim();
          const nextPaymentIncomplete = !Array.isArray(payment?.methods) || payment.methods.length === 0 || !String(payment?.primaryMethod ?? "").trim();

          setBrandingIncomplete(nextBrandingIncomplete);
          setSettingsIncomplete(nextSettingsIncomplete);
          setPaymentIncomplete(nextPaymentIncomplete);
          setShowBrandingToast((current) => (nextBrandingIncomplete ? current : false));
          setShowSettingsToast((current) => (nextSettingsIncomplete ? current : false));
          setShowPaymentToast((current) => (nextPaymentIncomplete ? current : false));
        })
        .catch(() => undefined);
    });
  }, [params]);

  return (
    <div className="w-full">
      <div className="fixed right-5 top-24 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {showBrandingToast && brandingIncomplete && (
          <Toast
            variant="warning"
            title="Incomplete branding data"
            message="Add a store name and short description to finish your storefront."
            onClose={() => {
              setShowBrandingToast(false);
              window.sessionStorage.setItem("storefront-branding-toast", "false");
            }}
          />
        )}
        {showSettingsToast && settingsIncomplete && (
          <Toast
            variant="warning"
            title="Incomplete settings data"
            message="Add your store email, phone, country, timezone, and language before saving settings."
            onClose={() => {
              setShowSettingsToast(false);
              window.sessionStorage.setItem("storefront-settings-toast", "false");
            }}
          />
        )}
        {showPaymentToast && paymentIncomplete && (
          <Toast
            variant="warning"
            title="Incomplete payment data"
            message="Add at least one payment method and choose a primary method before saving."
            onClose={() => {
              setShowPaymentToast(false);
              window.sessionStorage.setItem("storefront-payment-toast", "false");
            }}
          />
        )}
      </div>
      <section className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#111b40]">Overview</h2>
            <p className="mt-1 text-xs text-[#8993aa]">{storefront.description}</p>
          </div>
          <Link
            href={`/creator/storefront/${encodeURIComponent(storefront.displayName)}`}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white no-underline transition hover:opacity-90"
          >
            Open storefront
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map(({ label, value, detail, icon, tone }) => {
            const liveValue = label === "Products" ? String(stats.products) : label === "Revenue" ? `$${Number(stats.revenue).toFixed(2)}` : label === "Orders" ? String(stats.orders) : `${Number(stats.conversion).toFixed(1)}%`;
            return (
            <article key={label} className="rounded-2xl border border-[#e9edf6] bg-[#f9fafc] p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8993aa]">{label}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-[#111b40]">{stats.products || stats.revenue || stats.orders || stats.conversion ? liveValue : label === "Revenue" ? formatCompactCurrency(value) : value}</p>
                </div>
                <span className={`grid h-10 w-10 place-items-center rounded-lg ${tone}`}>
                  <PublicIcon name={icon as any} className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-3 text-[10px] text-[#76829d]">{detail}</p>
            </article>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <article className="rounded-2xl border border-[#e9edf6] bg-[#f9fafc] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-[#111b40]">Recent products</h2>
              <Link href={`/creator/storefront/${encodeURIComponent(storefront.displayName)}/products`} className="text-xs font-medium text-primary no-underline">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {recentItems.map(({ name, status, sales }) => (
                <div key={name} className="flex items-center justify-between gap-3 rounded-xl border border-[#edf0f5] bg-white px-3 py-3">
                  <div>
                    <p className="text-xs font-semibold text-[#263252]">{name}</p>
                    <p className="mt-1 text-[10px] text-[#8993aa]">{sales}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${status === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[#e9edf6] bg-[#f9fafc] p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#111b40]">Quick links</h2>
            <div className="mt-4 space-y-2">
              <Link href={`/creator/storefront/${encodeURIComponent(storefront.displayName)}/products`} className="flex items-center justify-between gap-3 rounded-lg border border-[#edf0f5] bg-white px-3 py-2.5 text-xs font-medium text-[#263252] no-underline transition hover:bg-[#f7f9ff]">
                Manage products
                <PublicIcon name="right" className="h-3.5 w-3.5" />
              </Link>
              <Link href={`/creator/storefront/${encodeURIComponent(storefront.displayName)}/payment`} className="flex items-center justify-between gap-3 rounded-lg border border-[#edf0f5] bg-white px-3 py-2.5 text-xs font-medium text-[#263252] no-underline transition hover:bg-[#f7f9ff]">
                Payment settings
                <PublicIcon name="right" className="h-3.5 w-3.5" />
              </Link>
              <Link href={`/creator/storefront/${encodeURIComponent(storefront.displayName)}/setting`} className="flex items-center justify-between gap-3 rounded-lg border border-[#edf0f5] bg-white px-3 py-2.5 text-xs font-medium text-[#263252] no-underline transition hover:bg-[#f7f9ff]">
                Store settings
                <PublicIcon name="right" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
