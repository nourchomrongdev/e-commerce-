"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import PublicIcon from "@/components/icons/PublicIcon";
import { Toast } from "@/components/ui";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
type FileRow = { id: number; fileName: string; product: string; mimeType: string; fileSize: number; createdAt?: string; url: string };

const fileIcon = { document: "file-search-corner", video: "view", image: "view", archive: "download" } as const;

export default function StorefrontFilesPage() {
  const params = useParams<{ storefront: string }>();
  const searchParams = useSearchParams();
  const storefront = decodeURIComponent(params.storefront);
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState<FileRow[]>([]);
  useEffect(() => {
    const product = searchParams.get("product");
    if (product) setSearch(product);
  }, [searchParams]);
  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products`, { headers }).then((response) => response.json()).then(async (data) => {
      const products = data.products ?? [];
      const rows = await Promise.all(products.map(async (product: { id: number; uuid?: string; name: string }) => {
        const key = product.uuid ?? product.id;
        const response = await fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products/${key}/files`, { headers });
        const result = await response.json();
        return (result.files ?? []).map((file: Omit<FileRow, "product">) => ({ ...file, product: product.name, url: `${apiUrl}${file.url}` }));
      }));
      setFiles(rows.flat());
    }).catch(() => setFiles([]));
  }, [storefront]);
  const filteredFiles = useMemo(() => files.filter((file) => `${file.fileName} ${file.product}`.toLowerCase().includes(search.toLowerCase())), [files, search]);

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Files</h1><p className="mt-1 text-sm text-muted">Manage all files used in your products.</p></div>
        <Link href={`/creator/storefront/${encodeURIComponent(storefront)}/products/new`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white no-underline shadow-sm hover:bg-primary-hover"><PublicIcon name="download" className="h-3.5 w-3.5" /> Upload Files</Link>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryCard title="Storage Used" value={`${(files.reduce((total, file) => total + file.fileSize, 0) / 1024 / 1024).toFixed(2)} MB`} detail="Across this storefront" icon="download" />
        <SummaryCard title="Total Files" value={String(files.length)} detail="Across all products" icon="file-search-corner" />
        <SummaryCard title="File Types" value={String(new Set(files.map((file) => file.mimeType)).size)} detail="Documents, videos, images, etc." icon="type" />
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-divider px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><h2 className="text-sm font-bold text-heading">Product Files</h2><label className="relative sm:w-64"><span className="sr-only">Search files</span><PublicIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-muted-faint" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search files..." className="h-9 w-full rounded-lg border border-border-control pl-9 pr-3 text-xs text-body outline-none placeholder:text-muted-faint focus:border-primary" /></label></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-xs"><thead className="bg-surface-muted text-[10px] text-muted"><tr><th className="px-6 py-3 font-medium">File Name</th><th className="py-3 font-medium">Product</th><th className="py-3 font-medium">Type</th><th className="py-3 font-medium">Size</th><th className="py-3 font-medium">Uploaded At</th><th className="px-6 py-3 text-right font-medium">Actions</th></tr></thead><tbody>{filteredFiles.map((file) => <tr key={file.id} className="border-t border-divider text-body transition hover:bg-surface-hover"><td className="px-6 py-3"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-md bg-orange-50 text-primary"><PublicIcon name="file-search-corner" className="h-4 w-4" /></span><span className="font-medium text-body-strong">{file.fileName}</span></div></td><td className="py-3 text-[10px] text-muted">{file.product}</td><td className="py-3 text-[10px] text-muted">{file.mimeType}</td><td className="py-3 text-[10px] text-muted">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</td><td className="py-3 text-[10px] text-muted">{file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "-"}</td><td className="px-6 py-3"><div className="flex justify-end gap-2"><a href={file.url} target="_blank" rel="noreferrer" aria-label={`Download ${file.fileName}`} className="grid h-7 w-7 place-items-center rounded-md border border-border-action text-muted hover:border-primary hover:text-primary"><PublicIcon name="download" className="h-3.5 w-3.5" /></a><button type="button" aria-label={`More actions for ${file.fileName}`} className="grid h-7 w-7 place-items-center rounded-md border border-border-action text-muted hover:border-primary hover:text-primary"><PublicIcon name="ellipsis-vertical" className="h-3.5 w-3.5" /></button></div></td></tr>)}</tbody></table>{filteredFiles.length === 0 && <p className="px-6 py-12 text-center text-sm text-muted">No files match your search.</p>}</div>
        <footer className="border-t border-divider px-6 py-4 text-[10px] text-muted"><span>Showing {filteredFiles.length} files</span></footer>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, detail, progress, icon }: { title: string; value: string; detail: string; progress?: string; icon: string }) { return <article className="rounded-xl border border-border bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><p className="text-[10px] font-semibold text-muted-soft">{title}</p><span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50 text-primary"><PublicIcon name={icon as any} className="h-4 w-4" /></span></div><div className="mt-2 flex items-end justify-between gap-2"><p className="text-xl font-bold text-heading">{value}</p><span className="text-[10px] text-muted">{progress ?? ""}</span></div><p className="mt-1 text-[10px] text-muted">{detail}</p>{progress && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-primary" style={{ width: progress }} /></div>}</article>; }
