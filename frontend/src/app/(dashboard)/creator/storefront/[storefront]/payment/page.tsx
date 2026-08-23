"use client";

import { useEffect, useState } from "react";
import StorefrontHeader from "@/components/dashboard/StorefrontHeader";
import PaymentMethodCard from "@/components/dashboard/PaymentMethodCard";

const storefrontData: Record<string, { displayName: string; type: string }> = {
  NourChomrong: { displayName: "NourChomrong", type: "Templates" },
  DevCourses: { displayName: "DevCourses", type: "Digital Products" },
  "AI Resources": { displayName: "AI Resources", type: "Bundles" },
  DesignHub: { displayName: "DesignHub", type: "UI Kits" },
};

const inputClassName =
  "w-full rounded-lg border border-[#e2e7f1] bg-white px-3 py-2.5 text-xs text-[#111b40] outline-none transition focus:border-primary focus:ring-2 focus:ring-[#ff6b001c]";

function PaymentField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-semibold text-[#33405d]"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
      />
    </div>
  );
}

export default function StorefrontPaymentPage({
  params,
}: {
  params: Promise<{ storefront: string }> | { storefront: string };
}) {
  const [storefrontName, setStorefrontName] = useState<string | null>(
    typeof params === "object" && params !== null && !("then" in params)
      ? (params as { storefront?: string }).storefront ?? null
      : null,
  );

  useEffect(() => {
    if (params && typeof (params as Promise<{ storefront: string }>).then === "function") {
      (params as Promise<{ storefront: string }>).then(({ storefront }) => {
        setStorefrontName(storefront ?? null);
      });
    }
  }, [params]);

  const storefront =
    storefrontData[decodeURIComponent(storefrontName ?? "NourChomrong")] ||
    storefrontData.DevCourses;
  const cardNumber = "•••• •••• •••• 4242";
  const cardName = "NourChomrong";
  const paypalEmail = "devcourses@gmail.com";
  const [savedMethods, setSavedMethods] = useState<string[]>([
    "Credit Card",
    "PayPal",
  ]);
  const [primaryMethod, setPrimaryMethod] = useState("Credit Card");
  const [activeMethodIndex, setActiveMethodIndex] = useState(0);
  const [flippedMethods, setFlippedMethods] = useState<Record<string, boolean>>(
    {},
  );
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const [methodToAdd, setMethodToAdd] = useState("Credit Card");
  const [taxId, setTaxId] = useState("");
  const [saved, setSaved] = useState(false);

  const savePayment = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const removePaymentMethod = (method: string) => {
    const nextMethods = savedMethods.filter(
      (savedMethod) => savedMethod !== method,
    );
    setSavedMethods(nextMethods);
    setActiveMethodIndex((index) =>
      Math.min(index, Math.max(nextMethods.length - 1, 0)),
    );
    if (primaryMethod === method) {
      setPrimaryMethod(nextMethods[0] ?? "");
    }
    setFlippedMethods((methods) => ({ ...methods, [method]: false }));
  };

  const addPaymentMethod = () => {
    setSavedMethods((methods) =>
      methods.includes(methodToAdd) ? methods : [...methods, methodToAdd],
    );
    if (!primaryMethod) setPrimaryMethod(methodToAdd);
    setAddMethodOpen(false);
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <StorefrontHeader storefront={storefront} activeTab="Payment" />

      <section className="min-w-0 rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#111b40]">Payment</h2>
            <p className="mt-1 text-xs text-[#8993aa]">
              Manage the payment methods used by buyers on your storefront.
            </p>
          </div>
          {saved && (
            <span className="text-xs font-medium text-emerald-600">
              Payment settings saved
            </span>
          )}
        </div>

        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-[#e9edf6] bg-[#f9fafc] p-3 sm:p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#111b40]">
                  Payment Methods
                </h3>
                <p className="mt-1 text-[11px] text-[#8993aa]">
                  Saved Credit Card and PayPal accounts available for platform
                  payments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddMethodOpen((open) => !open)}
                className="rounded-lg bg-primary px-3 py-2 text-[10px] font-semibold text-white transition hover:opacity-90"
              >
                Add payment
              </button>
            </div>

            {savedMethods.length ? (
              <div className="relative mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:flex sm:justify-center">
                {/* Previous */}
                <button
                  type="button"
                  aria-label="Previous payment method"
                  disabled={savedMethods.length < 2}
                  onClick={() =>
                    setActiveMethodIndex(
                      (index) =>
                        (index - 1 + savedMethods.length) % savedMethods.length,
                    )
                  }
                  className="row-start-2 grid h-10 w-10 shrink-0 place-items-center justify-self-end rounded-full border border-[#e0e5ef] bg-white text-lg text-[#33405d] transition hover:border-primary hover:text-primary disabled:opacity-40 sm:row-auto sm:justify-self-auto"
                >
                  ‹
                </button>

                {/* Center Card */}
                <div className="col-span-3 row-start-1 w-full max-w-md overflow-hidden sm:col-auto sm:row-auto">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${activeMethodIndex * 100}%)`,
                    }}
                  >
                    {savedMethods.map((method) => (
                      <div
                        key={method}
                        className="flex min-w-full justify-center"
                      >
                        <div className="w-full max-w-md">
                          <PaymentMethodCard
                            method={method}
                            cardName={cardName}
                            cardNumber={cardNumber}
                            paypalEmail={paypalEmail}
                            isPrimary={primaryMethod === method}
                            flipped={Boolean(flippedMethods[method])}
                            onSetPrimary={() => setPrimaryMethod(method)}
                            onFlip={() =>
                              setFlippedMethods((methods) => ({
                                ...methods,
                                [method]: !methods[method],
                              }))
                            }
                            onRemove={() => removePaymentMethod(method)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next */}
                <button
                  type="button"
                  aria-label="Next payment method"
                  disabled={savedMethods.length < 2}
                  onClick={() =>
                    setActiveMethodIndex(
                      (index) => (index + 1) % savedMethods.length,
                    )
                  }
                  className="row-start-2 grid h-10 w-10 shrink-0 place-items-center justify-self-start rounded-full border border-[#e0e5ef] bg-white text-lg text-[#33405d] transition hover:border-primary hover:text-primary disabled:opacity-40 sm:row-auto sm:justify-self-auto"
                >
                  ›
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-[#dce2ee] bg-white px-4 py-6 text-center text-[11px] text-[#8993aa]">
                No saved payment methods.
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#e9edf6] bg-[#f9fafc] p-3 sm:p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#111b40]">
                  System Payment Control
                </h3>
                <p className="mt-1 text-[11px] text-[#8993aa]">
                  The platform collects buyer payments and retains only the
                  system fee.
                </p>
              </div>
              <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-700 sm:mt-0">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                No payouts
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[#e9edf6] bg-white p-3">
                <p className="text-[10px] text-[#8993aa]">System fee</p>
                <p className="mt-2 text-sm font-bold text-[#111b40]">10%</p>
              </div>
              <div className="rounded-lg border border-[#e9edf6] bg-white p-3">
                <p className="text-[10px] text-[#8993aa]">Payout status</p>
                <p className="mt-2 text-sm font-bold text-[#111b40]">
                  Not available
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#e9edf6] bg-[#f9fafc] p-3 sm:p-4">
            <h3 className="text-xs font-bold text-[#111b40]">
              Tax Information
            </h3>
            <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-2">
              <PaymentField
                id="tax-id"
                label="Tax ID (Optional)"
                value={taxId}
                onChange={setTaxId}
                placeholder="Enter your tax identification number"
              />
              <div className="flex items-end">
                <div className="flex w-full items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-[11px] font-medium text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Tax profile ready for review
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#edf0f5] pt-5 sm:flex-row sm:items-center sm:justify-end">
          {saved && (
            <span className="text-xs font-medium text-emerald-600 sm:mr-auto">
              Your payment details are up to date.
            </span>
          )}
          <button
            type="button"
            onClick={savePayment}
            className="rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(255,103,0,0.18)] transition hover:opacity-90"
          >
            Save Changes
          </button>
        </div>
      </section>

      {addMethodOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4"
          role="presentation"
          onMouseDown={() => setAddMethodOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-payment-title"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="add-payment-title"
                  className="text-base font-bold text-[#111b40]"
                >
                  Add payment method
                </h2>
                <p className="mt-1 text-xs leading-5 text-[#8993aa]">
                  Choose a supported payment method for buyers on your
                  storefront.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddMethodOpen(false)}
                aria-label="Close add payment modal"
                className="grid h-8 w-8 place-items-center rounded-lg text-lg text-[#8993aa] transition hover:bg-[#f3f6fb] hover:text-[#111b40]"
              >
                ×
              </button>
            </div>
            <div className="mt-5">
              <label
                htmlFor="add-payment-method"
                className="mb-2 block text-[11px] font-semibold text-[#33405d]"
              >
                Payment type
              </label>
              <select
                id="add-payment-method"
                value={methodToAdd}
                onChange={(event) => setMethodToAdd(event.target.value)}
                className={inputClassName}
              >
                <option>Credit Card</option>
                <option>PayPal</option>
              </select>
            </div>
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-[11px] leading-5 text-blue-700">
              The platform securely processes buyer payments. No payouts are
              created from this action.
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAddMethodOpen(false)}
                className="rounded-lg border border-[#e0e5ef] px-4 py-2.5 text-xs font-semibold text-[#33405d] transition hover:bg-[#f7f9fd]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addPaymentMethod}
                className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
              >
                Add method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
