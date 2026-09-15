"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import PublicIcon from "@/components/icons/PublicIcon";
import { Toast } from "@/components/ui";

const steps = ["Basic Information", "Pricing", "Product Files", "License & Access", "Review & Publish"] as const;
type Props = { productsPath: string; storefrontName: string };
type StepProps = { productType: string; setProductType: (value: string) => void };
type PreviewAsset = { id: string; title: string; type: string; url: string };
type UploadedFile = { fileName: string; storageKey: string; fileSize: number; mimeType: string };
type CropTarget = { id?: string; source: string; title: string };
type CropPosition = { x: number; y: number };
const input = "mt-1.5 h-9 w-full rounded-lg border border-border-control bg-white px-3 text-xs text-body outline-none placeholder:text-muted-faint focus:border-primary";
const select = `${input} select-chevron`;
const dropdownSelect = `${input} appearance-none select-chevron`;
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const ValidationErrorsContext = createContext<Record<string, string>>({});

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

export default function AddProductForm({ productsPath, storefrontName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [productType, setProductType] = useState("Digital Download");
  const [freeProduct, setFreeProduct] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [previewAssets, setPreviewAssets] = useState<PreviewAsset[]>([]);
  const [notice, setNotice] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const [crop, setCrop] = useState<CropPosition>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState<Area | null>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stepPanelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const visibleSteps = freeProduct ? steps.filter((label) => label !== "License & Access") : steps;
  const goToNextStep = () => {
    const panel = stepPanelRefs.current[step];
    const invalidFields = panel ? Array.from(panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea")).filter((field) => !field.checkValidity()) : [];
    const invalidField = invalidFields[0];
    if (invalidField) {
      setFieldErrors(Object.fromEntries(invalidFields.map((field) => [field.name, field.validationMessage || "This field is required."])));
      invalidField.focus();
      return;
    }
    setFieldErrors({});
    setStep((value) => value + 1);
  };
  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selectedFiles.length) return;
    setUploadingFiles(true);
    setError("");
    const token = window.localStorage.getItem("marketplace-token");
    try {
      for (const file of selectedFiles) {
        const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`)); reader.readAsDataURL(file); });
        const response = await fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/product-files`, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ data, fileName: file.name, mimeType: file.type }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || `Unable to upload ${file.name}.`);
        setFiles((current) => [...current, result.file]);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload product files.");
    } finally {
      setUploadingFiles(false);
    }
  };
  const handlePreviewFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropTarget({ source: String(reader.result), title: file.name.replace(/\.[^.]+$/, "") });
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const handleReplacePreview = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropTarget({ id, source: String(reader.result), title: file.name.replace(/\.[^.]+$/, "") });
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const saveCrop = async () => {
    if (!cropTarget || !cropArea) return;
    try {
      const url = await createCroppedImage(cropTarget.source, cropArea);
      if (cropTarget.id) setPreviewAssets((current) => current.map((preview) => preview.id === cropTarget.id ? { ...preview, url, title: cropTarget.title } : preview));
      else setPreviewAssets((current) => [...current, { id: crypto.randomUUID(), title: cropTarget.title, type: "image", url }]);
      setCropTarget(null);
      setCropArea(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "Unable to crop preview image.");
    }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const token = window.localStorage.getItem("marketplace-token");
    try {
      const response = await fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/products`, {
        method: "POST",
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
          previews: previewAssets.map((preview, index) => ({ ...preview, sortOrder: index })),
          files,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save product.");
      setNotice(true);
      window.setTimeout(() => router.push(productsPath), 900);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    stepRefs.current[step]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [step]);

  return <ValidationErrorsContext.Provider value={fieldErrors}><form onSubmit={submit} onInput={(event) => { const name = (event.target as HTMLInputElement).name; if (name) setFieldErrors((current) => { if (!current[name]) return current; const next = { ...current }; delete next[name]; return next; }); }} className="relative">
    {notice && <Toast variant="success" message={status === "Published" ? "Your product is now published." : "Your product has been saved as a draft."} onClose={() => setNotice(false)} />}
    {error && <p role="alert" className="mb-4 rounded-lg border border-status-danger/20 bg-red-50 px-4 py-3 text-xs text-status-danger">{error}</p>}
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
              disabled={index > step}
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
    {step === 1 && <label className={`mb-4 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${freeProduct ? "border-primary bg-accent-light" : "border-border bg-white hover:border-primary/50 hover:bg-surface-hover"}`}><input type="checkbox" checked={freeProduct} onChange={(event) => setFreeProduct(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-primary" /><span><span className="block text-sm font-bold text-heading">This is a free product</span><span className="mt-1 block text-[11px] font-normal leading-4 text-muted">Customers can access it for free. License and paid pricing steps will be skipped.</span></span></label>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div ref={(element) => { stepPanelRefs.current[visibleSteps.indexOf("Basic Information")] = element; }} hidden={visibleSteps[step] !== "Basic Information"}><BasicInformation productType={productType} setProductType={setProductType} errors={fieldErrors} /></div>
        <div ref={(element) => { stepPanelRefs.current[visibleSteps.indexOf("Pricing")] = element; }} hidden={visibleSteps[step] !== "Pricing"}>{freeProduct ? <FreePricing /> : <Pricing errors={fieldErrors} />}</div>
        <div ref={(element) => { stepPanelRefs.current[visibleSteps.indexOf("Product Files")] = element; }} hidden={visibleSteps[step] !== "Product Files"}><ProductFiles files={files} uploadingFiles={uploadingFiles} onFiles={handleFiles} previewAssets={previewAssets} onPreviewFiles={handlePreviewFiles} onReplacePreview={handleReplacePreview} onUpdatePreview={(id, update) => setPreviewAssets((current) => current.map((preview) => preview.id === id ? { ...preview, ...update } : preview))} onRemovePreview={(id) => setPreviewAssets((current) => current.filter((preview) => preview.id !== id))} /></div>
        {!freeProduct && <div ref={(element) => { stepPanelRefs.current[visibleSteps.indexOf("License & Access")] = element; }} hidden={visibleSteps[step] !== "License & Access"}><LicenseAccess errors={fieldErrors} /></div>}
        <div ref={(element) => { stepPanelRefs.current[visibleSteps.indexOf("Review & Publish")] = element; }} hidden={visibleSteps[step] !== "Review & Publish"}><ReviewProduct files={files} productType={productType} storefrontName={storefrontName} freeProduct={freeProduct} /></div>
        <div className="mt-6 flex items-center justify-between border-t border-divider pt-5"><Link href={productsPath} className="rounded-lg border border-border-control px-3.5 py-2 text-xs font-medium text-muted no-underline hover:bg-surface-control">Cancel</Link><div className="flex gap-2">{step > 0 && <button type="button" onClick={() => setStep((value) => value - 1)} className="rounded-lg border border-border-control px-3.5 py-2 text-xs font-medium text-body hover:bg-surface-control">Back</button>}{step < visibleSteps.length - 1 ? <button type="button" onClick={goToNextStep} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover">Next <PublicIcon name="right" className="h-3 w-3" /></button> : <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60">{saving ? "Saving..." : status === "Published" ? "Publish" : "Save Draft"} <PublicIcon name="check" className="h-3.5 w-3.5" /></button>}</div></div>
      </div>
      <aside className="space-y-5"><section className="rounded-2xl border border-border bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-heading">Product Status</h2><div className="mt-4 space-y-3">{(["Draft", "Published"] as const).map((option) => <label key={option} className="flex cursor-pointer items-start gap-2 text-xs text-body"><input type="radio" name="status" checked={status === option} onChange={() => setStatus(option)} className="mt-0.5 accent-primary" /><span><strong>{option}</strong><span className="mt-1 block text-[10px] text-muted-soft">{option === "Draft" ? "Saved privately until you publish." : "Visible to customers after publishing."}</span></span></label>)}</div></section><section className="rounded-2xl border border-border bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-heading">Tips</h2><ul className="mt-3 space-y-2 text-[10px] leading-4 text-muted"><li>Use a clear and descriptive title.</li><li>Add high-quality product files.</li><li>Set a fair price and license.</li><li>Review everything before publishing.</li></ul></section></aside>
    </div>
    {cropTarget && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111b40]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="preview-crop-title"><section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"><div className="flex items-start justify-between gap-4 border-b border-divider px-5 py-4"><div><h2 id="preview-crop-title" className="text-sm font-bold text-heading">Crop preview asset</h2><p className="mt-1 text-[11px] text-muted">Position the image inside the 16:9 preview frame.</p></div><button type="button" onClick={() => setCropTarget(null)} aria-label="Close crop dialog" className="grid h-8 w-8 place-items-center rounded-lg text-lg text-muted hover:bg-surface-control">×</button></div><div className="relative h-[min(58vw,360px)] bg-[#111b40]"><Cropper image={cropTarget.source} crop={crop} zoom={zoom} aspect={16 / 9} cropShape="rect" showGrid onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, area) => setCropArea(area)} /></div><div className="flex items-center gap-3 border-t border-divider px-5 py-4"><label className="flex flex-1 items-center gap-3 text-[10px] font-semibold text-muted">Zoom<input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-primary" /></label><button type="button" onClick={() => setCropTarget(null)} className="rounded-lg border border-border-control px-4 py-2 text-xs font-semibold text-body">Cancel</button><button type="button" onClick={saveCrop} disabled={!cropArea} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Save crop</button></div></section></div>}
  </form></ValidationErrorsContext.Provider>;
}

function Title({ title, description }: { title: string; description: string }) { return <div><h2 className="text-base font-bold text-heading">{title}</h2><p className="mt-1 text-xs text-muted">{description}</p></div>; }
function Field({ label, children, required = false }: { label: string; children: ReactNode; required?: boolean }) { const errors = useContext(ValidationErrorsContext); const errorKey = ({ "Product Title": "title", "Short Description": "description", Category: "category", "Product Description": "longDescription", Price: "price", "License Type": "license" } as Record<string, string>)[label]; const error = errorKey ? errors[errorKey] : undefined; return <label className="block text-[11px] font-semibold text-body">{label}{required && <span className="text-status-danger"> *</span>}{children}{error && <span className="mt-1 block text-[10px] font-normal text-status-danger">{error}</span>}</label>; }

function BasicInformation({ productType, setProductType }: StepProps) { return <section><Title title="Basic Information" description="Add the basic details of your product." /><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Product Title" required><input required name="title" placeholder="e.g. Laravel API Mastery" className={input} /></Field><Field label="Product Slug"><input name="slug" placeholder="laravel-api-mastery" className={input} /></Field><Field label="Short Description" required><textarea required name="description" rows={3} placeholder="A short summary of your product" className="mt-1.5 w-full resize-y rounded-lg border border-border-control px-3 py-2 text-xs outline-none focus:border-primary sm:col-span-2" /></Field><Field label="Category" required><select required name="category" defaultValue="" className={select}><option value="" disabled>Select category</option><option>Development</option><option>Design</option><option>Marketing</option></select></Field><Field label="Subcategory"><select name="subcategory" defaultValue="" className={select}><option value="" disabled>Select subcategory</option><option>Backend Development</option><option>Frontend Development</option><option>UI Design</option></select></Field></div><Field label="Tags"><input name="tags" placeholder="laravel, api, rest, backend" className={input} /></Field><Field label="Product Description" required><textarea required name="longDescription" rows={7} placeholder="Describe what customers will learn or receive..." className="mt-1.5 w-full resize-y rounded-lg border border-border-control px-3 py-2 text-xs outline-none focus:border-primary" /></Field><fieldset className="mt-5"><legend className="text-[11px] font-semibold text-body">Product Type</legend><div className="mt-2 grid gap-3 sm:grid-cols-3">{["Digital Download", "Online Course", "License / Key"].map((type) => <label key={type} className={`flex cursor-pointer gap-2 rounded-lg border p-3 text-[10px] ${productType === type ? "border-primary bg-accent-light" : "border-border-control"}`}><input type="radio" name="productType" checked={productType === type} onChange={() => setProductType(type)} className="mt-0.5 accent-primary" /><span><strong className="block">{type}</strong><span className="mt-1 block text-[9px] font-normal text-muted-soft">{type === "Digital Download" ? "Files customers can download" : type === "Online Course" ? "Video lessons and materials" : "Software license or key"}</span></span></label>)}</div></fieldset></section>; }
function FreePricing() { return <section><Title title="Pricing" description="This product will be available at no cost to customers." /><div className="mt-5 rounded-xl border border-status-success/20 bg-status-success-surface p-5"><p className="text-xs font-semibold text-status-success">Free product</p><p className="mt-2 text-2xl font-bold text-heading">$0.00</p><p className="mt-1 text-[10px] text-muted">Customers can download this product without payment.</p></div><div className="mt-5 grid gap-4 border-t border-divider pt-5 sm:grid-cols-2"><Field label="Currency"><Dropdown name="currency"><option>USD - US Dollar</option><option>KHR - Cambodian Riel</option></Dropdown></Field><Field label="Tax"><Dropdown name="tax"><option>No Tax</option><option>Standard Tax</option></Dropdown></Field></div></section>; }
function Pricing() { return <section><Title title="Pricing" description="Set the price and discount for your product." /><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Price" required><input required name="price" type="number" min="0" step="0.01" placeholder="0.00" className={input} /></Field><Field label="Compare at Price"><input name="compareAtPrice" type="number" min="0" step="0.01" placeholder="0.00" className={input} /></Field></div><fieldset className="mt-5"><legend className="text-[11px] font-semibold text-body">Discount Type</legend><div className="mt-3 space-y-3 text-xs text-body"><label className="flex items-center gap-2"><input type="radio" name="discount" defaultChecked className="accent-primary" /> No Discount</label><label className="flex items-center gap-2"><input type="radio" name="discount" className="accent-primary" /> Percentage <input type="number" min="0" max="100" placeholder="0" className="h-8 w-24 rounded-lg border border-border-control px-2 text-xs" />%</label><label className="flex items-center gap-2"><input type="radio" name="discount" className="accent-primary" /> Fixed Amount <input type="number" min="0" placeholder="0.00" className="h-8 w-24 rounded-lg border border-border-control px-2 text-xs" /></label></div></fieldset><div className="mt-6 grid gap-4 border-t border-divider pt-5 sm:grid-cols-2"><Field label="Currency"><Dropdown name="currency"><option>USD - US Dollar</option><option>KHR - Cambodian Riel</option></Dropdown></Field><Field label="Tax"><Dropdown name="tax"><option>No Tax</option><option>Standard Tax</option></Dropdown></Field></div><div className="mt-5 rounded-lg border border-status-info/20 bg-status-info-surface p-4"><p className="text-xs font-semibold text-status-info">Your Earnings</p><p className="mt-1 text-xl font-bold text-heading">$31.20</p><p className="mt-1 text-[10px] text-muted">Estimated after marketplace fees.</p></div></section>; }
function Dropdown({ name, children, required = false, defaultValue }: { name: string; children: ReactNode; required?: boolean; defaultValue?: string }) { return <span className="mt-1.5 block"><select name={name} required={required} defaultValue={defaultValue} className={`${dropdownSelect} mt-0 pr-9 focus:ring-2 focus:ring-orange-100`}>{children}</select></span>; }
function ProductFiles({ files, uploadingFiles, onFiles, previewAssets, onPreviewFiles, onReplacePreview, onUpdatePreview, onRemovePreview }: { files: UploadedFile[]; uploadingFiles: boolean; onFiles: (event: ChangeEvent<HTMLInputElement>) => void; previewAssets: PreviewAsset[]; onPreviewFiles: (event: ChangeEvent<HTMLInputElement>) => void; onReplacePreview: (id: string, event: ChangeEvent<HTMLInputElement>) => void; onUpdatePreview: (id: string, update: Partial<PreviewAsset>) => void; onRemovePreview: (id: string) => void }) { return <section><Title title="Product Files" description="Upload the files customers will receive after purchase." /><label className={`mt-5 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border-control bg-surface-muted p-6 text-center ${uploadingFiles ? "cursor-wait opacity-70" : "cursor-pointer hover:border-primary hover:bg-surface-hover"}`}><PublicIcon name="download" className="h-8 w-8 text-primary" /><strong className="mt-3 text-xs text-body">{uploadingFiles ? "Uploading files..." : "Drag & drop your files here"}</strong><span className="mt-1 text-[10px] text-muted-soft">{uploadingFiles ? "Files are being stored before you save the product" : "or choose files from your computer"}</span><span className="mt-4 rounded-lg border border-primary px-4 py-2 text-[10px] font-semibold text-primary">{uploadingFiles ? "Uploading..." : "Upload Files"}</span><input type="file" multiple disabled={uploadingFiles} onChange={onFiles} className="sr-only" /></label>{files.length > 0 && <div className="mt-5 rounded-xl border border-border p-4"><p className="text-xs font-semibold text-heading">Uploaded Files ({files.length})</p><ul className="mt-3 space-y-2">{files.map((file) => <li key={file.storageKey} className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-[10px] text-body"><PublicIcon name="file-search-corner" className="h-4 w-4 text-primary" />{file.fileName}</li>)}</ul></div>}<div className="mt-6 border-t border-divider pt-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-heading">Preview Assets</h3><p className="mt-1 text-[10px] text-muted">Add screenshots or images customers can view before purchase.</p></div><label className="cursor-pointer rounded-lg border border-primary px-3 py-2 text-[10px] font-semibold text-primary hover:bg-accent-light">Add Preview<input type="file" accept="image/*" onChange={onPreviewFiles} className="sr-only" /></label></div>{previewAssets.length > 0 && <div className="mt-4 space-y-3">{previewAssets.map((preview, index) => <div key={preview.id} className="flex gap-3 rounded-xl border border-border bg-surface-muted p-3"><img src={preview.url} alt={preview.title} className="h-16 w-24 shrink-0 rounded-lg border border-border object-cover" /><div className="min-w-0 flex-1 space-y-2"><input value={preview.title} onChange={(event) => onUpdatePreview(preview.id, { title: event.target.value })} aria-label={`Preview ${index + 1} title`} className="h-8 w-full rounded-lg border border-border-control bg-white px-2 text-xs text-body outline-none focus:border-primary" /><div className="flex gap-2"><select value={preview.type} onChange={(event) => onUpdatePreview(preview.id, { type: event.target.value })} aria-label={`Preview ${index + 1} type`} className="h-8 rounded-lg border border-border-control bg-white px-2 text-[10px] text-body"><option value="image">Image</option><option value="video">Video</option><option value="document">Document</option></select><label className="cursor-pointer rounded-lg border border-border-control px-2 py-1.5 text-[10px] font-medium text-muted hover:border-primary hover:text-primary">Replace<input type="file" accept="image/*" onChange={(event) => onReplacePreview(preview.id, event)} className="sr-only" /></label><button type="button" onClick={() => onRemovePreview(preview.id)} className="rounded-lg border border-border-control px-2 py-1.5 text-[10px] font-medium text-status-danger hover:bg-red-50">Remove</button></div></div></div>)}</div>}</div></section>; }
function LicenseAccess() { return <section><Title title="License & Access" description="Choose how customers can use this product." /><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="License Type" required><select required name="license" defaultValue="" className={select}><option value="" disabled>Select license</option><option>Standard License</option><option>Personal License</option><option>Commercial License</option></select></Field><Field label="Access Type"><select name="access" className={select}><option>Lifetime Access</option><option>Limited Access</option><option>Subscription</option></select></Field></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-primary bg-accent-light p-4"><p className="text-xs font-semibold text-heading">Standard License</p><p className="mt-1 text-[10px] text-muted">For personal and commercial use.</p><ul className="mt-3 space-y-1.5 text-[10px] text-body"><li>✓ One user / single project</li><li>✓ No redistribution</li><li>✓ Support via email</li></ul></div><div className="space-y-4"><label className="flex items-start gap-2 text-xs text-body"><input type="radio" name="accessRule" defaultChecked className="mt-0.5 accent-primary" /><span><strong className="block">Lifetime access</strong><span className="text-[10px] text-muted-soft">One-time purchase, unlimited access.</span></span></label><label className="flex items-start gap-2 text-xs text-body"><input type="radio" name="accessRule" className="mt-0.5 accent-primary" /><span><strong className="block">Limited downloads</strong><span className="text-[10px] text-muted-soft">Set a maximum download count.</span></span></label><Field label="Download limit"><input type="number" min="1" placeholder="5" className={input} /></Field></div></div></section>; }
function ReviewProduct({ files, productType, storefrontName, freeProduct }: { files: UploadedFile[]; productType: string; storefrontName: string; freeProduct: boolean }) { return <section><Title title="Review & Publish" description="Review the details before publishing your product." /><div className="mt-5 space-y-4"><ReviewBlock title="Basic Information"><ReviewRow label="Product Title" value="Laravel API Mastery" /><ReviewRow label="Category" value="Development / Backend Development" /><ReviewRow label="Storefront" value={storefrontName} /><ReviewRow label="Product Type" value={productType} /></ReviewBlock><ReviewBlock title="Pricing"><ReviewRow label="Price" value={freeProduct ? "$0.00 (Free)" : "$39.00"} /><ReviewRow label="Compare at Price" value={freeProduct ? "Not applicable" : "$49.00"} /><ReviewRow label="Discount" value={freeProduct ? "Not applicable" : "20%"} /></ReviewBlock><ReviewBlock title={`Product Files (${files.length || 2})`}><ReviewRow label="Files" value={files.length ? files.map((file) => file.fileName).join(", ") : "laravel-api-mastery.zip, api-documentation.pdf"} /></ReviewBlock>{!freeProduct && <ReviewBlock title="License & Access"><ReviewRow label="License Type" value="Standard License" /><ReviewRow label="Access" value="Lifetime Access" /></ReviewBlock>}</div></section>; }
function ReviewBlock({ title, children }: { title: string; children: ReactNode }) { return <div className="rounded-xl border border-border bg-surface-muted p-4"><h3 className="text-xs font-bold text-heading">{title}</h3><div className="mt-3 space-y-2">{children}</div></div>; }
function ReviewRow({ label, value }: { label: string; value: string }) { return <div className="grid gap-1 text-[10px] sm:grid-cols-[150px_1fr]"><span className="text-muted">{label}</span><strong className="text-body">{value}</strong></div>; }