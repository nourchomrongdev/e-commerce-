"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import PublicIcon from "@/components/icons/PublicIcon";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
type Product = { id: number; uuid?: string; name: string; description?: string };
type PreviewUpload = { id: string; title: string; url: string };
type CropTarget = { source: string; title: string };
type CropPosition = { x: number; y: number };

const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
  reader.readAsDataURL(file);
});

const createCroppedImage = async (source: string, pixelCrop: Area) => {
  const image = new Image();
  image.src = source;
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = reject; });
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 675;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to prepare preview crop.");
  context.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88);
};

export default function NewVersionPage() {
  const { storefront: storefrontParam } = useParams<{ storefront: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storefront = decodeURIComponent(storefrontParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [productKey, setProductKey] = useState("");
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [previewUploads, setPreviewUploads] = useState<PreviewUpload[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const [crop, setCrop] = useState<CropPosition>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState<Area | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");
    fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((response) => response.json())
      .then((data) => {
        const nextProducts = data.products ?? [];
        const requestedKey = searchParams.get("product");
        const selected = nextProducts.find((product: Product) => String(product.uuid ?? product.id) === requestedKey) ?? nextProducts[0];
        setProducts(nextProducts);
        setProductKey(selected ? String(selected.uuid ?? selected.id) : "");
      })
      .catch(() => { setProducts([]); setError("Unable to load products."); });
  }, [searchParams, storefront]);

  const selectedProduct = products.find((product) => String(product.uuid ?? product.id) === productKey);
  const historyPath = `/creator/storefront/${encodeURIComponent(storefront)}/products/versions`;
  const busy = saving || uploading;

  const selectPreviews = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setError("Choose a preview image smaller than 10 MB.");
      return;
    }
    try {
      setCropTarget({ source: await readFileAsDataUrl(file), title: file.name.replace(/\.[^.]+$/, "") });
      setError("");
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : "Unable to read preview images.");
    }
  };

  const saveCrop = async () => {
    if (!cropTarget || !cropArea) return;
    try {
      const url = await createCroppedImage(cropTarget.source, cropArea);
      setPreviewUploads((current) => [...current, { id: crypto.randomUUID(), title: cropTarget.title, url }]);
      setCropTarget(null);
      setCropArea(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "Unable to crop preview image.");
    }
  };

  const addVersion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!productKey || !versionFile || !previewUploads.length) {
      setError("Choose a product file and at least one preview image for this version.");
      return;
    }
    setSaving(true);
    setUploading(true);
    setUploadProgress(0);
    setError("");
    const form = new FormData(event.currentTarget);
    const token = window.localStorage.getItem("marketplace-token");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const fileData = await readFileAsDataUrl(versionFile);
      const upload = await new Promise<{ file: { fileName: string; storageKey: string; fileSize: number; mimeType: string } }>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("POST", `${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/product-files`);
        request.setRequestHeader("Content-Type", "application/json");
        if (token) request.setRequestHeader("Authorization", `Bearer ${token}`);
        request.upload.onprogress = (progress) => { if (progress.lengthComputable) setUploadProgress(Math.round((progress.loaded / progress.total) * 100)); };
        request.onerror = () => reject(new Error("Unable to upload the product file."));
        request.onload = () => {
          try {
            const result = request.responseText ? JSON.parse(request.responseText) : {};
            if (request.status < 200 || request.status >= 300) throw new Error(result.error || "Unable to upload the product file.");
            resolve(result);
          } catch (uploadError) { reject(uploadError); }
        };
        request.send(JSON.stringify({ data: fileData, fileName: versionFile.name, mimeType: versionFile.type || "application/octet-stream" }));
      });
      setUploadProgress(100);
      setUploading(false);
      const response = await fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products/${productKey}/versions`, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify({ version: form.get("version"), summary: form.get("summary"), description: form.get("description"), current: form.get("current") === "on", files: [upload.file], previews: previewUploads.map((preview) => ({ title: preview.title, type: "image", url: preview.url })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to add version.");
      router.push(`${historyPath}?product=${encodeURIComponent(productKey)}`);
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : "Unable to add version.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setSaving(false);
    }
  };

  return <div className="mx-auto w-full max-w-6xl"><header className="flex items-start justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Add Version</h1><p className="mt-1 text-sm text-muted">Release a new file, preview images, and product description.</p></div><button type="button" disabled={busy} onClick={() => router.push(historyPath)} className="inline-flex items-center gap-2 rounded-lg border border-border-control bg-white px-3.5 py-2 text-xs font-semibold text-body disabled:cursor-wait disabled:opacity-50"><PublicIcon name="left" className="h-3.5 w-3.5" /> Version History</button></header><form onSubmit={addVersion} aria-busy={busy} className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">{uploading && versionFile && <UploadProgress fileName={versionFile.name} progress={uploadProgress} />}<fieldset disabled={busy} className="contents"><div className="flex flex-col gap-3 border-b border-divider pb-5 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-base font-bold text-heading">Product Files</h2><p className="mt-1 text-xs text-muted">Manage this product release, its downloadable file, and customer previews.</p></div></div>{error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}<article className="mt-5 overflow-hidden rounded-xl border border-border bg-white"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-divider bg-surface-muted px-4 py-3"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-light text-primary"><PublicIcon name="rotate-ccw" className="h-3.5 w-3.5" /></span><div><h3 className="text-xs font-bold text-heading">New version</h3><p className="mt-0.5 text-[10px] text-muted">{versionFile ? "1 file" : "0 files"} · {previewUploads.length} preview{previewUploads.length === 1 ? "" : "s"}</p></div></div><label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-medium text-body"><input name="current" type="radio" defaultChecked className="accent-primary" /> Set as current release</label></header><div className="p-4 sm:p-5"><div className="grid gap-4 sm:grid-cols-[180px_1fr]"><label className="block text-[11px] font-semibold text-body">Product<select value={productKey} onChange={(event) => setProductKey(event.target.value)} required className="mt-1.5 h-9 w-full rounded-lg border border-border-control bg-white px-3 text-xs font-normal outline-none focus:border-primary">{products.map((product) => <option key={product.id} value={product.uuid ?? product.id}>{product.name}</option>)}</select></label><label className="block text-[11px] font-semibold text-body">Product version<input name="version" required placeholder="e.g. 1.1.0" className="mt-1.5 h-9 w-full rounded-lg border border-border-control bg-white px-3 text-xs font-normal outline-none focus:border-primary" /></label></div><label className="mt-4 block text-[11px] font-semibold text-body">Release notes<textarea name="summary" placeholder="What changed in this version?" className="mt-1.5 w-full resize-y rounded-lg border border-border-control px-3 py-2 text-xs font-normal outline-none focus:border-primary" rows={2} /></label><div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]"><div><div className="flex items-center justify-between gap-3"><h4 className="text-xs font-bold text-heading">Product files</h4><span className="text-[10px] text-muted">Files delivered with this version</span></div><label className="mt-3 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border-control bg-surface-muted p-5 text-center hover:border-primary hover:bg-surface-hover"><PublicIcon name="download" className="h-7 w-7 text-primary" /><strong className="mt-2 text-xs text-body">Drag & drop file here</strong><span className="mt-1 text-[10px] text-muted-soft">or choose a file from your computer</span><span className="mt-3 rounded-lg border border-primary px-3 py-1.5 text-[10px] font-semibold text-primary">Upload file</span><input type="file" required onChange={(event) => setVersionFile(event.target.files?.[0] ?? null)} className="sr-only" /></label>{versionFile && <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-[10px] text-body"><PublicIcon name="file-search-corner" className="h-4 w-4 text-primary" /><span className="min-w-0 flex-1 truncate">{versionFile.name}</span><span className="text-muted">{(versionFile.size / 1024 / 1024).toFixed(1)} MB</span><button type="button" onClick={() => setVersionFile(null)} aria-label="Remove product file" className="grid h-6 w-6 place-items-center rounded-md text-muted hover:bg-red-50 hover:text-status-danger"><PublicIcon name="delete" className="h-3.5 w-3.5" /></button></div>}</div><div className="border-t border-divider pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"><div className="flex items-center justify-between gap-3"><div><h4 className="text-xs font-bold text-heading">Preview assets</h4><p className="mt-1 text-[10px] text-muted">Shown before purchase</p></div><label className="cursor-pointer rounded-lg border border-primary px-3 py-1.5 text-[10px] font-semibold text-primary hover:bg-accent-light">Add preview<input type="file" accept="image/*" onChange={selectPreviews} className="sr-only" /></label></div>{previewUploads.length ? <div className="mt-3 grid grid-cols-2 gap-2">{previewUploads.map((preview) => <div key={preview.id} className="group relative aspect-video overflow-hidden rounded-lg border border-border-control bg-white"><img src={preview.url} alt={preview.title} className="h-full w-full object-cover" /><button type="button" onClick={() => setPreviewUploads((current) => current.filter((item) => item.id !== preview.id))} aria-label={`Remove ${preview.title}`} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-md bg-white/90 text-sm font-bold text-body shadow-sm opacity-0 transition group-hover:opacity-100">x</button></div>)}</div> : <div className="mt-3 grid min-h-40 place-items-center rounded-xl border border-dashed border-border-control px-4 text-center"><span><PublicIcon name="view" className="mx-auto h-6 w-6 text-muted" /><span className="mt-2 block text-[10px] text-muted">No preview assets for this version</span></span></div>}</div></div><label className="mt-5 block text-[11px] font-semibold text-body">New description<textarea key={productKey} name="description" defaultValue={selectedProduct?.description ?? ""} placeholder="Describe what customers will receive in this release." className="mt-1.5 w-full resize-y rounded-lg border border-border-control px-3 py-2 text-xs font-normal outline-none focus:border-primary" rows={3} /></label></div></article><div className="mt-6 flex justify-between border-t border-divider pt-5"><button type="button" onClick={() => router.push(historyPath)} className="rounded-lg border border-border-control bg-white px-4 py-2 text-xs font-semibold text-body">Cancel</button><button type="submit" disabled={!productKey} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-60">{saving ? "Saving..." : "Save Version"} <PublicIcon name="check" className="h-3.5 w-3.5" /></button></div></fieldset></form>{cropTarget && <CropDialog target={cropTarget} crop={crop} zoom={zoom} cropArea={cropArea} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={setCropArea} onCancel={() => setCropTarget(null)} onSave={saveCrop} />}</div>;
}

function UploadProgress({ fileName, progress }: { fileName: string; progress: number }) { return <div className="absolute inset-0 z-10 grid place-items-center bg-white/90 p-6" role="alertdialog" aria-modal="true" aria-labelledby="version-upload-title"><section className="w-full max-w-md rounded-xl border border-border bg-white p-5 shadow-xl"><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-light text-primary"><span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" /></span><div className="min-w-0"><p id="version-upload-title" className="text-sm font-bold text-heading">Uploading product file</p><p className="mt-1 truncate text-xs text-body">{fileName}</p><p className="mt-1 text-[10px] text-muted">Please keep this page open.</p></div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-primary transition-[width] duration-150" style={{ width: `${progress}%` }} /></div><div className="mt-2 text-right text-[10px] font-semibold text-primary">{progress}%</div></section></div>; }
function CropDialog({ target, crop, zoom, cropArea, onCropChange, onZoomChange, onCropComplete, onCancel, onSave }: { target: CropTarget; crop: CropPosition; zoom: number; cropArea: Area | null; onCropChange: (position: CropPosition) => void; onZoomChange: (value: number) => void; onCropComplete: (area: Area) => void; onCancel: () => void; onSave: () => void }) { return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111b40]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="preview-crop-title"><section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"><div className="flex items-start justify-between gap-4 border-b border-divider px-5 py-4"><div><h2 id="preview-crop-title" className="text-sm font-bold text-heading">Crop preview asset</h2><p className="mt-1 text-[11px] text-muted">Position the image inside the 16:9 preview frame.</p></div><button type="button" onClick={onCancel} aria-label="Close crop dialog" className="grid h-8 w-8 place-items-center rounded-lg text-lg text-muted hover:bg-surface-control">x</button></div><div className="relative h-[min(58vw,360px)] bg-[#111b40]"><Cropper image={target.source} crop={crop} zoom={zoom} aspect={16 / 9} cropShape="rect" showGrid onCropChange={onCropChange} onZoomChange={onZoomChange} onCropComplete={(_, area) => onCropComplete(area)} /></div><div className="flex items-center gap-3 border-t border-divider px-5 py-4"><label className="flex flex-1 items-center gap-3 text-[10px] font-semibold text-muted">Zoom<input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => onZoomChange(Number(event.target.value))} className="w-full accent-primary" /></label><button type="button" onClick={onCancel} className="rounded-lg border border-border-control px-4 py-2 text-xs font-semibold text-body">Cancel</button><button type="button" onClick={onSave} disabled={!cropArea} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Save crop</button></div></section></div>; }
