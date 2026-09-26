"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PublicIcon from "@/components/icons/PublicIcon";

type LicenseTypeDetails = {
  id: number;
  name: string;
  description: string;
  duration: string;
  maxDevices: string;
  status: string;
  licenseRules: string;
};
type LicenseRuleDetails = { name: string; description: string };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export default function LicenseTypeDetailsPage() {
  const { storefront: storefrontParam, licenseTypeId } = useParams<{ storefront: string; licenseTypeId: string }>();
  const storefront = decodeURIComponent(storefrontParam);
  const router = useRouter();
  const [license, setLicense] = useState<LicenseTypeDetails | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = window.localStorage.getItem("marketplace-token") || "";
    void fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/licenses/types`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load license details.");
        const row = (data.rows || []).find((item: LicenseTypeDetails) => item.id === Number(licenseTypeId));
        if (!row) throw new Error("License type not found.");
        if (!cancelled) setLicense(row);
      })
      .catch((loadError) => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load license details."); });
    return () => { cancelled = true; };
  }, [storefront, licenseTypeId]);

  const backToTypes = () => router.push(`/creator/storefront/${encodeURIComponent(storefront)}/licenses/types`);
  let licenseRules: LicenseRuleDetails[] = [];
  if (license?.licenseRules) {
    try { licenseRules = JSON.parse(license.licenseRules); }
    catch { licenseRules = license.licenseRules === "No rules linked" ? [] : license.licenseRules.split(/\r?\n/).map((name) => ({ name, description: "" })); }
  }

  return <div className="mx-auto w-full max-w-[1200px]">
    {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : !license ? <p className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">Loading license details...</p> : <>
      <header className="flex flex-col gap-4 border-b border-divider pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div><Link href={`/creator/storefront/${encodeURIComponent(storefront)}/licenses/types`} className="text-xs font-medium text-primary no-underline hover:underline">License Types</Link><h1 className="mt-2 text-2xl font-bold tracking-tight text-heading sm:text-[28px]">{license.name}</h1><p className="mt-1 text-sm text-muted">Complete license details and all rules that apply to this type.</p></div>
        <button type="button" onClick={backToTypes} className="inline-flex w-fit items-center gap-2 bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-primary-hover"><PublicIcon name="left" className="h-3.5 w-3.5" />Back to License Types</button>
      </header>
      <section className="mt-6 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <section className="pb-2 lg:pb-5">
            <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">License information</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div><dt className="text-[11px] text-muted">License name</dt><dd className="mt-1 text-sm font-semibold text-heading">{license.name}</dd></div>
              <div><dt className="text-[11px] text-muted">Duration</dt><dd className="mt-1 text-sm text-body">{license.duration}</dd></div>
              <div><dt className="text-[11px] text-muted">Max devices</dt><dd className="mt-1 text-sm text-body">{license.maxDevices}</dd></div>
              <div className="sm:col-span-2"><dt className="text-[11px] text-muted">License text</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-body">{license.description || "No license text provided."}</dd></div>
            </dl>
          </section>
          <section className="border-t border-[#cbd7e8] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">Status</h2><p className="mt-4 inline-flex rounded-md bg-accent-light px-3 py-2 text-xs font-semibold text-primary">{license.status}</p>
          </section>
        </div>
        <section className="mt-5 border-t border-[#cbd7e8] pt-5">
          <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">License rules ({licenseRules.length})</h2>
          <p className="mt-2 text-xs text-muted">Every rule assigned to this license type, with its description.</p>
          {licenseRules.length ? <ul className="mt-3 divide-y divide-divider">{licenseRules.map((rule, index) => <li key={`${rule.name}-${index}`} className="py-3 first:pt-1"><h3 className="text-sm font-semibold text-heading">{rule.name}</h3><p className="mt-1 text-sm leading-6 text-body">{rule.description || "No description provided."}</p></li>)}</ul> : <p className="py-4 text-sm text-muted">No rules linked to this license type.</p>}
        </section>
      </section>
    </>}
  </div>;
}
