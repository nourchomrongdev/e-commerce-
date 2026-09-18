"use client";

import { useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import { addToCart } from "@/lib/cart";

type Props = {
  id: string;
  name: string;
  type: string;
  price: string;
  href: string;
  compact?: boolean;
};

export default function StorefrontCartButton({ id, name, type, price, href, compact = false }: Props) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart({ id, name, type, price, href });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return <button type="button" onClick={handleAdd} aria-label={`Add ${name} to cart`} className={compact ? `absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-md ${added ? "bg-emerald-500" : "bg-white text-primary"} shadow-sm` : `mt-4 flex w-full items-center justify-center gap-2 rounded-lg ${added ? "bg-emerald-500" : "bg-primary"} px-4 py-3 text-xs font-bold text-white hover:bg-primary-hover`}>
    <PublicIcon name="shopping-cart" className="h-3.5 w-3.5" />
    {!compact && (added ? "Added to Cart" : "Add to Cart")}
  </button>;
}
