"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import PublicIcon from "@/components/icons/PublicIcon";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
type Product = { id: number; uuid?: string; name: string };
type Version = { id: number; version: string };

export default function NewProductFilePage() {
  const { storefront: storefrontParam } = useParams<{ storefront: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const storefront = decodeURIComponent(storefrontParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [productKey, setProductKey] = useState(searchParams.get("product") || "");
  const [versionId, setVersionId] = useState(searchParams.get("version") || "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const token = typeof window === "undefined" ? "" : window.localStorage.getItem("marketplace-token") || "";
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const productUrl = (key: string, suffix = "") => `${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products/${key}${suffix}`;

  useEffect(() => {
    fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products`, { headers })
      .then((response) => response.json())
      .then((data) => {
        const nextProducts: Product[] = data.products ?? [];
        setProducts(nextProducts);
        if (!productKey && nextProducts[0]) setProductKey(String(nextProducts[0].uuid ?? nextProducts[0].id));
      })
      .catch(() => setError("Unable to load products."))
      .finally(() => setLoading(false));
  }, [storefront]);

  useEffect(() => {
    if (!productKey) { setVersions([]); return; }
    fetch(productUrl(productKey, "/versions"), { headers })
      .then((response) => response.json())
      .then((data) => {
        const nextVersions: Version[] = data.versions ?? [];
        setVersions(nextVersions);
        if (!nextVersions.some((version) => String(version.id) === versionId)) setVersionId(nextVersions[0] ? String(nextVersions[0].id) : "");
      })
      .catch(() => setError("Unable to load product versions."));
  }, [productKey]);

  const upload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !productKey || !versionId) { setError("Choose a product, version, and file."); return; }
    setUploading(true); setUploadProgress(1); setError("");
    try {
      const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onprogress = (event) => { if (event.lengthComputable) setUploadProgress(Math.max(1, Math.round((event.loaded / event.total) * 50))); }; reader.onload = () => { setUploadProgress(50); resolve(String(reader.result)); }; reader.onerror = () => reject(new Error("Unable to read file.")); reader.readAsDataURL(file); });
      const response = await fetch(productUrl(productKey, "/files"), { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ data, fileName: file.name, mimeType: file.type || "application/octet-stream", productVersionId: Number(versionId) }) });
      setUploadProgress(100);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to upload file.");
      router.push(`/creator/storefront/${encodeURIComponent(storefront)}/products/files?product=${encodeURIComponent(productKey)}&version=${encodeURIComponent(versionId)}`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload file.");
    } finally { setUploading(false); setUploadProgress(0); }
  };

  const selectedProduct = products.find((product) => String(product.uuid ?? product.id) === productKey);
  return <div className="mx-auto w-full max-w-[760px]">
    <header className="mb-6"><Link href={`/creator/storefront/${encodeURIComponent(storefront)}/products/files`} className="text-xs text-primary no-underline hover:underline">Files</Link><h1 className="mt-2 text-2xl font-bold tracking-tight text-heading">Upload file</h1><p className="mt-1 text-sm text-muted">Add a downloadable file to an existing product version.</p></header>
    {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</p>}
    <form onSubmit={upload} className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2"><label className="block text-xs font-semibold text-body">Product<select value={productKey} disabled={loading || uploading} onChange={(event) => { setProductKey(event.target.value); setVersionId(""); }} className="mt-1.5 h-10 w-full rounded-lg border border-border-control bg-white px-3 text-xs"><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.uuid ?? product.id}>{product.name}</option>)}</select></label><label className="block text-xs font-semibold text-body">Version<select value={versionId} disabled={!productKey || uploading} onChange={(event) => setVersionId(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border-control bg-white px-3 text-xs"><option value="">Select version</option>{versions.map((version) => <option key={version.id} value={version.id}>Version {version.version}</option>)}</select></label></div>
      <label className="mt-5 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border-control bg-surface-muted p-5 text-center hover:border-primary"><PublicIcon name="download" className="h-8 w-8 text-primary" /><strong className="mt-2 text-xs text-body">{file?.name || "Choose product file"}</strong><span className="mt-1 text-[10px] text-muted">{selectedProduct ? `Upload to ${selectedProduct.name}` : "Select a product and version first"}</span><input type="file" disabled={!productKey || !versionId || uploading} onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="sr-only" /></label>
      {uploading && <div className="mt-5" role="status" aria-live="polite"><div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-muted"><span>Uploading file...</span><span className="text-primary">{uploadProgress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-primary transition-[width] duration-150" style={{ width: `${uploadProgress}%` }} /></div></div>}
      <div className="mt-6 flex justify-end gap-2"><Link href={`/creator/storefront/${encodeURIComponent(storefront)}/products/files`} className="rounded-lg border border-border-control px-4 py-2 text-xs text-body no-underline">Cancel</Link><button type="submit" disabled={uploading || !file || !productKey || !versionId} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><PublicIcon name="download" className="h-3.5 w-3.5" />{uploading ? `Uploading ${uploadProgress}%` : "Upload file"}</button></div>
    </form>
  </div>;
}
