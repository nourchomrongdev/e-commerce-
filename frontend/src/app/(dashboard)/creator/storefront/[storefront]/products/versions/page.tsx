"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import PublicIcon from "@/components/icons/PublicIcon";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
type Product = { id: number; uuid?: string; name: string; description?: string };
type Version = { id: number; version: string; summary: string; current: boolean; createdAt?: string };

export default function VersionHistoryPage() {
  const { storefront: storefrontParam } = useParams<{ storefront: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storefront = decodeURIComponent(storefrontParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [productKey, setProductKey] = useState("");
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVersions = async (key: string) => {
    if (!key) { setVersions([]); setLoading(false); return; }
    const token = window.localStorage.getItem("marketplace-token");
    try {
      const response = await fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products/${key}/versions`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load versions.");
      setVersions(data.versions ?? []);
    } catch (loadError) {
      setVersions([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load versions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");
    fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then((response) => response.json()).then((data) => { const nextProducts = data.products ?? []; const requestedKey = searchParams.get("product"); const selected = nextProducts.find((product: Product) => String(product.uuid ?? product.id) === requestedKey) ?? nextProducts[0]; const key = selected ? String(selected.uuid ?? selected.id) : ""; setProducts(nextProducts); setProductKey(key); void loadVersions(key); }).catch(() => { setProducts([]); setVersions([]); setLoading(false); });
  }, [searchParams, storefront]);

  return <div className="mx-auto w-full max-w-[1120px]"><header className="flex items-start justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Version History</h1><p className="mt-1 text-sm text-muted">Track product releases and updates.</p></div><button type="button" disabled={!productKey} onClick={() => router.push(`/creator/storefront/${encodeURIComponent(storefront)}/products/versions/new?product=${encodeURIComponent(productKey)}`)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"><PublicIcon name="add" className="h-3.5 w-3.5" /> Add Version</button></header>
    <section className="mt-6 max-w-md"><label className="block text-[10px] font-semibold text-muted">Product<select value={productKey} onChange={(event) => { setProductKey(event.target.value); setLoading(true); void loadVersions(event.target.value); }} className="mt-1.5 h-10 w-full rounded-lg border border-border-control bg-white px-3 text-xs">{products.map((product) => <option key={product.id} value={product.uuid ?? product.id}>{product.name}</option>)}</select></label></section>
    {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
    <section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">{loading ? <p className="py-10 text-center text-sm text-muted">Loading versions...</p> : versions.length ? <div className="space-y-4">{versions.map((item) => <article key={item.id} className="flex items-start gap-4 border-b border-divider pb-4 last:border-0"><span className={`mt-1 h-3 w-3 rounded-full ${item.current ? "bg-status-success" : "bg-border"}`} /><div><div className="flex items-center gap-2"><h2 className="text-sm font-bold text-heading">Version {item.version}</h2>{item.current && <span className="rounded-md bg-status-success-surface px-2 py-1 text-[9px] font-semibold text-status-success">Current</span>}</div><p className="mt-1 text-xs text-muted">{item.summary || "No release notes."}</p><p className="mt-2 text-[10px] text-muted-soft">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}</p></div></article>)}</div> : <p className="py-10 text-center text-sm text-muted">No versions found.</p>}</section>
  </div>;
}
