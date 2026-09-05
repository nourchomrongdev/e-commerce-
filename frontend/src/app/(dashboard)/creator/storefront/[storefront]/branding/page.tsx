"use client";

import { useEffect, useState } from "react";
import StorefrontHeader from "@/components/dashboard/StorefrontHeader";

const storefrontData: Record<string, { displayName: string; type: string; description: string }> = {
  NourChomrong: {
    displayName: "NourChomrong",
    type: "Templates",
    description: "Professional templates and design resources for modern websites",
  },
  DevCourses: {
    displayName: "DevCourses",
    type: "Digital Products",
    description: "Online courses and resources for developers to level up their skills",
  },
  "AI Resources": {
    displayName: "AI Resources",
    type: "Bundles",
    description: "AI tools and learning bundles for everyone",
  },
  DesignHub: {
    displayName: "DesignHub",
    type: "UI Kits",
    description: "Beautiful UI kits and design systems",
  },
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

  const storefront =
    storefrontData[decodeURIComponent(storefrontName ?? "NourChomrong")] || storefrontData.DevCourses;
  const [storeName, setStoreName] = useState(storefront.displayName);
  const [description, setDescription] = useState(storefront.description);
  const [accentColor, setAccentColor] = useState("#5b6ef5");
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [bannerImage, setBannerImage] = useState("");
  const [saved, setSaved] = useState(false);

  const saveBranding = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <StorefrontHeader storefront={storefront} activeTab="Branding" />

      <div className="space-y-5">
        <section className="min-w-0 rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111b40]">Brand identity</h2>
              <p className="mt-1 text-xs text-[#8993aa]">
                Shape how customers recognize your storefront.
              </p>
            </div>
            <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 sm:mt-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Brand is live
            </span>
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
                  onChange={(event) => setStoreName(event.target.value)}
                  className="block w-full max-w-full rounded-lg border border-[#e2e7f1] bg-white px-3 py-2.5 text-sm text-[#111b40] outline-none transition focus:border-primary focus:ring-2 focus:ring-[#ff6b001c] sm:px-3.5"
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
                  onChange={(event) => setDescription(event.target.value)}
                  className="block w-full max-w-full resize-none rounded-lg border border-[#e2e7f1] bg-white px-3 py-2.5 text-sm leading-6 text-[#111b40] outline-none transition focus:border-primary focus:ring-2 focus:ring-[#ff6b001c] sm:px-3.5"
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
                    onClick={() => setBannerEnabled((enabled) => !enabled)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${bannerEnabled ? "bg-primary" : "bg-[#dce2ee]"}`}
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
                      className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#dce2ee] bg-white px-3 py-5 text-center text-xs font-medium text-[#33405d] transition hover:border-primary hover:bg-[#fffaf7]"
                    >
                      {bannerImage ? "Replace banner image" : "Choose banner image"}
                    </label>
                    <input
                      id="store-banner-image"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
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
                    className="w-full shrink-0 rounded-lg border border-[#e0e5ef] bg-white px-3 py-2 text-xs font-medium text-[#33405d] transition hover:bg-[#f3f6fb] sm:w-auto"
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
                    onChange={(event) => setAccentColor(event.target.value)}
                    className="h-11 w-11 cursor-pointer rounded-lg border-0 bg-transparent p-0"
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
                      onClick={() => setAccentColor(color.value)}
                      className={`h-8 w-8 rounded-lg border-2 transition ${accentColor === color.value ? "border-storefront-navy ring-2 ring-[#dfe4f0]" : "border-white shadow-sm"}`}
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
              className="rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(255,103,0,0.18)] transition hover:opacity-90"
            >
              Save branding
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
