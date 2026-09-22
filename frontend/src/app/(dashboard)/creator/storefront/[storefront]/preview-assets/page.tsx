"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, useSearchParams } from "next/navigation";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import PublicIcon from "@/components/icons/PublicIcon";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const tabs = ["All", "Images", "Videos", "Documents", "Audio"] as const;
type PreviewAsset = {
  id: number;
  title: string;
  type: string;
  url: string;
  product: string;
  productKey: string;
};
type Product = { id: number; uuid?: string; name: string };
type ProductVersion = { id: number; version: string; current?: boolean };
type CropPosition = { x: number; y: number };

const createCroppedImage = async (source: string, pixelCrop: Area) => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const imageElement = new Image();
    imageElement.onload = () => resolve(imageElement);
    imageElement.onerror = reject;
    imageElement.src = source;
  });
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 675;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to prepare image crop.");
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
  return canvas.toDataURL("image/jpeg", 0.9);
};

export default function PreviewAssetsPage() {
  const { storefront: storefrontParam } = useParams<{ storefront: string }>();
  const searchParams = useSearchParams();
  const storefront = decodeURIComponent(storefrontParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [assets, setAssets] = useState<PreviewAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [debouncedProductSearch, setDebouncedProductSearch] = useState("");
  const [showProductSearchSuggestions, setShowProductSearchSuggestions] =
    useState(false);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");
  const [editingAsset, setEditingAsset] = useState<PreviewAsset | null>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<"add" | "edit" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newPreview, setNewPreview] = useState({
    productKey: "",
    versionId: "",
    title: "",
    type: "image",
    url: "",
  });
  const [productVersions, setProductVersions] = useState<ProductVersion[]>([]);
  const [versionSearch, setVersionSearch] = useState("");
  const [showVersionSuggestions, setShowVersionSuggestions] = useState(false);
  const [newPreviewProductSearch, setNewPreviewProductSearch] = useState("");
  const [
    debouncedNewPreviewProductSearch,
    setDebouncedNewPreviewProductSearch,
  ] = useState("");
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const requestedProduct = searchParams.get("product");
    if (requestedProduct) setProductSearch(requestedProduct);
  }, [searchParams]);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedNewPreviewProductSearch(newPreviewProductSearch),
      400,
    );
    return () => window.clearTimeout(timeout);
  }, [newPreviewProductSearch]);

  useEffect(() => {
    if (!newPreview.productKey) {
      setProductVersions([]);
      setVersionSearch("");
      return;
    }
    const token = window.localStorage.getItem("marketplace-token");
    fetch(
      `${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products/${newPreview.productKey}/versions`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    )
      .then((response) => response.json())
      .then((data) => setProductVersions(data.versions ?? []))
      .catch(() => setProductVersions([]));
  }, [newPreview.productKey, storefront]);

  useEffect(() => {
    setSearchLoading(true);
    const timeout = window.setTimeout(() => {
      setDebouncedProductSearch(productSearch);
      setSearchLoading(false);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [productSearch]);

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    setLoading(true);
    fetch(
      `${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products`,
      { headers },
    )
      .then((response) => response.json())
      .then(async (data) => {
        const databaseProducts = data.products ?? [];
        setProducts(databaseProducts);
        const loaded = await Promise.all(
          databaseProducts.map(
            async (product: { id: number; uuid?: string; name: string }) => {
              const key = String(product.uuid ?? product.id);
              const response = await fetch(
                `${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products/${key}/previews`,
                { headers },
              );
              const result = await response.json();
              return (result.previews ?? []).map(
                (preview: {
                  id: number;
                  title: string;
                  type: string;
                  url: string;
                }) => ({ ...preview, product: product.name, productKey: key }),
              );
            },
          ),
        );
        setAssets(loaded.flat());
      })
      .catch(() => {
        setProducts([]);
        setAssets([]);
      })
      .finally(() => setLoading(false));
  }, [storefront]);

  const visibleAssets = useMemo(
    () =>
      assets.filter((asset) => {
        const matchesProduct =
          !productSearch ||
          asset.product.toLowerCase().includes(productSearch.toLowerCase());
        const matchesType =
          activeTab === "All" ||
          asset.type.toLowerCase() === activeTab.slice(0, -1).toLowerCase();
        return matchesProduct && matchesType;
      }),
    [activeTab, assets, productSearch],
  );

  const replaceImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingAsset) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setError("Choose an image smaller than 10 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropTarget("edit");
      setCropSource(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const updateAsset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingAsset) return;
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const token = window.localStorage.getItem("marketplace-token");
    try {
      const response = await fetch(
        `${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products/${editingAsset.productKey}/previews/${editingAsset.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            title: form.get("title"),
            url: editingAsset.url,
            type: form.get("type"),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to save preview asset.");
      setAssets((current) =>
        current.map((asset) =>
          asset.id === editingAsset.id
            ? {
                ...asset,
                title: String(form.get("title") || ""),
                url: editingAsset.url,
                type: String(form.get("type") || "image"),
              }
            : asset,
        ),
      );
      setEditingAsset(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save preview asset.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteAsset = async (asset: PreviewAsset) => {
    if (!window.confirm(`Delete ${asset.title || "this preview asset"}?`))
      return;
    const token = window.localStorage.getItem("marketplace-token");
    await fetch(
      `${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products/${asset.productKey}/previews/${asset.id}`,
      {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    setAssets((current) => current.filter((item) => item.id !== asset.id));
  };

  const selectPreviewFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setError("Choose an image smaller than 10 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropTarget("add");
      setCropSource(String(reader.result));
      setNewPreview((current) => ({
        ...current,
        type: "image",
        title: current.title || file.name.replace(/\.[^.]+$/, ""),
      }));
    };
    reader.readAsDataURL(file);
  };

  const addPreview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newPreview.productKey || !newPreview.versionId || !newPreview.url) {
      setError("Select a product, version, and preview image.");
      return;
    }
    setAdding(true);
    setError("");
    const token = window.localStorage.getItem("marketplace-token");
    try {
      const response = await fetch(
        `${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products/${newPreview.productKey}/previews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            title: newPreview.title,
            type: newPreview.type,
            url: newPreview.url,
            productVersionId: newPreview.versionId || undefined,
            sortOrder: assets.length,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to add preview asset.");
      const product = products.find(
        (item) => String(item.uuid ?? item.id) === newPreview.productKey,
      );
      if (product)
        setAssets((current) => [
          ...current,
          {
            ...data.preview,
            product: product.name,
            productKey: newPreview.productKey,
          },
        ]);
      setShowAdd(false);
      setShowProductSuggestions(false);
      setNewPreview({
        productKey: "",
        versionId: "",
        title: "",
        type: "image",
        url: "",
      });
      setNewPreviewProductSearch("");
      setVersionSearch("");
    } catch (addError) {
      setError(
        addError instanceof Error
          ? addError.message
          : "Unable to add preview asset.",
      );
    } finally {
      setAdding(false);
    }
  };

  const defaultPreviewProduct = () => {
    const search = productSearch.trim().toLowerCase();
    return (
      products.find((product) => product.name.toLowerCase() === search) ??
      products.find((product) => product.name.toLowerCase().includes(search)) ??
      products[0]
    );
  };

  const previewProductSuggestions = useMemo(() => {
    const search = debouncedNewPreviewProductSearch.trim().toLowerCase();
    if (!search) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(search),
    );
  }, [debouncedNewPreviewProductSearch, products]);

  const versionSuggestions = useMemo(() => {
    const search = versionSearch.trim().toLowerCase();
    if (!search) return productVersions;
    return productVersions.filter((version) =>
      version.version.toLowerCase().includes(search),
    );
  }, [productVersions, versionSearch]);

  const productSearchSuggestions = useMemo(() => {
    const search = debouncedProductSearch.trim().toLowerCase();
    if (!search) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(search),
    );
  }, [debouncedProductSearch, products]);

  const openAddPreview = () => {
    const product = defaultPreviewProduct();
    setError("");
    setNewPreview((current) => ({
      ...current,
      productKey: String(product?.uuid ?? product?.id ?? ""),
    }));
    setNewPreviewProductSearch(product?.name ?? "");
    setShowProductSuggestions(false);
    setShowAdd(true);
  };

  const closeAddPreview = () => {
    setShowAdd(false);
    setShowProductSuggestions(false);
  };

  return (
    <div
      className="preview-assets-page mx-auto w-full max-w-[1200px]"
      data-loading={loading ? "true" : "false"}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">
            Preview Assets
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage preview images and assets for your products.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddPreview}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white"
        >
          <PublicIcon name="add" className="h-3.5 w-3.5" /> Add Preview
        </button>
      </header>
      <section className="mt-6 max-w-md">
        <label className="relative block text-[10px] font-semibold text-muted">
          Search Product
          <input
            value={productSearch}
            onChange={(event) => {
              setProductSearch(event.target.value);
              setShowProductSearchSuggestions(true);
            }}
            onFocus={() => setShowProductSearchSuggestions(true)}
            onBlur={() => setShowProductSearchSuggestions(false)}
            aria-autocomplete="list"
            aria-controls="product-search-suggestions"
            aria-expanded={showProductSearchSuggestions}
            role="combobox"
            placeholder="Search product..."
            className="mt-1.5 h-10 w-full rounded-lg border border-border-control bg-white px-3 text-xs text-body outline-none focus:border-primary"
          />
          {showProductSearchSuggestions && (
            <div
              id="product-search-suggestions"
              role="listbox"
              className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border-control bg-white py-1 shadow-lg"
            >
              {productSearchSuggestions.length > 0 ? (
                productSearchSuggestions.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    role="option"
                    aria-selected={product.name === productSearch}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setProductSearch(product.name);
                      setShowProductSearchSuggestions(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-xs font-normal text-body hover:bg-orange-50"
                  >
                    {product.name}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs font-normal text-muted">
                  No products found.
                </p>
              )}
            </div>
          )}
        </label>
        <p role="status" className="mt-2 text-[10px] text-muted">
          {loading || searchLoading
            ? "Loading preview assets..."
            : `${products.length} products, ${assets.length} preview assets`}
        </p>
      </section>
      <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <nav
          className="flex gap-6 border-b border-divider px-5 pt-4 sm:px-6"
          aria-label="Asset types"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative pb-3 text-xs font-semibold ${activeTab === tab ? "text-primary" : "text-muted hover:text-body"}`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </nav>
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          {visibleAssets.map((asset) => (
            <article
              key={asset.id}
              className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
            >
              <div className="flex aspect-[1.45] items-center justify-center bg-surface-muted p-3">
                {asset.url ? (
                  <img
                    src={asset.url}
                    alt={asset.title || asset.product}
                    className="h-full w-full rounded-lg object-contain"
                  />
                ) : (
                  <PublicIcon name="view" className="h-8 w-8 text-primary" />
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold text-body-strong">
                      {asset.title || "Preview asset"}
                    </p>
                    <p className="mt-1 truncate text-[9px] text-muted">
                      {asset.product}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setEditingAsset(asset);
                      }}
                      aria-label={`Edit ${asset.title}`}
                      className="grid h-7 w-7 place-items-center rounded-md border border-border-action text-muted hover:border-primary hover:text-primary"
                    >
                      <PublicIcon name="edit" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAsset(asset)}
                      aria-label={`Delete ${asset.title}`}
                      className="grid h-7 w-7 place-items-center rounded-md border border-border-action text-muted hover:border-red-500 hover:text-red-500"
                    >
                      <PublicIcon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <span className="mt-2 inline-block rounded-md bg-orange-50 px-2 py-1 text-[9px] font-semibold text-primary">
                  {asset.type}
                </span>
              </div>
            </article>
          ))}
          {visibleAssets.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-muted">
              No preview assets found.
            </p>
          )}
        </div>
      </section>
      {showAdd && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#111b40]/55 p-4">
          <form
            onSubmit={addPreview}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-divider px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
                  New preview
                </p>
                <h2 className="mt-1 text-lg font-bold text-heading">
                  Add preview asset
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Choose the product and upload what customers should see.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddPreview}
                aria-label="Close editor"
                className="text-xl text-muted hover:text-heading"
              >
                ×
              </button>
            </div>
            <div className="space-y-5 p-6">
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}
              <label className="relative block text-xs font-semibold text-body">
                Product
                <input
                  value={newPreviewProductSearch}
                  onChange={(event) => {
                    setNewPreviewProductSearch(event.target.value);
                    setNewPreview((current) => ({
                      ...current,
                      productKey: "",
                      versionId: "",
                    }));
                    setVersionSearch("");
                    setShowProductSuggestions(true);
                  }}
                  onFocus={() => setShowProductSuggestions(true)}
                  onBlur={() => setShowProductSuggestions(false)}
                  aria-autocomplete="list"
                  aria-controls="preview-product-suggestions"
                  aria-expanded={showProductSuggestions}
                  role="combobox"
                  placeholder="Search product..."
                  className="mt-1.5 h-10 w-full rounded-lg border border-border-control bg-white px-3 text-xs font-normal outline-none focus:border-primary"
                />
                {showProductSuggestions && (
                  <div
                    id="preview-product-suggestions"
                    role="listbox"
                    className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border-control bg-white py-1 shadow-lg"
                  >
                    {previewProductSuggestions.length > 0 ? (
                      previewProductSuggestions.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          role="option"
                          aria-selected={
                            newPreview.productKey ===
                            String(product.uuid ?? product.id)
                          }
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setNewPreview((current) => ({
                              ...current,
                              productKey: String(product.uuid ?? product.id),
                              versionId: "",
                            }));
                            setNewPreviewProductSearch(product.name);
                            setVersionSearch("");
                            setShowProductSuggestions(false);
                          }}
                          className="block w-full px-3 py-2 text-left text-xs font-normal text-body hover:bg-orange-50"
                        >
                          {product.name}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-xs font-normal text-muted">
                        No products found.
                      </p>
                    )}
                  </div>
                )}
              </label>
              <label className="relative block text-xs font-semibold text-body">
                Version
                <input
                  value={versionSearch}
                  onChange={(event) => {
                    setVersionSearch(event.target.value);
                    setNewPreview((current) => ({ ...current, versionId: "" }));
                    setShowVersionSuggestions(true);
                  }}
                  onFocus={() => setShowVersionSuggestions(true)}
                  onBlur={() => setShowVersionSuggestions(false)}
                  aria-autocomplete="list"
                  aria-controls="preview-version-suggestions"
                  aria-expanded={showVersionSuggestions}
                  role="combobox"
                  placeholder={newPreview.productKey ? "Search version..." : "Select a product first"}
                  disabled={!newPreview.productKey || productVersions.length === 0}
                  className="mt-1.5 h-10 w-full rounded-lg border border-border-control bg-white px-3 text-xs font-normal outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-surface-muted"
                />
                {showVersionSuggestions && newPreview.productKey && (
                  <div
                    id="preview-version-suggestions"
                    role="listbox"
                    className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border-control bg-white py-1 shadow-lg"
                  >
                    {versionSuggestions.length > 0 ? (
                      versionSuggestions.map((version) => (
                        <button
                          key={version.id}
                          type="button"
                          role="option"
                          aria-selected={newPreview.versionId === String(version.id)}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setNewPreview((current) => ({
                              ...current,
                              versionId: String(version.id),
                            }));
                            setVersionSearch(`Version ${version.version}`);
                            setShowVersionSuggestions(false);
                          }}
                          className="block w-full px-3 py-2 text-left text-xs font-normal text-body hover:bg-orange-50"
                        >
                          Version {version.version}{version.current ? " (current)" : ""}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-xs font-normal text-muted">
                        No versions found.
                      </p>
                    )}
                  </div>
                )}
              </label>
              <div className="overflow-hidden rounded-xl border border-border-control bg-surface-muted">
                <div className="flex aspect-video items-center justify-center p-3">
                  {newPreview.url ? (
                    <img
                      src={newPreview.url}
                      alt="New preview"
                      className="h-full w-full rounded-lg object-contain"
                    />
                  ) : (
                    <div className="text-center text-muted">
                      <PublicIcon name="view" className="mx-auto h-8 w-8" />
                      <p className="mt-2 text-xs">Choose an image below</p>
                    </div>
                  )}
                </div>
                <label className="block cursor-pointer border-t border-border-control bg-white px-4 py-3 text-center text-xs font-semibold text-primary hover:bg-orange-50">
                  Choose image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={selectPreviewFile}
                    className="sr-only"
                  />
                </label>
              </div>
              <label className="block text-xs font-semibold text-body">
                Asset title
                <input
                  value={newPreview.title}
                  onChange={(event) =>
                    setNewPreview((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="e.g. Product cover"
                  className="mt-1.5 h-10 w-full rounded-lg border border-border-control px-3 text-xs font-normal"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-divider bg-surface-muted px-6 py-4">
              <button
                type="button"
                onClick={closeAddPreview}
                className="rounded-lg border border-border-control bg-white px-4 py-2 text-xs font-semibold text-body"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adding}
                className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-60"
              >
                {adding ? "Adding..." : "Add preview"}
              </button>
            </div>
          </form>
        </div>
      )}
      {editingAsset && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#111b40]/55 p-4">
          <form
            onSubmit={updateAsset}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-divider px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
                  Preview asset
                </p>
                <h2 className="mt-1 text-lg font-bold text-heading">
                  Edit preview asset
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Update the image customers will see before purchase.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                aria-label="Close editor"
                className="text-xl text-muted hover:text-heading"
              >
                ×
              </button>
            </div>
            <div className="space-y-5 p-6">
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}
              <div className="overflow-hidden rounded-xl border border-border-control bg-surface-muted">
                <div className="flex aspect-video items-center justify-center p-3">
                  {editingAsset.url ? (
                    <img
                      src={editingAsset.url}
                      alt="Preview"
                      className="h-full w-full rounded-lg object-contain"
                    />
                  ) : (
                    <PublicIcon name="view" className="h-10 w-10 text-muted" />
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-border-control bg-white px-3 py-2">
                  <span className="truncate text-[10px] text-muted">
                    {editingAsset.url.startsWith("data:")
                      ? "Uploaded image"
                      : "Current preview image"}
                  </span>
                  <label className="cursor-pointer rounded-md border border-primary px-3 py-1.5 text-[10px] font-semibold text-primary hover:bg-orange-50">
                    Replace image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={replaceImage}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
              <label className="block text-xs font-semibold text-body">
                Asset title
                <input
                  name="title"
                  defaultValue={editingAsset.title}
                  placeholder="e.g. Product cover"
                  className="mt-1.5 h-10 w-full rounded-lg border border-border-control px-3 text-xs font-normal outline-none focus:border-primary"
                />
              </label>
              <label className="block text-xs font-semibold text-body">
                Asset type
                <select
                  name="type"
                  defaultValue={editingAsset.type.toLowerCase()}
                  className="mt-1.5 h-10 w-full rounded-lg border border-border-control bg-white px-3 text-xs font-normal outline-none focus:border-primary"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="audio">Audio</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-divider bg-surface-muted px-6 py-4">
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="rounded-lg border border-border-control bg-white px-4 py-2 text-xs font-semibold text-body"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
      {cropSource && (
        <ImageCropModal
          source={cropSource}
          onClose={() => {
            setCropSource(null);
            setCropTarget(null);
          }}
          onCropped={(url) => {
            if (cropTarget === "edit")
              setEditingAsset((current) =>
                current ? { ...current, url, type: "image" } : current,
              );
            else if (cropTarget === "add")
              setNewPreview((current) => ({ ...current, url, type: "image" }));
            setCropSource(null);
            setCropTarget(null);
          }}
        />
      )}
    </div>
  );
}

function ImageCropModal({
  source,
  onClose,
  onCropped,
}: {
  source: string;
  onClose: () => void;
  onCropped: (url: string) => void;
}) {
  const [crop, setCrop] = useState<CropPosition>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const saveCrop = async () => {
    if (!area) return;
    setSaving(true);
    try {
      onCropped(await createCroppedImage(source, area));
    } catch {
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#111b40]/65 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-preview-title"
    >
      <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-divider px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
              Preview asset
            </p>
            <h2
              id="crop-preview-title"
              className="mt-1 text-base font-bold text-heading"
            >
              Crop image
            </h2>
            <p className="mt-1 text-[11px] text-muted">
              Position the image inside the 16:9 preview frame.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close crop dialog"
            className="grid h-8 w-8 place-items-center rounded-lg text-lg text-muted hover:bg-surface-control"
          >
            ×
          </button>
        </div>
        <div className="p-5">
          <div className="relative h-[min(65vw,420px)] overflow-hidden rounded-xl bg-[#111b40]">
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              cropShape="rect"
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedAreaPixels) =>
                setArea(croppedAreaPixels)
              }
            />
          </div>
          <label className="mt-4 flex items-center gap-3 text-xs font-semibold text-muted">
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
        </div>
        <div className="flex justify-end gap-2 border-t border-divider px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-border-control px-4 py-2 text-xs font-semibold text-body hover:bg-surface-control disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveCrop}
            disabled={!area || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && (
              <span
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white"
                aria-hidden="true"
              />
            )}
            {saving ? "Preparing..." : "Save Crop"}
          </button>
        </div>
      </section>
    </div>
  );
}

function PreviewAssetsPageSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-[1200px] animate-pulse"
      aria-label="Loading preview assets"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="h-8 w-44 rounded bg-surface-muted" />
          <div className="mt-2 h-4 w-72 rounded bg-surface-muted" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-surface-muted" />
      </div>
      <div className="mt-6 h-10 max-w-md rounded-lg bg-surface-muted" />
      <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex gap-6 border-b border-divider px-5 pt-4">
          <div className="h-4 w-10 rounded bg-surface-muted" />
          <div className="h-4 w-14 rounded bg-surface-muted" />
          <div className="h-4 w-14 rounded bg-surface-muted" />
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-xl border border-border"
            >
              <div className="aspect-[1.45] bg-surface-muted" />
              <div className="space-y-2 p-3">
                <div className="h-3 w-28 rounded bg-surface-muted" />
                <div className="h-3 w-20 rounded bg-surface-muted" />
                <div className="h-7 w-16 rounded bg-surface-muted" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
