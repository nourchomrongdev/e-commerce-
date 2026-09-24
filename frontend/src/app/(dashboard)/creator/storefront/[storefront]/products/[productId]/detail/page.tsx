"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type Product = {
  id: number;
  uuid?: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  discount: number;
  status: string;
  productType: string;
  createdAt?: string;
};
type Version = {
  id: number;
  version: string;
  price: number;
  releaseNotes: string;
  current: boolean;
  createdAt?: string;
  licenses?: Array<{ name: string; access?: string }>;
  files: Array<{ fileName: string; fileSize: number; mimeType?: string }>;
  previewAssets: Array<{ id: string; title: string; type: string; url: string }>;
};

export default function ProductDetailPage() {
  const { storefront: storefrontParam, productId } = useParams<{ storefront: string; productId: string }>();
  const searchParams = useSearchParams();
  const requestedVersion = searchParams.get("version");
  const storefront = decodeURIComponent(storefrontParam);
  const productsPath = `/creator/storefront/${encodeURIComponent(storefront)}/products`;
  const [product, setProduct] = useState<Product | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const base = `${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products/${productId}`;
    fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products`, { headers })
      .then((response) => response.json())
      .then(async (data) => {
        const selected = (data.products ?? []).find((item: Product) => item.uuid === productId || String(item.id) === productId);
        if (!selected) throw new Error("Product not found.");
        const versionsResponse = await fetch(`${base}/versions`, { headers });
        const versionData = await versionsResponse.json();
        if (!versionsResponse.ok) throw new Error(versionData.error || "Unable to load product versions.");
        setProduct(selected);
        const productVersions = versionData.versions ?? [];
        const hasCurrentVersion = productVersions.some((version: Version) => version.current);
        setVersions(productVersions
          .map((version: Version, index: number) => ({
            ...version,
            current: Boolean(version.current) || (!hasCurrentVersion && index === 0),
            licenses: version.licenses ?? [],
            files: version.files ?? [],
            previewAssets: version.previewAssets ?? [],
          }))
          .filter((version: Version) => !requestedVersion || version.version === requestedVersion));
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load product details."));
  }, [productId, storefront, requestedVersion]);

  if (error) return <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!product) return <p className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">Loading product details...</p>;

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <header className="flex flex-col gap-4 border-b border-divider pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href={productsPath} className="text-xs font-medium text-primary no-underline hover:underline">Products</Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-heading sm:text-[28px]">{product.name}</h1>
          <p className="mt-1 text-sm text-muted">Complete product details and assets.</p>
        </div>
        <Link href={`${productsPath}/${product.uuid ?? product.id}/edit`} className="inline-flex w-fit items-center bg-primary px-4 py-2.5 text-xs font-semibold text-white no-underline transition hover:bg-primary-hover">Edit Product</Link>
      </header>
      <section className="mt-6 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <section className="pb-2 lg:pb-6">
          <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">Product information</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><dt className="text-[11px] text-muted">Short description</dt><dd className="mt-1 text-sm text-body">{product.shortDescription || "No short description."}</dd></div>
            <div className="sm:col-span-2"><dt className="text-[11px] text-muted">Description</dt><dd className="mt-1 text-sm leading-6 text-body">{product.description || "No description."}</dd></div>
            <div><dt className="text-[11px] text-muted">Product type</dt><dd className="mt-1 text-sm text-body">{product.productType}</dd></div>
            <div><dt className="text-[11px] text-muted">Price</dt><dd className="mt-1 text-sm font-semibold text-heading">${Number(product.price).toFixed(2)}</dd></div>
            <div><dt className="text-[11px] text-muted">Discount</dt><dd className="mt-1 text-sm text-body">{product.discount ?? 0}%</dd></div>
          </dl>
          </section>
          <section className="border-t border-[#cbd7e8] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">Status</h2>
          <p className="mt-4 inline-flex rounded-md bg-accent-light px-3 py-2 text-xs font-semibold text-primary">{product.status}</p>
          <p className="mt-4 text-[10px] text-muted">Created {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "-"}</p>
          </section>
        </div>
      <section className="mt-6 border-t border-[#cbd7e8] pt-6">
        <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">Product versions</h2>
        <div className="mt-4 space-y-5">
          {versions.map((version) => (
            <article key={version.id} className="border-b border-[#cbd7e8] pb-5 last:border-b-0">
              <header className="flex flex-wrap items-start justify-between gap-3 bg-surface-muted px-3 py-3">
                <div>
                  <div className="flex items-center gap-2"><h3 className="text-sm font-bold text-heading">Version {version.version}</h3>{version.current && <span className="rounded-md bg-status-success-surface px-2 py-1 text-[9px] font-semibold text-status-success">Current</span>}</div>
                  <p className="mt-1 text-xs text-muted">{version.releaseNotes || "No release notes."}</p>
                  <p className="mt-1 text-[10px] text-muted-soft">{version.createdAt ? new Date(version.createdAt).toLocaleString() : "-"}</p>
                </div>
              </header>
              <div className="grid gap-5 pt-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="border-b border-divider pb-4 lg:col-span-2">
                  <h4 className="text-xs font-bold text-heading">Supported licenses</h4>
                  <p className="mt-2 text-xs text-body">{version.licenses?.length ? version.licenses.map((license) => `${license.name} License`).join(", ") : "No licenses selected."}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-xs font-bold text-heading">Preview assets ({version.previewAssets.length})</h4>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-xs font-bold text-heading">Product files ({version.files.length})</h4>
                    <Link href={`${productsPath}/${product.uuid ?? product.id}/detail/version${version.version}/assets`} className="text-xs font-semibold text-primary no-underline hover:underline">View all</Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {versions.length === 0 && <p className="py-4 text-sm text-muted">No versions.</p>}
        </div>
      </section>
      </section>
    </div>
  );
}
