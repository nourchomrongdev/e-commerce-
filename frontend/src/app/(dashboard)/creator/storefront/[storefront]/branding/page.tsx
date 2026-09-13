"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

const brandColors = [
  { name: "Blue", token: "var(--storefront-blue)", value: "#5b6ef5" },
  { name: "Orange", token: "var(--storefront-orange)", value: "#ff6b00" },
  { name: "Teal", token: "var(--storefront-teal)", value: "#19b5a5" },
  { name: "Pink", token: "var(--storefront-pink)", value: "#ec4899" },
  { name: "Navy", token: "var(--storefront-navy)", value: "#111b40" },
];
export default function StorefrontBrandingPage({
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

  const [storefront, setStorefront] = useState<{ displayName: string; type: string; description: string } | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [accentColor, setAccentColor] = useState("#5b6ef5");
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [bannerImage, setBannerImage] = useState("");
  const [saved, setSaved] = useState(false);
  const [showIncompleteBrandingToast, setShowIncompleteBrandingToast] = useState(() => getStoredToastState("storefront-branding-toast", true));
  const [showIncompleteSettingsToast, setShowIncompleteSettingsToast] = useState(() => getStoredToastState("storefront-settings-toast", true));
  const [showIncompletePaymentToast, setShowIncompletePaymentToast] = useState(() => getStoredToastState("storefront-payment-toast", true));
  const [isLoading, setIsLoading] = useState(true);
  const [settingsIncomplete, setSettingsIncomplete] = useState(false);
  const [paymentIncomplete, setPaymentIncomplete] = useState(false);

  const hasIncompleteBranding = !storeName.trim() || !description.trim();

  useEffect(() => {
    const handleBeforeUnload = () => clearStoredToastState();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    setIsEditMode(searchParams.get("edit") === "true");
  }, [searchParams]);

  const editToggleHref = isEditMode ? pathname : `${pathname}?edit=true`;

  useEffect(() => {
    if (!storefrontName) return;
    const token = window.localStorage.getItem("marketplace-token");
    const decodedName = decodeURIComponent(storefrontName);

    Promise.all([
      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/branding`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to load storefront branding");
        }
        return data;
      }),
      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (response) => {
        const data = await response.json();
        if (!response.ok) return {};
        return data.settings || {};
      }),
      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/payment`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (response) => {
        const data = await response.json();
        if (!response.ok) return {};
        return data.payment || {};
      }),
    ])
      .then(([brandingData, settingsData, paymentData]) => {
        const { branding, storefront: loadedStorefront } = brandingData;
        if (!branding || !loadedStorefront) return;

        setStorefront({
          displayName: loadedStorefront.displayName,
          type: loadedStorefront.type,
          description: loadedStorefront.description,
        });
        setStoreName(branding.storeName ?? loadedStorefront.displayName);
        setDescription(branding.description ?? loadedStorefront.description);
        setAccentColor(branding.accentColor ?? "#5b6ef5");
        setBannerEnabled(branding.bannerEnabled ?? true);
        setBannerImage(branding.bannerImage ?? "");

        setSettingsIncomplete(
          !String(settingsData.email ?? "").trim() ||
            !String(settingsData.phone ?? "").trim() ||
            !String(settingsData.country ?? "").trim() ||
            !String(settingsData.timezone ?? "").trim() ||
            !String(settingsData.language ?? "").trim(),
        );
        setPaymentIncomplete(
          !Array.isArray(paymentData.methods) ||
            paymentData.methods.length === 0 ||
            !String(paymentData.primaryMethod ?? "").trim(),
        );
      })
      .catch(() => setStorefront(null))
      .finally(() => setIsLoading(false));
  }, [storefrontName]);

  if (isLoading || !storefront) {
    const loadingStorefront = { displayName: decodeURIComponent(storefrontName ?? "Storefront"), type: "", description: "" };
    return (
      <div className="w-full min-w-0 max-w-full overflow-x-hidden">
        <section className="mt-5 min-w-0 rounded-2xl bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="h-5 w-40 animate-pulse rounded bg-[#edf0f5]" />
          <div className="mt-3 h-3 w-72 animate-pulse rounded bg-[#f1f3f7]" />
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="h-32 animate-pulse rounded-xl bg-[#f5f6fa]" />
            <div className="h-32 animate-pulse rounded-xl bg-[#f5f6fa]" />
          </div>
          {!isLoading && <p className="mt-5 text-sm text-red-600">Unable to load this storefront from the database.</p>}
        </section>
      </div>
    );
  }

  const saveBranding = () => {
    if (hasIncompleteBranding) {
      setShowIncompleteBrandingToast(true);
      return;
    }

    const token = window.localStorage.getItem("marketplace-token");
    fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront.displayName)}/branding`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ storeName, description, accentColor, bannerEnabled, bannerImage }) })
      .then((response) => { if (!response.ok) throw new Error("Unable to save branding"); setSaved(true); window.setTimeout(() => setSaved(false), 2200); })
      .catch(() => setSaved(false));
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      {hasIncompleteBranding && (
        <div className="mb-5 rounded-xl border border-[#f0d4a8] bg-[#fff7ed] px-4 py-3 text-sm text-[#7a4a08]">
          Complete your branding details: add a store name and short description.
        </div>
      )}
      <div className="fixed right-5 top-24 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {showIncompleteBrandingToast && hasIncompleteBranding && (
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
        {showIncompletePaymentToast && paymentIncomplete && (
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
      <div className="space-y-5">
        <section className="min-w-0 rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111b40]">Brand identity</h2>
              <p className="mt-1 text-xs text-[#8993aa]">
                Shape how customers recognize your storefront.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Brand is live
              </span>
              <Link
                href={editToggleHref}
                className="inline-flex items-center justify-center rounded-lg border border-[#dfe3ee] bg-white px-3.5 py-2 text-[11px] font-semibold text-[#263252] transition hover:border-primary hover:text-primary"
              >
                {isEditMode ? "Done Editing" : "Edit Branding"}
              </Link>
            </div>
          </div>

          <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="min-w-0 space-y-5">
              <div>
                <label htmlFor="store-name" className="mb-2 block text-xs font-semibold text-[#33405d]">
                  Store name
                </label>
                <input
                  id="store-name"
                  value={storeName}
                  disabled={!isEditMode}
                  onChange={(event) => setStoreName(event.target.value)}
                  className="block w-full max-w-full rounded-lg border border-[#e2e7f1] bg-white px-3 py-2.5 text-sm text-[#111b40] outline-none transition focus:border-primary focus:ring-2 focus:ring-[#ff6b001c] disabled:cursor-not-allowed disabled:bg-[#f3f5f8] disabled:text-[#7b8194] sm:px-3.5"
                />
              </div>

              <div>
                <label htmlFor="store-description" className="mb-2 block text-xs font-semibold text-[#33405d]">
                  Short description
                </label>
                <textarea
                  id="store-description"
                  rows={3}
                  value={description}
                  disabled={!isEditMode}
                  onChange={(event) => setDescription(event.target.value)}
                  className="block w-full max-w-full resize-none rounded-lg border border-[#e2e7f1] bg-white px-3 py-2.5 text-sm leading-6 text-[#111b40] outline-none transition focus:border-primary focus:ring-2 focus:ring-[#ff6b001c] disabled:cursor-not-allowed disabled:bg-[#f3f5f8] disabled:text-[#7b8194] sm:px-3.5"
                />
                <p className="mt-1.5 text-[11px] text-[#8993aa]">
                  Shown below your store name on your public storefront.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[#33405d]">Store banner</p>
                    <p className="mt-1 text-[11px] text-[#8993aa]">Highlight an announcement at the top of your storefront.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={bannerEnabled}
                    aria-label="Toggle store banner"
                    disabled={!isEditMode}
                    onClick={() => setBannerEnabled((enabled) => !enabled)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${bannerEnabled ? "bg-primary" : "bg-[#dce2ee]"} ${!isEditMode ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${bannerEnabled ? "left-6" : "left-1"}`} />
                  </button>
                </div>

                {bannerEnabled && (
                  <div className="mt-3 space-y-3 rounded-xl border border-[#e9edf6] bg-[#f9fafc] p-3">
                    <label htmlFor="store-banner-image" className="mb-2 block text-[11px] font-semibold text-[#33405d]">
                      Banner image
                    </label>
                    <label
                      htmlFor="store-banner-image"
                      className={`flex items-center justify-center rounded-lg border border-dashed border-[#dce2ee] bg-white px-3 py-5 text-center text-xs font-medium text-[#33405d] transition ${isEditMode ? "cursor-pointer hover:border-primary hover:bg-[#fffaf7]" : "cursor-not-allowed opacity-60"}`}
                    >
                      {bannerImage ? "Replace banner image" : "Choose banner image"}
                    </label>
                    <input
                      id="store-banner-image"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={!isEditMode}
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) setBannerImage(URL.createObjectURL(file));
                      }}
                    />
                    <p className="mt-1.5 text-[11px] text-[#8993aa]">PNG, JPG, or WEBP recommended at 1200 x 300px.</p>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-[#33405d]">Store logo</p>
                <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-[#dce2ee] bg-[#fafbfe] p-3 sm:flex-row sm:items-center sm:gap-4">
                  <div
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-xl text-xl font-bold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {storeName.charAt(0).toUpperCase() || "D"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#263252]">Upload a square logo</p>
                    <p className="mt-1 text-[11px] text-[#8993aa]">PNG or JPG, up to 2MB</p>
                  </div>
                  <button
                    type="button"
                    disabled={!isEditMode}
                    className={`w-full shrink-0 rounded-lg border border-[#e0e5ef] bg-white px-3 py-2 text-xs font-medium text-[#33405d] transition ${isEditMode ? "hover:bg-[#f3f6fb]" : "cursor-not-allowed opacity-60"} sm:w-auto`}
                  >
                    Choose file
                  </button>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <p className="mb-2 text-xs font-semibold text-[#33405d]">Brand color</p>
              <div className="rounded-xl border border-[#e9edf6] bg-[#f9fafc] p-4">
                <div className="flex items-center gap-3">
                  <input
                    aria-label="Brand color"
                    type="color"
                    value={accentColor}
                    disabled={!isEditMode}
                    onChange={(event) => setAccentColor(event.target.value)}
                    className={`h-11 w-11 rounded-lg border-0 bg-transparent p-0 ${isEditMode ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#263252]">Primary accent</p>
                    <p className="mt-1 font-mono text-[11px] uppercase text-[#8993aa]">{accentColor}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {brandColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      aria-label={`Use ${color.name} as brand color`}
                      disabled={!isEditMode}
                      onClick={() => setAccentColor(color.value)}
                      className={`h-8 w-8 rounded-lg border-2 transition ${accentColor === color.value ? "border-storefront-navy ring-2 ring-[#dfe4f0]" : "border-white shadow-sm"} ${!isEditMode ? "cursor-not-allowed opacity-60" : ""}`}
                      style={{ backgroundColor: color.token }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 min-w-0 overflow-hidden rounded-xl border border-[#e9edf6] bg-white">
                <div className="border-b border-[#edf0f5] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8993aa]">Live preview</p>
                </div>
                <div className="p-3 sm:p-4">
                  {bannerEnabled && bannerImage ? (
                    <img src={bannerImage} alt="Store banner preview" className="mb-3 h-16 w-full rounded-lg object-cover" />
                  ) : (
                    <div className="mb-3 flex h-16 items-center justify-center rounded-lg border border-dashed border-[#dce2ee] text-[11px] text-[#8993aa]">
                      Upload a banner image to preview it
                    </div>
                  )}
                  <div className="rounded-xl p-3 text-white sm:p-4" style={{ backgroundColor: accentColor }}>
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/20 text-sm font-bold">
                        {storeName.charAt(0).toUpperCase() || "D"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{storeName || "Your storefront"}</p>
                        <p className="mt-1 truncate text-[11px] text-white/75">{description || "Your store description"}</p>
                      </div>
                    </div>
                    <div className="mt-5 h-2 w-2/3 rounded-full bg-white/25" />
                    <div className="mt-2 h-2 w-1/2 rounded-full bg-white/15" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#edf0f5] pt-5 sm:flex-row sm:items-center sm:justify-end">
            {saved && <span className="text-xs font-medium text-emerald-600 sm:mr-auto">Branding changes saved</span>}
            <button
              type="button"
              onClick={saveBranding}
              disabled={!isEditMode}
              className={`rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(255,103,0,0.18)] transition ${isEditMode ? "hover:opacity-90" : "cursor-not-allowed opacity-60"}`}
            >
              Save branding
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
