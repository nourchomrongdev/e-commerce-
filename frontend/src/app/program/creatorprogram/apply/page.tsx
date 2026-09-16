"use client";

import { useEffect, useRef, useState, type ComponentType, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import PhoneInput from "react-phone-number-input";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import PublicIcon from "@/components/icons/PublicIcon";
import { Button, InputText, Textarea, Toast } from "@/components/ui";
import { routes } from "@/lib/routeController";

type CountryOption = { value?: string; label?: string; divider?: boolean };
type CountryIcon = ComponentType<{ country?: string; label?: string; aspectRatio?: number; "aria-hidden"?: boolean }>;
type CropPosition = { x: number; y: number };
const socialNetworkOptions = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/username" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@username" },
  { key: "x", label: "X", placeholder: "https://x.com/username" },
];
const socialLogoFiles: Record<string, string> = {
  instagram: "instagram.svg",
  facebook: "facebook.svg",
  linkedin: "linkedin.svg",
  youtube: "youtube.svg",
  x: "twitter.svg",
};

const createCroppedImage = async (imageSrc: string, pixelCrop: Area, aspect: number) => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const imageElement = new Image();
    imageElement.onload = () => resolve(imageElement);
    imageElement.onerror = reject;
    imageElement.src = imageSrc;
  });
  const width = 1024;
  const height = Math.round(width / aspect);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to prepare image crop");
  context.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, width, height);
  return canvas.toDataURL("image/png");
};

function CountryPicker({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  iconComponent: Icon,
}: {
  value?: string;
  onChange: (value?: string) => void;
  options: CountryOption[];
  disabled?: boolean;
  readOnly?: boolean;
  iconComponent?: CountryIcon;
}) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => !option.divider && option.value === value);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, []);

  return (
    <div ref={pickerRef} className="PhoneInputCountry relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-md px-1 py-1 text-xs text-body outline-none hover:bg-surface-control focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Select country"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled || readOnly}
        onClick={() => setOpen((current) => !current)}
      >
        {Icon && <span className="creator-country-icon"><Icon country={value} label={selected?.label} aria-hidden /></span>}
        <span className="max-w-28 truncate">{selected?.label || "Select country"}</span>
        <PublicIcon name="down" className={`h-3 w-3 text-muted-soft transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 max-h-56 w-64 overflow-y-auto rounded-lg border border-border bg-white p-1 shadow-xl" role="listbox" aria-label="Countries">
          {options.map((option, index) => option.divider ? (
            <div key={`divider-${index}`} className="my-1 border-t border-divider" />
          ) : (
            <button
              key={option.value || option.label}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-body hover:bg-accent-light ${option.value === value ? "bg-accent-light font-semibold" : ""}`}
              onClick={() => {
                onChange(option.value || undefined);
                setOpen(false);
              }}
            >
              {Icon && <span className="creator-country-icon"><Icon country={option.value} label={option.label} aria-hidden /></span>}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ImageCropEditor({ source, title, aspect, onCropped, onClose }: { source: string; title: string; aspect: number; onCropped: (value: string) => void; onClose: () => void }) {
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
      onCropped(await createCroppedImage(source, area, aspect));
      onClose();
    } catch {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--creator-page-overlay)] p-4" role="dialog" aria-modal="true" aria-labelledby="image-crop-title">
      <div className="w-full max-w-[620px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--creator-page-divider)] px-5 py-4">
          <h2 id="image-crop-title" className="text-sm font-bold text-[var(--creator-page-ink)]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close crop dialog" className="grid h-8 w-8 place-items-center rounded-lg text-lg text-[var(--creator-page-soft-muted)] hover:bg-[var(--creator-page-subtle-bg)]">×</button>
        </div>
        <div className="p-5">
          <div
            className="relative h-[min(68vw,420px)] overflow-hidden rounded-xl bg-[var(--creator-page-dark)] outline-none focus:ring-2 focus:ring-primary"
            tabIndex={0}
            aria-label="Image crop area. Drag with mouse or touch. Use arrow keys to move. Use mouse wheel or pinch to zoom."
            onKeyDown={(event) => {
              const movement = event.shiftKey ? 10 : 2;
              if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
              event.preventDefault();
              setCrop((current) => ({
                x: current.x + (event.key === "ArrowLeft" ? -movement : event.key === "ArrowRight" ? movement : 0),
                y: current.y + (event.key === "ArrowUp" ? -movement : event.key === "ArrowDown" ? movement : 0),
              }));
            }}
          >
            <Cropper image={source} crop={crop} zoom={zoom} minZoom={1} maxZoom={3} zoomWithScroll aspect={aspect} cropShape="rect" showGrid onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, croppedAreaPixels) => setArea(croppedAreaPixels)} />
          </div>
          <p className="mt-3 text-center text-[11px] text-muted">Drag to move. Arrow keys move precisely. Mouse wheel or two-finger pinch zooms on touch devices.</p>
        </div>
        <div className="flex justify-end gap-3 border-t border-[var(--creator-page-divider)] px-5 py-4"><button type="button" onClick={onClose} className="rounded-lg border border-[var(--creator-page-cancel-border)] px-5 py-2.5 text-xs font-semibold text-[var(--creator-page-cancel-text)] hover:border-primary hover:text-primary">Cancel</button><button type="button" onClick={saveCrop} disabled={!area} className="rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">Save crop</button></div>
      </div>
    </div>
  );
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (file: File | undefined) => void }) {
  const isAvatar = label.toLowerCase().includes("avatar");

  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold text-body">{label} <span className="font-normal text-muted-soft">(optional)</span></span>
      <span className="block rounded-lg border border-[var(--creator-page-border)] bg-white p-2">
        {value ? <img src={value} alt={`${label} preview`} className={isAvatar ? "mx-auto mb-2 h-32 w-32 rounded-full object-cover" : "mb-2 h-32 w-full rounded-md object-cover"} /> : <span className={isAvatar ? "mx-auto mb-2 flex h-32 w-32 items-center justify-center rounded-full bg-surface-control text-center text-xs text-muted" : "mb-2 flex h-32 items-center justify-center rounded-md bg-surface-control text-xs text-muted"}>No image selected</span>}
        <input type="file" accept="image/*" onChange={(event) => onChange(event.currentTarget.files?.[0])} className="block w-full text-xs text-muted file:mr-2 file:rounded-md file:border-0 file:bg-accent-light file:px-2 file:py-1.5 file:text-xs file:font-semibold file:text-primary" />
      </span>
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} role="alert" className="text-xs text-red-600">{message}</p> : null;
}

export default function CreatorProgramApplyPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validationTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [accountFullName, setAccountFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [avatarSource, setAvatarSource] = useState("");
  const [bannerSource, setBannerSource] = useState("");
  const [socialLinksOpen, setSocialLinksOpen] = useState(false);
  const [selectedSocials, setSelectedSocials] = useState<string[]>([]);
  const [socialPicker, setSocialPicker] = useState("");
  const [socialErrors, setSocialErrors] = useState<Record<string, string>>({});
  const [submitNotice, setSubmitNotice] = useState<{ variant: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    linkedin: "",
    youtube: "",
    x: "",
  });

  useEffect(() => {
    const clearSession = () => {
      window.localStorage.removeItem("marketplace-token");
      window.localStorage.removeItem("marketplace-user");
      window.localStorage.removeItem("current-user");
      window.localStorage.removeItem("creator-program-application");
    };

    const token = window.localStorage.getItem("marketplace-token");

    if (!token) {
      clearSession();
      const next = encodeURIComponent(routes.programs.creatorProgramApply());
      router.replace(`${routes.auth.login()}?next=${next}`);
      setAuthChecking(false);
      return;
    }

    const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";

    fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (response) => {
      if (!response.ok) throw new Error("Unauthorized");
      const result = await response.json();
      const user = result.user ?? {};
      setCurrentUserId(Number(user.id) || null);
      if (user.role === "creator" || user.hasApplied) {
        router.replace(routes.programs.creatorProgramReview());
        return;
      }
      setAccountFullName(user.name || user.fullName || "");
      setUsername(user.username || "");
    }).catch(() => {
      clearSession();
      const next = encodeURIComponent(routes.programs.creatorProgramApply());
      router.replace(`${routes.auth.login()}?next=${next}`);
      setAccountFullName("");
      setUsername("");
    }).finally(() => {
      setAuthChecking(false);
    });
  }, [router]);

  const readImage = (file: File | undefined, setImageSource: (value: string) => void) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, image: "Please choose an image file." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageSource(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const addSocialNetwork = (network: string) => {
    const nextNetwork = typeof network === "string" ? network.trim() : "";
    if (!nextNetwork || selectedSocials.includes(nextNetwork)) return;
    setSelectedSocials((current) => [...current, nextNetwork]);
  };

  const handleSocialSelect = (value: string | null | undefined) => {
    const nextNetwork = typeof value === "string" ? value.trim() : "";
    if (!nextNetwork) return;
    const isValidOption = socialNetworkOptions.some(({ key }) => key === nextNetwork);
    if (!isValidOption) return;
    addSocialNetwork(nextNetwork);
    setSocialPicker("");
  };

  const detectSocialNetworkFromUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const urlText = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      const url = new URL(urlText);
      const host = url.hostname.replace(/^www\./i, "").toLowerCase();
      const directMatch = socialNetworkOptions.find(({ key }) => {
        if (key === "x") return host.includes("x.com") || host.includes("twitter.com") || host.includes("t.co");
        if (key === "youtube") return host.includes("youtube.com") || host.includes("youtu.be");
        return host.includes(`${key}.com`) || host.includes(`${key}.co`);
      });
      return directMatch?.key ?? null;
    } catch {
      return null;
    }
  };

  const updateSocialLink = (network: string, rawValue: string | null | undefined) => {
    const safeNetwork = typeof network === "string" ? network.trim() : "";
    if (!safeNetwork) return;
    const nextValueFromUser = typeof rawValue === "string" ? rawValue : "";
    const normalizedValue = nextValueFromUser.trim();
    const normalizedUrl = !normalizedValue ? "" : /^https?:\/\//i.test(normalizedValue) ? normalizedValue : `https://${normalizedValue}`;
    const detectedNetwork = detectSocialNetworkFromUrl(normalizedUrl);

    if (normalizedValue && !detectedNetwork) {
      setSocialErrors((current) => ({ ...current, [safeNetwork]: "Please enter a valid social profile URL." }));
      setSocialLinks((current) => ({ ...current, [safeNetwork]: normalizedValue }));
      return;
    }

    setSocialErrors((current) => ({ ...current, [safeNetwork]: "" }));

    if (detectedNetwork && detectedNetwork !== safeNetwork) {
      setSelectedSocials((current) => {
        const withoutCurrent = current.filter((item) => item !== safeNetwork);
        return withoutCurrent.includes(detectedNetwork) ? withoutCurrent : [...withoutCurrent, detectedNetwork];
      });
      setSocialLinks((current) => {
        const updated = { ...current };
        delete updated[safeNetwork as keyof typeof updated];
        updated[detectedNetwork as keyof typeof updated] = normalizedUrl;
        return updated;
      });
      setSocialErrors((current) => ({ ...current, [detectedNetwork]: "", [safeNetwork]: "" }));
      return;
    }

    setSocialLinks((current) => ({
      ...current,
      [safeNetwork]: normalizedUrl,
    }));
  };

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const website = String(formData.get("websiteUrl") || "").trim();
    const phoneNumber = String(formData.get("phone") || "").trim();
    const nextErrors: Record<string, string> = {};

    if (!username.trim()) nextErrors.username = "Please enter a username.";
    if (website) {
      try {
        new URL(website);
      } catch {
        nextErrors.website = "Please enter a valid website URL.";
      }
    }
    if (!String(formData.get("bio") || "").trim()) nextErrors.bio = "Please enter a short bio.";
    if (!formData.get("consent")) nextErrors.consent = "Please accept the Terms and Conditions and Privacy Policy.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const firstInvalidField = event.currentTarget.querySelector<HTMLElement>("[aria-invalid='true']");
      firstInvalidField?.focus();
      return;
    }

    const token = window.localStorage.getItem("marketplace-token");
    if (!token) {
      const message = "Please sign in before applying to become a creator.";
      setErrors({ application: message });
      setSubmitNotice({ variant: "error", message });
      return;
    }

    setIsSubmitting(true);
    setSubmitNotice(null);

    try {
      const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/creator-program/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          username: username.trim(),
          phoneNumber,
          websiteUrl: website,
          bio: String(formData.get("bio") || "").trim(),
          avatarUrl,
          bannerUrl,
          socialLinks: Object.fromEntries(Object.entries(socialLinks).filter(([, url]) => url.trim())),
        }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        const message = result.error || "Unable to submit your application.";
        setErrors({ application: message });
        setSubmitNotice({ variant: "error", message });
        return;
      }
      const successMessage = "Your creator application has been submitted successfully.";
      if (currentUserId) {
        window.localStorage.setItem(`creator-program-application:${currentUserId}`, JSON.stringify({ status: "Under review", submittedAt: new Date().toISOString() }));
      }
      setSubmitNotice({ variant: "success", message: successMessage });
      router.push(routes.programs.creatorProgramReview());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit your application.";
      setErrors({ application: message });
      setSubmitNotice({ variant: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scheduleFieldCheck = (field: string, value: string | boolean) => {
    const currentTimer = validationTimers.current[field];
    if (currentTimer) clearTimeout(currentTimer);

    validationTimers.current[field] = setTimeout(() => {
      let message = "";
      const text = typeof value === "string" ? value.trim() : "";

      if (["username", "bio"].includes(field) && !text) {
        message = field === "username" ? "Please enter a username." : "Please enter a short bio.";
      } else if (field === "website" && text) {
        try {
          new URL(text);
        } catch {
          message = "Please enter a valid website URL.";
        }
      } else if (field === "consent" && !value) {
        message = "Please accept the Terms and Conditions and Privacy Policy.";
      }

      setErrors((current) => ({ ...current, [field]: message }));
    }, 200);
  };

  return (
    <main className="min-h-screen bg-[var(--creator-page-bg)] text-slate-800">
      {submitNotice && (
        <Toast
          variant={submitNotice.variant}
          message={submitNotice.message}
          onClose={() => setSubmitNotice(null)}
        />
      )}
      <Navbar active="programs" />
      <div className="mx-auto max-w-[1100px] px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href={routes.programs.creatorProgram()} className="inline-flex items-center gap-2 text-sm font-semibold text-primary no-underline hover:underline">
            <span aria-hidden="true">←</span>
            <span>Creator Program</span>
          </Link>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Application</p>
          <h1 className="mt-3 text-[42px] font-extrabold leading-[1.02] tracking-[-2px] text-[var(--creator-page-ink)] sm:text-[54px] lg:text-[60px]">Apply to become a creator</h1>
          <p className="mt-4 max-w-[980px] text-[18px] leading-8 text-slate-500">
            Tell us about your store, products, and audience. Only information needed to review your application is requested.
          </p>
        </div>

        {authChecking && (
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
            Checking your account access...
          </div>
        )}

<div className="h-px w-full bg-[var(--creator-page-border)]" />

        <form onSubmit={submitApplication} noValidate aria-busy={isSubmitting} className={`pt-8 sm:pt-10 ${authChecking || isSubmitting ? "pointer-events-none opacity-80" : ""}`}>
          <FieldError id="application-error" message={errors.application} />

          <div className="space-y-1">
            <label htmlFor="full-name" className="text-[15px] font-semibold text-[var(--creator-page-label)]">Full name</label>
            <InputText id="full-name" name="fullName" value={accountFullName} readOnly disabled={isSubmitting} aria-describedby="full-name-help" className="mt-2 cursor-not-allowed border-[var(--creator-page-border)] bg-[var(--creator-page-input-bg)] text-[var(--creator-page-input-text)]" placeholder="Account full name" />
            <p id="full-name-help" className="mt-2 text-[12px] text-slate-500">Full name comes from your account and cannot be changed here. Update it from your account settings.</p>
          </div>

          <div className="mt-5 space-y-1">
            <label htmlFor="username" className="text-[15px] font-semibold text-[var(--creator-page-label)]">Username</label>
            <InputText id="username" name="username" value={username} autoComplete="username" placeholder="Your username" invalid={Boolean(errors.username)} aria-invalid={Boolean(errors.username)} aria-describedby="username-error" className="mt-2 border-[var(--creator-page-border)] bg-[var(--creator-page-input-bg)]" disabled={isSubmitting} onChange={(event) => {
              const nextValue = event.currentTarget.value.replace(/\s+/g, "_");
              setUsername(nextValue);
              scheduleFieldCheck("username", nextValue);
            }} />
            <FieldError id="username-error" message={errors.username} />
          </div>

          <div className="mt-5 space-y-1">
            <label htmlFor="phone" className="text-[15px] font-semibold text-[var(--creator-page-label)]">Phone number <span className="font-normal text-slate-500">(optional)</span></label>
            <div className="mt-2">
              <PhoneInput
                id="phone"
                name="phone"
                international
                defaultCountry="KH"
                countryCallingCodeEditable
                countrySelectComponent={CountryPicker}
                value={phone}
                onChange={(value) => setPhone(value || "")}
                placeholder="Enter phone number"
                className="creator-phone-input"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="mt-5 space-y-1">
            <label htmlFor="bio" className="text-[15px] font-semibold text-[var(--creator-page-label)]">Bio</label>
            <Textarea id="bio" name="bio" rows={4} placeholder="Tell buyers about you and your work." invalid={Boolean(errors.bio)} aria-invalid={Boolean(errors.bio)} aria-describedby="bio-error" className="mt-2 border-[var(--creator-page-border)] bg-[var(--creator-page-input-bg)]" disabled={isSubmitting} onChange={(event) => scheduleFieldCheck("bio", event.currentTarget.value)} />
            <FieldError id="bio-error" message={errors.bio} />
          </div>

          <div className="mt-5 space-y-1">
            <label htmlFor="website-url" className="text-[15px] font-semibold text-[var(--creator-page-label)]">Website URL <span className="font-normal text-slate-500">(optional)</span></label>
            <InputText id="website-url" name="websiteUrl" type="url" placeholder="https://yourwebsite.com" invalid={Boolean(errors.website)} aria-invalid={Boolean(errors.website)} aria-describedby="website-error" className="mt-2 border-[var(--creator-page-border)] bg-[var(--creator-page-input-bg)]" disabled={isSubmitting} onChange={(event) => scheduleFieldCheck("website", event.currentTarget.value)} />
            <FieldError id="website-error" message={errors.website} />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ImageField label="Avatar image" value={avatarUrl} onChange={(file) => readImage(file, setAvatarSource)} />
            <ImageField label="Banner image" value={bannerUrl} onChange={(file) => readImage(file, setBannerSource)} />
          </div>
          {avatarSource && <ImageCropEditor source={avatarSource} title="Crop avatar image" aspect={1} onCropped={setAvatarUrl} onClose={() => setAvatarSource("")} />}
          {bannerSource && <ImageCropEditor source={bannerSource} title="Crop banner image" aspect={16 / 6} onCropped={setBannerUrl} onClose={() => setBannerSource("")} />}

          <div className="mt-5 space-y-3">
            <button type="button" aria-pressed={socialLinksOpen} onClick={() => setSocialLinksOpen((open) => !open)} className="flex w-full items-center justify-between rounded-lg border border-[var(--creator-page-border)] bg-[var(--creator-page-input-bg)] px-3 py-2.5 text-left text-xs font-semibold text-[var(--creator-page-label)] hover:border-primary">
              <span>Social links <span className="font-normal text-slate-500">(optional)</span></span>
              <span className={`relative h-5 w-9 rounded-full transition ${socialLinksOpen ? "bg-primary" : "bg-slate-300"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${socialLinksOpen ? "translate-x-4" : "translate-x-0.5"}`} /></span>
            </button>
            {socialLinksOpen && <div className="space-y-3">
              <select
                value={socialPicker}
                onChange={(event) => handleSocialSelect(event.currentTarget?.value ?? "")}
                disabled={isSubmitting}
                className="select-chevron w-fit min-w-48 rounded-lg border border-[var(--creator-page-border)] bg-[var(--creator-page-input-bg)] px-3 py-2 text-xs text-[var(--creator-page-label)] focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Add more social links...</option>
                {socialNetworkOptions.filter(({ key }) => !selectedSocials.includes(key)).map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
              </select>
              <div className="space-y-3">
                {selectedSocials.map((network) => {
                  const option = socialNetworkOptions.find(({ key }) => key === network);
                  if (!option) return null;
                  const socialValue = socialLinks[network as keyof typeof socialLinks] ?? "";
                  const logoFile = socialLogoFiles[network];
                  const logoSrc = logoFile ? `/logos/${logoFile}` : "";

                  return <div key={network} className="flex items-end gap-2">
                    <label className="min-w-0 flex-1 space-y-1">
                      <span className="text-xs text-slate-500">{option.label}</span>
                      <span className="relative block">
                        <InputText
                          className="pr-12 border-[var(--creator-page-border)] bg-[var(--creator-page-input-bg)]"
                          value={socialValue}
                          disabled={isSubmitting}
                          onChange={(event) => updateSocialLink(network, event?.currentTarget?.value ?? "")}
                          type="url"
                          placeholder={option.placeholder}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-white shadow-sm">
                          {logoSrc ? <img src={logoSrc} alt="" className="h-4 w-4 object-contain" /> : null}
                        </span>
                      </span>
                      {socialErrors[network] ? <span className="mt-1 block text-xs text-red-500">{socialErrors[network]}</span> : null}
                    </label>
                    <button
                      type="button"
                      aria-label={`Remove ${option.label}`}
                      disabled={isSubmitting}
                      onClick={() => {
                        setSelectedSocials((current) => current.filter((item) => item !== network));
                        setSocialLinks((current) => {
                          const nextLinks = { ...current };
                          delete nextLinks[network as keyof typeof nextLinks];
                          return nextLinks;
                        });
                        setSocialErrors((current) => {
                          const nextErrors = { ...current };
                          delete nextErrors[network];
                          return nextErrors;
                        });
                      }}
                      className="mb-1 grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-status-danger-surface hover:text-status-danger"
                    >
                      <PublicIcon name="x" className="h-4 w-4" />
                    </button>
                  </div>;
                })}
              </div>
            </div>}
            <FieldError id="image-error" message={errors.image} />
          </div>

          <label className="mt-6 flex items-start gap-3 border-t border-[var(--creator-page-border)] pt-4 text-sm leading-6 text-slate-600">
            <input type="checkbox" name="consent" aria-invalid={Boolean(errors.consent)} aria-describedby="consent-error" disabled={isSubmitting} onChange={(event) => scheduleFieldCheck("consent", event.currentTarget.checked)} className="mt-1 h-4 w-4 shrink-0 accent-primary disabled:cursor-not-allowed" />
            <span>I agree to the <Link href={routes.legal.terms()} className="text-primary underline">Terms and Conditions</Link> and acknowledge the <Link href={routes.legal.privacy()} className="text-primary underline">Privacy Policy</Link>.</span>
          </label>
          <FieldError id="consent-error" message={errors.consent} />

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href={routes.programs.creatorProgram()} className={`inline-flex items-center justify-center rounded-lg border border-[var(--creator-page-border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--creator-page-label)] no-underline hover:bg-slate-50 ${isSubmitting ? "pointer-events-none opacity-60" : ""}`} aria-disabled={isSubmitting}>Cancel</Link>
            <Button type="submit" size="sm" className="!px-5 !py-3 !text-[12px] !font-semibold" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit application"}</Button>
          </div>
        </form>
      </div>
      <PublicFooter />
    </main>
  );
}
