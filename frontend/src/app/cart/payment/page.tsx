"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import { clearCart, readCart, type CartItem } from "@/lib/cart";

function priceValue(price: string) {
  return Number.parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
}

export default function CartPaymentPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const total = items.reduce((sum, item) => sum + priceValue(item.price) * item.quantity, 0);

  function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearCart();
    setPaid(true);
  }

  return (
    <div className="min-h-screen bg-[#f7f9fd] text-[#142b4d]">
      <Navbar active="products" />
      <main className="mx-auto max-w-[960px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-[10px] text-muted"><Link href="/cart" className="text-primary">Cart</Link><span className="text-storefront-blue">/</span><span className="font-medium text-muted">Payment</span></div>
        {paid ? (
          <section className="mt-6 border border-border bg-white p-10 text-center shadow-sm">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-xl text-emerald-600">✓</div>
            <h1 className="mt-4 text-2xl font-extrabold text-heading">Payment successful</h1>
            <p className="mt-2 text-xs text-muted">Your digital files are ready in your account.</p>
            <Link href="/marketplace" className="mt-5 inline-flex rounded-md bg-primary px-5 py-3 text-xs font-bold text-white hover:bg-primary-hover">Back to marketplace</Link>
          </section>
        ) : items.length === 0 ? (
          <section className="mt-6 border border-border bg-white p-10 text-center shadow-sm"><h1 className="text-xl font-bold text-heading">No items to pay for</h1><Link href="/cart" className="mt-4 inline-block text-xs font-semibold text-primary">Return to cart</Link></section>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <form onSubmit={submitPayment} className="border border-border bg-white p-5 shadow-sm sm:p-6">
              <h1 className="text-2xl font-extrabold text-heading">Payment</h1>
              <p className="mt-2 text-xs text-muted">Complete your purchase securely.</p>
              <div className="mt-6 grid gap-4">
                <label className="text-[10px] font-semibold text-muted">Card number<input required name="card" inputMode="numeric" className="mt-1.5 h-10 w-full rounded-md border border-border-control px-3 text-xs text-heading outline-none focus:border-primary" placeholder="4242 4242 4242 4242" /></label>
                <div className="grid gap-4 sm:grid-cols-2"><label className="text-[10px] font-semibold text-muted">Expiry<input required name="expiry" inputMode="numeric" maxLength={7} pattern="(0[1-9]|1[0-2])/[0-9]{4}" className="mt-1.5 h-10 w-full rounded-md border border-border-control px-3 text-xs text-heading outline-none focus:border-primary" placeholder="MM/YYYY" /></label><label className="text-[10px] font-semibold text-muted">CVC<input required name="cvc" inputMode="numeric" pattern="[0-9]{3,4}" maxLength={4} className="mt-1.5 h-10 w-full rounded-md border border-border-control px-3 text-xs text-heading outline-none focus:border-primary" placeholder="123" /></label></div>
              </div>
              <button type="submit" className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-primary text-xs font-bold text-white hover:bg-primary-hover">Pay ${total.toFixed(2)}</button>
            </form>
            <aside className="h-fit border border-border bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-heading">Your order</h2>{items.map((item) => <div key={item.id} className="mt-4 flex justify-between gap-3 text-xs"><span className="text-muted">{item.name} × {item.quantity}</span><span className="font-semibold text-heading">${(priceValue(item.price) * item.quantity).toFixed(2)}</span></div>)}<div className="mt-5 flex justify-between border-t border-divider pt-4 text-sm font-bold text-heading"><span>Total</span><span>${total.toFixed(2)}</span></div></aside>
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
