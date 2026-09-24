"use client";

import Link from "next/link";
import { useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import { Card } from "@/components/ui";
import { addToCart } from "@/lib/cart";

export type Item = { name: string; type: string; icon: string; price?: string; isFree?: boolean };

const colors = [
  "from-[#ffd9bd] via-[#fff5ec] to-[#ff9148]", "from-[#102c4d] via-[#1f5c92] to-[#6dd8ed]",
  "from-[#19164d] via-[#4439a7] to-[#9c8cff]", "from-[#d9efff] via-[#fff5fb] to-[#f0a9bf]",
  "from-[#63125f] via-[#dd367c] to-[#ffb24b]", "from-[#dbe6f2] via-white to-[#b9c9dc]",
];
const productImages = [
  "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=900&q=85",
];

export default function ProductCard({ item, product = false, index }: { item: Item; product?: boolean; index: number }) {
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);
  const productHref = `/marketplace/TestStore/${item.name.toLowerCase().replaceAll(" ", "-")}`;

  function handleAddToCart() {
    if (!item.price || item.isFree) return;
    addToCart({ id: item.name.toLowerCase().replaceAll(" ", "-"), name: item.name, type: item.type, price: item.price, href: productHref });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <Card className={`group relative flex min-w-0 flex-col overflow-hidden rounded-xl p-0 transition duration-200 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_12px_28px_rgba(17,27,64,0.12)] ${product ? "min-h-[238px]" : "min-h-28"}`}>
      <Link href={product ? productHref : "#"} className="block min-w-0 flex-1 no-underline">
        <div className={`relative shrink-0 overflow-hidden bg-gradient-to-br ${colors[index]} text-xs font-bold text-white shadow-sm ${product ? "aspect-video h-auto w-full rounded-t-xl" : "h-10 w-10 rounded-xl"}`}>
          <img
            src={productImages[index % productImages.length]}
            alt={`${item.name} preview`}
            className="h-full w-full object-cover"
          />
          {product && index === 0 && <span className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 text-[7px] font-bold text-white shadow-sm">Best Seller</span>}
        </div>
        <div className={`min-w-0 ${product ? "mt-2.5 px-3" : ""}`}>
          <strong className="block truncate text-[11px] font-bold text-slate-900">{item.name}</strong>
          <span className="mt-0.5 flex items-center gap-1 truncate text-[8px] text-slate-500"><span>{item.type}</span>{item.isFree && <b className="rounded bg-accent-light px-1.5 py-0.5 text-[8px] font-semibold text-primary">Free</b>}</span>
        </div>
      </Link>
      {product && <div className="px-3">
        <Link href="/marketplace/TestStore" className="mt-1 block text-[9px] font-semibold text-primary no-underline hover:text-primary-hover">
          by TestStore
        </Link>
        <Link href={productHref} className="block no-underline">
          <div className="mt-2 flex items-end justify-between gap-2"><span><b className={`block text-sm ${item.isFree ? "text-primary" : "text-slate-900"}`}>{item.isFree ? "Free" : item.price}</b><small className="mt-0.5 block text-[8px] text-amber-500">★ 4.8 <span className="text-slate-400">(124)</span></small></span></div>
        </Link>
      </div>}
      {product ? <div className="mt-2.5 px-3 pb-3">
        {item.isFree ? <Link href={productHref} aria-label={`Download ${item.name}`} className="flex h-8 w-full items-center justify-center gap-1 rounded-md bg-primary text-[8px] font-semibold text-white no-underline transition hover:bg-primary-hover"><PublicIcon name="download" className="h-3 w-3" /> Download</Link> : <button type="button" aria-label={`Add ${item.name} to cart`} onClick={handleAddToCart} className={`flex h-8 w-full items-center justify-center gap-1 rounded-md text-[8px] font-semibold text-white shadow-sm transition ${added ? "bg-emerald-500" : "bg-primary hover:bg-primary-hover"}`}><PublicIcon key={added ? "added" : "cart"} name={added ? "check" : "shopping-cart"} className={`h-3 w-3 ${added ? "animate-bounce" : ""}`} />{added ? "Added" : "Add to Cart"}</button>}
      </div> : <button className="absolute bottom-3 right-3 rounded-md border border-slate-200 px-3 py-1.5 text-[9px] font-medium text-primary hover:border-accent-soft hover:bg-accent-light md:left-3 md:right-3">Download</button>}
      {product && <button type="button" aria-label={`${saved ? "Remove" : "Save"} ${item.name}`} onClick={() => setSaved(!saved)} className={`absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full border transition ${saved ? "border-primary bg-primary text-white" : "border-white/70 bg-white/80 text-slate-500 hover:text-primary"}`}><PublicIcon name="heart-plus" className={`h-3.5 w-3.5 ${saved ? "text-white" : "text-slate-500"}`} /></button>}
    </Card>
  );
}
