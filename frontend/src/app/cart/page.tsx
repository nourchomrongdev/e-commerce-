"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import PublicIcon from "@/components/icons/PublicIcon";
import { getCartCount, readCart, removeFromCart, type CartItem } from "@/lib/cart";

function priceValue(price: string) {
  return Number.parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const total = items.reduce((sum, item) => sum + priceValue(item.price) * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f7f9fd] text-[#142b4d]">
      <Navbar active="products" />
      <main className="mx-auto max-w-[1120px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-[10px] text-muted">
          <Link href="/marketplace" className="text-primary">Marketplace</Link>
          <span className="text-storefront-blue">/</span>
          <span className="font-medium text-muted">Cart</span>
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-primary">Your selection</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-heading">Shopping cart</h1>
          </div>
          <span className="text-xs text-muted">{getCartCount(items)} item{getCartCount(items) === 1 ? "" : "s"}</span>
        </div>

        {items.length === 0 ? (
          <section className="mt-6 border border-border bg-white p-10 text-center shadow-sm">
            <PublicIcon name="shopping-cart" className="mx-auto h-9 w-9 text-muted" />
            <h2 className="mt-4 text-lg font-bold text-heading">Your cart is empty</h2>
            <p className="mt-2 text-xs text-muted">Add a digital product to continue to payment.</p>
            <Link href="/marketplace" className="mt-5 inline-flex rounded-md bg-primary px-5 py-3 text-xs font-bold text-white hover:bg-primary-hover">Browse marketplace</Link>
          </section>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section className="border border-border bg-white shadow-sm">
              <div className="border-b border-divider px-5 py-4 text-sm font-bold text-heading">Products</div>
              <div className="divide-y divide-divider">
                {items.map((item) => (
                  <article key={item.id} className="flex items-center gap-4 px-5 py-5">
                    <div className="grid h-16 w-20 shrink-0 place-items-center rounded-md bg-gradient-to-br from-orange-100 via-white to-blue-200 text-[9px] font-bold text-primary">{item.name}</div>
                    <div className="min-w-0 flex-1">
                      <Link href={item.href} className="text-sm font-bold text-heading hover:text-primary">{item.name}</Link>
                      <p className="mt-1 text-[10px] text-muted">{item.type} · Quantity {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-heading">${(priceValue(item.price) * item.quantity).toFixed(2)}</p>
                      <button type="button" onClick={() => setItems(removeFromCart(item.id))} className="mt-1 text-[10px] font-semibold text-muted hover:text-primary">Remove</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <aside className="h-fit border border-border bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-heading">Order summary</h2>
              <div className="mt-5 flex items-center justify-between border-b border-divider pb-4 text-xs text-muted"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
              <div className="mt-4 flex items-center justify-between text-base font-bold text-heading"><span>Total</span><span>${total.toFixed(2)}</span></div>
              <Link href="/cart/payment" className="mt-5 flex h-11 items-center justify-center rounded-md bg-primary px-4 text-xs font-bold text-white hover:bg-primary-hover">Proceed to payment</Link>
              <Link href="/marketplace" className="mt-3 block text-center text-[10px] font-semibold text-primary">Continue shopping</Link>
            </aside>
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
