"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import StorefrontHeader from "@/components/dashboard/StorefrontHeader";
import { routes } from "@/lib/routeController";

const storefrontData: Record<string, { displayName: string; type: string }> = {
  NourChomrong: { displayName: "NourChomrong", type: "Templates" },
  DevCourses: { displayName: "DevCourses", type: "Digital Products" },
  "AI Resources": { displayName: "AI Resources", type: "Bundles" },
  DesignHub: { displayName: "DesignHub", type: "UI Kits" },
};

const inputClassName =
  "w-full rounded-lg border border-[#e2e7f1] bg-white px-3 py-2.5 text-xs text-[#111b40] outline-none transition focus:border-primary focus:ring-2 focus:ring-[#ff6b001c]";

function SettingField({
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
      <label htmlFor={id} className="mb-2 block text-[11px] font-semibold text-[#33405d]">
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

export default function StorefrontSettingPage({
  params,
}: {
  params: { storefrontName: string };
}) {
  const storefront =
    storefrontData[decodeURIComponent(params.storefrontName)] || storefrontData.DevCourses;
  const [email, setEmail] = useState("devcourses@gmail.com");
  const [phone, setPhone] = useState("+855 12 345 678");
  const [country, setCountry] = useState("Cambodia");
  const [timezone, setTimezone] = useState("(GMT+07:00) Indochina Time (ICT)");
  const [language, setLanguage] = useState("English");
  const [siteOrigin, setSiteOrigin] = useState("");
  const [automaticStorefront, setAutomaticStorefront] = useState(false);
  const [socialLinks, setSocialLinks] = useState([
    ["Website", "https://devcourses.com"],
    ["Facebook", "https://facebook.com/devcourses"],
    ["Twitter", "https://twitter.com/devcourses"],
    ["LinkedIn", "https://linkedin.com/company/devcourses"],
    ["YouTube", "https://youtube.com/@devcourses"],
  ]);
  const [saved, setSaved] = useState(false);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setSiteOrigin(window.location.origin);
  }, []);

  const updateSocialLink = (index: number, value: string) => {
    setSocialLinks((links) => links.map((link, linkIndex) => (linkIndex === index ? [link[0], value] : link)));
  };

  const saveSettings = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
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

  return (
    <div className="w-full">
      <StorefrontHeader storefront={storefront} activeTab="Settings" />

      <section className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#111b40]">Settings</h2>
            <p className="mt-1 text-xs text-[#8993aa]">Manage your store settings and preferences.</p>
          </div>
          {saved && <span className="text-xs font-medium text-emerald-600">Settings saved</span>}
        </div>

        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-[#e9edf6] bg-[#f9fafc] p-4">
            <h3 className="text-xs font-bold text-[#111b40]">Store Settings</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <SettingField id="store-email" label="Store Email" value={email} onChange={setEmail} type="email" />
              <SettingField id="store-phone" label="Store Phone" value={phone} onChange={setPhone} type="tel" />
              <div>
                <label htmlFor="store-country" className="mb-2 block text-[11px] font-semibold text-[#33405d]">Store Country</label>
                <select id="store-country" value={country} onChange={(event) => setCountry(event.target.value)} className={inputClassName}>
                  <option>Cambodia</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Singapore</option>
                </select>
              </div>
              <div>
                <label htmlFor="store-timezone" className="mb-2 block text-[11px] font-semibold text-[#33405d]">Store Timezone</label>
                <select id="store-timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} className={inputClassName}>
                  <option>(GMT+07:00) Indochina Time (ICT)</option>
                  <option>(GMT+00:00) Greenwich Mean Time (GMT)</option>
                  <option>(GMT-05:00) Eastern Time (ET)</option>
                </select>
              </div>
              <div>
                <label htmlFor="store-language" className="mb-2 block text-[11px] font-semibold text-[#33405d]">Store Language</label>
                <select id="store-language" value={language} onChange={(event) => setLanguage(event.target.value)} className={inputClassName}>
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
                onClick={() => setAutomaticStorefront((enabled) => !enabled)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${automaticStorefront ? "bg-primary" : "bg-[#dce2ee]"}`}
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
                  <input
                    id={`social-${name}`}
                    type="url"
                    value={url}
                    onChange={(event) => updateSocialLink(index, event.target.value)}
                    className={inputClassName}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#edf0f5] pt-5">
          {saved && <span className="text-xs font-medium text-emerald-600 sm:mr-auto">Your storefront settings are up to date.</span>}
          <button type="button" onClick={saveSettings} className="rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(255,103,0,0.18)] transition hover:opacity-90">
            Save Changes
          </button>
        </div>
      </section>
    </div>
  );
}
