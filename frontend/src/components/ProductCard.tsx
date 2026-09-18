"use client";

import Link from "next/link";
import { useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import { addToCart } from "@/lib/cart";

export type Item = {
  name: string;
  type: string;
  icon: string;
  price?: string;
};
const colors = [
  "from-[#ffd9bd] via-[#fff5ec] to-[#ff9148]",
  "from-[#102c4d] via-[#1f5c92] to-[#6dd8ed]",
  "from-[#19164d] via-[#4439a7] to-[#9c8cff]",
  "from-[#d9efff] via-[#fff5fb] to-[#f0a9bf]",
  "from-[#63125f] via-[#dd367c] to-[#ffb24b]",
  "from-[#dbe6f2] via-white to-[#b9c9dc]",
];
export default function ProductCard({
  item,
  product = false,
  index,
}: {
  item: Item;
  product?: boolean;
  index: number;
}) {
  const [added, setAdded] = useState(false);
  const productHref = `/marketplace/NourChomrong/${item.name.toLowerCase().replaceAll(" ", "-")}`;

  function handleAddToCart() {
    if (!item.price) return;
    addToCart({
      id: item.name.toLowerCase().replaceAll(" ", "-"),
      name: item.name,
      type: item.type,
      price: item.price,
      href: productHref,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article
      className={`group relative flex min-w-0 gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${product ? "min-h-32" : "min-h-28"} md:block`}
    >
      <Link href={product ? productHref : "#"} className="block min-w-0 flex-1 no-underline">
        <div
          className={`relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${colors[index]} text-xs font-bold text-white shadow-sm ${product ? "md:aspect-[1.7/1] md:h-auto md:w-full md:rounded-lg" : ""}`}
        >
          {product && <span className="absolute right-2 top-2 h-7 w-7 rounded-full bg-white/30" />}
          <span className={product ? "relative rounded bg-white/80 px-2 py-1 text-[9px] text-slate-800 shadow-sm" : ""}>{item.icon}</span>
        </div>
        <div className="min-w-0 md:mt-2">
          <strong className="block truncate text-[11px] text-slate-900">
            {item.name}
          </strong>
          <span className="mt-0.5 block truncate text-[9px] text-slate-500">
            {item.type}
          </span>
          {product && (
            <div className="mt-1 flex items-end justify-between gap-2">
              <span>
                <b className="block text-[11px] text-slate-900">{item.price}</b>
                <small className="mt-1 block text-[8px] text-amber-500">★ 4.8 <span className="text-slate-400">(124)</span></small>
              </span>
            </div>
          )}
        </div>
      </Link>
      {product ? (
        <button
          type="button"
          aria-label={`Add ${item.name} to cart`}
          onClick={handleAddToCart}
          className={`absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full text-white shadow-sm transition ${added ? "bg-emerald-500" : "bg-primary hover:bg-primary-hover"}`}
        >
          <PublicIcon name="shopping-cart" className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button className="absolute right-3 bottom-3 rounded-md border border-slate-200 px-3 py-1.5 text-[9px] font-medium text-primary hover:border-accent-soft hover:bg-accent-light md:right-3 md:left-3">
          Download
        </button>
      )}
    </article>
  );
}
