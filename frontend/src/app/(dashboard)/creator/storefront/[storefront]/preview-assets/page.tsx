"use client";

import { useMemo, useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import { Toast } from "@/components/ui";

const products = ["Laravel API Mastery", "Flutter UI Design Course", "Vue.js for Beginners", "JavaScript Fundamentals"];
const assets = [
  ["cover-image.jpg", "Images", "1.2 MB", "May 12, 2024", "from-[#f97316] via-[#7c2d12] to-[#111b40]"],
  ["preview-1.jpg", "Images", "890 KB", "May 12, 2024", "from-[#1e3a8a] via-[#2563eb] to-[#dbeafe]"],
  ["preview-2.jpg", "Images", "1.1 MB", "May 12, 2024", "from-[#111827] via-[#334155] to-[#0f172a]"],
  ["screenshot-1.png", "Images", "756 KB", "May 8, 2024", "from-[#0f172a] via-[#1e293b] to-[#475569]"],
  ["screenshot-2.png", "Images", "812 KB", "May 8, 2024", "from-[#172554] via-[#1e293b] to-[#020617]"],
] as const;
const tabs = ["All", "Images", "Videos", "Documents", "Audio"] as const;

export default function PreviewAssetsPage() {
  const [productSearch, setProductSearch] = useState(products[0]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");
  const [notice, setNotice] = useState(false);
  const suggestions = products.filter((product) => product.toLowerCase().includes(productSearch.toLowerCase()));
  const visibleAssets = useMemo(() => activeTab === "All" || activeTab === "Images" ? assets : [], [activeTab]);

  return <div className="mx-auto w-full max-w-[1200px]">
    {notice && <Toast variant="success" message="Asset upload started successfully." onClose={() => setNotice(false)} />}
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Preview Assets</h1><p className="mt-1 text-sm text-muted">Manage preview images and assets for your products.</p></div><button type="button" onClick={() => setNotice(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover"><PublicIcon name="add" className="h-3.5 w-3.5" /> Add Asset</button></header>

    <section className="mt-6 max-w-md"><label className="block text-[10px] font-semibold text-muted">Search Product<div className="relative mt-1.5"><PublicIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-muted-faint" /><input value={productSearch} onFocus={() => setSuggestionsOpen(true)} onBlur={() => setSuggestionsOpen(false)} onChange={(event) => { setProductSearch(event.target.value); setSuggestionsOpen(true); }} placeholder="Search product..." role="combobox" aria-expanded={suggestionsOpen} className="h-10 w-full rounded-lg border border-border-control bg-white pl-9 pr-3 text-xs font-semibold text-body outline-none placeholder:text-muted-faint focus:border-primary focus:ring-2 focus:ring-orange-100" />{suggestionsOpen && <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border-control bg-white py-1 shadow-lg">{suggestions.length ? suggestions.map((product) => <button key={product} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setProductSearch(product); setSuggestionsOpen(false); }} className="block w-full px-3 py-2 text-left text-xs text-body hover:bg-surface-control">{product}</button>) : <p className="px-3 py-2 text-xs text-muted">No matching products</p>}</div>}</div></label></section>

    <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-sm"><nav className="flex gap-6 border-b border-divider px-5 pt-4 sm:px-6" aria-label="Asset types">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`relative pb-3 text-xs font-semibold ${activeTab === tab ? "text-primary" : "text-muted hover:text-body"}`}>{tab}{activeTab === tab && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />}</button>)}</nav><div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">{visibleAssets.map(([name, type, size, date, gradient]) => <article key={name} className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"><div className={`flex aspect-[1.45] items-center justify-center bg-gradient-to-br ${gradient} p-4`}><div className="rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-center text-white backdrop-blur-sm"><PublicIcon name="view" className="mx-auto h-7 w-7" /><p className="mt-2 text-[10px] font-semibold">Preview Asset</p></div></div><div className="p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-body-strong">{name}</p><p className="mt-1 text-[9px] text-muted">{size}</p><p className="mt-1 text-[9px] text-muted-soft">{date}</p></div><button type="button" aria-label={`More actions for ${name}`} className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border-action text-muted hover:border-primary hover:text-primary"><PublicIcon name="ellipsis-vertical" className="h-3.5 w-3.5" /></button></div><span className="mt-2 inline-block rounded-md bg-orange-50 px-2 py-1 text-[9px] font-semibold text-primary">{type}</span></div></article>)}<label className="flex aspect-[1.45] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border-control bg-surface-muted text-center hover:border-primary hover:bg-surface-hover"><span className="grid h-9 w-9 place-items-center rounded-full border border-muted text-muted"><PublicIcon name="add" className="h-4 w-4" /></span><strong className="mt-3 text-xs text-body">Upload New Asset</strong><span className="mt-1 text-[9px] text-muted-soft">PNG, JPG or WEBP</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={() => setNotice(true)} className="sr-only" /></label>{visibleAssets.length === 0 && <p className="col-span-full py-10 text-center text-sm text-muted">No {activeTab.toLowerCase()} assets available.</p>}</div></section>
  </div>;
}
