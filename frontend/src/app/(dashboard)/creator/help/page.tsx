"use client";

import { useMemo, useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";

const categories = [
  ["Getting Started", "Learn the basics", "dashboard"],
  ["Store Management", "Manage your store and products", "store"],
  ["Orders & Sales", "Handle orders and customer payments", "receipt"],
  ["Payouts & Payments", "Track earnings and withdraw funds", "payout"],
  ["Account & Verification", "Verify your creator account", "verification"],
  ["Policies & Guidelines", "Rules and best practices", "product"],
] as const;

const articles = [
  ["How to create your storefront", "Learn how to set up your store and get started"],
  ["How payouts work", "Understand your payout cycle and methods"],
  ["How to add a new product", "Step-by-step guide to adding digital products"],
  ["How to manage orders", "Process orders and communicate with customers"],
] as const;

export default function CreatorHelpPage() {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visibleCategories = useMemo(
    () => categories.filter(([title, description]) => `${title} ${description}`.toLowerCase().includes(query)),
    [query],
  );
  const visibleArticles = useMemo(
    () => articles.filter(([title, description]) => `${title} ${description}`.toLowerCase().includes(query)),
    [query],
  );

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header>
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-primary"><PublicIcon name="help" className="h-5 w-5" /></span><div><h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Help Center</h1><p className="mt-1 text-sm text-muted">Find answers and get support.</p></div></div>
        <label className="relative mt-5 block max-w-xl"><span className="sr-only">Search help articles</span><PublicIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-muted-faint" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for help articles..." className="h-10 w-full rounded-lg border border-border-control bg-white pl-9 pr-3 text-xs text-body-strong outline-none placeholder:text-muted-faint focus:border-primary focus:ring-2 focus:ring-orange-100" /></label>
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"><h2 className="text-sm font-bold text-heading">Categories</h2><div className="mt-3 divide-y divide-divider">{visibleCategories.map(([title, description, icon]) => <button key={title} type="button" className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-surface-hover"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-control text-body"><PublicIcon name={icon} className="h-3.5 w-3.5" /></span><span className="min-w-0 flex-1"><strong className="block text-xs text-body-strong">{title}</strong><small className="mt-0.5 block text-[10px] text-muted-soft">{description}</small></span><PublicIcon name="right" className="h-3.5 w-3.5 text-muted" /></button>)}</div>{visibleCategories.length === 0 && <p className="py-8 text-center text-sm text-muted">No categories found.</p>}</section>

        <div className="space-y-5"><section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-heading">Popular Articles</h2><button type="button" className="text-[10px] font-semibold text-primary">View All</button></div><div className="mt-3 divide-y divide-divider">{visibleArticles.map(([title, description]) => <button key={title} type="button" className="flex w-full items-start gap-3 py-3 text-left transition hover:bg-surface-hover"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-blue-50 text-status-info"><PublicIcon name="receipt" className="h-3.5 w-3.5" /></span><span><strong className="block text-[10px] text-body-strong">{title}</strong><small className="mt-0.5 block text-[9px] text-muted-soft">{description}</small></span></button>)}</div>{visibleArticles.length === 0 && <p className="py-8 text-center text-sm text-muted">No articles found.</p>}</section><section className="rounded-2xl border border-primary/20 bg-orange-50 p-5 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-primary"><PublicIcon name="help" className="h-4 w-4" /></span><div><h2 className="text-xs font-bold text-heading">Need more help?</h2><p className="mt-0.5 text-[10px] text-muted">Contact our support team.</p></div></div><a href="mailto:support@marketplace.com" className="mt-4 inline-flex rounded-lg bg-primary px-3 py-2 text-[10px] font-semibold text-white no-underline transition hover:bg-primary-hover">Contact Us</a></section></div>
      </div>
    </div>
  );
}
