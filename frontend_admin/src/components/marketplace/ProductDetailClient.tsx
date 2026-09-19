"use client";

import Link from "next/link";
import { useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";

const previews = [
  { label: "Cover", tone: "from-sky-950 via-blue-900 to-cyan-500" },
  { label: "Principles", tone: "from-orange-100 via-white to-orange-300" },
  { label: "Systems", tone: "from-violet-100 via-white to-indigo-300" },
  { label: "Toolkit", tone: "from-emerald-100 via-white to-sky-300" },
  { label: "Bonus", tone: "from-slate-900 via-slate-700 to-orange-400" },
];

const related = [
  ["Mobile App UI Kit", "$18", "from-violet-100 to-indigo-300"],
  ["Business Card Templates", "$12", "from-orange-100 to-rose-200"],
  ["Dashboard UI Kit", "$22", "from-slate-200 to-blue-300"],
];

export default function ProductDetailClient({ productSlug }: { productSlug: string }) {
  const [selectedPreview, setSelectedPreview] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("Description");
  const [notice, setNotice] = useState("");
  const [review, setReview] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const isFree = productSlug.toLowerCase().includes("free");
  const title = productSlug.toLowerCase() === "the-ultimate-design" ? "The Ultimate Design" : productSlug.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }

  function addToCart() {
    showNotice(`${quantity} item${quantity === 1 ? "" : "s"} added to cart`);
  }

  function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!review.trim()) return;
    setReviewSubmitted(true);
    setReview("");
  }

  async function copyLink() {
    await navigator.clipboard?.writeText(window.location.href);
    showNotice("Product link copied");
  }

  return (
    <main className="mx-auto max-w-[1560px] px-4 pb-12 pt-5 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted">
        <Link href="/marketplace" className="text-primary hover:underline">Marketplace</Link><span className="text-storefront-blue">/</span>
        <Link href="/marketplace/TestStore" className="text-primary hover:underline">TestStore</Link><span className="text-storefront-blue">/</span>
        <span className="font-medium text-muted" aria-current="page">{title}</span>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
        <section className="order-2 min-w-0 lg:col-span-2">
          <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
            <div className={`relative grid aspect-[1.65/1] place-items-center overflow-hidden rounded-lg bg-gradient-to-br ${previews[selectedPreview].tone} p-6 sm:p-10`}>
              <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/20" />
              <div className="relative w-[74%] max-w-[500px] rotate-[-2deg] rounded-md bg-white p-5 shadow-2xl sm:p-8">
                <span className="text-[10px] font-bold tracking-[.18em] text-primary">TESTSTORE STUDIO</span>
                <h1 className="mt-8 max-w-[280px] text-3xl font-extrabold leading-none text-heading sm:text-5xl">The <span className="text-primary">Ultimate</span> Design</h1>
                <p className="mt-4 max-w-[280px] text-[10px] leading-5 text-muted sm:text-xs">A practical guide to building clear, useful and memorable digital products.</p>
                <div className="mt-7 flex gap-2"><span className="h-1.5 w-16 rounded bg-primary" /><span className="h-1.5 w-10 rounded bg-slate-200" /></div>
              </div>
              <span className="absolute bottom-5 left-5 rounded bg-white/85 px-2 py-1 text-[9px] font-semibold text-heading shadow-sm">{previews[selectedPreview].label} preview</span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {previews.map((preview, index) => <button type="button" key={preview.label} onClick={() => setSelectedPreview(index)} aria-label={`Show ${preview.label} preview`} className={`rounded-md bg-gradient-to-br ${preview.tone} p-1 ${selectedPreview === index ? "ring-2 ring-primary ring-offset-1" : "opacity-75 hover:opacity-100"}`}><span className="grid aspect-[1.35/1] place-items-center rounded bg-white/80 text-[8px] font-bold text-heading">{preview.label}</span></button>)}
            </div>
          </div>

          <section className="mt-5 rounded-xl border border-border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-5 border-b border-divider text-xs font-semibold">
              {["Description", "Features", "Files Included", "Reviews (38)"].map((tab) => <button type="button" key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted hover:text-primary"}`}>{tab}</button>)}
            </div>
            {activeTab === "Description" && <div className="mt-5 grid gap-6 md:grid-cols-[1.1fr_.9fr]"><div><h2 className="text-sm font-bold text-heading">About this product</h2><p className="mt-3 text-xs leading-6 text-muted">The Ultimate Design is a practical eBook for creators who want to make digital products easier to understand, use and love. It brings together visual principles, product thinking and repeatable workflows in one focused guide.</p><p className="mt-3 text-xs leading-6 text-muted">Use it as a reference while planning a new interface, reviewing your design system or improving an existing product experience.</p></div><ul className="space-y-2 text-xs text-muted">{["120+ pages of practical guidance", "Real-world design checklists", "Examples for web and mobile products", "Bonus templates and worksheets", "Lifetime updates included"].map((item) => <li key={item}><span className="mr-2 text-primary">✓</span>{item}</li>)}</ul></div>}
            {activeTab === "Features" && <InfoList items={["Build stronger visual hierarchy", "Create consistent design systems", "Improve usability with simple research", "Present and review work with confidence"]} />}
            {activeTab === "Files Included" && <InfoList items={["The-Ultimate-Design.pdf (18.4 MB)", "Design-Review-Checklist.pdf (1.2 MB)", "Bonus-Templates.zip (6.8 MB)", "License-and-Updates.txt"]} />}
            {activeTab === "Reviews (38)" && <div className="mt-5 rounded-lg bg-surface-muted p-4 text-xs text-muted"><span className="text-lg text-amber-500">★★★★★</span><b className="ml-2 text-heading">4.9 out of 5</b><p className="mt-2">"Clear, practical, and easy to return to when I get stuck." - Verified buyer</p></div>}
          </section>

          <section className="mt-5"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-heading">More from TestStore</h2><Link href="/marketplace/TestStore" className="text-[10px] font-semibold text-primary">View store &rarr;</Link></div><div className="mt-3 grid gap-3 sm:grid-cols-3">{related.map(([name, price, tone]) => <Link href={`/marketplace/${name.toLowerCase().replaceAll(" ", "-")}`} key={name} className="rounded-lg border border-border bg-white p-2.5 shadow-sm hover:-translate-y-0.5 hover:shadow-md"><div className={`grid aspect-[1.55/1] place-items-center rounded-md bg-gradient-to-br ${tone} text-[10px] font-bold text-heading`}>{name}</div><b className="mt-2 block truncate text-[10px] text-heading">{name}</b><span className="mt-1 block text-xs font-bold text-heading">{price}</span></Link>)}</div></section>

          <section className="mt-6 rounded-xl border border-border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-sm font-bold text-heading">Customer reviews</h2><p className="mt-1 text-[10px] text-muted">What buyers say about this product</p></div><span className="text-lg text-amber-500">★★★★★ <b className="ml-1 text-xs text-heading">4.9</b></span></div>
            <div className="mt-5 grid gap-4 border-y border-divider py-4 sm:grid-cols-[150px_1fr]"><div className="text-center"><b className="block text-3xl text-heading">4.9</b><span className="text-sm text-amber-500">★★★★★</span><small className="mt-1 block text-[9px] text-muted">38 verified reviews</small></div><div className="space-y-2 text-[9px] text-muted">{[["5", "92%"], ["4", "6%"], ["3", "2%"]].map(([stars, width]) => <div className="flex items-center gap-2" key={stars}><span>{stars} star</span><span className="h-1.5 flex-1 rounded-full bg-surface-control"><span className="block h-full rounded-full bg-amber-400" style={{ width }} /></span><span>{width}</span></div>)}</div></div>
            <article className="mt-4 rounded-lg bg-surface-muted p-3"><div className="flex items-center justify-between"><b className="text-[10px] text-heading">Sokha P.</b><span className="text-[10px] text-amber-500">★★★★★</span></div><p className="mt-2 text-[10px] leading-5 text-muted">Clear, practical, and easy to return to when I get stuck. The checklists alone saved me hours.</p><small className="mt-2 block text-[9px] text-muted">Verified purchase · 2 days ago</small></article>
            <form onSubmit={submitReview} className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={review} onChange={(event) => setReview(event.target.value)} placeholder="Share your experience" className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-xs text-heading outline-none focus:border-primary" /><button type="submit" className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover">Post review</button></form>
            {reviewSubmitted && <p className="mt-2 text-[10px] text-status-success">Thanks. Your review was submitted for approval.</p>}
          </section>
        </section>

        <aside className="order-1 min-w-0 lg:col-span-2 xl:pt-2">
          <div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-accent-light px-3 py-1 text-[10px] font-semibold text-primary">eBook</span><h2 className="mt-4 text-3xl font-extrabold tracking-tight text-heading">{title}</h2></div><button type="button" aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"} onClick={() => setWishlisted(!wishlisted)} className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-white text-xl ${wishlisted ? "text-primary" : "text-muted"}`}>{wishlisted ? "♥" : "♡"}</button></div>
          <p className="mt-3 text-sm leading-6 text-muted">A practical design guide for creators, product teams and anyone who wants to make better digital experiences.</p>
          <p className="mt-4 text-sm text-amber-500">★★★★★ <b className="ml-2 text-heading">4.9</b> <span className="text-muted">(38 reviews) | 172 sold</span></p>
          <div className="mt-5 flex items-center gap-3"><b className="text-4xl text-heading">{isFree ? "Free" : "$15"}</b>{!isFree && <><del className="text-sm text-muted">$24</del><span className="rounded bg-primary px-2.5 py-1 text-[10px] font-bold text-white">38% OFF</span></>}</div>
          <div className="mt-5 flex flex-wrap gap-2">{["PDF", "120+ Pages", "Templates", "Lifetime Updates"].map((tag) => <span key={tag} className="rounded-full bg-surface-control px-3 py-2 text-[10px] text-muted">{tag}</span>)}</div>
          {!isFree && <><p className="mt-6 text-xs font-bold text-heading">Quantity</p><div className="mt-2 flex w-32 overflow-hidden rounded-lg border border-border bg-white"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 border-r border-border py-2 text-muted hover:text-primary">-</button><span className="flex-1 py-2 text-center text-xs font-bold text-heading">{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)} className="w-10 border-l border-border py-2 text-muted hover:text-primary">+</button></div></>}
          {isFree ? <button type="button" onClick={() => showNotice("Your free download is starting")} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-primary-hover"><PublicIcon name="download" className="h-4 w-4" />Free Download</button> : <div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" onClick={addToCart} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-primary-hover"><PublicIcon name="shopping-cart" className="h-4 w-4" />Add to Cart</button><button type="button" onClick={() => showNotice("Checkout is ready to start")} className="rounded-lg border border-orange-300 px-4 py-3.5 text-xs font-bold text-primary hover:bg-accent-light">Buy Now</button></div>}
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-divider pt-5 text-center"><TrustItem icon="↓" title="Instant Download" /><TrustItem icon="◈" title="Secure Payment" /><TrustItem icon="◌" title="24/7 Support" /></div>
          <div className="mt-5 rounded-lg bg-accent-light p-3 text-[10px] text-muted"><b className="text-primary">Digital product</b><p className="mt-1">Your files are available immediately after a successful payment.</p></div>
          <button type="button" onClick={copyLink} className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-muted hover:text-primary"><PublicIcon name="link" className="h-3 w-3" />Share this product</button>
        </aside>

        <aside className="hidden"><div className="rounded-xl border border-border bg-white p-3 shadow-sm"><h2 className="border-l-2 border-primary pl-2 text-xs font-bold text-heading">Trending products</h2></div></aside>
      </div>
      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-heading px-4 py-3 text-xs font-semibold text-white shadow-lg">{notice}</div>}
    </main>
  );
}

function InfoList({ items }: { items: string[] }) { return <ul className="mt-5 space-y-3 text-xs text-muted">{items.map((item) => <li key={item} className="rounded-lg bg-surface-muted px-3 py-2"><span className="mr-2 text-primary">✓</span>{item}</li>)}</ul>; }
function TrustItem({ icon, title }: { icon: string; title: string }) { return <div><span className="text-primary">{icon}</span><b className="mt-1 block text-[9px] text-heading">{title}</b><small className="text-[8px] text-muted">Available anytime</small></div>; }
