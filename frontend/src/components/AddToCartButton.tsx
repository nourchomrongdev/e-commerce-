"use client";

import { useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import { addToCart } from "@/lib/cart";

type AddToCartButtonProps = {
  id: string;
  name: string;
  type: string;
  price: string;
  href: string;
};

export default function AddToCartButton({
  id,
  name,
  type,
  price,
  href,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart({ id, name, type, price, href });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
    >
      <PublicIcon name="shopping-cart" className="h-4 w-4" />
      {added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
