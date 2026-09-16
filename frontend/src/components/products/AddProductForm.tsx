"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import PublicIcon from "@/components/icons/PublicIcon";
import { Toast } from "@/components/ui";

const steps: readonly string[] = ["Basic Information", "Pricing", "Product Files", "License & Access", "Review & Publish"];
type Props = { productsPath: string; storefrontName: string };
type EditableProduct = { id: number; uuid?: string; name: string; description: string; price: number; discount: number; status: "Draft" | "Published" | "Archived"; productType: string };
type StepProps = { productType: string; setProductType: (value: string) => void; editProduct?: EditableProduct; errors?: Record<string, string> };
type PreviewAsset = { id: string; title: string; type: string; url: string };
type UploadedFile = { fileName: string; storageKey: string; fileSize: number; mimeType: string };
type ProductRelease = { id: string; version: string; releaseNotes: string; current: boolean; files: UploadedFile[]; previewAssets: PreviewAsset[] };
type ReleaseErrors = { version?: string; files?: string; previews?: string };
type CropTarget = { releaseId: string; id?: string; source: string; title: string };
type CropPosition = { x: number; y: number };
const input = "mt-1.5 h-9 w-full rounded-lg border border-border-control bg-white px-3 text-xs text-body outline-none placeholder:text-muted-faint focus:border-primary";
const select = `${input} select-chevron`;
const dropdownSelect = `${input} appearance-none select-chevron`;
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const ValidationErrorsContext = createContext<Record<string, string>>({});

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

async function readApiResponse(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(response.ok ? "The server returned an invalid response." : `Request failed (${response.status}). Is the backend running?`);
  }
}

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

export default function AddProductForm({ productsPath, storefrontName, editProduct }: Props & { editProduct?: EditableProduct }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"Draft" | "Published" | "Archived">(editProduct?.status ?? "Draft");
  const [productType, setProductType] = useState(editProduct?.productType ?? "Digital Download");
  const [freeProduct, setFreeProduct] = useState(editProduct ? editProduct.price === 0 : false);
  const [releases, setReleases] = useState<ProductRelease[]>([{ id: crypto.randomUUID(), version: "1.0.0", releaseNotes: "Initial product release.", current: true, files: [], previewAssets: [] }]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState<{ name: string; size: number; index: number; total: number } | null>(null);
  const [notice, setNotice] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [confirmSave, setConfirmSave] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [releaseErrors, setReleaseErrors] = useState<Record<string, ReleaseErrors>>({});
  const [saving, setSaving] = useState(false);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const [crop, setCrop] = useState<CropPosition>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState<Area | null>(null);
  const [reviewRevision, setReviewRevision] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stepPanelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const uploadRequestsRef = useRef<XMLHttpRequest[]>([]);
  const pendingFormRef = useRef<FormData | null>(null);
  const visibleSteps = freeProduct ? steps.filter((label) => label !== "License & Access") : steps;
  const busy = saving || uploadingFiles;
  const validateReleases = (showMessage = false) => {
    const errors = Object.fromEntries(releases.flatMap((release) => {
      const releaseError: ReleaseErrors = {};
      if (!release.version.trim()) releaseError.version = "Enter a version number.";
      if (release.files.length === 0) releaseError.files = "Add at least one product file.";
      if (release.previewAssets.length === 0) releaseError.previews = "Add at least one preview asset.";
      return Object.keys(releaseError).length ? [[release.id, releaseError]] : [];
    }));
    setReleaseErrors(errors);
    const valid = Object.keys(errors).length === 0;
    if (showMessage) setValidationError(valid ? "" : "Complete the highlighted fields for every product version.");
    return valid;
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      validateReleases();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [releases]);

  useEffect(() => {
    if (!editProduct) return;
    const token = window.localStorage.getItem("marketplace-token");
    const productKey = editProduct.uuid || editProduct.id;
    const baseUrl = `${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/products/${productKey}`;
    fetch(`${baseUrl}/versions`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then((response) => response.json()).then((data) => {
      const loadedReleases = (data.versions ?? []).map((release: ProductRelease) => ({ ...release, id: String(release.id), files: release.files ?? [], previewAssets: release.previewAssets ?? [] }));
      if (loadedReleases.length) setReleases(loadedReleases);
    }).catch(() => setError("Unable to load existing product releases."));
  }, [editProduct, storefrontName]);

  useEffect(() => {
    if (!uploadingFiles) return;
    const message = "A product file is still uploading. Leaving now will cancel the upload.";
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const popState = () => {
      if (window.confirm(`${message} Do you want to leave?`)) {
        uploadRequestsRef.current.forEach((request) => request.abort());
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("popstate", popState);
    return () => { window.removeEventListener("beforeunload", beforeUnload); window.removeEventListener("popstate", popState); };
  }, [uploadingFiles]);

  const goToNextStep = () => {
    if (visibleSteps[step] === "Product Files" && !validateReleases(true)) return;
    const panel = stepPanelRefs.current[step];
    const invalidFields = panel ? Array.from(panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea")).filter((field) => !field.checkValidity()) : [];
    const invalidField = invalidFields[0];
    if (invalidField) {
      setValidationError(`Complete the highlighted fields in ${visibleSteps[step]}.`);
      setFieldErrors(Object.fromEntries(invalidFields.map((field) => [field.name, field.validationMessage || "This field is required."])));
      invalidField.focus();
      return;
    }
    setValidationError("");
    setFieldErrors({});
    setStep((value) => value + 1);
  };
  const handleFiles = async (releaseId: string, event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selectedFiles.length) return;
    setUploadingFiles(true);
    setUploadProgress(0);
    setError("");
    const token = window.localStorage.getItem("marketplace-token");
    try {
      for (const [index, file] of selectedFiles.entries()) {
        setUploadingFile({ name: file.name, size: file.size, index: index + 1, total: selectedFiles.length });
        const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`)); reader.readAsDataURL(file); });
        const result = await new Promise<{ file: UploadedFile }>((resolve, reject) => {
          const request = new XMLHttpRequest();
          uploadRequestsRef.current.push(request);
          request.open("POST", `${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/product-files`);
          request.setRequestHeader("Content-Type", "application/json");
          if (token) request.setRequestHeader("Authorization", `Bearer ${token}`);
          request.upload.onprogress = (progress) => { if (progress.lengthComputable) setUploadProgress(Math.round((progress.loaded / progress.total) * 100)); };
          request.onerror = () => reject(new Error(`Unable to upload ${file.name}.`));
          request.onabort = () => reject(new Error("Upload cancelled."));
          request.onload = () => {
            try {
              const response = request.responseText ? JSON.parse(request.responseText) : {};
              if (request.status < 200 || request.status >= 300) throw new Error(response.error || `Unable to upload ${file.name}.`);
              resolve(response);
            } catch (uploadError) { reject(uploadError); }
          };
          request.send(JSON.stringify({ data, fileName: file.name, mimeType: file.type || "application/octet-stream" }));
        });
        setReleases((current) => current.map((release) => release.id === releaseId ? { ...release, files: [...release.files, result.file] } : release));
        setUploadProgress(100);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload product files.");
    } finally {
      uploadRequestsRef.current = [];
      setUploadingFiles(false);
      setUploadingFile(null);
      setUploadProgress(0);
    }
  };
  const handlePreviewFiles = (releaseId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropTarget({ releaseId, source: String(reader.result), title: file.name.replace(/\.[^.]+$/, "") });
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const handleReplacePreview = (releaseId: string, id: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropTarget({ releaseId, id, source: String(reader.result), title: file.name.replace(/\.[^.]+$/, "") });
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const saveCrop = async () => {
    if (!cropTarget || !cropArea) return;
    try {
      const url = await createCroppedImage(cropTarget.source, cropArea);
      setReleases((current) => current.map((release) => {
        if (release.id !== cropTarget.releaseId) return release;
        const previewAssets = cropTarget.id
          ? release.previewAssets.map((preview) => preview.id === cropTarget.id ? { ...preview, url, title: cropTarget.title } : preview)
          : [...release.previewAssets, { id: crypto.randomUUID(), title: cropTarget.title, type: "image", url }];
        return { ...release, previewAssets };
      }));
      setCropTarget(null);
      setCropArea(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "Unable to crop preview image.");
    }
  };
  const saveProduct = async (form: FormData) => {
    setConfirmSave(false);
    pendingFormRef.current = null;
    setSaving(true);
    setError("");
    const token = window.localStorage.getItem("marketplace-token");
    const productKey = editProduct?.uuid || editProduct?.id;
    try {
      const response = await fetch(editProduct ? `${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/products/${productKey}` : `${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/products`, {
        method: editProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          name: String(form.get("title") || "").trim(),
          slug: String(form.get("slug") || "").trim(),
          description: form.get("longDescription") || form.get("description"),
          categoryName: form.get("category"),
          price: freeProduct ? 0 : Number(form.get("price") || 0),
          currency: String(form.get("currency") || "USD").slice(0, 3),
          status,
          productType,
          discount: Number(form.get("discount") || form.get("existingDiscount") || editProduct?.discount || 0),
          versions: releases.map((release) => ({ id: /^\d+$/.test(release.id) ? Number(release.id) : undefined, version: release.version.trim(), releaseNotes: release.releaseNotes.trim(), current: release.current, files: release.files, previews: release.previewAssets.map((preview, index) => ({ ...preview, sortOrder: index })) })),
        }),
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.error || "Unable to save product.");
      setNotice(true);
      window.setTimeout(() => router.push(productsPath), 900);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (!submitter?.dataset.saveProduct) {
      if (step < visibleSteps.length - 1) goToNextStep();
      return;
    }
    if (step < visibleSteps.length - 1) {
      goToNextStep();
      return;
    }
    if (!validateReleases(true)) {
      setStep(visibleSteps.indexOf("Product Files"));
      return;
    }
    pendingFormRef.current = new FormData(event.currentTarget);
    setConfirmSave(true);
  };

  useEffect(() => {
    setValidationError("");
    stepRefs.current[step]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [step]);

  useEffect(() => {
    if (!confirmSave) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setConfirmSave(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmSave]);

  useEffect(() => {
    if (!editProduct) return;
    const title = document.querySelector<HTMLInputElement>('input[name="title"]');
    const description = document.querySelector<HTMLTextAreaElement>('textarea[name="description"]');
    const longDescription = document.querySelector<HTMLTextAreaElement>('textarea[name="longDescription"]');
    const price = document.querySelector<HTMLInputElement>('input[name="price"]');
    const category = document.querySelector<HTMLSelectElement>('select[name="category"]');
    const license = document.querySelector<HTMLSelectElement>('select[name="license"]');
    if (title) title.value = editProduct.name;
    if (description) description.value = editProduct.description;
    if (longDescription) longDescription.value = editProduct.description;
    if (price) price.value = String(editProduct.price);
    if (category) category.value = "Development";
    if (license) license.value = "Standard License";
  }, [editProduct]);

  return <ValidationErrorsContext.Provider value={fieldErrors}><form ref={formRef} onSubmit={submit} onInput={(event) => { const target = event.target as HTMLInputElement; const name = target.name; if (name) { setReviewRevision((value) => value + 1); setFieldErrors((current) => { if (!current[name]) return current; const next = { ...current }; delete next[name]; return next; }); } }} className="relative" aria-busy={busy}>
    {notice && <Toast variant="success" message={status === "Published" ? "Your product is now published." : "Your product has been saved as a draft."} onClose={() => setNotice(false)} />}
    {(error || validationError) && <p role="alert" className="mb-4 rounded-lg border border-status-danger/20 bg-red-50 px-4 py-3 text-xs text-status-danger">{error || validationError}</p>}
    {uploadingFiles && uploadingFile && <div className="fixed inset-0 z-[90] grid place-items-center bg-[#111b40]/55 p-4" role="alertdialog" aria-modal="true" aria-labelledby="uploading-file-title"><section className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-2xl"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-light text-primary"><span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" /></span><div className="min-w-0"><p id="uploading-file-title" className="text-sm font-bold text-heading">Uploading file</p><p className="mt-1 truncate text-xs text-body">{uploadingFile.name}</p><p className="mt-1 text-[10px] text-muted">{formatFileSize(uploadingFile.size)} · File {uploadingFile.index} of {uploadingFile.total}</p></div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-primary transition-[width] duration-150" style={{ width: `${uploadProgress}%` }} /></div><div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-muted"><span>Do not close or navigate away.</span><span className="text-primary">{uploadProgress}%</span></div></section></div>}
    <fieldset disabled={busy} className="contents">
    <input type="hidden" name="existingDiscount" value={editProduct?.discount ?? 0} />
    <div className="mb-2 flex items-center justify-between">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Product setup</p>
      <p className="text-[10px] font-semibold text-primary">Step {step + 1} of {visibleSteps.length}</p>
    </div>
    <nav className="scrollbar-hidden mb-5 flex min-w-0 snap-x items-center overflow-x-auto pb-2" aria-label="Product creation steps">
      {visibleSteps.map((label, index) => {
        const active = index === step;
        const complete = index < step;
        return (
          <div ref={(element) => { stepRefs.current[index] = element; }} key={label} className="flex min-w-[9.25rem] snap-start items-center sm:min-w-0 sm:flex-1">
            <button
              type="button"
              aria-current={active ? "step" : undefined}
              onClick={() => setStep(index)}
              className={`group flex min-w-max items-center gap-1.5 text-[9px] transition sm:text-[10px] ${active ? "font-semibold text-primary" : complete ? "font-medium text-status-success" : "text-muted"}`}
            >
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[9px] font-bold ${active ? "border-primary bg-primary text-white" : complete ? "border-status-success bg-status-success text-white" : "border-border bg-surface-control text-muted"}`}>
                {complete ? <PublicIcon name="check" className="h-3 w-3" /> : index + 1}
              </span>
              <span>{label}</span>
            </button>
            {index < visibleSteps.length - 1 && <span className={`mx-2 h-px min-w-3 flex-1 ${complete ? "bg-status-success" : "bg-border"}`} aria-hidden="true" />}
          </div>
        );
      })}
    </nav>
    {step === 1 && <label className={`mb-4 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${freeProduct ? "border-primary bg-accent-light" : "border-border bg-white hover:border-primary/50 hover:bg-surface-hover"}`}><input type="checkbox" checked={freeProduct} onChange={(event) => { setFreeProduct(event.target.checked); setReviewRevision((value) => value + 1); }} className="mt-0.5 h-5 w-5 shrink-0 accent-primary" /><span><span className="block text-sm font-bold text-heading">This is a free product</span><span className="mt-1 block text-[11px] font-normal leading-4 text-muted">Customers can access it for free. It will skip the licensing step.</span></span></label>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div ref={(element) => { stepPanelRefs.current[visibleSteps.indexOf("Basic Information")] = element; }} hidden={visibleSteps[step] !== "Basic Information"}><BasicInformation productType={productType} setProductType={setProductType} errors={fieldErrors} editProduct={editProduct} /></div>
        <div ref={(element) => { stepPanelRefs.current[visibleSteps.indexOf("Pricing")] = element; }} hidden={visibleSteps[step] !== "Pricing"}>{freeProduct ? <FreePricing /> : <Pricing errors={fieldErrors} editProduct={editProduct} />}</div>
        <div ref={(element) => { stepPanelRefs.current[visibleSteps.indexOf("Product Files")] = element; }} hidden={visibleSteps[step] !== "Product Files"}><ProductFiles releases={releases} releaseErrors={releaseErrors} uploadingFiles={uploadingFiles} onFiles={handleFiles} onAddRelease={() => { const id = crypto.randomUUID(); setReleases((current) => [{ id, version: "", releaseNotes: "", current: false, files: [], previewAssets: [] }, ...current]); return id; }} onUpdateRelease={(id, update) => setReleases((current) => current.map((release) => update.current ? { ...release, ...(release.id === id ? update : { current: false }) } : release.id === id ? { ...release, ...update } : release))} onRemoveRelease={(id) => setReleases((current) => current.filter((release) => release.id !== id))} onRemoveFile={(releaseId, storageKey) => setReleases((current) => current.map((release) => release.id === releaseId ? { ...release, files: release.files.filter((file) => file.storageKey !== storageKey) } : release))} onPreviewFiles={handlePreviewFiles} onReplacePreview={handleReplacePreview} onUpdatePreview={(releaseId, id, update) => setReleases((current) => current.map((release) => release.id === releaseId ? { ...release, previewAssets: release.previewAssets.map((preview) => preview.id === id ? { ...preview, ...update } : preview) } : release))} onRemovePreview={(releaseId, id) => setReleases((current) => current.map((release) => release.id === releaseId ? { ...release, previewAssets: release.previewAssets.filter((preview) => preview.id !== id) } : release))} /></div>
        {!freeProduct && <div ref={(element) => { stepPanelRefs.current[visibleSteps.indexOf("License & Access")] = element; }} hidden={visibleSteps[step] !== "License & Access"}><LicenseAccess /></div>}
        <div ref={(element) => { stepPanelRefs.current[visibleSteps.indexOf("Review & Publish")] = element; }} hidden={visibleSteps[step] !== "Review & Publish"}><ReviewProduct releases={releases} productType={productType} storefrontName={storefrontName} freeProduct={freeProduct} form={formRef.current} revision={reviewRevision} /></div>
        <div className="mt-6 flex items-center justify-between border-t border-divider pt-5"><Link href={productsPath} aria-disabled={busy} onClick={(event) => { if (busy) event.preventDefault(); }} className={`rounded-lg border border-border-control px-3.5 py-2 text-xs font-medium text-muted no-underline hover:bg-surface-control ${busy ? "pointer-events-none opacity-50" : ""}`}>Cancel</Link><div className="flex gap-2">{step > 0 && <button type="button" onClick={() => setStep((value) => value - 1)} className="rounded-lg border border-border-control px-3.5 py-2 text-xs font-medium text-body hover:bg-surface-control">Back</button>}{step < visibleSteps.length - 1 ? <button type="button" onClick={goToNextStep} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover">Next <PublicIcon name="right" className="h-3 w-3" /></button> : <button type="submit" data-save-product="true" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60">{saving ? "Saving..." : status === "Published" ? "Publish" : "Save Draft"} <PublicIcon name="check" className="h-3.5 w-3.5" /></button>}</div></div>
      </div>
      <aside className="space-y-5"><section className="rounded-2xl border border-border bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-heading">Product Status</h2><div className="mt-4 space-y-3">{(["Draft", "Published", "Archived"] as const).map((option) => <label key={option} className="flex cursor-pointer items-start gap-2 text-xs text-body"><input type="radio" name="status" checked={status === option} onChange={() => setStatus(option)} className="mt-0.5 accent-primary" /><span><strong>{option}</strong><span className="mt-1 block text-[10px] text-muted-soft">{option === "Draft" ? "Saved privately until you publish." : option === "Published" ? "Visible to customers after publishing." : "Hidden from customers."}</span></span></label>)}</div></section><section className="rounded-2xl border border-border bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-heading">Tips</h2><ul className="mt-3 space-y-2 text-[10px] leading-4 text-muted"><li>Use a clear and descriptive title.</li><li>Add high-quality product files.</li><li>Set a fair price and license.</li><li>Review everything before publishing.</li></ul></section></aside>
    </div>
    {cropTarget && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111b40]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="preview-crop-title"><section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"><div className="flex items-start justify-between gap-4 border-b border-divider px-5 py-4"><div><h2 id="preview-crop-title" className="text-sm font-bold text-heading">Crop preview asset</h2><p className="mt-1 text-[11px] text-muted">Position the image inside the 16:9 preview frame.</p></div><button type="button" onClick={() => setCropTarget(null)} aria-label="Close crop dialog" className="grid h-8 w-8 place-items-center rounded-lg text-lg text-muted hover:bg-surface-control">×</button></div><div className="relative h-[min(58vw,360px)] bg-[#111b40]"><Cropper image={cropTarget.source} crop={crop} zoom={zoom} aspect={16 / 9} cropShape="rect" showGrid onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, area) => setCropArea(area)} /></div><div className="flex items-center gap-3 border-t border-divider px-5 py-4"><label className="flex flex-1 items-center gap-3 text-[10px] font-semibold text-muted">Zoom<input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-primary" /></label><button type="button" onClick={() => setCropTarget(null)} className="rounded-lg border border-border-control px-4 py-2 text-xs font-semibold text-body">Cancel</button><button type="button" onClick={saveCrop} disabled={!cropArea} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Save crop</button></div></section></div>}
    {confirmSave && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111b40]/60 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="confirm-save-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmSave(false); }}><section className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"><div className="border-b border-divider bg-surface-muted px-5 py-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-light text-primary"><PublicIcon name="check" className="h-5 w-5" /></span><div><h2 id="confirm-save-title" className="text-sm font-bold text-heading">{editProduct ? "Save product changes?" : "Create this product?"}</h2><p className="mt-1 text-[11px] leading-4 text-muted">{editProduct ? "Your updated product details will be saved to the storefront." : "Your product will be added to the storefront as a draft."}</p></div></div></div><div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end"><button type="button" onClick={() => setConfirmSave(false)} className="rounded-lg border border-border-control px-4 py-2 text-xs font-semibold text-body hover:bg-surface-control">Cancel</button><button type="button" onClick={() => { if (pendingFormRef.current) void saveProduct(pendingFormRef.current); }} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover">{editProduct ? "Save changes" : "Create product"}</button></div></section></div>}
    </fieldset>
  </form></ValidationErrorsContext.Provider>;
}

function Title({ title, description }: { title: string; description: string }) { return <div><h2 className="text-base font-bold text-heading">{title}</h2><p className="mt-1 text-xs text-muted">{description}</p></div>; }
function Field({ label, children, required = false }: { label: string; children: ReactNode; required?: boolean }) { const errors = useContext(ValidationErrorsContext); const errorKey = ({ "Product Title": "title", "Short Description": "description", Category: "category", "Product Description": "longDescription", Price: "price", "License Type": "license" } as Record<string, string>)[label]; const error = errorKey ? errors[errorKey] : undefined; return <label className="block text-[11px] font-semibold text-body">{label}{required && <span className="text-status-danger"> *</span>}{children}{error && <span className="mt-1 block text-[10px] font-normal text-status-danger">{error}</span>}</label>; }

function BasicInformation({ productType, setProductType }: StepProps) { return <section><Title title="Basic Information" description="Add the basic details of your product." /><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Product Title" required><input required name="title" placeholder="e.g. Laravel API Mastery" className={input} /></Field><Field label="Product Slug"><input name="slug" placeholder="laravel-api-mastery" className={input} /></Field><Field label="Short Description" required><textarea required name="description" rows={3} placeholder="A short summary of your product" className="mt-1.5 w-full resize-y rounded-lg border border-border-control px-3 py-2 text-xs outline-none focus:border-primary sm:col-span-2" /></Field><Field label="Category" required><select required name="category" defaultValue="" className={select}><option value="" disabled>Select category</option><option>Development</option><option>Design</option><option>Marketing</option></select></Field><Field label="Subcategory"><select name="subcategory" defaultValue="" className={select}><option value="" disabled>Select subcategory</option><option>Backend Development</option><option>Frontend Development</option><option>UI Design</option></select></Field></div><Field label="Tags"><input name="tags" placeholder="laravel, api, rest, backend" className={input} /></Field><Field label="Product Description" required><textarea required name="longDescription" rows={7} placeholder="Describe what customers will learn or receive..." className="mt-1.5 w-full resize-y rounded-lg border border-border-control px-3 py-2 text-xs outline-none focus:border-primary" /></Field><fieldset className="mt-5"><legend className="text-[11px] font-semibold text-body">Product Type</legend><div className="mt-2 grid gap-3 sm:grid-cols-3">{["Digital Download", "Online Course", "License / Key"].map((type) => <label key={type} className={`flex cursor-pointer gap-2 rounded-lg border p-3 text-[10px] ${productType === type ? "border-primary bg-accent-light" : "border-border-control"}`}><input type="radio" name="productType" checked={productType === type} onChange={() => setProductType(type)} className="mt-0.5 accent-primary" /><span><strong className="block">{type}</strong><span className="mt-1 block text-[9px] font-normal text-muted-soft">{type === "Digital Download" ? "Files customers can download" : type === "Online Course" ? "Video lessons and materials" : "Software license or key"}</span></span></label>)}</div></fieldset></section>; }
function FreePricing() { return <section><Title title="Pricing" description="This product will be available at no cost to customers." /><div className="mt-5 rounded-xl border border-status-success/20 bg-status-success-surface p-5"><p className="text-xs font-semibold text-status-success">Free product</p><p className="mt-2 text-2xl font-bold text-heading">$0.00</p><p className="mt-1 text-[10px] text-muted">Customers can download this product without payment.</p></div><div className="mt-5 grid gap-4 border-t border-divider pt-5 sm:grid-cols-2"><Field label="Currency"><Dropdown name="currency"><option>USD - US Dollar</option><option>KHR - Cambodian Riel</option></Dropdown></Field><Field label="Tax"><Dropdown name="tax"><option>No Tax</option><option>Standard Tax</option></Dropdown></Field></div></section>; }
function Pricing({ editProduct }: { errors?: Record<string, string>; editProduct?: EditableProduct }) { const [price, setPrice] = useState(editProduct?.price ?? 0); const [discount, setDiscount] = useState(editProduct?.discount ?? 0); const earnings = Math.max(0, price * (1 - discount / 100) * 0.8); return <section><Title title="Pricing" description="Set the price and discount for your product." /><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Price" required><input required name="price" type="number" min="0.01" step="0.01" value={price || ""} onChange={(event) => setPrice(Number(event.target.value || 0))} placeholder="0.00" className={input} /></Field><Field label="Compare at Price"><input name="compareAtPrice" type="number" min="0" step="0.01" placeholder="0.00" className={input} /></Field></div><fieldset className="mt-5"><legend className="text-[11px] font-semibold text-body">Discount Type</legend><div className="mt-3 space-y-3 text-xs text-body"><label className="flex items-center gap-2"><input type="radio" name="discountType" defaultChecked className="accent-primary" /> No Discount</label><label className="flex items-center gap-2"><input type="radio" name="discountType" className="accent-primary" /> Percentage <input name="discount" type="number" min="0" max="100" value={discount} onChange={(event) => setDiscount(Number(event.target.value || 0))} placeholder="0" className="h-8 w-24 rounded-lg border border-border-control px-2 text-xs" />%</label><label className="flex items-center gap-2"><input type="radio" name="discountType" className="accent-primary" /> Fixed Amount <input type="number" min="0" placeholder="0.00" className="h-8 w-24 rounded-lg border border-border-control px-2 text-xs" /></label></div></fieldset><div className="mt-6 grid gap-4 border-t border-divider pt-5 sm:grid-cols-2"><Field label="Currency"><Dropdown name="currency"><option>USD - US Dollar</option><option>KHR - Cambodian Riel</option></Dropdown></Field><Field label="Tax"><Dropdown name="tax"><option>No Tax</option><option>Standard Tax</option></Dropdown></Field></div><div className="mt-5 rounded-lg border border-status-info/20 bg-status-info-surface p-4"><p className="text-xs font-semibold text-status-info">Your Earnings</p><p className="mt-1 text-xl font-bold text-heading">${earnings.toFixed(2)}</p><p className="mt-1 text-[10px] text-muted">Estimated after marketplace fees.</p></div></section>; }
function Dropdown({ name, children, required = false, defaultValue }: { name: string; children: ReactNode; required?: boolean; defaultValue?: string }) { return <span className="mt-1.5 block"><select name={name} required={required} defaultValue={defaultValue} className={`${dropdownSelect} mt-0 pr-9 focus:ring-2 focus:ring-orange-100`}>{children}</select></span>; }
function ProductFiles({ releases, releaseErrors, uploadingFiles, onFiles, onAddRelease, onUpdateRelease, onRemoveRelease, onRemoveFile, onPreviewFiles, onReplacePreview, onUpdatePreview, onRemovePreview }: { releases: ProductRelease[]; releaseErrors: Record<string, ReleaseErrors>; uploadingFiles: boolean; onFiles: (releaseId: string, event: ChangeEvent<HTMLInputElement>) => void; onAddRelease: () => string; onUpdateRelease: (id: string, update: Partial<ProductRelease>) => void; onRemoveRelease: (id: string) => void; onRemoveFile: (releaseId: string, storageKey: string) => void; onPreviewFiles: (releaseId: string, event: ChangeEvent<HTMLInputElement>) => void; onReplacePreview: (releaseId: string, id: string, event: ChangeEvent<HTMLInputElement>) => void; onUpdatePreview: (releaseId: string, id: string, update: Partial<PreviewAsset>) => void; onRemovePreview: (releaseId: string, id: string) => void }) {
  const [selectedReleaseId, setSelectedReleaseId] = useState(releases[0]?.id ?? "");
  const [releaseSearch, setReleaseSearch] = useState("");
  const selectedRelease = releases.find((release) => release.id === selectedReleaseId) ?? releases[0];
  const release = selectedRelease;
  const filteredReleases = releases.filter((release) => `${release.version} ${release.releaseNotes}`.toLowerCase().includes(releaseSearch.toLowerCase()));
  useEffect(() => {
    if (!releases.some((release) => release.id === selectedReleaseId)) setSelectedReleaseId(releases[0]?.id ?? "");
  }, [releases, selectedReleaseId]);
  const addRelease = () => { const id = onAddRelease(); setReleaseSearch(""); setSelectedReleaseId(id); };
  return <section><div className="flex flex-col gap-3 border-b border-divider pb-5 sm:flex-row sm:items-end sm:justify-between"><Title title="Product Files" description="Manage every product release, its downloadable files, and its customer previews." /><button type="button" onClick={addRelease} className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-accent-light"><PublicIcon name="add" className="h-3.5 w-3.5" /> Add version</button></div>
    <div className="mt-5 rounded-xl border border-border bg-surface-muted p-4"><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(180px,280px)]"><label className="block text-[11px] font-semibold text-body">Select version<select value={selectedRelease?.id ?? ""} onChange={(event) => setSelectedReleaseId(event.target.value)} className={select}>{filteredReleases.map((release) => <option key={release.id} value={release.id}>{release.version.trim() ? `Version ${release.version}` : "New version"} {release.current ? "(Current)" : ""}</option>)}</select></label><label className="block text-[11px] font-semibold text-body">Search versions<input value={releaseSearch} onChange={(event) => setReleaseSearch(event.target.value)} placeholder="Search version or notes" className={input} /></label></div><p className="mt-2 text-[10px] text-muted">Showing {filteredReleases.length} of {releases.length} versions. Select a version to manage its files and previews.</p></div>
    <div className="mt-5 space-y-5">{selectedRelease && <article key={selectedRelease.id} className="overflow-hidden rounded-xl border border-border bg-white"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-divider bg-surface-muted px-4 py-3"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-light text-primary"><PublicIcon name="rotate-ccw" className="h-3.5 w-3.5" /></span><div><h3 className="text-xs font-bold text-heading">{selectedRelease.version.trim() ? `Version ${selectedRelease.version}` : "New version"}</h3><p className="mt-0.5 text-[10px] text-muted">{selectedRelease.files.length} file{selectedRelease.files.length === 1 ? "" : "s"} · {selectedRelease.previewAssets.length} preview{selectedRelease.previewAssets.length === 1 ? "" : "s"}</p></div></div><div className="flex items-center gap-2">{selectedRelease.current && <span className="rounded-full bg-status-success-surface px-2 py-1 text-[9px] font-bold text-status-success">CURRENT</span>}{releases.length > 1 && <button type="button" onClick={() => onRemoveRelease(selectedRelease.id)} aria-label={`Remove version ${selectedRelease.version || "selected"}`} className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-red-50 hover:text-status-danger"><PublicIcon name="delete" className="h-3.5 w-3.5" /></button>}</div></header>
      <div className="p-4 sm:p-5"><div className="grid gap-4 sm:grid-cols-[180px_1fr]"><label className="block text-[11px] font-semibold text-body">Product version<input value={release.version} onChange={(event) => onUpdateRelease(release.id, { version: event.target.value })} placeholder="e.g. 1.1.0" className={input} />{releaseErrors[release.id]?.version && <span className="mt-1 block text-[10px] font-normal text-status-danger">{releaseErrors[release.id].version}</span>}</label><label className="block text-[11px] font-semibold text-body">Release notes<textarea value={release.releaseNotes} onChange={(event) => onUpdateRelease(release.id, { releaseNotes: event.target.value })} rows={2} placeholder="What changed in this version?" className="mt-1.5 w-full resize-y rounded-lg border border-border-control bg-white px-3 py-2 text-xs outline-none focus:border-primary" /></label></div><label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-[10px] font-medium text-body"><input type="radio" checked={release.current} onChange={() => onUpdateRelease(release.id, { current: true })} className="accent-primary" /> Set as current release</label>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]"><div><div className="flex items-center justify-between gap-3"><h4 className="text-xs font-bold text-heading">Product files</h4><span className="text-[10px] text-muted">Files delivered with this version</span></div><label className={`mt-3 flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border-control bg-surface-muted p-5 text-center ${uploadingFiles ? "cursor-wait opacity-70" : "cursor-pointer hover:border-primary hover:bg-surface-hover"}`}><PublicIcon name="download" className="h-7 w-7 text-primary" /><strong className="mt-2 text-xs text-body">{uploadingFiles ? "Uploading files..." : "Drag & drop files here"}</strong><span className="mt-1 text-[10px] text-muted-soft">or choose files from your computer</span><span className="mt-3 rounded-lg border border-primary px-3 py-1.5 text-[10px] font-semibold text-primary">Upload files</span><input type="file" multiple disabled={uploadingFiles} onChange={(event) => onFiles(release.id, event)} className="sr-only" /></label>{releaseErrors[release.id]?.files && <p className="mt-1 text-[10px] text-status-danger">{releaseErrors[release.id].files}</p>}{release.files.length > 0 && <ul className="mt-3 space-y-2">{release.files.map((file) => <li key={file.storageKey} className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-[10px] text-body"><PublicIcon name="file-search-corner" className="h-4 w-4 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block truncate">{file.fileName}</span><span className="mt-0.5 block text-[9px] text-muted">{formatFileSize(file.fileSize)}</span></span><button type="button" onClick={() => onRemoveFile(release.id, file.storageKey)} aria-label={`Remove ${file.fileName}`} className="grid h-6 w-6 place-items-center rounded-md text-muted hover:bg-red-50 hover:text-status-danger"><PublicIcon name="delete" className="h-3.5 w-3.5" /></button></li>)}</ul>}</div>
          <div className="border-t border-divider pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"><div className="flex items-center justify-between gap-3"><div><h4 className="text-xs font-bold text-heading">Preview assets</h4><p className="mt-1 text-[10px] text-muted">Shown before purchase</p></div><label className="cursor-pointer rounded-lg border border-primary px-3 py-1.5 text-[10px] font-semibold text-primary hover:bg-accent-light">Add preview<input type="file" accept="image/*" onChange={(event) => onPreviewFiles(release.id, event)} className="sr-only" /></label></div>{releaseErrors[release.id]?.previews && <p className="mt-1 text-[10px] text-status-danger">{releaseErrors[release.id].previews}</p>}{release.previewAssets.length ? <div className="mt-3 space-y-2">{release.previewAssets.map((preview, index) => <div key={preview.id} className="flex gap-2 rounded-lg bg-surface-muted p-2"><img src={preview.url} alt={preview.title} className="h-14 w-20 shrink-0 rounded-md border border-border object-cover" /><div className="min-w-0 flex-1"><input value={preview.title} onChange={(event) => onUpdatePreview(release.id, preview.id, { title: event.target.value })} aria-label={`Preview ${index + 1} title`} className="h-7 w-full rounded-md border border-border-control bg-white px-2 text-[10px] text-body outline-none focus:border-primary" /><div className="mt-1.5 flex gap-1.5"><label className="cursor-pointer rounded-md border border-border-control px-2 py-1 text-[9px] font-medium text-muted hover:border-primary hover:text-primary">Replace<input type="file" accept="image/*" onChange={(event) => onReplacePreview(release.id, preview.id, event)} className="sr-only" /></label><button type="button" onClick={() => onRemovePreview(release.id, preview.id)} className="rounded-md px-2 py-1 text-[9px] font-medium text-status-danger hover:bg-red-50">Remove</button></div></div></div>)}</div> : <div className="mt-3 grid min-h-36 place-items-center rounded-xl border border-dashed border-border-control px-4 text-center"><span><PublicIcon name="view" className="mx-auto h-6 w-6 text-muted" /><span className="mt-2 block text-[10px] text-muted">No preview assets for this version</span></span></div>}</div></div></div>
    </article>}</div>
  </section>;
}
function LicenseAccess() { return <section><Title title="License & Access" description="Choose how customers can use this product." /><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="License Type" required><select required name="license" defaultValue="" className={select}><option value="" disabled>Select license</option><option>Standard License</option><option>Personal License</option><option>Commercial License</option></select></Field><Field label="Access Type"><select name="access" className={select}><option>Lifetime Access</option><option>Limited Access</option><option>Subscription</option></select></Field></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-primary bg-accent-light p-4"><p className="text-xs font-semibold text-heading">Standard License</p><p className="mt-1 text-[10px] text-muted">For personal and commercial use.</p><ul className="mt-3 space-y-1.5 text-[10px] text-body"><li>✓ One user / single project</li><li>✓ No redistribution</li><li>✓ Support via email</li></ul></div><div className="space-y-4"><label className="flex items-start gap-2 text-xs text-body"><input type="radio" name="accessRule" defaultChecked className="mt-0.5 accent-primary" /><span><strong className="block">Lifetime access</strong><span className="text-[10px] text-muted-soft">One-time purchase, unlimited access.</span></span></label><label className="flex items-start gap-2 text-xs text-body"><input type="radio" name="accessRule" className="mt-0.5 accent-primary" /><span><strong className="block">Limited downloads</strong><span className="text-[10px] text-muted-soft">Set a maximum download count.</span></span></label><Field label="Download limit"><input type="number" min="1" placeholder="5" className={input} /></Field></div></div></section>; }
function ReviewProduct({ releases, productType, storefrontName, freeProduct, form, revision }: { releases: ProductRelease[]; productType: string; storefrontName: string; freeProduct: boolean; form: HTMLFormElement | null; revision: number }) { void revision; const values = form ? new FormData(form) : null; const text = (name: string, fallback = "Not set") => String(values?.get(name) || fallback); const price = Number(values?.get("price") || 0); const currency = text("currency", "USD").slice(0, 3); const category = [text("category", ""), text("subcategory", "")].filter(Boolean).join(" / ") || "Not set"; const fileCount = releases.reduce((total, release) => total + release.files.length, 0); return <section><Title title="Review & Publish" description="Review the details before publishing your product." /><div className="mt-5 space-y-4"><ReviewBlock title="Basic Information"><ReviewRow label="Product Title" value={text("title")} /><ReviewRow label="Category" value={category} /><ReviewRow label="Storefront" value={storefrontName} /><ReviewRow label="Product Type" value={productType} /></ReviewBlock><ReviewBlock title="Pricing"><ReviewRow label="Price" value={freeProduct ? "$0.00 (Free)" : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price)} /><ReviewRow label="Compare at Price" value={freeProduct ? "Not applicable" : text("compareAtPrice")} /><ReviewRow label="Discount" value={freeProduct ? "Not applicable" : `${text("discount", "0")}%`} /></ReviewBlock><ReviewBlock title={`Product releases (${releases.length})`}><ReviewRow label="Total files" value={String(fileCount)} />{releases.map((release) => <ReviewRow key={release.id} label={release.version || "Unnumbered version"} value={`${release.files.length} file${release.files.length === 1 ? "" : "s"} · ${release.previewAssets.length} preview${release.previewAssets.length === 1 ? "" : "s"}`} />)}</ReviewBlock>{!freeProduct && <ReviewBlock title="License & Access"><ReviewRow label="License Type" value={text("license")} /><ReviewRow label="Access" value={text("access")} /></ReviewBlock>}</div></section>; }
function ReviewBlock({ title, children }: { title: string; children: ReactNode }) { return <div className="rounded-xl border border-border bg-surface-muted p-4"><h3 className="text-xs font-bold text-heading">{title}</h3><div className="mt-3 space-y-2">{children}</div></div>; }
function ReviewRow({ label, value }: { label: string; value: string }) { return <div className="grid gap-1 text-[10px] sm:grid-cols-[150px_1fr]"><span className="text-muted">{label}</span><strong className="text-body">{value}</strong></div>; }
