"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type Product = {
  id: number;
  uuid?: string;
  name: string;
};

type Asset = {
  id: string;
  title: string;
  url: string;
};

type FileItem = {
  fileName: string;
  fileSize: number;
  mimeType?: string;
};

type Version = {
  version: string;
  releaseNotes: string;
  createdAt?: string;
  previewAssets: Asset[];
  files: FileItem[];
};

export default function VersionAssetsPage() {
  const { storefront: storefrontParam, productId, version: versionParam } = useParams<{ storefront: string; productId: string; version: string }>();
  const storefront = decodeURIComponent(storefrontParam);
  const requestedVersion = versionParam.replace(/^version/, "");
  const productsPath = `/creator/storefront/${encodeURIComponent(storefront)}/products`;
  const detailPath = `${productsPath}/${productId}/detail`;
  const [product, setProduct] = useState<Product | null>(null);
  const [version, setVersion] = useState<Version | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const productUrl = `${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products`;
    const versionsUrl = `${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products/${productId}/versions`;

    fetch(productUrl, { headers })
      .then((response) => response.json())
      .then(async (data) => {
        const selectedProduct = (data.products ?? []).find((item: Product) => item.uuid === productId || String(item.id) === productId);
        if (!selectedProduct) throw new Error("Product not found.");
        const versionsResponse = await fetch(versionsUrl, { headers });
        const versionData = await versionsResponse.json();
        if (!versionsResponse.ok) throw new Error(versionData.error || "Unable to load product assets.");
        const selectedVersion = (versionData.versions ?? []).find((item: Version) => item.version === requestedVersion);
        if (!selectedVersion) throw new Error("Product version not found.");
        setProduct(selectedProduct);
        setVersion({
          ...selectedVersion,
          previewAssets: selectedVersion.previewAssets ?? [],
          files: selectedVersion.files ?? [],
        });
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load product assets."));
  }, [productId, requestedVersion, storefront]);

  if (error) return <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!product || !version) return <p className="bg-white p-8 text-center text-sm text-muted shadow-sm">Loading product assets...</p>;

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <header className="border-b border-divider pb-5">
        <Link href={detailPath} className="text-xs font-medium text-primary no-underline hover:underline">Back to product details</Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-heading sm:text-[28px]">{product.name}</h1>
        <p className="mt-1 text-sm text-muted">Version {version.version} assets</p>
      </header>

      <section className="mt-6 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">Preview assets ({version.previewAssets.length})</h2>
            {version.previewAssets.length ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {version.previewAssets.map((asset) => (
                  <article key={asset.id} className="overflow-hidden border border-border-control">
                    <img src={asset.url} alt={asset.title || `${product.name} preview`} className="aspect-video w-full bg-surface-muted object-contain" />
                    <p className="truncate border-t border-border-control px-3 py-2 text-xs text-body">{asset.title || "Preview asset"}</p>
                  </article>
                ))}
              </div>
            ) : <p className="mt-5 text-sm text-muted">No preview assets for this version.</p>}
          </section>

          <section>
            <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">Product files ({version.files.length})</h2>
            {version.files.length ? (
              <div className="mt-5 divide-y divide-border-control border-y border-border-control">
                {version.files.map((file, index) => (
                  <div key={`${file.fileName}-${index}`} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="min-w-0 truncate text-primary">{file.fileName}</span>
                    <span className="shrink-0 text-[11px] text-muted">{file.mimeType || "File"}</span>
                  </div>
                ))}
              </div>
            ) : <p className="mt-5 text-sm text-muted">No product files for this version.</p>}
          </section>
        </div>
      </section>
    </div>
  );
}
