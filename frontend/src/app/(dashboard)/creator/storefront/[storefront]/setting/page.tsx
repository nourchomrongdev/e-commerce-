"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { getNames } from "country-list";
import { Toast } from "@/components/ui";
import { routes } from "@/lib/routeController";

const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";

const countryOptions: string[] = getNames();

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

const timezoneOptions = [
  "UTC-12:00",
  "UTC-11:00",
  "UTC-10:00",
  "UTC-09:00",
  "UTC-08:00",
  "UTC-07:00",
  "UTC-06:00",
  "UTC-05:00",
  "UTC-04:00",
  "UTC-03:00",
  "UTC-02:00",
  "UTC-01:00",
  "UTC+00:00",
  "UTC+01:00",
  "UTC+02:00",
  "UTC+03:00",
  "UTC+04:00",
  "UTC+05:00",
  "UTC+05:30",
  "UTC+06:00",
  "UTC+07:00",
  "UTC+08:00",
  "UTC+09:00",
  "UTC+09:30",
  "UTC+10:00",
  "UTC+11:00",
  "UTC+12:00",
];

type Storefront = {
  displayName: string;
  type: string;
  description?: string;
};

const inputClassName =
  "w-full rounded-lg border border-[#e2e7f1] bg-white px-3 py-2.5 text-xs text-[#111b40] outline-none transition focus:border-primary focus:ring-2 focus:ring-[#ff6b001c]";

const defaultSocialLinks = [
  ["Website", ""],
  ["Facebook", ""],
  ["X", ""],
  ["LinkedIn", ""],
  ["YouTube", ""],
] as Array<[string, string]>;

const socialLinkPlaceholders: Record<string, string> = {
  Website: "https://yourwebsite.com",
  Facebook: "https://facebook.com/yourpage",
  X: "https://x.com/yourhandle",
  LinkedIn: "https://linkedin.com/in/yourprofile",
  YouTube: "https://youtube.com/@yourchannel",
};

function normalizeSocialLink(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function isValidSocialLink(value: string) {
  const normalizedValue = normalizeSocialLink(value);
  if (!normalizedValue) return true;

  if (/^https?:\/\/$/i.test(normalizedValue)) {
    return true;
  }

  try {
    const parsedUrl = new URL(normalizedValue);
    return (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") && Boolean(parsedUrl.hostname);
  } catch {
    return false;
  }
}

function SettingField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-semibold text-[#33405d]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClassName} ${disabled ? "cursor-not-allowed bg-[#f3f5f8] text-[#7b8194]" : ""}`}
      />
    </div>
  );
}

export default function StorefrontSettingPage({
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

  const [storefront, setStorefront] = useState<Storefront>({ displayName: "Storefront", type: "Digital Products" });
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Cambodia");
  const [timezone, setTimezone] = useState("UTC+07:00");
  const [language, setLanguage] = useState("English");
  const [siteOrigin, setSiteOrigin] = useState("");
  const [automaticStorefront, setAutomaticStorefront] = useState(false);
  const [socialLinks, setSocialLinks] = useState<Array<[string, string]>>(defaultSocialLinks);
  const [socialLinkErrors, setSocialLinkErrors] = useState<Array<string>>(defaultSocialLinks.map(() => ""));
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showIncompleteSettingsToast, setShowIncompleteSettingsToast] = useState(() => getStoredToastState("storefront-settings-toast", true));
  const [showIncompleteBrandingToast, setShowIncompleteBrandingToast] = useState(() => getStoredToastState("storefront-branding-toast", true));
  const [showIncompletePaymentToast, setShowIncompletePaymentToast] = useState(() => getStoredToastState("storefront-payment-toast", true));
  const [brandingIncomplete, setBrandingIncomplete] = useState(false);
  const [paymentIncomplete, setPaymentIncomplete] = useState(false);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  const hasIncompleteSettings = !email.trim() || !phone.trim() || !country.trim() || !timezone.trim() || !language.trim();

  useEffect(() => {
    const handleBeforeUnload = () => clearStoredToastState();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    setSiteOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    setIsEditMode(searchParams.get("edit") === "true");
  }, [searchParams]);

  const editToggleHref = isEditMode ? pathname : `${pathname}?edit=true`;

  useEffect(() => {
    if (!storefrontName) return;

    const decodedName = decodeURIComponent(storefrontName);
    const token = window.localStorage.getItem("marketplace-token");
    setIsLoading(true);

    Promise.all([
      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Unable to load storefront");
          return data.storefront || { displayName: decodedName, type: "Digital Products" };
        }),
      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/settings`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Unable to load settings");
          return data.settings || {};
        }),
      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/branding`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) return {};
          return data.branding || {};
        }),
      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}/payment`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) return {};
          return data.payment || {};
        }),
    ])
      .then(([loadedStorefront, settings, branding, payment]) => {
        setStorefront({
          displayName: loadedStorefront.displayName,
          type: loadedStorefront.type || "Digital Products",
          description: loadedStorefront.description || "",
        });

        setEmail(settings.email ?? "");
        setPhone(settings.phone ?? "");
        setCountry(settings.country ?? "Cambodia");
        setTimezone(settings.timezone ?? "UTC+07:00");
        setLanguage(settings.language ?? "English");
        setAutomaticStorefront(Boolean(settings.automaticStorefront));
        setBrandingIncomplete(!String(branding.storeName ?? "").trim() || !String(branding.description ?? "").trim());
        setPaymentIncomplete(!Array.isArray(payment.methods) || payment.methods.length === 0 || !String(payment.primaryMethod ?? "").trim());

        if (settings.socialLinks && typeof settings.socialLinks === "object") {
          const loadedLinks = defaultSocialLinks.map(([defaultName]) => {
            const existing = Object.entries(settings.socialLinks).find(([label, value]) => {
              if (!value) return false;
              const normalizedLabel = String(label).toLowerCase();
              return normalizedLabel === defaultName.toLowerCase() || (defaultName === "X" && normalizedLabel === "twitter");
            });
            return [defaultName, existing ? String(existing[1]) : ""] as [string, string];
          });
          setSocialLinks(loadedLinks);
        } else {
          setSocialLinks(defaultSocialLinks);
        }

        setSocialLinkErrors(defaultSocialLinks.map(() => ""));
      })
      .catch(() => {
        setStorefront({ displayName: decodedName, type: "Digital Products" });
      })
      .finally(() => setIsLoading(false));
  }, [storefrontName]);

  const updateSocialLink = (index: number, value: string) => {
    const normalizedValue = normalizeSocialLink(value);

    setSocialLinks((links) => links.map((link, linkIndex) => (linkIndex === index ? [link[0], normalizedValue] : link)));
    setSocialLinkErrors((errors) => errors.map((error, errorIndex) => (errorIndex === index ? "" : error)));
  };

  const saveSettings = () => {
    if (hasIncompleteSettings) {
      setShowIncompleteSettingsToast(true);
      return;
    }

    const nextErrors = socialLinks.map(([_, value]) => {
      if (!value) return "";
      return isValidSocialLink(value) ? "" : "Invalid link. Use a valid URL.";
    });

    setSocialLinkErrors(nextErrors);

    if (nextErrors.some(Boolean)) {
      return;
    }

    const token = window.localStorage.getItem("marketplace-token");
    const sanitizedSocialLinks = Object.fromEntries(
      socialLinks.map(([name, value]) => [name, normalizeSocialLink(value)]),
    );

    fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront.displayName)}/settings`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ email, phone, country, timezone, language, automaticStorefront, socialLinks: sanitizedSocialLinks }) })
      .then((response) => { if (!response.ok) throw new Error("Unable to save settings"); setSaved(true); window.setTimeout(() => setSaved(false), 2200); })
      .catch(() => setSaved(false));
  };

  const storeUrl = siteOrigin
    ? new URL(routes.marketplaceStorefront(storefront.displayName), siteOrigin).toString()
    : routes.marketplaceStorefront(storefront.displayName);

  const downloadQrCode = () => {
    const canvas = qrCodeRef.current;
    if (!canvas) return;

    const downloadLink = document.createElement("a");
    downloadLink.download = `${storefront.displayName.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`;
    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.click();
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="h-5 w-40 animate-pulse rounded bg-[#edf0f5]" />
          <div className="mt-3 h-3 w-72 animate-pulse rounded bg-[#f1f3f7]" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-xl border border-[#e9edf6] bg-[#f9fafc]" />
            ))}
          </div>
          <div className="mt-6 h-40 animate-pulse rounded-xl border border-[#e9edf6] bg-[#f9fafc]" />
        </section>
      </div>
    );
  }

  return (
    <div className="w-full">
      {hasIncompleteSettings && (
        <div className="mb-5 rounded-xl border border-[#f0d4a8] bg-[#fff7ed] px-4 py-3 text-sm text-[#7a4a08]">
          Complete your settings: add your store email, phone, country, timezone, and language.
        </div>
      )}
      <div className="fixed right-5 top-24 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
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
        {showIncompleteSettingsToast && hasIncompleteSettings && (
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
      <section className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#111b40]">Settings</h2>
            <p className="mt-1 text-xs text-[#8993aa]">Manage your store settings and preferences.</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-xs font-medium text-emerald-600">Settings saved</span>}
            <Link
              href={editToggleHref}
              className="inline-flex items-center justify-center rounded-lg border border-[#dfe3ee] bg-white px-3.5 py-2 text-[11px] font-semibold text-[#263252] transition hover:border-primary hover:text-primary"
            >
              {isEditMode ? "Done Editing" : "Edit Settings"}
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-[#e9edf6] bg-[#f9fafc] p-4">
            <h3 className="text-xs font-bold text-[#111b40]">Store Settings</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <SettingField id="store-email" label="Store Email" value={email} onChange={setEmail} type="email" disabled={!isEditMode} />
              <SettingField id="store-phone" label="Store Phone" value={phone} onChange={setPhone} type="tel" disabled={!isEditMode} />
              <div>
                <label htmlFor="store-country" className="mb-2 block text-[11px] font-semibold text-[#33405d]">Store Country</label>
                <select id="store-country" value={country} onChange={(event) => setCountry(event.target.value)} disabled={!isEditMode} className={`${inputClassName} ${!isEditMode ? "cursor-not-allowed bg-[#f3f5f8] text-[#7b8194]" : ""}`}>
                  {countryOptions.map((countryName) => (
                    <option key={countryName} value={countryName}>{countryName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="store-timezone" className="mb-2 block text-[11px] font-semibold text-[#33405d]">Store Timezone</label>
                <select id="store-timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} disabled={!isEditMode} className={`${inputClassName} ${!isEditMode ? "cursor-not-allowed bg-[#f3f5f8] text-[#7b8194]" : ""}`}>
                  {timezoneOptions.map((timezoneName) => (
                    <option key={timezoneName} value={timezoneName}>{timezoneName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="store-language" className="mb-2 block text-[11px] font-semibold text-[#33405d]">Store Language</label>
                <select id="store-language" value={language} onChange={(event) => setLanguage(event.target.value)} disabled={!isEditMode} className={`${inputClassName} ${!isEditMode ? "cursor-not-allowed bg-[#f3f5f8] text-[#7b8194]" : ""}`}>
                  <option>English</option>
                  <option>Khmer</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label htmlFor="store-url" className="mb-2 block text-[11px] font-semibold text-[#33405d]">Store URL</label>
                <input
                  id="store-url"
                  type="url"
                  value={storeUrl}
                  readOnly
                  className={`${inputClassName} cursor-default bg-[#f4f6fb] text-[#6d7a96]`}
                />
                <p className="mt-1.5 text-[11px] text-[#8993aa]">Generated automatically from your public storefront name.</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center rounded-xl border border-[#e2e7f1] bg-white p-4 text-center">
              <QRCodeCanvas ref={qrCodeRef} value={storeUrl} size={180} bgColor="#ffffff" fgColor="#111b40" includeMargin />
              <p className="mt-3 text-[11px] text-[#8993aa]">Scan to open your public storefront</p>
              <button
                type="button"
                onClick={downloadQrCode}
                className="mt-3 rounded-lg border border-[#e0e5ef] bg-white px-4 py-2 text-[11px] font-semibold text-[#33405d] transition hover:border-primary hover:text-primary"
              >
                Download QR
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#e9edf6] pt-4">
              <div>
                <p className="text-xs font-semibold text-[#263252]">Auto storefront mode</p>
                <p className="mt-1 text-[11px] text-[#8993aa]">Automatically publish new products to this storefront.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={automaticStorefront}
                aria-label="Toggle auto storefront mode"
                disabled={!isEditMode}
                onClick={() => setAutomaticStorefront((enabled) => !enabled)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${automaticStorefront ? "bg-primary" : "bg-[#dce2ee]"} ${!isEditMode ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${automaticStorefront ? "left-6" : "left-1"}`} />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#e9edf6] bg-[#f9fafc] p-4">
            <h3 className="text-xs font-bold text-[#111b40]">Social Links</h3>
            <div className="mt-4 space-y-3">
              {socialLinks.map(([name, url], index) => (
                <div key={name} className="grid gap-2 sm:grid-cols-[105px_minmax(0,1fr)] sm:items-center">
                  <label htmlFor={`social-${name}`} className="text-[11px] font-medium text-[#33405d]">{name}</label>
                  <div className="space-y-1.5">
                    <input
                      id={`social-${name}`}
                      type="text"
                      value={url}
                      disabled={!isEditMode}
                      placeholder={socialLinkPlaceholders[name] ?? "https://your-link.com"}
                      onChange={(event) => updateSocialLink(index, event.target.value)}
                      className={`${inputClassName} ${socialLinkErrors[index] ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""} ${!isEditMode ? "cursor-not-allowed bg-[#f3f5f8] text-[#7b8194]" : ""}`}
                    />
                    {socialLinkErrors[index] && (
                      <p className="text-[10px] font-medium text-red-600">{socialLinkErrors[index]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#edf0f5] pt-5">
          {saved && <span className="text-xs font-medium text-emerald-600 sm:mr-auto">Your storefront settings are up to date.</span>}
          <button
            type="button"
            onClick={saveSettings}
            disabled={!isEditMode}
            className={`rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(255,103,0,0.18)] transition ${isEditMode ? "hover:opacity-90" : "cursor-not-allowed opacity-60"}`}
          >
            Save Changes
          </button>
        </div>
      </section>
    </div>
  );
}
