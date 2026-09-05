"use client";

import { useEffect, useState } from "react";
import StorefrontHeader from "@/components/dashboard/StorefrontHeader";

const storefrontData: Record<string, { displayName: string; type: string }> = {
  NourChomrong: { displayName: "NourChomrong", type: "Templates" },
  DevCourses: { displayName: "DevCourses", type: "Digital Products" },
  "AI Resources": { displayName: "AI Resources", type: "Bundles" },
  DesignHub: { displayName: "DesignHub", type: "UI Kits" },
};

const metrics = [
  ["Total earnings", "$8,420.00", "Since storefront launch"],
  ["Buyer payments", "$9,262.00", "Collected by the platform"],
  ["System fees", "$842.00", "Retained by the platform"],
  ["Creator earnings", "$8,420.00", "Recorded by the system"],
  ["Payouts", "None", "Payout feature disabled"],
];

const transactions = [
  ["Full Stack Web Dev", "August 18, 2026", "+$49.00", "Completed"],
  ["React Code Course", "August 16, 2026", "+$39.00", "Completed"],
  ["API Mastery", "August 14, 2026", "+$24.00", "Completed"],
  ["Platform fee adjustment", "August 14, 2026", "-$2.40", "Processed"],
];

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

  useEffect(() => {
    if (params && typeof (params as Promise<{ storefront: string }>).then === "function") {
      (params as Promise<{ storefront: string }>).then(({ storefront }) => {
        setStorefrontName(storefront ?? null);
      });
    }
  }, [params]);

  const storefront =
    storefrontData[decodeURIComponent(storefrontName ?? "NourChomrong")] || storefrontData.DevCourses;
  const [period, setPeriod] = useState("All time");

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <StorefrontHeader storefront={storefront} activeTab="Summary" />

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

          <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(([label, value, detail]) => (
              <div key={label} className="min-w-0 rounded-xl border border-[#e9edf6] bg-[#f9fafc] p-4">
                <p className="text-[11px] text-[#8993aa]">{label}</p>
                <p className="mt-2 truncate text-xl font-bold text-[#111b40]">{value}</p>
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
                <p className="mt-1 text-[11px] text-[#8993aa]">There are no creator or buyer payouts in this system.</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-700">Disabled</span>
            </div>
            <div className="mt-5 rounded-lg border border-dashed border-[#dce2ee] bg-[#fafbfe] px-4 py-6 text-center text-[11px] text-[#8993aa]">
              Money remains recorded in the platform. Only the system fee is retained.
            </div>
          </section>

          <section className="min-w-0 rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            <h2 className="text-base font-bold text-[#111b40]">Money flow</h2>
            <p className="mt-1 text-[11px] text-[#8993aa]">Buyer pays the platform, the platform keeps its fee, and the remainder becomes creator earnings.</p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-xs"><span className="text-[#8993aa]">Buyer payments collected</span><span className="font-semibold text-[#111b40]">$9,262.00</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-[#edf0f5]"><div className="h-full w-[90%] rounded-full bg-storefront-blue" /></div>
              <div className="flex items-center justify-between text-xs"><span className="text-[#8993aa]">Platform fees</span><span className="font-semibold text-[#111b40]">-$842.00</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-[#edf0f5]"><div className="h-full w-[10%] rounded-full bg-storefront-orange" /></div>
              <div className="flex items-center justify-between border-t border-[#edf0f5] pt-3 text-xs"><span className="font-semibold text-[#263252]">Creator earnings recorded</span><span className="font-bold text-emerald-600">$8,420.00</span></div>
              <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2.5 text-[11px] text-blue-700"><span>All payouts</span><span className="font-semibold">Disabled</span></div>
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
                {transactions.map(([description, date, amount, status]) => (
                  <tr key={`${description}-${date}`} className="border-b border-[#edf0f5] last:border-0">
                    <td className="max-w-[190px] truncate px-3 py-3 font-medium text-[#263252]">{description}</td>
                    <td className="whitespace-nowrap py-3 text-[#8993aa]">{date}</td>
                    <td className={`whitespace-nowrap py-3 font-semibold ${amount.startsWith("-") ? "text-[#ef4444]" : "text-emerald-600"}`}>{amount}</td>
                    <td className="py-3 text-[#8993aa]">{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
