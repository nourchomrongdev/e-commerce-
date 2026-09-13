"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AppBrand from "@/components/AppBrand";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "◫" },
  { href: "/dashboard/products", label: "Products", icon: "▣" },
  { href: "/dashboard/orders", label: "Orders", icon: "◍" },
  { href: "/dashboard/customers", label: "Customers", icon: "◎" },
  { href: "/dashboard/reviews", label: "Reviews", icon: "★" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "◔" },
];

const quickStats = [
  { label: "Revenue", value: "$184.2K" },
  { label: "Growth", value: "+18.4%" },
  { label: "Pending", value: "32" },
];

export function AdminShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-slate-950 p-6 text-slate-100 lg:flex lg:flex-col">
        <div className="mb-10">
          <AppBrand
            name="KhmerDigital"
            subtitle="Admin Panel"
            className="mb-2"
            textClassName="text-sm"
            logoClassName="h-10 w-10"
            showTagline
          />
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-primary/15 text-white ring-1 ring-inset ring-white/10"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/8 text-[12px]">
                    {item.icon}
                  </span>
                  {item.label}
                </span>
                {active ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            System status
          </p>
          <div className="mt-4 space-y-3">
            {quickStats.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{item.label}</span>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Operations</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
            </div>

            <div className="flex items-center gap-3">
              {actions}
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-white">
                  AD
                </span>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-semibold text-slate-800">Admin</div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Super user</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  change,
  tone = "default",
}: {
  label: string;
  value: string;
  change: string;
  tone?: "default" | "positive" | "warning" | "danger";
}) {
  const toneClass = {
    default: "bg-slate-50 text-slate-700",
    positive: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-rose-50 text-rose-700",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{label}</span>
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${toneClass}`}>{change}</span>
      </div>
      <div className="mt-4 text-3xl font-black tracking-tight text-slate-900">{value}</div>
    </div>
  );
}

export function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
