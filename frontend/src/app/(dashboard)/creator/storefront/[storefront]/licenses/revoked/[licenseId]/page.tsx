"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PublicIcon from "@/components/icons/PublicIcon";

type LicenseDetail = {
  id: number;
  uuid?: string;
  licenseId?: number;
  key?: string;
  product?: string;
  licenseType?: string;
  productName?: string;
  status?: string;
  activatedBy?: string;
  activatedOn?: string;
  buyerEmail?: string;
  device?: string;
  location?: string;
  revokedOn?: string;
  reason?: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export default function RevokedLicenseDetailPage() {
  const { storefront: storefrontParam, licenseId: licenseUuid } = useParams<{ storefront: string; licenseId: string }>();
  const storefront = decodeURIComponent(storefrontParam);
  const router = useRouter();
  const [license, setLicense] = useState<LicenseDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = window.localStorage.getItem("marketplace-token") || "";
    fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/licenses/revoked`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load revoked license details.");
        const match = (data.rows || []).find((row: LicenseDetail) => row.uuid === licenseUuid);
        if (!match) throw new Error("Revoked license not found.");
        if (!cancelled) setLicense(match as LicenseDetail);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load revoked license details.");
      });

    return () => {
      cancelled = true;
    };
  }, [storefront, licenseUuid]);

  const backPath = `/creator/storefront/${encodeURIComponent(storefront)}/licenses/revoked`;

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : !license ? (
        <p className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">Loading revoked license details...</p>
      ) : (
        <>
          <header className="flex flex-col gap-4 border-b border-divider pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link href={backPath} className="text-xs font-medium text-primary no-underline hover:underline">Revoked Licenses</Link>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-heading sm:text-[28px]">{license.product || `License key ${license.id}`}</h1>
              <p className="mt-1 text-sm text-muted">Revocation details and restoration context.</p>
            </div>
            <button type="button" onClick={() => router.push(backPath)} className="inline-flex w-fit items-center gap-2 bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-primary-hover">
              <PublicIcon name="left" className="h-3.5 w-3.5" />Back to Revoked Licenses
            </button>
          </header>

          <section className="mt-6 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <section className="pb-2 lg:pb-6">
                <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">License information</h2>
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div><dt className="text-[11px] text-muted">License key</dt><dd className="mt-1 break-all text-sm font-medium text-body">{license.key || "-"}</dd></div>
                  <div><dt className="text-[11px] text-muted">Product</dt><dd className="mt-1 text-sm text-body">{license.product || license.productName || "-"}</dd></div>
                  <div><dt className="text-[11px] text-muted">License type</dt><dd className="mt-1 text-sm text-body">{license.licenseType || "-"}</dd></div>
                  <div><dt className="text-[11px] text-muted">Activated by</dt><dd className="mt-1 text-sm text-body">{license.activatedBy || "-"}</dd></div>
                  <div><dt className="text-[11px] text-muted">Device / browser</dt><dd className="mt-1 text-sm text-body">{license.device || "-"}</dd></div>
                  <div><dt className="text-[11px] text-muted">Location (IP)</dt><dd className="mt-1 text-sm text-body">{license.location || "-"}</dd></div>
                </dl>
              </section>
              <section className="border-t border-[#cbd7e8] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">Status</h2>
                <p className="mt-4 inline-flex rounded-md bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">{license.status || "Revoked"}</p>
                <dl className="mt-4 grid gap-4">
                  <div><dt className="text-[11px] text-muted">Buyer email</dt><dd className="mt-1 break-all text-sm text-body">{license.buyerEmail || license.activatedBy || "-"}</dd></div>
                  <div><dt className="text-[11px] text-muted">Activated on</dt><dd className="mt-1 break-all text-sm text-body">{license.activatedOn ? new Date(license.activatedOn).toLocaleString() : "-"}</dd></div>
                </dl>
              </section>
            </div>
            <section className="mt-5 border-t border-[#cbd7e8] pt-5">
              <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">Revocation details</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div><dt className="text-[11px] text-muted">Revoked on</dt><dd className="mt-1 text-sm text-body">{license.revokedOn ? new Date(license.revokedOn).toLocaleString() : "-"}</dd></div>
                <div className="sm:col-span-2"><dt className="text-[11px] text-muted">Reason</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-body">{license.reason || "No reason provided."}</dd></div>
              </dl>
            </section>
          </section>
        </>
      )}
    </div>
  );
}
