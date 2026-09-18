"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PublicIcon, { type PublicIconName } from "@/components/icons/PublicIcon";
import { addToCart } from "@/lib/cart";

type Props = {
  id: string;
  name: string;
  type: string;
  price: string;
  href: string;
  compact?: boolean;
  className?: string;
  label?: string;
  redirectTo?: string;
  iconName?: PublicIconName;
};

export default function StorefrontCartButton({ id, name, type, price, href, compact = false, className = "", label, redirectTo, iconName = "shopping-cart" }: Props) {
  const [added, setAdded] = useState(false);
  const router = useRouter();

  function handleAdd() {
    addToCart({ id, name, type, price, href });
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return <button type="button" onClick={handleAdd} aria-label={`${label ?? "Add"} ${name}`} className={`${compact ? `absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-md ${added ? "bg-emerald-500" : "bg-white text-primary"} shadow-sm` : `flex w-full items-center justify-center gap-2 rounded-md ${added ? "bg-emerald-500" : "bg-primary"} px-4 py-3 text-xs font-bold text-white hover:bg-primary-hover`} ${className}`}>
    <PublicIcon name={iconName} className="h-3.5 w-3.5" />
    {!compact && (added ? "Added to Cart" : label ?? "Add to Cart")}
  </button>;
}
