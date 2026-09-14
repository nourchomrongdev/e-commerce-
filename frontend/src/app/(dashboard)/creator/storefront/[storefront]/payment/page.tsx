"use client";

import { useEffect, useState } from "react";
import PaymentMethodCard from "@/components/dashboard/PaymentMethodCard";
import { Toast } from "@/components/ui";

const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";

const getStoredToastState = (key: string, fallback: boolean) => {
  if (typeof window === "undefined") return fallback;
  const storedValue = window.sessionStorage.getItem(key);
  return storedValue === null ? fallback : storedValue === "true";
};

const clearStoredToastState = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem("storefront-branding-toast");
  window.sessionStorage.removeItem("storefront-settings-toast");
  window.sessionStorage.removeItem("storefront-payment-toast");
};

const storefrontData: Record<string, { displayName: string; type: string }> = {
  NourChomrong: { displayName: "NourChomrong", type: "Templates" },
  DevCourses: { displayName: "DevCourses", type: "Digital Products" },
  "AI Resources": { displayName: "AI Resources", type: "Bundles" },
  DesignHub: { displayName: "DesignHub", type: "UI Kits" },
};

const inputClassName =
  "w-full rounded-lg border border-[#e2e7f1] bg-white px-3 py-2.5 text-xs text-[#111b40] outline-none transition focus:border-primary focus:ring-2 focus:ring-[#ff6b001c]";

function getDetectedCardBrand(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "");

  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^(6011|65|64[4-9])/.test(digits)) return "Discover";
  if (/^3(?:0[0-5]|[68])/.test(digits)) return "Diners Club";
  if (/^35(?:2[89]|[3-8][0-9])/.test(digits)) return "JCB";

  return "Other";
}

function validateSandboxCard(cardNumber: string, expiry: string, cvv: string) {
  const digits = cardNumber.replace(/\D/g, "");

  if (digits.length < 12 || digits.length > 19) {
    return "Invalid card number length.";
  }

  if (!/^\d{2}\/\d{4}$/.test(expiry.trim())) {
    return "Expiry must be in MM/YYYY format.";
  }

  const [expiryMonthRaw, expiryYearRaw] = expiry.trim().split("/");
  const expiryMonth = Number(expiryMonthRaw);
  const expiryYear = Number(expiryYearRaw);

  if (!Number.isInteger(expiryMonth) || expiryMonth < 1 || expiryMonth > 12) {
    return "Expiry month is invalid.";
  }

  if (!Number.isInteger(expiryYear) || expiryYear < 1900 || expiryYear > 9999) {
    return "Expiry year is invalid.";
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
    return "Card is expired.";
  }

  if (!/^\d{3,4}$/.test(cvv.trim())) {
    return "CVV must be 3 or 4 digits.";
  }

  return "valid";
}

function getCardFieldErrors({
  cardNumber,
  cardExpiry,
  cardCvc,
}: {
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}) {
  const errors: Record<string, string> = {};
  const validationResult = validateSandboxCard(cardNumber, cardExpiry, cardCvc);

  if (validationResult !== "valid") {
    if (validationResult.includes("card number") || validationResult.includes("Invalid")) {
      errors.cardNumber = validationResult;
    }
    if (validationResult.includes("Expiry") || validationResult.includes("expired")) {
      errors.cardExpiry = validationResult;
    }
    if (validationResult.includes("CVV")) {
      errors.cardCvc = validationResult;
    }
  }

  return errors;
}

function PaymentField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
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
        disabled={disabled}
        className={`${inputClassName} ${disabled ? "cursor-not-allowed bg-[#f3f6fb] text-[#ccc]" : ""} ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
      />
      {error && (
        <p className="mt-1 text-[10px] font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

function CardNumberField({
  value,
  onChange,
  error,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const detectedBrand = getDetectedCardBrand(value);
  const brandText =
    detectedBrand === "Visa"
      ? "VISA"
      : detectedBrand === "Mastercard"
        ? "MC"
        : detectedBrand === "Amex"
          ? "AMEX"
          : detectedBrand === "Discover"
            ? "DISC"
            : detectedBrand === "Diners Club"
              ? "DINERS"
              : detectedBrand === "JCB"
                ? "JCB"
                : "CARD";

  const showBrand = value.replace(/\D/g, "").length > 0;

  return (
    <div>
      <label
        htmlFor="card-number"
        className="mb-2 block text-[11px] font-semibold text-[#33405d]"
      >
        Card number
      </label>
      <div className="relative">
        <input
          id="card-number"
          type="text"
          value={value}
          placeholder="4242 4242 4242 4242"
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={`${inputClassName} pr-14 ${disabled ? "cursor-not-allowed bg-[#f3f6fb] text-[#ccc]" : ""} ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
        />

        {showBrand && (
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <div className="rounded border border-[#dfe5f0] bg-[#f8fafc] px-2 py-1 text-[9px] font-bold tracking-[0.08em] text-[#1d2333]">
              {brandText}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-[10px] font-medium text-red-600">{error}</p>
      )}
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
  const [savedMethods, setSavedMethods] = useState<string[]>([]);
  const [primaryMethod, setPrimaryMethod] = useState("");
  const [provider, setProvider] = useState("PayPal");
  const [cardName, setCardName] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [stripeEmail, setStripeEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [activeMethodIndex, setActiveMethodIndex] = useState(0);
  const [flippedMethods, setFlippedMethods] = useState<Record<string, boolean>>(
    {},
  );
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const [methodToAdd, setMethodToAdd] = useState("Credit Card");
  const [taxId, setTaxId] = useState("");
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showIncompletePaymentToast, setShowIncompletePaymentToast] = useState(() => getStoredToastState("storefront-payment-toast", true));
  const [showIncompleteBrandingToast, setShowIncompleteBrandingToast] = useState(() => getStoredToastState("storefront-branding-toast", true));
  const [showIncompleteSettingsToast, setShowIncompleteSettingsToast] = useState(() => getStoredToastState("storefront-settings-toast", true));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [paymentFormError, setPaymentFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const detectedCardBrand = getDetectedCardBrand(cardNumber);
  const [brandingIncomplete, setBrandingIncomplete] = useState(false);
  const [settingsIncomplete, setSettingsIncomplete] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = () => clearStoredToastState();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const hasIncompletePayment = savedMethods.length === 0 || !primaryMethod;

  const persistPaymentSettings = async ({
    nextMethods = savedMethods,
    nextPrimaryMethod = primaryMethod,
  }: {
    nextMethods?: string[];
    nextPrimaryMethod?: string;
  } = {}) => {
    setIsSaving(true);
    const token = window.localStorage.getItem("marketplace-token");

    const nextErrors = getCardFieldErrors({
      cardNumber,
      cardExpiry,
      cardCvc,
    });

    setFieldErrors(nextErrors);
    setPaymentFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      setPaymentFormError("Please correct the highlighted fields.");
      setIsSaving(false);
      return false;
    }

    try {
      const response = await fetch(
        `${apiUrl}/creator/storefronts/${encodeURIComponent(storefront.displayName)}/payment`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            methods: nextMethods,
            primaryMethod: nextPrimaryMethod || nextMethods[0] || "",
            provider: "PayPal",
            taxId,
            paypalEmail,
            stripeEmail,
            cardNumber,
            cardExpiry,
            cardCvc,
            cardBrand: detectedCardBrand,
          }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Unable to save payment settings");
      }

      setFieldErrors({});
      setPaymentFormError(null);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  const savePayment = async () => {
    if (hasIncompletePayment) {
      setShowIncompletePaymentToast(true);
      return;
    }

    try {
      await persistPaymentSettings();
    } catch (error) {
      setSaved(false);
      setPaymentFormError(
        error instanceof Error ? error.message : "Unable to save payment settings",
      );
    }
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

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);

    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 6)}`;
  };

  const addPaymentMethod = async () => {
    const nextErrors = getCardFieldErrors({
      cardNumber,
      cardExpiry,
      cardCvc,
    });

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setPaymentFormError("Please correct the highlighted fields.");
      return;
    }

    const nextMethods = savedMethods.includes(methodToAdd)
      ? savedMethods
      : [...savedMethods, methodToAdd];
    const nextPrimaryMethod = primaryMethod || methodToAdd;

    try {
      const persisted = await persistPaymentSettings({
        nextMethods,
        nextPrimaryMethod,
      });

      if (!persisted) {
        return;
      }

      setSavedMethods(nextMethods);
      setPrimaryMethod(nextPrimaryMethod);
      setActiveMethodIndex(Math.max(nextMethods.length - 1, 0));
      setAddMethodOpen(false);
    } catch (error) {
      setSaved(false);
      setPaymentFormError(
        error instanceof Error ? error.message : "Unable to save payment settings",
      );
    }
  };

  useEffect(() => {
    if (!storefrontName) return;
    const token = window.localStorage.getItem("marketplace-token");
    const decodedName = decodeURIComponent(storefrontName);
    setIsLoading(true);

    Promise.all([
      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/payment`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) return {};
          return data.payment || {};
        }),
      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/branding`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) return {};
          return data.branding || {};
        }),
      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/settings`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) return {};
          return data.settings || {};
        }),
    ])
      .then(([payment, branding, settings]) => {
        if (payment) {
          setSavedMethods(Array.isArray(payment.methods) ? payment.methods : []);
          setPrimaryMethod(payment.primaryMethod || "");
          setProvider(payment.provider || "PayPal");
          setTaxId(payment.taxId || "");
          setCardName(payment.cardName || "");
          setPaypalEmail(payment.paypalEmail || "");
          setStripeEmail(payment.stripeEmail || "");
          setCardNumber(payment.cardNumber || "");
          setCardExpiry(payment.cardExpiry || "");
          setCardCvc(payment.cardCvc || "");
        }

        setBrandingIncomplete(!String(branding.storeName ?? "").trim() || !String(branding.description ?? "").trim());
        setSettingsIncomplete(
          !String(settings.email ?? "").trim() ||
            !String(settings.phone ?? "").trim() ||
            !String(settings.country ?? "").trim() ||
            !String(settings.timezone ?? "").trim() ||
            !String(settings.language ?? "").trim(),
        );
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, [storefrontName]);

  if (isLoading) {
    return (
      <div className="w-full min-w-0 max-w-full overflow-x-hidden">
        <section className="min-w-0 rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-[#edf0f5]" />
          <div className="mt-3 h-3 w-72 animate-pulse rounded bg-[#f1f3f7]" />
          <div className="mt-6 h-40 animate-pulse rounded-xl border border-[#e9edf6] bg-[#f9fafc]" />
          <div className="mt-6 h-40 animate-pulse rounded-xl border border-[#e9edf6] bg-[#f9fafc]" />
        </section>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      {hasIncompletePayment && (
        <div className="mb-5 rounded-xl border border-[#f0d4a8] bg-[#fff7ed] px-4 py-3 text-sm text-[#7a4a08]">
          Complete your payment setup: add at least one payment method and choose a primary method.
        </div>
      )}
      <div className="fixed right-5 top-24 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {showIncompleteBrandingToast && brandingIncomplete && (
          <Toast
            variant="warning"
            title="Incomplete branding data"
            message="Add a store name and short description to finish your storefront."
            onClose={() => {
              setShowIncompleteBrandingToast(false);
              window.sessionStorage.setItem("storefront-branding-toast", "false");
            }}
          />
        )}
        {showIncompleteSettingsToast && settingsIncomplete && (
          <Toast
            variant="warning"
            title="Incomplete settings data"
            message="Add your store email, phone, country, timezone, and language before saving settings."
            onClose={() => {
              setShowIncompleteSettingsToast(false);
              window.sessionStorage.setItem("storefront-settings-toast", "false");
            }}
          />
        )}
        {showIncompletePaymentToast && hasIncompletePayment && (
          <Toast
            variant="warning"
            title="Incomplete payment data"
            message="Add at least one payment method and choose a primary method before saving."
            onClose={() => {
              setShowIncompletePaymentToast(false);
              window.sessionStorage.setItem("storefront-payment-toast", "false");
            }}
          />
        )}
      </div>
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
                  Saved payment methods are managed through PayPal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!addMethodOpen) {
                    // Clear form when opening modal to add new payment method
                    setCardNumber("");
                    setCardExpiry("");
                    setCardCvc("");
                    setFieldErrors({});
                    setPaymentFormError(null);
                  }
                  setAddMethodOpen((open) => !open);
                }}
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
          onMouseDown={() => !isSaving && setAddMethodOpen(false)}
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
                onClick={() => !isSaving && setAddMethodOpen(false)}
                aria-label="Close add payment modal"
                disabled={isSaving}
                className={`grid h-8 w-8 place-items-center rounded-lg text-lg transition ${
                  isSaving
                    ? "cursor-not-allowed text-[#ccc]"
                    : "text-[#8993aa] hover:bg-[#f3f6fb] hover:text-[#111b40]"
                }`}
              >
                ×
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <CardNumberField
                value={cardNumber}
                onChange={(value) => {
                  setCardNumber(formatCardNumber(value));
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.cardNumber;
                    return next;
                  });
                }}
                error={fieldErrors.cardNumber}
                disabled={isSaving}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <PaymentField
                  id="card-expiry"
                  label="Expiry date"
                  value={cardExpiry}
                  onChange={(value) => {
                    setCardExpiry(formatExpiry(value));
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.cardExpiry;
                      return next;
                    });
                  }}
                  placeholder="00/0000"
                  error={fieldErrors.cardExpiry}
                  disabled={isSaving}
                />
                <PaymentField
                  id="card-cvc"
                  label="CVC"
                  value={cardCvc}
                  onChange={(value) => {
                    setCardCvc(value);
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.cardCvc;
                      return next;
                    });
                  }}
                  placeholder="123"
                  error={fieldErrors.cardCvc}
                  disabled={isSaving}
                />
              </div>
            </div>

            {isSaving && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-[11px] leading-5 text-blue-700 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border-2 border-blue-700 border-t-transparent animate-spin" />
                Saving payment method...
              </div>
            )}

            {paymentFormError && !isSaving && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] leading-5 text-red-700">
                {paymentFormError}
              </div>
            )}

            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-[11px] leading-5 text-blue-700">
              The platform securely processes buyer payments through PayPal.
              No payouts are created from this action.
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => !isSaving && setAddMethodOpen(false)}
                disabled={isSaving}
                className={`rounded-lg border border-[#e0e5ef] px-4 py-2.5 text-xs font-semibold transition ${
                  isSaving
                    ? "cursor-not-allowed bg-[#f3f6fb] text-[#ccc]"
                    : "text-[#33405d] hover:bg-[#f7f9fd]"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addPaymentMethod}
                disabled={isSaving}
                className={`rounded-lg px-4 py-2.5 text-xs font-semibold text-white transition ${
                  isSaving
                    ? "cursor-not-allowed bg-[#ff9933cc]"
                    : "bg-primary hover:opacity-90"
                }`}
              >
                {isSaving ? "Saving..." : "Add method"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
