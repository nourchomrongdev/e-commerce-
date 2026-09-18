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
  isFree?: boolean;
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
  const productHref = `/marketplace/TestStore/${item.name.toLowerCase().replaceAll(" ", "-")}`;

  function handleAddToCart() {
    if (!item.price || item.isFree) return;
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
      className={`group relative flex min-w-0 flex-col gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md ${product ? "min-h-32" : "min-h-28"}`}
    >
      <Link href={product ? productHref : "#"} className="block min-w-0 flex-1 no-underline">
        <div
          className={`relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${colors[index]} text-xs font-bold text-white shadow-sm ${product ? "aspect-[1.7/1] h-auto w-full rounded-lg" : ""}`}
        >
          {product && <span className="absolute right-2 top-2 h-7 w-7 rounded-full bg-white/30" />}
          <span className={product ? "relative rounded bg-white/80 px-2 py-1 text-[9px] text-slate-800 shadow-sm" : ""}>{item.icon}</span>
        </div>
        <div className={`min-w-0 ${product ? "mt-2" : ""}`}>
          <strong className="block truncate text-[11px] text-slate-900">
            {item.name}
          </strong>
          <span className="mt-0.5 flex items-center gap-1 truncate text-[9px] text-slate-500">
            {item.type}
            {item.isFree && <b className="rounded bg-accent-light px-1.5 py-0.5 text-[8px] font-semibold text-primary">Free</b>}
          </span>
          {product && (
            <div className="mt-1 flex items-end justify-between gap-2">
              <span>
                <b className={`block text-[11px] ${item.isFree ? "text-primary" : "text-slate-900"}`}>{item.isFree ? "Free" : item.price}</b>
                <small className="mt-1 block text-[8px] text-amber-500">★ 4.8 <span className="text-slate-400">(124)</span></small>
              </span>
            </div>
          )}
        </div>
      </Link>
      {product ? (
        item.isFree ? (
          <Link href={productHref} className="mt-auto ml-auto flex h-9 w-[70%] min-w-[96px] items-center justify-center rounded-md bg-primary px-2 text-center text-[8px] font-semibold leading-none text-white no-underline transition hover:bg-primary-hover sm:text-[9px]">
            Free Download
          </Link>
        ) : (
          <div className="mt-auto grid grid-cols-[minmax(0,7fr)_minmax(78px,3fr)] gap-2">
            <button
              type="button"
              aria-label={`Add ${item.name} to cart`}
              onClick={handleAddToCart}
              className={`flex h-9 min-w-0 items-center justify-center gap-1 rounded-md px-2 py-2 text-[9px] font-semibold text-white shadow-sm transition ${added ? "bg-emerald-500" : "bg-primary hover:bg-primary-hover"}`}
            >
              <PublicIcon name="shopping-cart" className="h-3 w-3" />
              {added ? "Added" : "Add to Cart"}
            </button>
            <Link href={productHref} aria-label={`View ${item.name} details`} title="View product details" className="flex h-9 min-w-0 items-center justify-center whitespace-nowrap rounded-md border border-primary px-1 text-center text-[8px] font-semibold leading-none tracking-tight text-primary no-underline transition hover:bg-accent-light sm:px-2 sm:text-[9px]">
              View Details
            </Link>
          </div>
        )
      ) : (
        <button className="absolute right-3 bottom-3 rounded-md border border-slate-200 px-3 py-1.5 text-[9px] font-medium text-primary hover:border-accent-soft hover:bg-accent-light md:right-3 md:left-3">
          Download
        </button>
      )}
    </article>
  );
}
