"use client";

import Link from "next/link";
import PublicIcon from "@/components/icons/PublicIcon";
import { Card, MetricTile } from "@/components/ui";
import { routes } from "@/lib/routeController";
import AnalyticsChart from "./AnalyticsChart";

const stats = [["Total Orders", "12", "+2 this month", "receipt"], ["Downloads", "28", "+5 this month", "download"], ["Active Licenses", "8", "+1 this month", "shield-check"], ["Wishlist Items", "15", "+3 this month", "shopping-cart"]] as const;
const recentOrders = [["#A1024", "Premium Template Pack", "Delivered"], ["#A1025", "Mobile App UI Kit", "Processing"], ["#A1026", "Icon Set Collection", "Refunded"]] as const;

export default function BuyerDashboard() {
  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">
            Good evening, Buyer <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Find and manage your digital products.</p>
        </div>

        <Link
          href="/marketplace"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white no-underline hover:bg-primary-hover"
        >
          <PublicIcon name="search" className="h-3.5 w-3.5" /> Browse marketplace
        </Link>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, change, icon]) => (
          <MetricTile
            key={label}
            label={label}
            value={value}
            change={change}
            icon={<PublicIcon name={icon as any} className="h-5 w-5" />}
            iconClassName="text-primary"
          />
        ))}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-divider px-5 py-4">
            <h2 className="text-sm font-bold text-heading">Recent Orders</h2>
            <Link href={routes.buyer.purchases()} className="text-[10px] font-semibold text-primary no-underline">
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-xs">
              <thead className="bg-surface-muted text-[10px] text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(([id, product, status], index) => (
                  <tr key={id} className="border-t border-divider">
                    <td className="px-5 py-3 font-medium text-ink">{id}</td>
                    <td className="px-5 py-3 text-body">{product}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          index === 0
                            ? "bg-emerald-100 text-emerald-700"
                            : index === 1
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-bold text-heading">Growth</h2>
          <div className="mt-4 grid grid-cols-[32px_1fr] gap-3">
            <div className="flex h-40 flex-col justify-between text-[9px] text-muted-soft">
              <span>40</span>
              <span>30</span>
              <span>20</span>
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
