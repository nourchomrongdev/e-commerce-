"use client";

import { useEffect, useMemo, useState } from "react";
import { Toast } from "@/components/ui";

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

type Storefront = {
  displayName: string;
  type: string;
  description?: string;
};

type SummaryData = {
  totalEarnings?: number;
  buyerPayments?: number;
  systemFees?: number;
  creatorEarnings?: number;
  payouts?: unknown[];
  transactions?: Array<{ description: string; amount: number; date: string; status: string }>;
};

export default function StorefrontSummaryPage({
  params,
}: {
  params: Promise<{ storefront: string }> | { storefront: string };
}) {
  const [storefrontName, setStorefrontName] = useState<string | null>(
    typeof params === "object" && params !== null && !("then" in params)
      ? (params as { storefront?: string }).storefront ?? null
      : null,
  );
  const [storefront, setStorefront] = useState<Storefront>({ displayName: "Storefront", type: "Digital Products" });
  const [period, setPeriod] = useState("All time");
  const [summaryData, setSummaryData] = useState<SummaryData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showIncompleteBrandingToast, setShowIncompleteBrandingToast] = useState(() => getStoredToastState("storefront-branding-toast", true));
  const [showIncompleteSettingsToast, setShowIncompleteSettingsToast] = useState(() => getStoredToastState("storefront-settings-toast", true));
  const [showIncompletePaymentToast, setShowIncompletePaymentToast] = useState(() => getStoredToastState("storefront-payment-toast", true));
  const [brandingIncomplete, setBrandingIncomplete] = useState(false);
  const [settingsIncomplete, setSettingsIncomplete] = useState(false);
  const [paymentIncomplete, setPaymentIncomplete] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = () => clearStoredToastState();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (params && typeof (params as Promise<{ storefront: string }>).then === "function") {
      (params as Promise<{ storefront: string }>).then(({ storefront }) => {
        setStorefrontName(storefront ?? null);
      });
    }
  }, [params]);

  useEffect(() => {
    if (!storefrontName) return;

    const decodedName = decodeURIComponent(storefrontName);
    const token = window.localStorage.getItem("marketplace-token");
    const headers = { Authorization: `Bearer ${token}` };

    setIsLoading(true);
    setLoadError(false);

    const storefrontRequest = fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}`, { headers })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to load storefront details");
        }
        return data.storefront || { displayName: decodedName, type: "Digital Products" };
      })
      .then((loadedStorefront: Storefront) => {
        setStorefront({
          displayName: loadedStorefront.displayName,
          type: loadedStorefront.type || "Digital Products",
          description: loadedStorefront.description || "",
        });
      })
      .catch(() => {
        setLoadError(true);
        setStorefront({ displayName: decodedName, type: "Digital Products" });
      });

    const summaryRequest = fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/summary`, { headers })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to load storefront summary");
        }
        return data.summary || {};
      })
      .then((summary) => setSummaryData(summary))
      .catch(() => setSummaryData({}));

    const brandingRequest = fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/branding`, {
      headers,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) return {};
        return data.branding || {};
      })
      .then((branding) => {
        setBrandingIncomplete(!String(branding.storeName ?? "").trim() || !String(branding.description ?? "").trim());
      })
      .catch(() => setBrandingIncomplete(false));

    const settingsRequest = fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/settings`, {
      headers,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) return {};
        return data.settings || {};
      })
      .then((settings) => {
        setSettingsIncomplete(
          !String(settings.email ?? "").trim() ||
            !String(settings.phone ?? "").trim() ||
            !String(settings.country ?? "").trim() ||
            !String(settings.timezone ?? "").trim() ||
            !String(settings.language ?? "").trim(),
        );
      })
      .catch(() => setSettingsIncomplete(false));

    const paymentRequest = fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/payment`, {
      headers,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) return {};
        return data.payment || {};
      })
      .then((payment) => {
        setPaymentIncomplete(
          !Array.isArray(payment.methods) ||
            payment.methods.length === 0 ||
            !String(payment.primaryMethod ?? "").trim(),
        );
      })
      .catch(() => setPaymentIncomplete(false));

    Promise.all([storefrontRequest, summaryRequest, brandingRequest, settingsRequest, paymentRequest]).finally(() => setIsLoading(false));
  }, [storefrontName]);

  const displayMetrics = useMemo(
    () => [
      { label: "Total earnings", value: summaryData.totalEarnings ?? 0, detail: "Since storefront launch" },
      { label: "Buyer payments", value: summaryData.buyerPayments ?? 0, detail: "Collected by the platform" },
      { label: "System fees", value: summaryData.systemFees ?? 0, detail: "Retained by the platform" },
      { label: "Creator earnings", value: summaryData.creatorEarnings ?? 0, detail: "Recorded by the system" },
      { label: "Payouts", value: Array.isArray(summaryData.payouts) && summaryData.payouts.length > 0 ? summaryData.payouts.length : 0, detail: "Payout entries in the system" },
    ],
    [summaryData],
  );

  const buyerPayments = Number(summaryData.buyerPayments ?? 0);
  const systemFees = Number(summaryData.systemFees ?? 0);
  const creatorEarnings = Number(summaryData.creatorEarnings ?? 0);
  const payoutCount = Array.isArray(summaryData.payouts) ? summaryData.payouts.length : 0;

  const moneyFlowBars = {
    buyer: buyerPayments > 0 ? 100 : 0,
    fees: buyerPayments > 0 ? Math.min(100, (systemFees / buyerPayments) * 100) : 0,
    creator: buyerPayments > 0 ? Math.min(100, (creatorEarnings / buyerPayments) * 100) : 0,
  };

  if (isLoading) {
    return (
      <div className="w-full min-w-0 max-w-full overflow-x-hidden">
        <div className="space-y-5">
          <section className="min-w-0 rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            <div className="h-5 w-44 animate-pulse rounded bg-[#edf0f5]" />
            <div className="mt-3 h-3 w-80 animate-pulse rounded bg-[#f1f3f7]" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-xl border border-[#e9edf6] bg-[#f9fafc]" />
              ))}
            </div>
          </section>
          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="h-56 animate-pulse rounded-2xl border border-[#e9edf6] bg-[#f9fafc]" />
            <div className="h-56 animate-pulse rounded-2xl border border-[#e9edf6] bg-[#f9fafc]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <div className="fixed right-5 top-24 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {showIncompleteBrandingToast && brandingIncomplete && (
          <Toast
            variant="warning"
            title="Incomplete branding data"
            message="Add a store name and short description to finish your storefront."
            onClose={() => {
              setShowIncompleteBrandingToast(false);
              window.sessionStorage.setItem("storefront-branding-toast", "false");
            }}
          />
        )}
        {showIncompleteSettingsToast && settingsIncomplete && (
          <Toast
            variant="warning"
            title="Incomplete settings data"
            message="Add your store email, phone, country, timezone, and language before saving settings."
            onClose={() => {
              setShowIncompleteSettingsToast(false);
              window.sessionStorage.setItem("storefront-settings-toast", "false");
            }}
          />
        )}
        {showIncompletePaymentToast && paymentIncomplete && (
          <Toast
            variant="warning"
            title="Incomplete payment data"
            message="Add at least one payment method and choose a primary method before saving."
            onClose={() => {
              setShowIncompletePaymentToast(false);
              window.sessionStorage.setItem("storefront-payment-toast", "false");
            }}
          />
        )}
      </div>
      <div className="space-y-5">
        <section className="min-w-0 rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111b40]">Financial Summary</h2>
              <p className="mt-1 text-xs text-[#8993aa]">A complete view of your storefront earnings and system-managed payouts.</p>
            </div>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="w-full rounded-lg border border-[#e2e7f1] bg-[#f7f9fd] px-3 py-2 text-xs font-medium text-[#33405d] outline-none focus:border-primary sm:w-auto"
              aria-label="Summary period"
            >
              <option>All time</option>
              <option>This year</option>
              <option>This month</option>
            </select>
          </div>

          {loadError && !isLoading && (
            <p className="mt-4 text-sm text-red-600">Unable to load this storefront from the database.</p>
          )}

          <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {displayMetrics.map(({ label, value, detail }) => (
              <div key={label} className="min-w-0 rounded-xl border border-[#e9edf6] bg-[#f9fafc] p-4">
                <p className="text-[11px] text-[#8993aa]">{label}</p>
                <p className="mt-2 truncate text-xl font-bold text-[#111b40]">
                  {label === "Payouts"
                    ? value > 0
                      ? `${value}`
                      : "None"
                    : `$${Number(value).toFixed(2)}`}
                </p>
                <p className="mt-1 text-[10px] text-[#8993aa]">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid min-w-0 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="min-w-0 rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#111b40]">Payouts</h2>
                <p className="mt-1 text-[11px] text-[#8993aa]">
                  {payoutCount > 0 ? `${payoutCount} recorded payout entry${payoutCount === 1 ? "" : "ies"}.` : "There are no creator or buyer payouts in this system."}
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-700">Disabled</span>
            </div>
            <div className="mt-5 rounded-lg border border-dashed border-[#dce2ee] bg-[#fafbfe] px-4 py-6 text-center text-[11px] text-[#8993aa]">
              {payoutCount > 0
                ? "Payout records are available from the connected API response."
                : "Money remains recorded in the platform. Only the system fee is retained."}
            </div>
          </section>

          <section className="min-w-0 rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            <h2 className="text-base font-bold text-[#111b40]">Money flow</h2>
            <p className="mt-1 text-[11px] text-[#8993aa]">Buyer pays the platform, the platform keeps its fee, and the remainder becomes creator earnings.</p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-xs"><span className="text-[#8993aa]">Buyer payments collected</span><span className="font-semibold text-[#111b40]">${buyerPayments.toFixed(2)}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-[#edf0f5]"><div className="h-full rounded-full bg-storefront-blue" style={{ width: `${moneyFlowBars.buyer}%` }} /></div>
              <div className="flex items-center justify-between text-xs"><span className="text-[#8993aa]">Platform fees</span><span className="font-semibold text-[#111b40]">-${systemFees.toFixed(2)}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-[#edf0f5]"><div className="h-full rounded-full bg-storefront-orange" style={{ width: `${moneyFlowBars.fees}%` }} /></div>
              <div className="flex items-center justify-between border-t border-[#edf0f5] pt-3 text-xs"><span className="font-semibold text-[#263252]">Creator earnings recorded</span><span className="font-bold text-emerald-600">${creatorEarnings.toFixed(2)}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-[#edf0f5]"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${moneyFlowBars.creator}%` }} /></div>
              <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2.5 text-[11px] text-blue-700"><span>All payouts</span><span className="font-semibold">{payoutCount > 0 ? `${payoutCount} recorded` : "Disabled"}</span></div>
            </div>
          </section>
        </div>

        <section className="min-w-0 overflow-hidden rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#111b40]">Recent transactions</h2>
              <p className="mt-1 text-[11px] text-[#8993aa]">Sales and system adjustments for {storefront.displayName}.</p>
            </div>
            <span className="text-[10px] font-medium text-[#8993aa]">{period}</span>
          </div>

          {isLoading ? (
            <div className="mt-5 h-24 animate-pulse rounded-xl bg-[#f1f3f7]" />
          ) : (summaryData.transactions ?? []).length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-[#dce2ee] bg-[#fafbfe] px-4 py-8 text-center text-[11px] text-[#8993aa]">
              No transactions found for this storefront yet.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="border-y border-[#edf0f5] bg-[#fcfcfe] text-[#8993aa]">
                  <tr>
                    <th className="px-3 py-3 font-medium">Description</th>
                    <th className="py-3 font-medium">Date</th>
                    <th className="py-3 font-medium">Amount</th>
                    <th className="py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(summaryData.transactions ?? []).map(({ description, date, amount, status }) => (
                    <tr key={`${description}-${date}`} className="border-b border-[#edf0f5] last:border-0">
                      <td className="max-w-[190px] truncate px-3 py-3 font-medium text-[#263252]">{description}</td>
                      <td className="whitespace-nowrap py-3 text-[#8993aa]">{new Date(date).toLocaleString()}</td>
                      <td className="whitespace-nowrap py-3 font-semibold text-emerald-600">${Number(amount).toFixed(2)}</td>
                      <td className="py-3 text-[#8993aa]">{status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
