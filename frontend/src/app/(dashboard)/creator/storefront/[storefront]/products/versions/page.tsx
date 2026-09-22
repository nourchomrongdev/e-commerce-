"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import PublicIcon from "@/components/icons/PublicIcon";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const allProductsKey = "__all_products__";
type Product = { id: number; uuid?: string; name: string; description?: string };
type Version = { id: number; version: string; summary: string; current: boolean; createdAt?: string; productKey: string; productName: string };

export default function VersionHistoryPage() {
  const { storefront: storefrontParam } = useParams<{ storefront: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storefront = decodeURIComponent(storefrontParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [productKey, setProductKey] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [debouncedProductSearch, setDebouncedProductSearch] = useState("");
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const productSuggestions = products.filter((product) => product.name.toLowerCase().includes(debouncedProductSearch.toLowerCase()));

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedProductSearch(productSearch), 300);
    return () => window.clearTimeout(timer);
  }, [productSearch]);

  const loadVersions = async (key: string, productList = products) => {
    if (!key) { setVersions([]); setLoading(false); return; }
    const token = window.localStorage.getItem("marketplace-token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const selectedProducts = key === allProductsKey ? productList : productList.filter((product) => String(product.uuid ?? product.id) === key);
      const results = await Promise.all(selectedProducts.map(async (product) => {
        const productKey = String(product.uuid ?? product.id);
        const response = await fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products/${productKey}/versions`, { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load versions.");
        const productVersions = data.versions ?? [];
        const hasCurrentVersion = productVersions.some((version: { current?: boolean }) => version.current);
        return productVersions.map((version: { id: number; version: string; releaseNotes?: string; summary?: string; current?: boolean; createdAt?: string }, index: number) => ({ ...version, summary: version.releaseNotes ?? version.summary ?? "", current: Boolean(version.current) || (!hasCurrentVersion && index === 0), productKey, productName: product.name }));
      }));
      setVersions(results.flat());
    } catch (loadError) {
      setVersions([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load versions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");
    fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then((response) => response.json()).then((data) => { const nextProducts = data.products ?? []; const requestedKey = searchParams.get("product"); const selected = nextProducts.find((product: Product) => String(product.uuid ?? product.id) === requestedKey) ?? nextProducts[0]; const key = selected ? String(selected.uuid ?? selected.id) : ""; setProducts(nextProducts); setProductKey(key); setProductSearch(selected?.name ?? ""); return { nextProducts, key }; }).then(({ nextProducts, key }) => { if (!key) { setLoading(false); return; } void loadVersions(key, nextProducts); }).catch(() => { setProducts([]); setVersions([]); setLoading(false); });
  }, [searchParams, storefront]);

  return <div className="mx-auto w-full max-w-[1120px]"><header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Version History</h1><p className="mt-1 text-sm text-muted">Track product releases and updates.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" disabled={!productKey || productKey === allProductsKey} onClick={() => router.push(`/creator/storefront/${encodeURIComponent(storefront)}/products/versions/new?product=${encodeURIComponent(productKey)}`)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"><PublicIcon name="add" className="h-3.5 w-3.5" /> Add Version</button></div></header>
    <section className="mt-6 max-w-md"><label className="relative block text-[10px] font-semibold text-muted">Product<input value={productSearch} onChange={(event) => { setProductSearch(event.target.value); setShowProductSuggestions(true); }} onFocus={() => setShowProductSuggestions(true)} onBlur={() => window.setTimeout(() => setShowProductSuggestions(false), 150)} placeholder="Search products..." className="mt-1.5 h-10 w-full rounded-lg border border-border-control bg-white px-3 text-xs" />{showProductSuggestions && <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-border-control bg-white py-1 shadow-lg"><button type="button" onMouseDown={() => { setProductKey(allProductsKey); setProductSearch("All Products"); setShowProductSuggestions(false); setLoading(true); void loadVersions(allProductsKey); }} className="block w-full px-3 py-2 text-left text-xs hover:bg-surface-muted">All Products</button>{productSuggestions.map((product) => <button type="button" key={product.id} onMouseDown={() => { const key = String(product.uuid ?? product.id); setProductKey(key); setProductSearch(product.name); setShowProductSuggestions(false); setLoading(true); void loadVersions(key); }} className="block w-full px-3 py-2 text-left text-xs hover:bg-surface-muted">{product.name}</button>)}</div>}</label></section>
    {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
    <section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">{loading ? <p className="py-10 text-center text-sm text-muted">Loading versions...</p> : versions.length ? <div className="space-y-4">{versions.map((item) => <article key={`${item.productKey}-${item.id}`} className="flex items-start gap-4 border-b border-divider pb-4 last:border-0"><span className={`mt-1 h-3 w-3 rounded-full ${item.current ? "bg-status-success" : "bg-border"}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold text-heading">Version {item.version}</h2>{item.current && <span className="rounded-md bg-status-success-surface px-2 py-1 text-[9px] font-semibold text-status-success">Current</span>}<span className="text-[10px] text-muted">{item.productName}</span></div><p className="mt-1 text-xs text-muted">{item.summary || "No release notes."}</p><p className="mt-2 text-[10px] text-muted-soft">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}</p></div><Link href={`/creator/storefront/${encodeURIComponent(storefront)}/products/${encodeURIComponent(item.productKey)}/detail?version=${encodeURIComponent(item.version)}`} aria-label={`View details for version ${item.version}`} title={`View version ${item.version}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border-control text-muted no-underline hover:border-primary hover:text-primary"><PublicIcon name="ellipsis-vertical" className="h-3.5 w-3.5" /></Link></article>)}</div> : <p className="py-10 text-center text-sm text-muted">No versions found.</p>}</section>
  </div>;
}
