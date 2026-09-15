"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type Product = { id: number; uuid?: string; name: string; description: string; price: number; discount: number; status: string; productType: string; createdAt?: string };
type Asset = { id: number; fileName?: string; title?: string; url?: string; fileSize?: number; mimeType?: string };

export default function ProductDetailPage() {
  const { storefront: storefrontParam, productId } = useParams<{ storefront: string; productId: string }>();
  const storefront = decodeURIComponent(storefrontParam);
  const productsPath = `/creator/storefront/${encodeURIComponent(storefront)}/products`;
  const [product, setProduct] = useState<Product | null>(null);
  const [files, setFiles] = useState<Asset[]>([]);
  const [previews, setPreviews] = useState<Asset[]>([]);
  const [versions, setVersions] = useState<Array<{ id: number; version: string; summary: string; current: boolean }>>([]);
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
        const [filesResponse, previewsResponse, versionsResponse] = await Promise.all([fetch(`${base}/files`, { headers }), fetch(`${base}/previews`, { headers }), fetch(`${base}/versions`, { headers })]);
        const [fileData, previewData, versionData] = await Promise.all([filesResponse.json(), previewsResponse.json(), versionsResponse.json()]);
        setProduct(selected);
        setFiles((fileData.files ?? []).map((file: Asset) => ({ ...file, url: `${apiUrl}${file.url ?? ""}` })));
        setPreviews(previewData.previews ?? []);
        setVersions(versionData.versions ?? []);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load product details."));
  }, [productId, storefront]);

  if (error) return <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!product) return <p className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">Loading product details...</p>;

  return <div className="mx-auto w-full max-w-[1200px]"><header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><Link href={productsPath} className="text-xs text-primary no-underline hover:underline">Products</Link><h1 className="mt-2 text-2xl font-bold tracking-tight text-heading">{product.name}</h1><p className="mt-1 text-sm text-muted">Complete product details and assets.</p></div><Link href={`${productsPath}/${product.uuid ?? product.id}/edit`} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white no-underline">Edit Product</Link></header>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]"><section className="rounded-2xl border border-border bg-white p-5 shadow-sm"><h2 className="text-base font-bold text-heading">Product information</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2"><div><dt className="text-[10px] text-muted">Description</dt><dd className="mt-1 text-sm text-body">{product.description || "No description."}</dd></div><div><dt className="text-[10px] text-muted">Product type</dt><dd className="mt-1 text-sm text-body">{product.productType}</dd></div><div><dt className="text-[10px] text-muted">Price</dt><dd className="mt-1 text-sm font-semibold text-body">${Number(product.price).toFixed(2)}</dd></div><div><dt className="text-[10px] text-muted">Discount</dt><dd className="mt-1 text-sm text-body">{product.discount ?? 0}%</dd></div></dl></section><section className="rounded-2xl border border-border bg-white p-5 shadow-sm"><h2 className="text-base font-bold text-heading">Status</h2><p className="mt-4 inline-flex rounded-md bg-accent-light px-3 py-2 text-xs font-semibold text-primary">{product.status}</p><p className="mt-4 text-[10px] text-muted">Created {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "-"}</p></section></div>
    <section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm"><h2 className="text-base font-bold text-heading">Preview assets</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{previews.map((preview) => <img key={preview.id} src={preview.url} alt={preview.title || product.name} className="aspect-video w-full rounded-lg bg-surface-muted object-contain" />)}{previews.length === 0 && <p className="text-sm text-muted">No preview assets.</p>}</div></section>
    <section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm"><h2 className="text-base font-bold text-heading">Product files</h2><div className="mt-4 space-y-2">{files.map((file) => <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-border-control px-3 py-3 text-xs text-primary"><span>{file.fileName}</span><span className="text-muted">{file.mimeType}</span></a>)}{files.length === 0 && <p className="text-sm text-muted">No product files.</p>}</div></section>
    <section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm"><h2 className="text-base font-bold text-heading">Version history</h2><div className="mt-4 space-y-3">{versions.map((version) => <div key={version.id} className="flex items-start justify-between gap-4 border-b border-divider pb-3 last:border-0"><div><p className="text-sm font-semibold text-body">Version {version.version}</p><p className="mt-1 text-xs text-muted">{version.summary || "No release notes."}</p></div>{version.current && <span className="text-[10px] font-semibold text-status-success">Current</span>}</div>)}{versions.length === 0 && <p className="text-sm text-muted">No versions.</p>}</div></section>
  </div>;
}