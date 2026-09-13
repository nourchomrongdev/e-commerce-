"use client";

import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import PublicIcon from "@/components/icons/PublicIcon";

const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";
const inputClassName = "w-full rounded-lg border border-[#e2e7f1] bg-white px-3 py-2.5 text-xs text-[#111b40] outline-none transition placeholder:text-[#a1a9ba] focus:border-primary focus:ring-2 focus:ring-[#ff6b001c]";
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type StorefrontFormProps = { mode: "create" | "edit"; storefrontName?: string };
type CropPosition = { x: number; y: number };

type StorefrontResponse = {
  displayName: string;
  slug: string;
  description: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  guestPurchase?: boolean;
  logoUrl?: string;
};

type FormErrors = {
  name?: string;
  slug?: string;
  description?: string;
  logo?: string;
};

const createCroppedImage = async (imageSrc: string, pixelCrop: Area) => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const imageElement = new Image();
    imageElement.onload = () => resolve(imageElement);
    imageElement.onerror = reject;
    imageElement.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to prepare logo crop");
  context.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, 512, 512);
  return canvas.toDataURL("image/png");
};

function LogoCropEditor({ source, onCropped, onClose }: { source: string; onCropped: (value: string) => void; onClose: () => void }) {
  const [crop, setCrop] = useState<CropPosition>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setArea(null);
  }, [source]);

  const saveCrop = async () => {
    if (!area) return;
    try {
      onCropped(await createCroppedImage(source, area));
      onClose();
    } catch {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111b40]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="crop-logo-title">
      <div className="w-full max-w-[620px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#edf0f5] px-5 py-4">
          <div><h2 id="crop-logo-title" className="text-sm font-bold text-[#111b40]">Crop store logo</h2><p className="mt-1 text-[11px] text-[#8993aa]">Position your logo inside the square.</p></div>
          <button type="button" onClick={onClose} aria-label="Close crop dialog" className="grid h-8 w-8 place-items-center rounded-lg text-lg text-[#78839a] hover:bg-[#f4f6fa]">×</button>
        </div>
        <div className="p-5">
          <div className="relative h-[min(78vw,560px)] overflow-hidden rounded-xl bg-[#1f2937]">
            <Cropper image={source} crop={crop} zoom={zoom} aspect={1} cropShape="rect" showGrid onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, croppedAreaPixels) => setArea(croppedAreaPixels)} />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] px-5 py-4"><button type="button" onClick={onClose} className="rounded-lg border border-[#e1e5ee] px-5 py-2.5 text-xs font-semibold text-[#33405d] transition hover:border-primary hover:text-primary">Back</button><button type="button" onClick={saveCrop} disabled={!area} className="rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">Save Crop</button></div>
      </div>
    </div>
  );
}

export default function StorefrontForm({ mode, storefrontName }: StorefrontFormProps) {
  const router = useRouter();
  const decodedName = decodeURIComponent(storefrontName ?? "");
  const isEdit = mode === "edit";
  const [name, setName] = useState(decodedName);
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSource, setLogoSource] = useState<string | null>(null);
  const [croppedLogo, setCroppedLogo] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(isEdit);
  const [isFeatured, setIsFeatured] = useState(false);
  const [guestPurchase, setGuestPurchase] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!isEdit || !decodedName) return;
    fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load storefront");
        return response.json() as Promise<{ storefront: StorefrontResponse }>;
      })
      .then(({ storefront }) => {
        setName(storefront.displayName);
        setSlug(storefront.slug);
        setDescription(storefront.description);
        setIsPublished(storefront.isPublished ?? true);
        setIsFeatured(storefront.isFeatured ?? false);
        setGuestPurchase(storefront.guestPurchase ?? true);
        setLogo(storefront.logoUrl ? "Current logo" : null);
        setCroppedLogo(storefront.logoUrl || null);
      })
      .catch((error: Error) => setFeedback(error.message));
  }, [decodedName, isEdit]);

  const storeUrl = `marketplace.com/${slug || "your-store-name"}`;

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const source = URL.createObjectURL(file);
    setLogo(file.name);
    setLogoSource(source);
    setErrors((current) => ({ ...current, logo: "" }));
    setFeedback("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = "Store name can't be empty.";
    if (!description.trim()) nextErrors.description = "Description can't be empty.";
    if (!slug.trim() && !isEdit) nextErrors.slug = "Store URL can't be empty.";
    if (!croppedLogo) nextErrors.logo = "Store logo can't be empty.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setFeedback(Object.values(nextErrors)[0]);
      return;
    }

    const request = isEdit
      ? fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storeName: name, description, isPublished, isFeatured, guestPurchase, logoUrl: croppedLogo }) })
      : fetch(`${apiUrl}/creator/storefronts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storeName: name, slug, description, isPublished, isFeatured, guestPurchase, logoUrl: croppedLogo }) });

    request.then(async (response) => {
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to save storefront");
      }
      setFeedback(isEdit ? "Storefront updated successfully." : "Storefront created successfully.");
      window.setTimeout(() => router.push("/creator/storefront"), 700);
    }).catch((error: Error) => setFeedback(error.message));
  };

  const deleteStorefront = () => {
    if (!window.confirm(`Delete ${name || "this storefront"}?`)) return;
    fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodedName)}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to delete storefront");
        router.push("/creator/storefront");
      })
      .catch((error: Error) => setFeedback(error.message));
  };

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <div className="mb-5 flex items-center gap-2 text-[11px] text-[#78839a]"><Link href="/creator/storefront" className="transition hover:text-primary">{isEdit ? "Back to Storefronts" : "All Storefronts Overview"}</Link><PublicIcon name="right" className="h-3 w-3" /><span className="font-medium text-[#263252]">{isEdit ? "Edit Storefront" : "Add New Storefront"}</span></div>
      <header className="mb-5"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange-50 text-primary"><PublicIcon name="store" className="h-5 w-5" /></span><div><h1 className="text-xl font-bold tracking-tight text-[#111b40] sm:text-2xl">{isEdit ? "Edit Storefront" : "Add New Storefront"}</h1><p className="mt-1 text-xs text-[#8993aa]">{isEdit ? "Update your storefront information and keep your store up to date." : "Create a new storefront and start selling your digital products."}</p></div></div></header>

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-xl border border-[#e9edf5] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <section className="p-5 sm:p-6">
          <div className="flex items-start gap-3 border-b border-[#edf0f5] pb-4"><PublicIcon name="store" className="mt-0.5 h-5 w-5 text-[#24345c]" /><div><h2 className="text-sm font-bold text-[#263252]">Store Information</h2><p className="mt-1 text-[11px] text-[#8993aa]">Fill in the basic information for your storefront.</p></div></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#33405d]">Store Name <b className="text-red-500">*</b></span><input value={name} onChange={(event) => { const value = event.target.value; setName(value); setErrors((current) => ({ ...current, name: value.trim() ? "" : "Store name can't be empty." })); if (!isEdit) setSlug(slugify(value)); }} placeholder="e.g. NourChomrong Store" className={`${inputClassName} ${errors.name ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`} aria-invalid={Boolean(errors.name)} /></label>{errors.name && <p className="mt-1 text-[10px] font-medium text-red-500">{errors.name}</p>}
            <div><label htmlFor="store-slug" className="mb-2 block text-[11px] font-semibold text-[#33405d]">Store URL <b className="text-red-500">*</b></label><div className="flex overflow-hidden rounded-lg border border-[#e2e7f1] bg-[#f8f9fc]"><span className="flex items-center px-2.5 text-[10px] text-[#8993aa]">marketplace.com/</span><input id="store-slug" disabled value={slug} className="min-w-0 flex-1 cursor-not-allowed bg-transparent px-2.5 py-2.5 text-xs text-[#78839a] outline-none" /></div>{errors.slug && <p className="mt-1 text-[10px] font-medium text-red-500">{errors.slug}</p>}<p className="mt-1.5 text-[10px] text-[#8993aa]">Generated automatically from your store name.</p></div>
            <label className="block md:col-span-2"><span className="mb-2 block text-[11px] font-semibold text-[#33405d]">Description <b className="text-red-500">*</b></span><textarea value={description} maxLength={500} onChange={(event) => { const value = event.target.value; setDescription(value); setErrors((current) => ({ ...current, description: value.trim() ? "" : "Description can't be empty." })); setFeedback(""); }} placeholder="Tell customers about your store, your products, and what makes it special..." className={`${inputClassName} min-h-[92px] resize-y ${errors.description ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`} aria-invalid={Boolean(errors.description)} /><span className="mt-1 block text-right text-[10px] text-[#a1a9ba]">{description.length}/500</span>{errors.description && <p className="mt-1 text-[10px] font-medium text-red-500">{errors.description}</p>}</label>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div><span className="mb-2 block text-[11px] font-semibold text-[#33405d]">Store Logo <b className="text-red-500">*</b></span><label className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center transition hover:border-primary hover:bg-orange-50/30 ${errors.logo ? "border-red-400 bg-red-50/40" : "border-[#d8dfec] bg-[#fcfdff]"}`}><PublicIcon name="up" className="h-7 w-7 text-[#8a99b2]" /><span className="mt-2 text-[10px] font-semibold text-[#33405d]">{logo ? "Click to change image" : "Click to upload or drag and drop"}</span><span className="mt-1 text-[9px] text-[#9aa2b5]">PNG, JPG, WEBP (Max 2MB)</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoChange} className="sr-only" /></label>{errors.logo && <p className="mt-1 text-[10px] font-medium text-red-500">{errors.logo}</p>}{logoSource && <LogoCropEditor source={logoSource} onCropped={setCroppedLogo} onClose={() => setLogoSource(null)} />}</div>
            <div><span className="mb-2 block text-[11px] font-semibold text-[#33405d]">Preview</span><div className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border border-[#edf0f5] bg-[#fcfdff]"><span className="grid h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white text-primary shadow-[0_3px_12px_rgba(17,27,64,0.1)]">{croppedLogo ? <img src={croppedLogo} alt="Store logo" className="h-full w-full object-cover" /> : <PublicIcon name="shopping-cart" className="h-9 w-9" />}</span><span className="mt-2 max-w-[140px] truncate text-[9px] text-[#8993aa]">{logo || "Store Logo"}</span></div></div>
          </div>
        </section>

        <section className="border-t border-[#edf0f5] p-5 sm:p-6"><div className="flex items-start gap-3"><PublicIcon name="view" className="mt-0.5 h-5 w-5 text-[#24345c]" /><div><h2 className="text-sm font-bold text-[#263252]">Preview</h2><p className="mt-1 text-[11px] text-[#8993aa]">See how your storefront will look with your information.</p></div></div><div className="mt-5 overflow-hidden rounded-lg bg-gradient-to-r from-[#6d4df5] to-[#8c55ef] p-4 text-white"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{name || "Your Store Name"}</p><p className="mt-1 truncate text-[10px] text-white/75">Digital Products &nbsp;•&nbsp; Templates &nbsp;•&nbsp; More</p></div><span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-primary">{croppedLogo ? <img src={croppedLogo} alt="Store logo" className="h-full w-full object-cover" /> : <PublicIcon name="shopping-cart" className="h-7 w-7" />}</span></div></div><div className="mt-2 flex items-center gap-2 rounded-lg border border-[#e9edf5] px-3 py-2 text-[10px] text-[#8993aa]"><PublicIcon name="link" className="h-3.5 w-3.5" />{storeUrl}<PublicIcon name="right" className="ml-auto h-3 w-3" /></div></section>

        {isEdit && <section className="border-t border-[#edf0f5] p-5 sm:p-6"><div className="flex items-start gap-3"><PublicIcon name="settings" className="mt-0.5 h-5 w-5 text-[#24345c]" /><div><h2 className="text-sm font-bold text-[#263252]">Additional Settings</h2><p className="mt-1 text-[11px] text-[#8993aa]">Manage additional options for your storefront.</p></div></div><div className="mt-4 divide-y divide-[#edf0f5]">{[["Store Status", "Make your store visible to customers.", isPublished, setIsPublished, "Active"], ["Featured Store", "Showcase your store on the marketplace homepage.", isFeatured, setIsFeatured, "Inactive"], ["Allow Guest Purchase", "Let customers purchase without an account.", guestPurchase, setGuestPurchase, "Enabled"]].map(([label, hint, value, setter, stateLabel]) => <div key={label as string} className="flex items-center justify-between gap-4 py-3"><div><p className="text-xs font-semibold text-[#263252]">{label as string}</p><p className="mt-1 text-[10px] text-[#8993aa]">{hint as string}</p></div><button type="button" role="switch" aria-checked={value as boolean} onClick={() => (setter as (value: boolean) => void)(!(value as boolean))} className={`flex shrink-0 items-center gap-2 text-[10px] font-semibold ${value ? "text-[#263252]" : "text-[#8993aa]"}`}><span className={`relative h-5 w-9 rounded-full transition ${value ? "bg-emerald-600" : "bg-[#d7deea]"}`}><span className={`absolute top-1 h-3 w-3 rounded-full bg-white shadow-sm transition ${value ? "left-5" : "left-1"}`} /></span>{value ? "Enabled" : stateLabel as string}</button></div>)}</div></section>}

        <footer className="flex flex-col-reverse gap-3 border-t border-[#edf0f5] p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6">{isEdit && <button type="button" onClick={deleteStorefront} className="mr-auto inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"><PublicIcon name="delete" className="h-3.5 w-3.5" />Delete Storefront</button>}<Link href="/creator/storefront" className="inline-flex items-center justify-center rounded-lg border border-[#e1e5ee] px-5 py-2.5 text-xs font-semibold text-[#33405d] transition hover:border-primary hover:text-primary">Cancel</Link><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(255,103,0,0.18)] transition hover:bg-primary-hover"><PublicIcon name={isEdit ? "check" : "add"} className="h-3.5 w-3.5" />{isEdit ? "Update Storefront" : "Create Storefront"}</button></footer>
      </form>
      {feedback && <p role="status" className="mt-3 text-right text-xs font-medium text-emerald-600">{feedback}</p>}
    </div>
  );
}
