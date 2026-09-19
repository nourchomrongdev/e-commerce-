"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type Product = { id: number; uuid?: string; name: string; description: string; price: number; discount: number; status: string; productType: string; createdAt?: string };
type Version = { id: number; version: string; releaseNotes: string; current: boolean; createdAt?: string; files: Array<{ fileName: string; fileSize: number; mimeType?: string }>; previewAssets: Array<{ id: string; title: string; type: string; url: string }> };

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
        setVersions(productVersions.map((version: Version, index: number) => ({ ...version, current: Boolean(version.current) || (!hasCurrentVersion && index === 0), files: version.files ?? [], previewAssets: version.previewAssets ?? [] })).filter((version: Version) => !requestedVersion || version.version === requestedVersion));
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load product details."));
  }, [productId, storefront]);

  if (error) return <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!product) return <p className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">Loading product details...</p>;

  return <div className="mx-auto w-full max-w-[1200px]"><header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><Link href={productsPath} className="text-xs text-primary no-underline hover:underline">Products</Link><h1 className="mt-2 text-2xl font-bold tracking-tight text-heading">{product.name}</h1><p className="mt-1 text-sm text-muted">Complete product details and assets.</p></div><Link href={`${productsPath}/${product.uuid ?? product.id}/edit`} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white no-underline">Edit Product</Link></header>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]"><section className="rounded-2xl border border-border bg-white p-5 shadow-sm"><h2 className="text-base font-bold text-heading">Product information</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2"><div><dt className="text-[10px] text-muted">Description</dt><dd className="mt-1 text-sm text-body">{product.description || "No description."}</dd></div><div><dt className="text-[10px] text-muted">Product type</dt><dd className="mt-1 text-sm text-body">{product.productType}</dd></div><div><dt className="text-[10px] text-muted">Price</dt><dd className="mt-1 text-sm font-semibold text-body">${Number(product.price).toFixed(2)}</dd></div><div><dt className="text-[10px] text-muted">Discount</dt><dd className="mt-1 text-sm text-body">{product.discount ?? 0}%</dd></div></dl></section><section className="rounded-2xl border border-border bg-white p-5 shadow-sm"><h2 className="text-base font-bold text-heading">Status</h2><p className="mt-4 inline-flex rounded-md bg-accent-light px-3 py-2 text-xs font-semibold text-primary">{product.status}</p><p className="mt-4 text-[10px] text-muted">Created {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "-"}</p></section></div>
    <section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm"><h2 className="text-base font-bold text-heading">Product versions</h2><div className="mt-4 space-y-5">{versions.map((version) => <article key={version.id} className="overflow-hidden rounded-xl border border-border-control"><header className="flex flex-wrap items-start justify-between gap-3 bg-surface-muted px-4 py-3"><div><div className="flex items-center gap-2"><h3 className="text-sm font-bold text-heading">Version {version.version}</h3>{version.current && <span className="rounded-md bg-status-success-surface px-2 py-1 text-[9px] font-semibold text-status-success">Current</span>}</div><p className="mt-1 text-xs text-muted">{version.releaseNotes || "No release notes."}</p><p className="mt-1 text-[10px] text-muted-soft">{version.createdAt ? new Date(version.createdAt).toLocaleString() : "-"}</p></div></header><div className="grid gap-5 p-4 lg:grid-cols-[1.2fr_0.8fr]"><div><h4 className="text-xs font-bold text-heading">Preview assets ({version.previewAssets.length})</h4>{version.previewAssets.length ? <div className="mt-3 grid gap-3 sm:grid-cols-2">{version.previewAssets.map((preview) => <div key={preview.id} className="overflow-hidden rounded-lg border border-border-control"><img src={preview.url} alt={preview.title || `${product.name} ${version.version}`} className="aspect-video w-full bg-surface-muted object-contain" /><p className="truncate px-2 py-2 text-[10px] text-body">{preview.title || "Preview asset"}</p></div>)}</div> : <p className="mt-3 text-xs text-muted">No preview assets for this version.</p>}</div><div><h4 className="text-xs font-bold text-heading">Product files ({version.files.length})</h4>{version.files.length ? <div className="mt-3 space-y-2">{version.files.map((file, index) => <div key={`${file.fileName}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-border-control px-3 py-2 text-xs"><span className="min-w-0 truncate text-primary">{file.fileName}</span><span className="shrink-0 text-[10px] text-muted">{file.mimeType || "File"}</span></div>)}</div> : <p className="mt-3 text-xs text-muted">No product files for this version.</p>}</div></div></article>)}{versions.length === 0 && <p className="py-4 text-sm text-muted">No versions.</p>}</div></section>
  </div>;
}