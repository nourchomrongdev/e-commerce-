"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import PublicIcon from "@/components/icons/PublicIcon";
import { Card, CardTitle, Toast } from "@/components/ui";

const steps: readonly string[] = [
  "Basic Information",
  "Pricing & Access",
  "Review & Publish",
];
type Props = { productsPath: string; storefrontName: string };
type EditableProduct = {
  id: number;
  uuid?: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  discount: number;
  discountType?: "none" | "percentage" | "fixed";
  discountAmount?: number;
  status: "Draft" | "Published" | "Archived";
  productType: string;
};
type StepProps = {
  productType: string;
  setProductType: (value: string) => void;
  editProduct?: EditableProduct;
  errors?: Record<string, string>;
};
type PreviewAsset = {
  id: string;
  title: string;
  type: string;
  url: string;
  isPrimary: boolean;
};
type UploadedFile = {
  fileName: string;
  storageKey: string;
  fileSize: number;
  mimeType: string;
};
type ProductRelease = {
  id: string;
  version: string;
  price: number;
  isFree: boolean;
  license: string;
  licenses: LicenseOffer[];
  releaseNotes: string;
  current: boolean;
  files: UploadedFile[];
  previewAssets: PreviewAsset[];
};
type LicenseOffer = {
  name: string;
  access: "Lifetime Access" | "Limited Downloads" | "Subscription";
  downloadLimit?: number;
};
const licenseNames = ["All", "Free", "Standard", "Personal", "Commercial", "Professional"];
const defaultLicenseOffer = (): LicenseOffer => ({
  name: "All",
  access: "Lifetime Access",
});
type ReleaseErrors = { version?: string; releaseNotes?: string; files?: string; previews?: string; licenses?: string };
type CropTarget = {
  releaseId: string;
  id?: string;
  source: string;
  title: string;
};
type CropPosition = { x: number; y: number };
type CatalogStatus = "loading" | "ready" | "error";
const input =
  "mt-1.5 h-9 w-full rounded-lg border border-border-control bg-white px-3 text-xs text-body outline-none placeholder:text-muted-faint focus:border-primary";
const select = `${input} select-chevron`;
const dropdownSelect = `${input} appearance-none select-chevron`;
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const MAX_PRODUCT_FILES = 10;
const MARKETPLACE_FEE_RATE = 0.2;
const MAX_DESCRIPTION_WORDS = 50;
const MAX_DESCRIPTION_CHARACTERS = 500;
const ValidationErrorsContext = createContext<Record<string, string>>({});
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const limitText = (value: string, maximum: number) => value.slice(0, maximum);
const wordPattern = /[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+/g;
const wordsIn = (value: string) => value.match(wordPattern) ?? [];
const limitWords = (value: string, maximum: number) => {
  const matches = [...value.matchAll(wordPattern)];
  const wordLimited = matches.length > maximum && matches[maximum - 1]
    ? value.slice(0, matches[maximum - 1].index! + matches[maximum - 1][0].length).trimEnd()
    : value;
  return wordLimited.slice(0, MAX_DESCRIPTION_CHARACTERS);
};
const wordCount = (value: string) => wordsIn(value).length;

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function formatPrice(price: number) {
  return price > 0 ? price.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "";
}

function formatPriceInput(value: string) {
  if (!value) return "";
  const [whole, fraction] = value.split(".");
  const normalizedWhole = whole.replace(/^0+(?=\d)/, "");
  const formattedWhole = normalizedWhole
    ? Number(normalizedWhole).toLocaleString("en-US")
    : "0";
  return fraction === undefined ? formattedWhole : `${formattedWhole}.${fraction}`;
}

async function readApiResponse(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      response.ok
        ? "The server returned an invalid response."
        : `Request failed (${response.status}). Is the backend running?`,
    );
  }
}

const createCroppedImage = async (source: string, pixelCrop: Area) => {
  const image = new Image();
  image.src = source;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
  });
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 675;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to prepare preview crop.");
  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return canvas.toDataURL("image/jpeg", 0.88);
};

export default function AddProductForm({
  productsPath,
  storefrontName,
  editProduct,
}: Props & { editProduct?: EditableProduct }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"Draft" | "Published" | "Archived">(
    editProduct?.status ?? "Draft",
  );
  const [productType, setProductType] = useState(
    editProduct?.productType ?? "Digital Download",
  );
  const [category, setCategory] = useState("");
  const [catalogStatus, setCatalogStatus] =
    useState<CatalogStatus>("loading");
  const [releases, setReleases] = useState<ProductRelease[]>([
    {
      id: crypto.randomUUID(),
      version: "1.0.0",
      price: editProduct?.price ?? 0,
      isFree: editProduct ? editProduct.price === 0 : false,
      license: "All",
      licenses: [defaultLicenseOffer()],
      releaseNotes: "Initial product release.",
      current: true,
      files: [],
      previewAssets: [],
    },
  ]);
  const [selectedReleaseId, setSelectedReleaseId] = useState(releases[0].id);
  const selectedRelease = releases.find((release) => release.id === selectedReleaseId) ?? releases[0];
  const freeProduct = Boolean(selectedRelease?.isFree);
  const [loadingReleases, setLoadingReleases] = useState(Boolean(editProduct));
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState<{
    name: string;
    size: number;
    index: number;
    total: number;
  } | null>(null);
  const [notice, setNotice] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [confirmSave, setConfirmSave] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [releaseErrors, setReleaseErrors] = useState<
    Record<string, ReleaseErrors>
  >({});
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
  const dirtyRef = useRef(false);
  const allowLeaveRef = useRef(false);
  const currentUrlRef = useRef("");
  const visibleSteps = steps;
  const busy = saving || uploadingFiles || loadingReleases;
  const updateRelease = (id: string, update: Partial<ProductRelease>) => {
    setReleases((current) => current.map((release) => {
      if (update.isFree !== undefined) {
        const sharedPrice = update.isFree
          ? 0
          : Number(editProduct?.price ?? current.find((item) => item.id === id)?.price ?? 0);
        return {
          ...release,
          ...(release.id === id ? update : {}),
          isFree: update.isFree,
          price: sharedPrice,
        };
      }
      if (update.price !== undefined)
        return { ...release, price: update.price };
      return release.id === id ? { ...release, ...update } : release;
    }));
  };
  const validateReleases = (showMessage = false) => {
    const errors = Object.fromEntries(
      releases.flatMap((release) => {
        const releaseError: ReleaseErrors = {};
        if (!release.version.trim())
          releaseError.version = "Enter a version number.";
        if (!release.releaseNotes.trim())
          releaseError.releaseNotes = "Enter release notes.";
        if (release.files.length === 0)
          releaseError.files = "Add at least one product file.";
        if (release.previewAssets.length === 0)
          releaseError.previews = "Add at least one preview asset.";
        if (release.licenses.length === 0)
          releaseError.licenses = "Choose at least one licence type.";
        return Object.keys(releaseError).length
          ? [[release.id, releaseError]]
          : [];
      }),
    );
    setReleaseErrors(errors);
    const valid = Object.keys(errors).length === 0;
    if (showMessage)
      setValidationError(
        valid
          ? ""
          : "Complete the highlighted fields for every product version.",
      );
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
    fetch(`${baseUrl}/versions`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => response.json())
      .then((data) => {
        const loadedReleases = (data.versions ?? []).map(
          (release: ProductRelease) => ({
            ...release,
            price: Number(editProduct.price ?? release.price ?? 0),
            isFree: editProduct.price === 0,
            license: release.license ?? "All",
            licenses: Array.isArray(release.licenses) && release.licenses.length
              ? release.licenses.map((license: LicenseOffer) => ({
                  ...defaultLicenseOffer(),
                  ...license,
                }))
              : [{ ...defaultLicenseOffer(), name: release.license ?? "All" }],
            id: String(release.id),
            files: release.files ?? [],
            previewAssets: (release.previewAssets ?? []).map(
              (preview, index) => ({ ...preview, isPrimary: index === 0 }),
            ),
          }),
        );
        if (loadedReleases.length) {
          setReleases(loadedReleases);
          setSelectedReleaseId(loadedReleases[0].id);
        }
      })
      .catch(() => setError("Unable to load existing product releases."))
      .finally(() => setLoadingReleases(false));
  }, [editProduct, storefrontName]);

  useEffect(() => {
    currentUrlRef.current = window.location.href;
    const shouldWarn = () =>
      !allowLeaveRef.current && (dirtyRef.current || uploadingFiles);
    const message = () =>
      uploadingFiles
        ? "A product file is still uploading. Leaving now will cancel the upload."
        : "You have unsaved product changes. Leaving now will discard them.";
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldWarn()) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const popState = () => {
      if (
        !shouldWarn() ||
        window.confirm(`${message()} Do you want to leave?`)
      ) {
        allowLeaveRef.current = true;
        uploadRequestsRef.current.forEach((request) => request.abort());
      } else {
        window.history.pushState(null, "", currentUrlRef.current);
      }
    };
    const linkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest("a");
      if (
        !link ||
        !shouldWarn() ||
        link.target === "_blank" ||
        event.defaultPrevented
      )
        return;
      const href = link.href;
      if (
        !href ||
        new URL(href, window.location.href).origin !== window.location.origin ||
        href === window.location.href
      )
        return;
      if (!window.confirm(`${message()} Do you want to leave?`)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      allowLeaveRef.current = true;
      uploadRequestsRef.current.forEach((request) => request.abort());
    };
    const saveClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "button[data-save-product='true']",
      );
      if (!target) return;
      const form = target.form;
      if (!form) return;
      event.preventDefault();
      event.stopPropagation();
      const invalidFields = Array.from(
        form.querySelectorAll<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >("input, select, textarea"),
      ).filter((field) => field.willValidate && !field.checkValidity());
      if (invalidFields.length) {
        const fieldLabels: Record<string, string> = {
          title: "Product Title",
          description: "Short Description",
          category: "Category",
          longDescription: "Product Description",
          price: "Product Price",
          discountAmount: "Fixed Discount Amount",
          discount: "Percentage Discount",
        };
        const names = [...new Set(invalidFields.map((field) => fieldLabels[field.name] || field.name || "a required field"))];
        setFieldErrors(
          Object.fromEntries(
            invalidFields.map((field) => [
              field.name,
              field.validationMessage || "This field is missing or incomplete.",
            ]),
          ),
        );
        setValidationError(`Cannot save. Complete the missing or incomplete fields: ${names.join(", ")}.`);
        const firstInvalidStep = stepPanelRefs.current.findIndex((panel) =>
          Boolean(panel?.contains(invalidFields[0])),
        );
        if (firstInvalidStep >= 0) setStep(firstInvalidStep);
        return;
      }
      if (!validateReleases(true)) {
        setStep(visibleSteps.indexOf("Pricing & Access"));
        return;
      }
      pendingFormRef.current = new FormData(form);
      setConfirmSave(true);
    };
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("popstate", popState);
    document.addEventListener("click", linkClick, true);
    document.addEventListener("click", saveClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("popstate", popState);
      document.removeEventListener("click", linkClick, true);
      document.removeEventListener("click", saveClick, true);
    };
  }, [releases, uploadingFiles, visibleSteps]);

  const goToNextStep = () => {
    setConfirmSave(false);
    if (visibleSteps[step] === "Basic Information" && catalogStatus !== "ready") {
      setValidationError(
        catalogStatus === "loading"
          ? "Catalog data is still loading. Please wait before continuing."
          : "Catalog data could not be loaded. Please retry before continuing.",
      );
      return;
    }
    if (visibleSteps[step] === "Pricing & Access" && !validateReleases(true))
      return;
    const panel = stepPanelRefs.current[step];
    const invalidFields = panel
      ? Array.from(
          panel.querySelectorAll<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          >("input, select, textarea"),
        ).filter((field) => !field.checkValidity())
      : [];
    const invalidField = invalidFields[0];
    if (invalidField) {
      setValidationError(
        `Complete the highlighted fields in ${visibleSteps[step]}.`,
      );
      setFieldErrors(
        Object.fromEntries(
          invalidFields.map((field) => [
            field.name,
            field.validationMessage || "This field is required.",
          ]),
        ),
      );
      invalidField.focus();
      return;
    }
    setValidationError("");
    setFieldErrors({});
    setStep((value) => value + 1);
  };
  const handleFiles = async (
    releaseId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const release = releases.find((item) => item.id === releaseId);
    const availableSlots = MAX_PRODUCT_FILES - (release?.files.length ?? 0);
    const chosenFiles = Array.from(event.target.files ?? []);
    const selectedFiles = chosenFiles.slice(0, Math.max(0, availableSlots));
    event.target.value = "";
    if (availableSlots <= 0) {
      setError(`A product version can contain at most ${MAX_PRODUCT_FILES} files.`);
      return;
    }
    if (!selectedFiles.length) return;
    if (selectedFiles.length < chosenFiles.length)
      setError(`Only ${MAX_PRODUCT_FILES} files are allowed per product version.`);
    setUploadingFiles(true);
    setUploadProgress(0);
    setError("");
    const token = window.localStorage.getItem("marketplace-token");
    try {
      for (const [index, file] of selectedFiles.entries()) {
        setUploadingFile({
          name: file.name,
          size: file.size,
          index: index + 1,
          total: selectedFiles.length,
        });
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () =>
            reject(new Error(`Unable to read ${file.name}.`));
          reader.readAsDataURL(file);
        });
        const result = await new Promise<{ file: UploadedFile }>(
          (resolve, reject) => {
            const request = new XMLHttpRequest();
            uploadRequestsRef.current.push(request);
            request.open(
              "POST",
              `${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/product-files`,
            );
            request.setRequestHeader("Content-Type", "application/json");
            if (token)
              request.setRequestHeader("Authorization", `Bearer ${token}`);
            request.upload.onprogress = (progress) => {
              if (progress.lengthComputable)
                setUploadProgress(
                  Math.round((progress.loaded / progress.total) * 100),
                );
            };
            request.onerror = () =>
              reject(new Error(`Unable to upload ${file.name}.`));
            request.onabort = () => reject(new Error("Upload cancelled."));
            request.onload = () => {
              try {
                const response = request.responseText
                  ? JSON.parse(request.responseText)
                  : {};
                if (request.status < 200 || request.status >= 300)
                  throw new Error(
                    response.error || `Unable to upload ${file.name}.`,
                  );
                resolve(response);
              } catch (uploadError) {
                reject(uploadError);
              }
            };
            request.send(
              JSON.stringify({
                data,
                fileName: file.name,
                mimeType: file.type || "application/octet-stream",
              }),
            );
          },
        );
        setReleases((current) =>
          current.map((release) =>
            release.id === releaseId
              ? { ...release, files: [...release.files, result.file] }
              : release,
          ),
        );
        setUploadProgress(100);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload product files.",
      );
    } finally {
      uploadRequestsRef.current = [];
      setUploadingFiles(false);
      setUploadingFile(null);
      setUploadProgress(0);
    }
  };
  const handlePreviewFiles = (
    releaseId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setCropTarget({
        releaseId,
        source: String(reader.result),
        title: file.name.replace(/\.[^.]+$/, ""),
      });
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const handleReplacePreview = (
    releaseId: string,
    id: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setCropTarget({
        releaseId,
        id,
        source: String(reader.result),
        title: file.name.replace(/\.[^.]+$/, ""),
      });
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const saveCrop = async () => {
    if (!cropTarget || !cropArea) return;
    try {
      const url = await createCroppedImage(cropTarget.source, cropArea);
      setReleases((current) =>
        current.map((release) => {
          if (release.id !== cropTarget.releaseId) return release;
          const previewAssets = cropTarget.id
            ? release.previewAssets.map((preview) =>
                preview.id === cropTarget.id
                  ? { ...preview, url, title: cropTarget.title }
                  : preview,
              )
            : [
                ...release.previewAssets,
                {
                  id: crypto.randomUUID(),
                  title: cropTarget.title,
                  type: "image",
                  url,
                  isPrimary: release.previewAssets.length === 0,
                },
              ];
          return { ...release, previewAssets };
        }),
      );
      setCropTarget(null);
      setCropArea(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (cropError) {
      setError(
        cropError instanceof Error
          ? cropError.message
          : "Unable to crop preview image.",
      );
    }
  };
  const saveProduct = async (form: FormData) => {
    if (saving) return;
    setConfirmSave(false);
    pendingFormRef.current = null;
    setSaving(true);
    setError("");
    const token = window.localStorage.getItem("marketplace-token");
    const productKey = editProduct?.uuid || editProduct?.id;
    try {
      const response = await fetch(
        editProduct
          ? `${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/products/${productKey}`
          : `${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/products`,
        {
          method: editProduct ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: String(form.get("title") || "").trim(),
            slug: String(form.get("slug") || "").trim(),
            shortDescription: String(form.get("description") || "").trim(),
            description: String(form.get("longDescription") || "").trim(),
            categoryName: form.get("category"),
            price: freeProduct ? 0 : Number(form.get("price") || 0),
            currency: String(form.get("currency") || "USD").slice(0, 3),
            status,
            productType,
            discountType: String(form.get("discountType") || "none"),
            discountAmount: Number(form.get("discountAmount") || form.get("discount") || 0),
            discount: Number(
              form.get("discount") ||
                form.get("existingDiscount") ||
                editProduct?.discount ||
                0,
            ),
            versions: releases.map((release) => ({
              id: /^\d+$/.test(release.id) ? Number(release.id) : undefined,
              version: release.version.trim(),
              price: release.isFree ? 0 : release.price,
              isFree: release.isFree,
              license: release.license,
              licenses: release.licenses.map((license) => ({ ...license, price: release.isFree ? 0 : release.price })),
              releaseNotes: release.releaseNotes.trim(),
              current: release.current,
              files: release.files,
              previews: release.previewAssets.map((preview, index) => ({
                ...preview,
                sortOrder: index,
              })),
            })),
          }),
        },
      );
      const data = await readApiResponse(response);
      if (!response.ok)
        throw new Error(data.error || "Unable to save product.");
      allowLeaveRef.current = true;
      dirtyRef.current = false;
      setNotice(true);
      window.setTimeout(() => router.push(productsPath), 900);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save product.",
      );
    } finally {
      setSaving(false);
    }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const isReviewStep = step === visibleSteps.length - 1;
    if (!submitter?.dataset.saveProduct || !isReviewStep) {
      if (step < visibleSteps.length - 1) goToNextStep();
      return;
    }
    if (!validateReleases(true)) {
      setStep(visibleSteps.indexOf("Pricing & Access"));
      return;
    }
    return;
  };

  useEffect(() => {
    setValidationError("");
    stepRefs.current[step]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [step]);

  useEffect(() => {
    if (!validationError) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [validationError]);

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
    const title = document.querySelector<HTMLInputElement>(
      'input[name="title"]',
    );
    const slug = document.querySelector<HTMLInputElement>('input[name="slug"]');
    const description = document.querySelector<HTMLTextAreaElement>(
      'textarea[name="description"]',
    );
    const longDescription = document.querySelector<HTMLTextAreaElement>(
      'textarea[name="longDescription"]',
    );
    const price = document.querySelector<HTMLInputElement>(
      'input[name="price"]',
    );
    const category = document.querySelector<HTMLSelectElement>(
      'select[name="category"]',
    );
    if (title) title.value = editProduct.name;
    if (slug) slug.value = slugify(editProduct.name);
    if (description) description.value = editProduct.shortDescription || "";
    if (longDescription) longDescription.value = editProduct.description;
    if (price) price.value = String(editProduct.price);
    if (category) category.value = "Development";
    setReviewRevision((value) => value + 1);
  }, [editProduct]);

  return (
    <ValidationErrorsContext.Provider value={fieldErrors}>
      <form
        ref={formRef}
        onSubmit={submit}
        onInputCapture={(event) => {
          const target = event.target;
          if (
            !(target instanceof HTMLInputElement) &&
            !(target instanceof HTMLTextAreaElement)
          )
            return;
          if (target instanceof HTMLInputElement && target.type !== "text" && target.type !== "search")
            return;
          const isProductDescription = target instanceof HTMLTextAreaElement && target.name === "longDescription";
          const maximum = target instanceof HTMLTextAreaElement ? 100 : 40;
          const limitExceeded = isProductDescription
            ? wordCount(target.value) > MAX_DESCRIPTION_WORDS || target.value.length > MAX_DESCRIPTION_CHARACTERS
            : target.value.length > maximum;
          target.dataset.limitExceeded = String(limitExceeded);
          if (limitExceeded) {
            target.value = isProductDescription ? limitWords(target.value, MAX_DESCRIPTION_WORDS) : limitText(target.value, maximum);
            if (target.name) {
              setFieldErrors((current) => {
                const next = { ...current };
                delete next[target.name];
                return next;
              });
            }
          }
        }}
        onInput={(event) => {
          dirtyRef.current = true;
          const target = event.target as HTMLInputElement;
          const name = target.name;
          if (name === "title") {
            const slug = formRef.current?.elements.namedItem(
              "slug",
            ) as HTMLInputElement | null;
            if (slug) slug.value = slugify(target.value);
          }
          if (name) {
            setReviewRevision((value) => value + 1);
            setFieldErrors((current) => {
              if (!current[name]) return current;
              const next = { ...current };
              delete next[name];
              return next;
            });
          }
        }}
        className="relative"
        aria-busy={busy}
      >
        {notice && (
          <Toast
            variant="success"
            message={
              status === "Published"
                ? "Your product is now published."
                : "Your product has been saved as a draft."
            }
            onClose={() => setNotice(false)}
          />
        )}
        {(error || validationError) && (
          <Toast
            variant="error"
            title="Product form error"
            message={error || validationError}
            duration={5000}
            onClose={() => {
              setError("");
              setValidationError("");
            }}
          />
        )}
        {uploadingFiles && uploadingFile && (
          <div
            className="fixed inset-0 z-[90] grid place-items-center bg-[#111b40]/55 p-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="uploading-file-title"
          >
            <section className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-2xl">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-light text-primary">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                </span>
                <div className="min-w-0">
                  <p
                    id="uploading-file-title"
                    className="text-sm font-bold text-heading"
                  >
                    Uploading file
                  </p>
                  <p className="mt-1 truncate text-xs text-body">
                    {uploadingFile.name}
                  </p>
                  <p className="mt-1 text-[10px] text-muted">
                    {formatFileSize(uploadingFile.size)} · File{" "}
                    {uploadingFile.index} of {uploadingFile.total}
                  </p>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-muted">
                <span>Do not close or navigate away.</span>
                <span className="text-primary">{uploadProgress}%</span>
              </div>
            </section>
          </div>
        )}
        <fieldset disabled={busy} className="contents">
          <input
            type="hidden"
            name="existingDiscount"
            value={editProduct?.discount ?? 0}
          />
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
              Product setup
            </p>
            <p className="text-[10px] font-semibold text-primary">
              Step {step + 1} of {visibleSteps.length}
            </p>
          </div>
          <nav
            className="scrollbar-hidden mb-5 flex min-w-0 snap-x items-center overflow-x-auto pb-2"
            aria-label="Product creation steps"
          >
            {visibleSteps.map((label, index) => {
              const active = index === step;
              const complete = index < step;
              return (
                <div
                  ref={(element) => {
                    stepRefs.current[index] = element;
                  }}
                  key={label}
                  className="flex min-w-[9.25rem] snap-start items-center sm:min-w-0 sm:flex-1"
                >
                  <button
                    type="button"
                    aria-current={active ? "step" : undefined}
                    onClick={() => index <= step && setStep(index)}
                    disabled={index > step}
                    aria-disabled={index > step}
                    title={index > step ? "Complete the current step to continue." : undefined}
                    className={`group flex min-w-max items-center gap-1.5 text-[9px] transition disabled:cursor-not-allowed disabled:opacity-60 sm:text-[10px] ${active ? "font-semibold text-primary" : complete ? "font-medium text-status-success" : "text-muted"}`}
                  >
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[9px] font-bold ${active ? "border-primary bg-primary text-white" : complete ? "border-status-success bg-status-success text-white" : "border-border bg-surface-control text-muted"}`}
                    >
                      {complete ? (
                        <PublicIcon name="check" className="h-3 w-3" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span>{label}</span>
                  </button>
                  {index < visibleSteps.length - 1 && (
                    <span
                      className={`mx-2 h-px min-w-3 flex-1 ${complete ? "bg-status-success" : "bg-border"}`}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </nav>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <Card className="flex min-w-0 flex-col p-5 sm:p-6">
              <div
                ref={(element) => {
                  stepPanelRefs.current[
                    visibleSteps.indexOf("Basic Information")
                  ] = element;
                }}
                hidden={visibleSteps[step] !== "Basic Information"}
              >
                <BasicInformation
                  productType={productType}
                  setProductType={setProductType}
                  category={category}
                  setCategory={setCategory}
                  onCatalogStatusChange={setCatalogStatus}
                  errors={fieldErrors}
                  editProduct={editProduct}
                />
              </div>
              <div
                  ref={(element) => {
                    stepPanelRefs.current[visibleSteps.indexOf("Pricing & Access")] =
                      element;
                  }}
                  hidden={visibleSteps[step] !== "Pricing & Access"}
              >
                <div className="border-b border-divider pb-8">
                  <label className={`mb-5 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${freeProduct ? "border-primary bg-accent-light" : "border-border bg-white hover:border-primary/50 hover:bg-surface-hover"}`}>
                    <input type="checkbox" checked={freeProduct} onChange={(event) => { const checked = event.target.checked; updateRelease(selectedReleaseId, { isFree: checked, ...(checked ? { price: 0 } : { licenses: selectedRelease?.licenses.length ? selectedRelease.licenses : [defaultLicenseOffer()], license: selectedRelease?.license || "All" }) }); setReviewRevision((value) => value + 1); }} className="mt-0.5 h-5 w-5 shrink-0 accent-primary" />
                    <span><span className="block text-sm font-bold text-heading">This product is free</span><span className="mt-1 block text-[11px] font-normal leading-4 text-muted">All versions use the same product price and free status.</span></span>
                  </label>
                  {freeProduct ? <FreePricing /> : <Pricing selectedRelease={releases.find((release) => release.id === selectedReleaseId) ?? releases[0]} onUpdateRelease={(update) => updateRelease(selectedReleaseId, update)} initialDiscountType={editProduct?.discountType} initialDiscount={editProduct?.discount} initialDiscountAmount={editProduct?.discountAmount} />}
                </div>
                <div className="mt-8">
                <ProductFiles
                  releases={releases}
                  releaseErrors={releaseErrors}
                  loadingReleases={loadingReleases}
                  uploadingFiles={uploadingFiles}
                  freeProduct={freeProduct}
                  selectedReleaseId={selectedReleaseId}
                  onSelectRelease={setSelectedReleaseId}
                  onFiles={handleFiles}
                  onAddRelease={() => {
                    const id = crypto.randomUUID();
                    setReleases((current) => {
                      const sharedPrice = Number(editProduct?.price ?? current[0]?.price ?? 0);
                      const sharedIsFree = sharedPrice === 0 || current[0]?.isFree === true;
                      return [
                        {
                          id,
                          version: "",
                          price: sharedIsFree ? 0 : sharedPrice,
                          isFree: sharedIsFree,
                          license: "All",
                          licenses: [defaultLicenseOffer()],
                          releaseNotes: "",
                          current: false,
                          files: [],
                          previewAssets: [],
                        },
                        ...current,
                      ];
                    });
                    setSelectedReleaseId(id);
                    return id;
                  }}
                  onUpdateRelease={(id, update) =>
                    setReleases((current) =>
                      current.map((release) =>
                        update.current
                          ? {
                              ...release,
                              ...(release.id === id
                                ? update
                                : { current: false }),
                            }
                          : release.id === id
                            ? { ...release, ...update }
                            : release,
                      ),
                    )
                  }
                  onRemoveRelease={(id) =>
                    setReleases((current) =>
                      current.filter((release) => release.id !== id),
                    )
                  }
                  onRemoveFile={(releaseId, storageKey) =>
                    setReleases((current) =>
                      current.map((release) =>
                        release.id === releaseId
                          ? {
                              ...release,
                              files: release.files.filter(
                                (file) => file.storageKey !== storageKey,
                              ),
                            }
                          : release,
                      ),
                    )
                  }
                  onRenameFile={(releaseId, storageKey, fileName) =>
                    setReleases((current) =>
                      current.map((release) =>
                        release.id === releaseId
                          ? {
                              ...release,
                              files: release.files.map((file) =>
                                file.storageKey === storageKey
                                  ? { ...file, fileName }
                                  : file,
                              ),
                            }
                          : release,
                      ),
                    )
                  }
                  onPreviewFiles={handlePreviewFiles}
                  onReplacePreview={handleReplacePreview}
                  onUpdatePreview={(releaseId, id, update) =>
                    setReleases((current) =>
                      current.map((release) =>
                        release.id === releaseId
                          ? {
                              ...release,
                              previewAssets: release.previewAssets.map(
                                (preview) =>
                                  preview.id === id
                                    ? { ...preview, ...update }
                                    : preview,
                              ),
                            }
                          : release,
                      ),
                    )
                  }
                  onReorderPreview={(releaseId, sourceId, targetId) =>
                    setReleases((current) =>
                      current.map((release) => {
                        if (release.id !== releaseId || sourceId === targetId)
                          return release;
                        const previewAssets = [...release.previewAssets];
                        const sourceIndex = previewAssets.findIndex(
                          (preview) => preview.id === sourceId,
                        );
                        const targetIndex = previewAssets.findIndex(
                          (preview) => preview.id === targetId,
                        );
                        if (sourceIndex < 0 || targetIndex < 0) return release;
                        const [movedPreview] = previewAssets.splice(
                          sourceIndex,
                          1,
                        );
                        previewAssets.splice(targetIndex, 0, movedPreview);
                        return {
                          ...release,
                          previewAssets: previewAssets.map(
                            (preview, index) => ({
                              ...preview,
                              isPrimary: index === 0,
                            }),
                          ),
                        };
                      }),
                    )
                  }
                  onRemovePreview={(releaseId, id) =>
                    setReleases((current) =>
                      current.map((release) => {
                        if (release.id !== releaseId) return release;
                        const previewAssets = release.previewAssets.filter(
                          (preview) => preview.id !== id,
                        );
                        return {
                          ...release,
                          previewAssets: previewAssets.map(
                            (preview, index) => ({
                              ...preview,
                              isPrimary: index === 0,
                            }),
                          ),
                        };
                      }),
                    )
                  }
                />
                </div>
                <div className="order-3 mt-8 border-t border-divider pt-8">
                  <LicenseAccess release={releases.find((release) => release.id === selectedReleaseId) ?? releases[0]} releaseErrors={releaseErrors} onUpdateRelease={(update) => updateRelease(selectedReleaseId, update)} />
                </div>
              </div>
              <div
                ref={(element) => {
                  stepPanelRefs.current[
                    visibleSteps.indexOf("Review & Publish")
                  ] = element;
                }}
                hidden={visibleSteps[step] !== "Review & Publish"}
              >
                <ReviewProduct
                  releases={releases}
                  productType={productType}
                  storefrontName={storefrontName}
                  freeProduct={freeProduct}
                  form={formRef.current}
                  revision={reviewRevision}
                />
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-divider pt-5">
                <Link
                  href={productsPath}
                  aria-disabled={busy}
                  onClick={(event) => {
                    if (busy) event.preventDefault();
                  }}
                  className={`rounded-lg border border-border-control px-3.5 py-2 text-xs font-medium text-muted no-underline hover:bg-surface-control ${busy ? "pointer-events-none opacity-50" : ""}`}
                >
                  Cancel
                </Link>
                <div className="flex gap-2">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep((value) => value - 1)}
                      className="rounded-lg border border-border-control px-3.5 py-2 text-xs font-medium text-body hover:bg-surface-control"
                    >
                      Back
                    </button>
                  )}
                  {step < visibleSteps.length - 1 ? (
                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
                    >
                      Next <PublicIcon name="right" className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      data-save-product="true"
                      disabled={busy}
                      aria-busy={saving}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
                    >
                      {saving
                        ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white" aria-hidden="true" /> Saving...</>
                        : status === "Published"
                          ? "Publish"
                          : "Save Draft"}{" "}
                      {!saving && <PublicIcon name="check" className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </Card>
            <aside className="space-y-5">
              <Card className="p-5">
                <CardTitle>Product Status</CardTitle>
                <div className="mt-4 space-y-3">
                  {(["Draft", "Published", "Archived"] as const).map(
                    (option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-start gap-2 text-xs text-body"
                      >
                        <input
                          type="radio"
                          name="status"
                          checked={status === option}
                          onChange={() => setStatus(option)}
                          className="mt-0.5 accent-primary"
                        />
                        <span>
                          <strong>{option}</strong>
                          <span className="mt-1 block text-[10px] text-muted-soft">
                            {option === "Draft"
                              ? "Saved privately until you publish."
                              : option === "Published"
                                ? "Visible to customers after publishing."
                                : "Hidden from customers."}
                          </span>
                        </span>
                      </label>
                    ),
                  )}
                </div>
              </Card>
              <Card className="p-5">
                <CardTitle>Tips</CardTitle>
                <ul className="mt-3 space-y-2 text-[10px] leading-4 text-muted">
                  <li>Use a clear and descriptive title.</li>
                  <li>Add high-quality product files.</li>
                  <li>Set a fair price and license.</li>
                  <li>Review everything before publishing.</li>
                </ul>
              </Card>
            </aside>
          </div>
          {cropTarget && (
            <div
              className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111b40]/55 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="preview-crop-title"
            >
              <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-divider px-5 py-4">
                  <div>
                    <h2
                      id="preview-crop-title"
                      className="text-sm font-bold text-heading"
                    >
                      Crop preview asset
                    </h2>
                    <p className="mt-1 text-[11px] text-muted">
                      Position the image inside the 16:9 preview frame.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCropTarget(null)}
                    aria-label="Close crop dialog"
                    className="grid h-8 w-8 place-items-center rounded-lg text-lg text-muted hover:bg-surface-control"
                  >
                    ×
                  </button>
                </div>
                <div className="relative h-[min(58vw,360px)] bg-[#111b40]">
                  <Cropper
                    image={cropTarget.source}
                    crop={crop}
                    zoom={zoom}
                    aspect={16 / 9}
                    cropShape="rect"
                    showGrid
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, area) => setCropArea(area)}
                  />
                </div>
                <div className="flex items-center gap-3 border-t border-divider px-5 py-4">
                  <label className="flex flex-1 items-center gap-3 text-[10px] font-semibold text-muted">
                    Zoom
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(event) => setZoom(Number(event.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setCropTarget(null)}
                    className="rounded-lg border border-border-control px-4 py-2 text-xs font-semibold text-body"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveCrop}
                    disabled={!cropArea}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save crop
                  </button>
                </div>
              </section>
            </div>
          )}
          {confirmSave && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111b40]/60 p-4 backdrop-blur-[2px]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-save-title"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setConfirmSave(false);
              }}
            >
              <section className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
                <div className="border-b border-divider bg-surface-muted px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-light text-primary">
                      <PublicIcon name="check" className="h-5 w-5" />
                    </span>
                    <div>
                      <h2
                        id="confirm-save-title"
                        className="text-sm font-bold text-heading"
                      >
                        {editProduct
                          ? "Save product changes?"
                          : "Create this product?"}
                      </h2>
                      <p className="mt-1 text-[11px] leading-4 text-muted">
                        {editProduct
                          ? "Your updated product details will be saved to the storefront."
                          : "Your product will be added to the storefront as a draft."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setConfirmSave(false)}
                    className="rounded-lg border border-border-control px-4 py-2 text-xs font-semibold text-body hover:bg-surface-control"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      if (pendingFormRef.current)
                        void saveProduct(pendingFormRef.current);
                    }}
                    aria-busy={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
                  >
                    {saving && (
                      <span
                        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white"
                        aria-hidden="true"
                      />
                    )}
                    {saving
                      ? "Saving..."
                      : editProduct
                        ? "Save changes"
                        : "Create product"}
                  </button>
                </div>
              </section>
            </div>
          )}
        </fieldset>
      </form>
    </ValidationErrorsContext.Provider>
  );
}

function Title({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-base font-bold text-heading">{title}</h2>
      <p className="mt-1 text-xs text-muted">{description}</p>
    </div>
  );
}
function Field({
  label,
  children,
  required = false,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  const errors = useContext(ValidationErrorsContext);
  const errorKey = (
    {
      "Product Title": "title",
      "Short Description": "description",
      Tags: "tags",
      Category: "category",
      "Product Description": "longDescription",
      Price: "price",
      "License Type": "license",
    } as Record<string, string>
  )[label];
  const error = errorKey ? errors[errorKey] : undefined;
  return (
    <label className="block text-[11px] font-semibold text-body">
      {label}
      {required && <span className="text-status-danger"> *</span>}
      {children}
      {error && (
        <span className="mt-1 block text-[10px] font-normal text-status-danger">
          {error}
        </span>
      )}
    </label>
  );
}

function BasicInformation({
  productType,
  setProductType,
  category,
  setCategory,
  onCatalogStatusChange,
}: StepProps & {
  category: string;
  setCategory: (value: string) => void;
  onCatalogStatusChange: (status: CatalogStatus) => void;
}) {
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [productTypes, setProductTypes] = useState<Array<{ name: string; description?: string }>>([]);
  const [catalogStatus, setCatalogStatus] = useState<CatalogStatus>("loading");
  useEffect(() => {
    let active = true;
    const token = window.localStorage.getItem("marketplace-token");
    fetch(`${apiUrl}/creator/catalog-options`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load catalog options.");
        return data;
      })
      .then((data) => {
        if (!active) return;
        setCategories((data.categories ?? []).map((item: { id: number | string; name: string }) => ({
          id: Number(item.id),
          name: String(item.name),
        })));
        setProductTypes((data.productTypes ?? []).map((item: { name: string; description?: string }) => ({ name: String(item.name), description: item.description || "" })));
        setCatalogStatus("ready");
        onCatalogStatusChange("ready");
      })
      .catch(() => {
        if (active) {
          setCatalogStatus("error");
          onCatalogStatusChange("error");
        }
      });
    return () => {
      active = false;
    };
  }, [onCatalogStatusChange]);
  const parentCategories = categories;
  const selectedCategory = categories.find((item) => item.name === category);
  return (
    <section>
      <Title
        title="Basic Information"
        description="Add the basic details of your product."
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Product Title" required>
          <input
            required
            name="title"
            maxLength={40}
            spellCheck={false}
            placeholder="e.g. Laravel API Mastery"
            className={input}
          />
        </Field>
        <Field label="Product Slug">
          <input
            name="slug"
            readOnly
            tabIndex={-1}
            spellCheck={false}
            aria-readonly="true"
            title="Automatically generated from the product title"
            placeholder="laravel-api-mastery"
            className={`${input} pointer-events-none cursor-not-allowed bg-surface-muted text-muted`}
          />
        </Field>
        <Field label="Short Description" required>
          <textarea
            required
            name="description"
            maxLength={50}
            rows={3}
            cols={10}
            placeholder="A short summary of your product"
            className="mt-1.5 max-h-[10lh] w-full resize-y rounded-lg border border-border-control px-3 py-2 text-xs outline-none focus:border-primary sm:col-span-2"
          />
          <p className="mt-1 text-[10px] text-muted">Maximum 50 characters.</p>
        </Field>
        <Field label="Category" required>
          <select
            required
            name="category"
            defaultValue=""
            onChange={(event) => {
              setCategory(event.target.value);
            }}
            className={select}
            disabled={catalogStatus !== "ready"}
          >
            <option value="" disabled>
              {catalogStatus === "loading"
                ? "Loading category data..."
                : catalogStatus === "error"
                  ? "Unable to load category data"
                  : "Select category"}
            </option>
            {parentCategories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Tags">
        <input
          name="tags"
          maxLength={100}
          placeholder="laravel, api, rest, backend"
          className={input}
        />
      </Field>
      <Field label="Product Description" required>
        <textarea
          required
          name="longDescription"
          rows={7}
          cols={10}
          placeholder="Describe what customers will learn or receive..."
          onPaste={(event) => {
            event.preventDefault();
            const textarea = event.currentTarget;
            const pastedText = event.clipboardData.getData("text");
            const nextValue = `${textarea.value.slice(0, textarea.selectionStart)}${pastedText}${textarea.value.slice(textarea.selectionEnd)}`;
            textarea.value = limitWords(nextValue, MAX_DESCRIPTION_WORDS);
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
          }}
          className="mt-1.5 max-h-[10lh] w-full resize-y rounded-lg border border-border-control px-3 py-2 text-xs outline-none focus:border-primary"
        />
        <p className="mt-1 text-[10px] text-muted">Maximum 50 words or 500 characters.</p>
      </Field>
      <fieldset className="mt-5">
        <legend className="text-[11px] font-semibold text-body">
          Product Type
        </legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {(productTypes.length ? productTypes : [{ name: "Digital Download", description: "Files customers can download." }, { name: "Online Course", description: "Video lessons and materials." }, { name: "License / Key", description: "Software license or key." }]).map(
            (type) => (
              <label
                key={type.name}
                className={`flex cursor-pointer gap-2 rounded-lg border p-3 text-[10px] ${productType === type.name ? "border-primary bg-accent-light" : "border-border-control"}`}
              >
                <input
                  type="radio"
                  name="productType"
                  checked={productType === type.name}
                  onChange={() => setProductType(type.name)}
                  className="mt-0.5 accent-primary"
                />
                <span>
                  <strong className="block">{type.name}</strong>
                  <span className="mt-1 block text-[9px] font-normal text-muted-soft">{type.description}</span>
                </span>
              </label>
            ),
          )}
        </div>
      </fieldset>
    </section>
  );
}
function FreePricing() {
  return (
    <section>
      <Title
        title="Pricing"
        description="This product will be available at no cost to customers."
      />
      <div className="mt-5 rounded-xl border border-status-success/20 bg-status-success-surface p-5">
        <p className="text-xs font-semibold text-status-success">
          Free product
        </p>
        <p className="mt-2 text-2xl font-bold text-heading">$0.00</p>
        <p className="mt-1 text-[10px] text-muted">
          Customers can download this product without payment.
        </p>
      </div>
      <div className="mt-5 grid gap-4 border-t border-divider pt-5 sm:grid-cols-2">
        <Field label="Currency">
          <Dropdown name="currency">
            <option>USD - US Dollar</option>
          </Dropdown>
        </Field>
      </div>
    </section>
  );
}
function Pricing({
  selectedRelease,
  onUpdateRelease,
  initialDiscountType,
  initialDiscount,
  initialDiscountAmount,
}: {
  selectedRelease: ProductRelease;
  onUpdateRelease: (update: Partial<ProductRelease>) => void;
  initialDiscountType?: "none" | "percentage" | "fixed";
  initialDiscount?: number;
  initialDiscountAmount?: number;
}) {
  const price = selectedRelease.price;
  const [discountType, setDiscountType] = useState<"none" | "percentage" | "fixed">(initialDiscountType ?? "none");
  const [percentage, setPercentage] = useState(initialDiscount ?? 0);
  const [fixedAmount, setFixedAmount] = useState(initialDiscountAmount ?? 0);
  const [priceInput, setPriceInput] = useState(formatPrice(price));
  const discountAmount = discountType === "fixed" ? fixedAmount : discountType === "percentage" ? price * (percentage / 100) : 0;
  const marketplaceFee = price * MARKETPLACE_FEE_RATE;
  const fixedDiscountLimit = Math.max(0, Math.ceil((price - marketplaceFee - 0.01) * 100) / 100);
  const fixedDiscountIsInvalid = discountType === "fixed" && fixedAmount + marketplaceFee >= price;
  const earnings = Math.max(0, price - discountAmount - marketplaceFee);
  useEffect(() => {
    const numericInput = Number(priceInput.replace(/,/g, ""));
    if (numericInput !== price) setPriceInput(formatPrice(price));
  }, [price, priceInput]);
  return (
    <section>
      <Title
        title="Pricing"
        description="Set one product price shared by every version."
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Product price (all versions)" required>
          <input
            required
            name="price"
            type="text"
            inputMode="decimal"
            min="0.01"
            value={priceInput}
            onChange={(event) => {
              const rawValue = event.target.value.replace(/,/g, "").replace(/[^\d.]/g, "");
              if (!/^\d*(\.\d{0,2})?$/.test(rawValue)) return;
              const [whole, fraction] = rawValue.split(".");
              const normalizedValue = `${whole.slice(0, 10)}${fraction !== undefined ? `.${fraction.slice(0, 2)}` : ""}`;
              setPriceInput(formatPriceInput(normalizedValue));
              onUpdateRelease({ price: Number(normalizedValue || 0) });
            }}
            placeholder="0.00"
            className={input}
          />
        </Field>
      </div>
      <fieldset className="mt-5">
        <legend className="text-[11px] font-semibold text-body">
          Discount Type
        </legend>
        <div className="mt-3 space-y-3 text-xs text-body">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="discountMode"
              checked={discountType === "none"}
              onChange={() => setDiscountType("none")}
              className="accent-primary"
            />{" "}
            No Discount
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="discountMode"
              checked={discountType === "percentage"}
              onChange={() => setDiscountType("percentage")}
              className="accent-primary"
            />{" "}
            Percentage{" "}
            <input
              name="discount"
              type="number"
              min="0"
              max="100"
              value={percentage}
              onChange={(event) => setPercentage(Number(event.target.value || 0))}
              placeholder="0"
              className="h-8 w-24 rounded-lg border border-border-control px-2 text-xs"
            />
            %
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="discountMode"
              checked={discountType === "fixed"}
              onChange={() => setDiscountType("fixed")}
              className="accent-primary"
            />{" "}
            Fixed Amount{" "}
            <input
              name="discountAmount"
              type="number"
              min="0"
              max={fixedDiscountLimit}
              step="0.01"
              value={fixedAmount}
              onChange={(event) => setFixedAmount(Number(event.target.value || 0))}
              placeholder="0.00"
              className={`h-8 w-24 rounded-lg border px-2 text-xs ${fixedDiscountIsInvalid ? "border-status-danger" : "border-border-control"}`}
            />
          </label>
          {discountType === "fixed" && <p className={`ml-6 text-[10px] ${fixedDiscountIsInvalid ? "text-status-danger" : "text-muted"}`}>The fixed discount cannot exceed ${fixedDiscountLimit.toFixed(2)} so it and the 20% marketplace fee stay below the product price.</p>}
        </div>
      </fieldset>
      <div className="mt-6 grid gap-4 border-t border-divider pt-5 sm:grid-cols-2">
        <Field label="Currency">
          <Dropdown name="currency">
            <option>USD - US Dollar</option>
          </Dropdown>
        </Field>
      </div>
        <input type="hidden" name="discountType" value={discountType} />
        <input type="hidden" name="discount" value={percentage} />
      <div className="mt-5 rounded-lg border border-status-info/20 bg-status-info-surface p-4">
        <p className="text-xs font-semibold text-status-info">Your Earnings</p>
        <p className="mt-1 text-xl font-bold text-heading">
          ${earnings.toFixed(2)}
        </p>
        <p className="mt-1 text-[10px] text-muted">
          Estimated after a 20% marketplace fee on the listed price.
        </p>
      </div>
    </section>
  );
}
function Dropdown({
  name,
  children,
  required = false,
  defaultValue,
}: {
  name: string;
  children: ReactNode;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <span className="mt-1.5 block">
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className={`${dropdownSelect} mt-0 pr-9 focus:ring-2 focus:ring-orange-100`}
      >
        {children}
      </select>
    </span>
  );
}
function ProductFiles({
  releases,
  releaseErrors,
  loadingReleases,
  uploadingFiles,
  freeProduct,
  selectedReleaseId,
  onSelectRelease,
  onFiles,
  onAddRelease,
  onUpdateRelease,
  onRemoveRelease,
  onRemoveFile,
  onRenameFile,
  onPreviewFiles,
  onReplacePreview,
  onUpdatePreview,
  onReorderPreview,
  onRemovePreview,
}: {
  releases: ProductRelease[];
  releaseErrors: Record<string, ReleaseErrors>;
  loadingReleases: boolean;
  uploadingFiles: boolean;
  freeProduct: boolean;
  selectedReleaseId: string;
  onSelectRelease: (id: string) => void;
  onFiles: (releaseId: string, event: ChangeEvent<HTMLInputElement>) => void;
  onAddRelease: () => string;
  onUpdateRelease: (id: string, update: Partial<ProductRelease>) => void;
  onRemoveRelease: (id: string) => void;
  onRemoveFile: (releaseId: string, storageKey: string) => void;
  onRenameFile: (releaseId: string, storageKey: string, fileName: string) => void;
  onPreviewFiles: (
    releaseId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  onReplacePreview: (
    releaseId: string,
    id: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  onUpdatePreview: (
    releaseId: string,
    id: string,
    update: Partial<PreviewAsset>,
  ) => void;
  onReorderPreview: (
    releaseId: string,
    sourceId: string,
    targetId: string,
  ) => void;
  onRemovePreview: (releaseId: string, id: string) => void;
}) {
  const [releaseSearch, setReleaseSearch] = useState("");
  const [debouncedReleaseSearch, setDebouncedReleaseSearch] = useState("");
  const [showReleaseSuggestions, setShowReleaseSuggestions] = useState(false);
  const [releaseActionError, setReleaseActionError] = useState("");
  const [draggedPreviewId, setDraggedPreviewId] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<UploadedFile | null>(null);
  const [editingFileName, setEditingFileName] = useState("");
  const selectedRelease =
    releases.find((release) => release.id === selectedReleaseId) ?? releases[0];
  const release = selectedRelease;
  const filteredReleases = releases.filter((release) =>
    `${release.version} ${release.releaseNotes}`
      .toLowerCase()
      .includes(debouncedReleaseSearch.toLowerCase()),
  );
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedReleaseSearch(releaseSearch), 300);
    return () => window.clearTimeout(timer);
  }, [releaseSearch]);
  useEffect(() => {
    if (!releases.some((release) => release.id === selectedReleaseId))
      onSelectRelease(releases[0]?.id ?? "");
  }, [releases, selectedReleaseId, onSelectRelease]);
  const addRelease = () => {
    if (
      !release ||
      !release.version.trim() ||
      !release.releaseNotes.trim() ||
      release.files.length === 0 ||
      release.previewAssets.length === 0 ||
      release.licenses.length === 0
    ) {
      setReleaseActionError("Complete the current version before adding another version.");
      setShowReleaseSuggestions(false);
      return;
    }
    setReleaseActionError("");
    const id = onAddRelease();
    setReleaseSearch("");
    onSelectRelease(id);
  };
  return (
    <section>
      <div className="flex flex-col gap-3 border-b border-divider pb-5 sm:flex-row sm:items-end sm:justify-between">
        <Title
          title="Product Files"
          description="Manage every product release, its downloadable files, and its customer previews."
        />
        <button
          type="button"
          onClick={addRelease}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-accent-light"
        >
          <PublicIcon name="add" className="h-3.5 w-3.5" /> Add version
        </button>
      </div>
      <div className="mt-5 rounded-xl border border-border bg-surface-muted p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(180px,280px)]">
          <label className="relative block text-[11px] font-semibold text-body">
            Search version
            <input
              value={releaseSearch || (selectedRelease?.version.trim() ? `Version ${selectedRelease.version}${selectedRelease.current ? " (Current)" : ""}` : "New version")}
              disabled={loadingReleases}
              onChange={(event) => {
                setReleaseSearch(event.target.value);
                setShowReleaseSuggestions(true);
              }}
              onFocus={() => setShowReleaseSuggestions(true)}
              onBlur={() => window.setTimeout(() => setShowReleaseSuggestions(false), 150)}
              placeholder="Search version or notes"
              className={input}
              role="combobox"
              aria-expanded={showReleaseSuggestions}
              aria-controls="product-version-suggestions"
              aria-autocomplete="list"
            />
            {showReleaseSuggestions && (
              <div id="product-version-suggestions" role="listbox" className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border-control bg-white py-1 shadow-lg">
                {filteredReleases.length > 0 ? filteredReleases.map((release) => (
                  <button
                    key={release.id}
                    type="button"
                    role="option"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onSelectRelease(release.id);
                      setReleaseSearch(release.version.trim() ? `Version ${release.version}${release.current ? " (Current)" : ""}` : "New version");
                      setShowReleaseSuggestions(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-xs font-normal text-body hover:bg-orange-50"
                  >
                    {release.version.trim() ? `Version ${release.version}` : "New version"}{release.current ? " (Current)" : ""}
                  </button>
                )) : <p className="px-3 py-2 text-xs font-normal text-muted">No versions found.</p>}
              </div>
            )}
          </label>
          {loadingReleases && (
            <p className="text-[10px] font-medium text-primary">Loading saved versions...</p>
          )}
          <label className="block text-[11px] font-semibold text-body">
            Search versions
            <input
              value={releaseSearch}
              onChange={(event) => setReleaseSearch(event.target.value)}
              placeholder="Search version or notes"
              className={input}
            />
          </label>
        </div>
        <p className="mt-2 text-[10px] text-muted">
          Showing {filteredReleases.length} of {releases.length} versions.
          Select a version to manage its files and previews.
        </p>
        {releaseActionError && <p role="alert" className="mt-2 text-[10px] text-status-danger">{releaseActionError}</p>}
      </div>
      <div className="mt-5 space-y-5">
        {selectedRelease && (
          <article
            key={selectedRelease.id}
            className="overflow-hidden rounded-xl border border-border bg-white"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-divider bg-surface-muted px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-light text-primary">
                  <PublicIcon name="rotate-ccw" className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-heading">
                    {selectedRelease.version.trim()
                      ? `Version ${selectedRelease.version}`
                      : "New version"}
                  </h3>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {selectedRelease.files.length} file
                    {selectedRelease.files.length === 1 ? "" : "s"} ·{" "}
                    {selectedRelease.previewAssets.length} preview
                    {selectedRelease.previewAssets.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedRelease.current && (
                  <span className="rounded-full bg-status-success-surface px-2 py-1 text-[9px] font-bold text-status-success">
                    CURRENT
                  </span>
                )}
                {releases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveRelease(selectedRelease.id)}
                    aria-label={`Remove version ${selectedRelease.version || "selected"}`}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-red-50 hover:text-status-danger"
                  >
                    <PublicIcon name="delete" className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </header>
            <div className="p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-[180px_180px_180px_1fr]">
                <label className="block text-[11px] font-semibold text-body">
                  Product version
                  <input
                    value={release.version}
                      maxLength={40}
                    onChange={(event) =>
                      onUpdateRelease(release.id, {
                        version: event.target.value,
                      })
                    }
                    placeholder="e.g. 1.1.0"
                    className={input}
                  />
                  {releaseErrors[release.id]?.version && (
                    <span className="mt-1 block text-[10px] font-normal text-status-danger">
                      {releaseErrors[release.id].version}
                    </span>
                  )}
                </label>
                <label className="col-span-full block text-[11px] font-semibold text-body">
                  Release notes
                  <textarea
                    value={release.releaseNotes}
                    maxLength={100}
                    onChange={(event) =>
                      onUpdateRelease(release.id, {
                        releaseNotes: event.target.value,
                      })
                    }
                    rows={6}
                    placeholder="What changed in this version?"
                    className="mt-1.5 min-h-32 w-full resize-y rounded-lg border border-border-control bg-white px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                  {releaseErrors[release.id]?.releaseNotes && (
                    <p className="mt-1 text-[10px] text-status-danger">
                      {releaseErrors[release.id].releaseNotes}
                    </p>
                  )}
                </label>
              </div>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-[10px] font-medium text-body">
                <input
                  type="radio"
                  checked={release.current}
                  onChange={() =>
                    onUpdateRelease(release.id, { current: true })
                  }
                  className="accent-primary"
                />{" "}
                Set as current release
              </label>
              <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-xs font-bold text-heading">
                      Product files
                    </h4>
                    <span className="text-[10px] text-muted">
                      Up to {MAX_PRODUCT_FILES} files per version
                    </span>
                  </div>
                  <label
                    className={`mt-3 flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border-control bg-surface-muted p-5 text-center ${uploadingFiles ? "cursor-wait opacity-70" : "cursor-pointer hover:border-primary hover:bg-surface-hover"}`}
                  >
                    <PublicIcon
                      name="download"
                      className="h-7 w-7 text-primary"
                    />
                    <strong className="mt-2 text-xs text-body">
                      {uploadingFiles
                        ? "Uploading files..."
                        : "Drag & drop files here"}
                    </strong>
                    <span className="mt-1 text-[10px] text-muted-soft">
                      Choose up to {MAX_PRODUCT_FILES} files from your computer
                    </span>
                    <span className="mt-3 rounded-lg border border-primary px-3 py-1.5 text-[10px] font-semibold text-primary">
                      Upload files
                    </span>
                    <input
                      type="file"
                      multiple
                      disabled={
                        uploadingFiles || release.files.length >= MAX_PRODUCT_FILES
                      }
                      onChange={(event) => onFiles(release.id, event)}
                      className="sr-only"
                    />
                  </label>
                  {releaseErrors[release.id]?.files && (
                    <p className="mt-1 text-[10px] text-status-danger">
                      {releaseErrors[release.id].files}
                    </p>
                  )}
                  {release.files.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {release.files.map((file) => (
                        <li
                          key={file.storageKey}
                          className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-[10px] text-body"
                        >
                          <PublicIcon
                            name="file-search-corner"
                            className="h-4 w-4 shrink-0 text-primary"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate">
                              {file.fileName}
                            </span>
                            <span className="mt-0.5 block text-[9px] text-muted">
                              {formatFileSize(file.fileSize)}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFile(file);
                              setEditingFileName(file.fileName);
                            }}
                            aria-label={`Edit ${file.fileName}`}
                            className="grid h-6 w-6 place-items-center rounded-md text-muted hover:bg-accent-light hover:text-primary"
                          >
                            <PublicIcon name="edit" className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              release.files.length > 1 &&
                              onRemoveFile(release.id, file.storageKey)
                            }
                            disabled={release.files.length <= 1}
                            aria-label={`Remove ${file.fileName}`}
                            title={release.files.length <= 1 ? "Keep at least one file for this version." : `Remove ${file.fileName}`}
                            className="grid h-6 w-6 place-items-center rounded-md text-muted hover:bg-red-50 hover:text-status-danger disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <PublicIcon name="delete" className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="border-t border-divider pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-heading">
                        Preview assets
                      </h4>
                      <p className="mt-1 text-[10px] text-muted">
                        Shown before purchase
                      </p>
                    </div>
                    <label className="cursor-pointer rounded-lg border border-primary px-3 py-1.5 text-[10px] font-semibold text-primary hover:bg-accent-light">
                      Add preview
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => onPreviewFiles(release.id, event)}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  {editingFile && (
                    <div
                      className="fixed inset-0 z-[210] grid place-items-center overflow-y-auto bg-ink/30 p-4"
                      onMouseDown={() => setEditingFile(null)}
                    >
                      <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-product-file-title"
                        className="w-full max-w-sm rounded-xl border border-border bg-white p-5 shadow-2xl"
                        onMouseDown={(event) => event.stopPropagation()}
                      >
                        <h2 id="edit-product-file-title" className="text-sm font-bold text-heading">
                          Edit file
                        </h2>
                        <label className="mt-4 block text-xs font-semibold text-body">
                          File name
                          <input
                            value={editingFileName}
                            onChange={(event) => setEditingFileName(event.target.value)}
                            className={input}
                            autoFocus
                          />
                        </label>
                        <div className="mt-5 flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingFile(null)} className="rounded-lg border border-border-control px-3 py-2 text-xs text-body">
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={!editingFileName.trim()}
                            onClick={() => {
                              onRenameFile(release.id, editingFile.storageKey, editingFileName.trim());
                              setEditingFile(null);
                            }}
                            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                      </section>
                    </div>
                  )}
                  {releaseErrors[release.id]?.previews && (
                    <p className="mt-1 text-[10px] text-status-danger">
                      {releaseErrors[release.id].previews}
                    </p>
                  )}
                  {release.previewAssets.length ? (
                    <div className="mt-3 space-y-2">
                      {release.previewAssets.map((preview, index) => (
                        <div
                          key={preview.id}
                          draggable
                          onDragStart={() => setDraggedPreviewId(preview.id)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (draggedPreviewId)
                              onReorderPreview(
                                release.id,
                                draggedPreviewId,
                                preview.id,
                              );
                            setDraggedPreviewId(null);
                          }}
                          onDragEnd={() => setDraggedPreviewId(null)}
                          className={`flex gap-2 rounded-lg border bg-surface-muted p-2 ${draggedPreviewId === preview.id ? "border-primary/50 opacity-60" : "border-transparent"}`}
                        >
                          <button
                            type="button"
                            aria-label={`Reorder ${preview.title || `preview ${index + 1}`}`}
                            className="mt-5 cursor-grab touch-none text-muted active:cursor-grabbing"
                          >
                            <PublicIcon
                              name="grip"
                              className="h-4 w-4"
                            />
                          </button>
                          <img
                            src={preview.url}
                            alt={preview.title}
                            className="h-14 w-20 shrink-0 rounded-md border border-border object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <input
                              value={preview.title}
                              onChange={(event) =>
                                onUpdatePreview(release.id, preview.id, {
                                  title: event.target.value,
                                })
                              }
                              aria-label={`Preview ${index + 1} name`}
                              className="h-7 w-full rounded-md border border-border-control bg-white px-2 text-[10px] text-body outline-none focus:border-primary"
                            />
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <label
                                className={`inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-[9px] font-medium ${preview.isPrimary ? "border-primary bg-accent-light text-primary" : "border-border-control text-muted hover:border-primary hover:text-primary"}`}
                              >
                                <input
                                  type="radio"
                                  name={`primary-preview-${release.id}`}
                                  checked={preview.isPrimary}
                                  onChange={() =>
                                    onUpdatePreview(release.id, preview.id, {
                                      isPrimary: true,
                                    })
                                  }
                                  className="sr-only"
                                />
                                {preview.isPrimary
                                  ? "PRIMARY"
                                  : "Set as primary"}
                              </label>
                              <label className="cursor-pointer rounded-md border border-border-control px-2 py-1 text-[9px] font-medium text-muted hover:border-primary hover:text-primary">
                                Replace
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(event) =>
                                    onReplacePreview(
                                      release.id,
                                      preview.id,
                                      event,
                                    )
                                  }
                                  className="sr-only"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  onRemovePreview(release.id, preview.id)
                                }
                                className="rounded-md px-2 py-1 text-[9px] font-medium text-status-danger hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 grid min-h-36 place-items-center rounded-xl border border-dashed border-border-control px-4 text-center">
                      <span>
                        <PublicIcon
                          name="view"
                          className="mx-auto h-6 w-6 text-muted"
                        />
                        <span className="mt-2 block text-[10px] text-muted">
                          No preview assets for this version
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
function LicenseAccess({
  release,
  releaseErrors,
  onUpdateRelease,
}: {
  release: ProductRelease;
  releaseErrors: Record<string, ReleaseErrors>;
  onUpdateRelease: (update: Partial<ProductRelease>) => void;
}) {
  const updateOffers = (licenses: LicenseOffer[]) =>
    onUpdateRelease({ licenses, license: licenses[0]?.name ?? "All" });
  const selectLicence = (name: string, checked: boolean) => {
    if (name === "All") {
      updateOffers([{ ...defaultLicenseOffer(), name: "All" }]);
      return;
    }
    const specificLicences = release.licenses.filter((license) => license.name !== "All");
    const next = checked
      ? [...specificLicences, { ...defaultLicenseOffer(), name }]
      : specificLicences.filter((license) => license.name !== name);
    updateOffers(next.length ? next : [{ ...defaultLicenseOffer(), name: "All" }]);
  };
  return (
    <section>
      <Title
        title="License & Access"
        description="Show customers which licence types this product supports."
      />
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <fieldset className="sm:col-span-2">
          <legend className="text-[11px] font-semibold text-body">Licence types <span className="text-status-danger">*</span></legend>
          <p className="mt-1 text-[10px] text-muted">Choose up to four supported licences. All Licence is exclusive; choosing a specific licence clears it.</p>
          {releaseErrors[release.id]?.licenses && (
            <p className="mt-1 text-[10px] text-status-danger">
              {releaseErrors[release.id].licenses}
            </p>
          )}
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {licenseNames.map((name) => {
              const checked = release.licenses.some((license) => license.name === name);
              const disabled = name !== "All" && !checked && release.licenses.filter((license) => license.name !== "All").length >= 4;
              return <label key={name} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${checked ? "border-primary bg-accent-light text-primary" : "border-border-control text-body"} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => selectLicence(name, event.target.checked)} className="accent-primary" />{name} License</label>;
            })}
          </div>
        </fieldset>
      </div>
      <div hidden className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-primary bg-accent-light p-4">
          <p className="text-xs font-semibold text-heading">Standard License</p>
          <p className="mt-1 text-[10px] text-muted">
            For personal and commercial use.
          </p>
          <ul className="mt-3 space-y-1.5 text-[10px] text-body">
            <li>✓ One user / single project</li>
            <li>✓ No redistribution</li>
            <li>✓ Support via email</li>
          </ul>
        </div>
        <div className="space-y-4">
          <label className="flex items-start gap-2 text-xs text-body">
            <input
              type="radio"
              name="accessRule"
              defaultChecked
              className="mt-0.5 accent-primary"
            />
            <span>
              <strong className="block">Lifetime access</strong>
              <span className="text-[10px] text-muted-soft">
                One-time purchase, unlimited access.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-xs text-body">
            <input
              type="radio"
              name="accessRule"
              className="mt-0.5 accent-primary"
            />
            <span>
              <strong className="block">Limited downloads</strong>
              <span className="text-[10px] text-muted-soft">
                Set a maximum download count.
              </span>
            </span>
          </label>
          <Field label="Download limit">
            <input type="number" min="1" placeholder="5" className={input} />
          </Field>
        </div>
      </div>
    </section>
  );
}
function ReviewProduct({
  releases,
  productType,
  storefrontName,
  freeProduct,
  form,
  revision,
}: {
  releases: ProductRelease[];
  productType: string;
  storefrontName: string;
  freeProduct: boolean;
  form: HTMLFormElement | null;
  revision: number;
}) {
  void revision;
  const values = form ? new FormData(form) : null;
  const text = (name: string, fallback = "Not set") =>
    String(values?.get(name) || fallback);
  const price = Number(values?.get("price") || 0);
  const currency = text("currency", "USD").slice(0, 3);
  const category =
    [text("category", "")]
      .filter(Boolean)
      .join(" / ") || "Not set";
  const fileCount = releases.reduce(
    (total, release) => total + release.files.length,
    0,
  );
  return (
    <section>
      <Title
        title="Review & Publish"
        description="Review the details before publishing your product."
      />
      <div className="mt-5 space-y-4">
        <ReviewBlock title="Basic Information">
          <ReviewRow label="Product Title" value={text("title")} />
          <ReviewRow label="Category" value={category} />
          <ReviewRow label="Storefront" value={storefrontName} />
          <ReviewRow label="Product Type" value={productType} />
        </ReviewBlock>
        <ReviewBlock title="Pricing">
          <ReviewRow
            label="Price"
            value={
              freeProduct
                ? "$0.00 (Free)"
                : new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency,
                  }).format(price)
            }
          />
          <ReviewRow
            label="Discount"
            value={freeProduct ? "Not applicable" : `${text("discount", "0")}%`}
          />
        </ReviewBlock>
        <ReviewBlock title={`Product releases (${releases.length})`}>
          <ReviewRow label="Total files" value={String(fileCount)} />
          {releases.map((release) => (
            <ReviewRow
              key={release.id}
              label={release.version || "Unnumbered version"}
              value={`${release.files.length} file${release.files.length === 1 ? "" : "s"} · ${release.previewAssets.length} preview${release.previewAssets.length === 1 ? "" : "s"}`}
            />
          ))}
        </ReviewBlock>
        {releases.map((release) => (
          <ReviewBlock key={release.id} title={`Supported licences — ${release.version || "Unnumbered version"}`}>
            <ReviewRow label="Product" value={text("title")} />
            <ReviewRow label="Supported licences" value={release.licenses.map((license) => `${license.name} License`).join(", ")} />
          </ReviewBlock>
        ))}
      </div>
    </section>
  );
}
function ReviewBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="bg-surface-muted p-4">
      <h3 className="text-xs font-bold text-heading">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </Card>
  );
}
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 text-[10px] sm:grid-cols-[150px_1fr]">
      <span className="text-muted">{label}</span>
      <strong className="text-body">{value}</strong>
    </div>
  );
}
