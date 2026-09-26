"use client";

import { useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import { Badge, Card, MetricTile, Toast } from "@/components/ui";

const stats = [["Total Earnings", "$1,245.80", "+12.5%", "dollar"], ["Clicks", "2,458", "+12.5%", "up"], ["Conversions", "186", "+9.3%", "receipt"], ["Conversion Rate", "7.56%", "+2.1%", "dashboard"], ["Pending Payout", "$345.20", "", "payout"]] as const;
const topProducts = [["Premium Template Pack", "$450.00"], ["UI Design Kit", "$320.00"], ["Icon Set Collection", "$280.00"], ["WordPress Plugin", "$195.00"], ["Mobile App UI Kit", "$120.00"]];
const conversions = [["Premium Template Pack", "$49.00", "$9.80", "Approved"], ["UI Design Kit", "$29.00", "$5.80", "Approved"], ["Icon Set Collection", "$19.00", "$3.80", "Pending"]];

export default function AffiliateDashboard() {
  const [notice, setNotice] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {notice && (
        <Toast
          variant="success"
          message="Affiliate dashboard data exported successfully."
          onClose={() => setNotice(false)}
        />
      )}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Good evening, Affiliate</h1>
          <p className="mt-1 text-sm text-muted">Track your performance and earnings.</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-border-control bg-white px-3 py-2 text-xs font-medium text-body"
          >
            <PublicIcon name="search" className="h-3.5 w-3.5" />Search anything...
          </button>
          <button
            type="button"
            onClick={() => setNotice(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border-control bg-white px-3 py-2 text-xs font-semibold text-body hover:bg-surface-control"
          >
            <PublicIcon name="down" className="h-3.5 w-3.5 rotate-180" /> Export
          </button>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(([label, value, change, icon]) => (
          <MetricTile
            key={label}
            label={label}
            value={value}
            change={change || undefined}
            icon={<PublicIcon name={icon as any} className="h-5 w-5" />}
            iconClassName="text-primary"
          />
        ))}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-heading">Performance Overview</h2>
            <button
              type="button"
              className="select-chevron rounded-lg border border-border-control bg-white px-3 py-1.5 text-[10px] font-medium text-body"
            >
              This month
            </button>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-divider bg-surface-muted p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Top products</h3>
              <div className="mt-4 space-y-3">
                {topProducts.map(([product, amount]) => (
                  <div key={product} className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-ink">{product}</span>
                    <span className="text-xs font-semibold text-heading">{amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-divider bg-surface-muted p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Conversations</h3>
              <div className="mt-4 space-y-3">
                {conversions.map(([product, amount, commission, status]) => (
                  <div key={product} className="rounded-lg bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium text-ink">{product}</span>
                      <Badge tone={status === "Approved" ? "success" : "warning"}>{status}</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
                      <span>Sale</span>
                      <span>{amount}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted">
                      <span>Commission</span>
                      <span>{commission}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-sm font-bold text-heading">Performance chart</h2>
          <div className="mt-4 grid grid-cols-[32px_1fr] gap-3">
            <div className="flex h-40 flex-col justify-between text-[9px] text-muted-soft">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>0</span>
            </div>
            <div>
              <div className="relative h-40 border-b border-l border-divider bg-[linear-gradient(to_bottom,transparent_24%,#eef1f6_25%,transparent_26%,transparent_49%,#eef1f6_50%,transparent_51%,transparent_74%,#eef1f6_75%,transparent_76%)]">
                <AnalyticsChart />
              </div>
              <div className="mt-2 flex justify-between text-[9px] text-muted-soft">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
