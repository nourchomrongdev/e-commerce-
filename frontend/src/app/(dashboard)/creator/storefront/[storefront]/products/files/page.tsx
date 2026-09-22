"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PublicIcon from "@/components/icons/PublicIcon";
import { MetricTile } from "@/components/ui";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
type Product = { id: number; uuid?: string; name: string };
type Version = { id: number; version: string };
type FileRow = { id: string; productId: number; productKey: string; productVersionId?: number; fileName: string; product: string; mimeType: string; fileSize: number; createdAt?: string; url: string };

export default function StorefrontFilesPage() {
  const params = useParams<{ storefront: string }>();
  const storefront = decodeURIComponent(params.storefront);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [editing, setEditing] = useState<FileRow | null>(null);
  const [actionFile, setActionFile] = useState<FileRow | null>(null);
  const [fileName, setFileName] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const token = typeof window === "undefined" ? "" : window.localStorage.getItem("marketplace-token") || "";
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const productUrl = (productKey: string, suffix = "") => `${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products/${productKey}${suffix}`;

  useEffect(() => {
    const modalOpen = Boolean(actionFile || editing);
    document.body.dataset.modalOpen = modalOpen ? "true" : "false";
    window.dispatchEvent(new CustomEvent("creator-modal-state", { detail: modalOpen }));
    return () => {
      delete document.body.dataset.modalOpen;
      window.dispatchEvent(new CustomEvent("creator-modal-state", { detail: false }));
    };
  }, [actionFile, editing]);

  const loadFiles = async () => {
    const response = await fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products`, { headers });
    const data = await response.json();
    const loadedProducts: Product[] = data.products ?? [];
    const rows = await Promise.all(loadedProducts.map(async (product) => {
      const key = String(product.uuid ?? product.id);
      const result = await (await fetch(productUrl(key, "/files"), { headers })).json();
      return (result.files ?? []).map((file: Omit<FileRow, "product" | "productId" | "productKey">) => ({ ...file, productId: product.id, productKey: key, product: product.name, url: `${apiUrl}${file.url}` }));
    }));
    setFiles(rows.flat());
  };

  useEffect(() => { loadFiles().catch(() => setError("Unable to load product files.")); }, [storefront]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);
  const filteredFiles = useMemo(() => files.filter((file) => `${file.fileName} ${file.product}`.toLowerCase().includes(debouncedSearch.toLowerCase())), [files, debouncedSearch]);
  const suggestions = useMemo(() => files.filter((file) => `${file.fileName} ${file.product}`.toLowerCase().includes(debouncedSearch.toLowerCase())).slice(0, 8), [files, debouncedSearch]);
  const renameFile = async () => {
    if (!editing || !fileName.trim()) return;
    const response = await fetch(productUrl(editing.productKey, `/files/${editing.id}`), { method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ fileName }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to rename file.");
    setFiles((current) => current.map((file) => file.id === editing.id ? { ...file, fileName: result.file.fileName } : file)); setEditing(null); setNotice("File name updated.");
  };
  const deleteFile = async (file: FileRow) => {
    if (!window.confirm(`Delete ${file.fileName}?`)) return;
    const response = await fetch(productUrl(file.productKey, `/files/${file.id}`), { method: "DELETE", headers });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to delete file.");
    setFiles((current) => current.filter((item) => item.id !== file.id)); setNotice("File deleted.");
  };

  return <div className="mx-auto w-full max-w-[1400px]">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Files</h1><p className="mt-1 text-sm text-muted">Manage all files used in your products.</p></div><Link href={`/creator/storefront/${encodeURIComponent(storefront)}/products/files/new`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white no-underline shadow-sm hover:bg-primary-hover"><PublicIcon name="download" className="h-3.5 w-3.5" /> Upload Files</Link></header>
    {(error || notice) && <p role="alert" className={`mt-4 rounded-lg border px-4 py-3 text-xs ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>{error || notice}</p>}
    <section className="mt-5 grid gap-4 md:grid-cols-3"><MetricTile label="Storage Used" value={`${(files.reduce((total, file) => total + file.fileSize, 0) / 1024 / 1024).toFixed(2)} MB`} change="Across this storefront" icon={<PublicIcon name="download" className="h-5 w-5" />} /><MetricTile label="Total Files" value={String(files.length)} change="Across all products" icon={<PublicIcon name="file-search-corner" className="h-5 w-5" />} /><MetricTile label="File Types" value={String(new Set(files.map((file) => file.mimeType)).size)} change="Documents, videos, images, etc." icon={<PublicIcon name="type" className="h-5 w-5" />} /></section>
    <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-sm"><div className="flex justify-between border-b border-divider px-5 py-4"><h2 className="text-sm font-bold text-heading">Product Files</h2><div className="relative"><input value={search} onChange={(event) => { setSearch(event.target.value); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)} placeholder="Search files..." className="h-9 rounded-lg border border-border-control px-3 text-xs" />{showSuggestions && <div className="absolute right-0 z-20 mt-1 max-h-52 w-72 overflow-y-auto rounded-lg border border-border-control bg-white py-1 shadow-lg">{suggestions.map((file) => <button type="button" key={file.id} onMouseDown={() => { setSearch(file.fileName); setShowSuggestions(false); }} className="block w-full px-3 py-2 text-left text-xs hover:bg-surface-muted"><span className="block truncate">{file.fileName}</span><span className="block text-[10px] text-muted">{file.product}</span></button>)}{suggestions.length === 0 && <p className="px-3 py-2 text-xs text-muted">No matching files.</p>}</div>}</div></div><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-xs"><thead className="bg-surface-muted text-[10px] text-muted"><tr><th className="px-6 py-3">File Name</th><th>Product</th><th>Type</th><th>Size</th><th>Uploaded At</th><th className="px-6 py-3 text-right">Actions</th></tr></thead><tbody>{filteredFiles.map((file) => <tr key={file.id} className="border-t border-divider"><td className="px-6 py-3 font-medium">{file.fileName}</td><td className="text-[10px] text-muted">{file.product}</td><td className="text-[10px] text-muted">{file.mimeType}</td><td className="text-[10px] text-muted">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</td><td className="text-[10px] text-muted">{file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "-"}</td><td className="px-6 py-3"><div className="flex justify-end"><button type="button" onClick={() => setActionFile(file)} aria-label={`Actions for ${file.fileName}`} className="grid h-7 w-7 place-items-center rounded-md border border-border-action text-muted hover:border-primary hover:text-primary"><PublicIcon name="ellipsis-vertical" className="h-3.5 w-3.5" /></button></div></td></tr>)}</tbody></table></div><footer className="border-t border-divider px-6 py-4 text-[10px] text-muted">Showing {filteredFiles.length} files</footer></section>
    {actionFile && <div className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto bg-[#111b40]/55 p-4" onMouseDown={() => setActionFile(null)}><div className="w-full max-w-xs rounded-xl bg-white p-5 shadow-xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-heading">File actions</h2><button type="button" onClick={() => setActionFile(null)} aria-label="Close actions" className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-surface-muted"><PublicIcon name="close" className="h-4 w-4" /></button></div><p className="mt-2 truncate text-xs text-muted">{actionFile.fileName}</p><div className="mt-4 grid gap-2"><a href={actionFile.url} target="_blank" rel="noreferrer" onClick={() => setActionFile(null)} className="flex items-center gap-2 rounded-lg border border-border-control px-3 py-2 text-xs text-body hover:border-primary"><PublicIcon name="download" className="h-4 w-4 text-primary" /> Download</a><button type="button" onClick={() => { setEditing(actionFile); setFileName(actionFile.fileName); setActionFile(null); }} className="flex items-center gap-2 rounded-lg border border-border-control px-3 py-2 text-left text-xs text-body hover:border-primary"><PublicIcon name="edit" className="h-4 w-4 text-primary" /> Edit file name</button><button type="button" onClick={() => { setActionFile(null); deleteFile(actionFile).catch((deleteError) => setError(deleteError instanceof Error ? deleteError.message : "Unable to delete file.")); }} className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-left text-xs text-status-danger hover:bg-red-50"><PublicIcon name="delete" className="h-4 w-4" /> Delete file</button></div></div></div>}
    {editing && <div className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto bg-[#111b40]/55 p-4"><div className="w-full max-w-sm rounded-xl bg-white p-5"><h2 className="text-sm font-bold">Edit file name</h2><input value={fileName} onChange={(event) => setFileName(event.target.value)} className="mt-4 h-9 w-full rounded-lg border border-border-control px-3 text-xs" /><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded-lg border px-3 py-2 text-xs">Cancel</button><button type="button" onClick={() => renameFile().catch((renameError) => setError(renameError instanceof Error ? renameError.message : "Unable to rename file."))} className="rounded-lg bg-primary px-3 py-2 text-xs text-white">Save</button></div></div></div>}
  </div>;
}
