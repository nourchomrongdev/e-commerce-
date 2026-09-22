"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import PublicIcon from "@/components/icons/PublicIcon";
import ProductDiscountDialog from "@/components/products/ProductDiscountDialog";
import ProductPagination from "@/components/products/ProductPagination";
import ProductTable from "@/components/products/ProductTable";
import { Modal, Toast } from "@/components/ui";
import type { Product, ProductStatus } from "@/components/products/productTypes";

const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";
const ClientCaptchaChallenge = dynamic(() => import("@/components/dashboard/CaptchaChallenge"), { ssr: false });
const iconColors = ["#25376f", "#176b8d", "#1d5c45", "#b27b1b", "#18254f"];

const tabs: Array<"All Products" | ProductStatus> = ["All Products", "Published", "Draft", "Archived"];

export default function CreatorProductsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const storefrontMatch = pathname.match(/^\/creator\/storefront\/([^/]+)/);
  const storefrontSegment = storefrontMatch?.[1] ?? "";
  const addProductPath = storefrontMatch
    ? `/creator/storefront/${storefrontMatch[1]}/products/new`
    : "/creator/storefront";
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All Products");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [discounts, setDiscounts] = useState<Record<string, number>>(
    Object.fromEntries(products.map((product) => [product.name, product.discount])),
  );
  const [discountProduct, setDiscountProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [assetProduct, setAssetProduct] = useState<Product | null>(null);
  const [moreProduct, setMoreProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"name" | "captcha">("name");
  const [deleteNameConfirmation, setDeleteNameConfirmation] = useState("");
  const [productCaptchaValid, setProductCaptchaValid] = useState(false);
  const [productNotice, setProductNotice] = useState<{ variant: "success" | "error"; message: string } | null>(null);
  const [assets, setAssets] = useState<{ previews: Array<{ id: number; title: string; url: string }>; files: Array<{ id: number; fileName: string; fileSize: number; mimeType: string; url: string }> }>({ previews: [], files: [] });
  const [assetsLoading, setAssetsLoading] = useState(false);

  useEffect(() => {
    if (!storefrontSegment) {
      setIsLoading(false);
      return;
    }
    const storefrontName = decodeURIComponent(storefrontSegment);
    const token = window.localStorage.getItem("marketplace-token");
    setIsLoading(true);

    fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load products.");
        return data.products ?? [];
      })
      .then((databaseProducts: Array<{ id?: number; uuid?: string; name: string; description?: string; currentVersion?: string | null; latestVersion?: string | null; price: number; discount?: number; status: string; createdAt?: string }>) => {
        const nextProducts = databaseProducts.map((product, index) => ({
          id: product.id,
          uuid: product.uuid,
          name: product.name,
          description: product.description || "",
          currentVersion: product.currentVersion,
          latestVersion: product.latestVersion,
          price: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.price),
          discount: product.discount ?? 0,
          status: (product.status.charAt(0).toUpperCase() + product.status.slice(1).toLowerCase()) as ProductStatus,
          sales: 0,
          createdAt: product.createdAt ? new Date(product.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-",
          icon: iconColors[index % iconColors.length],
        }));
        setProducts(nextProducts);
        setDiscounts(Object.fromEntries(nextProducts.map((product) => [String(product.id ?? product.name), product.discount])));
      })
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, [storefrontSegment]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesTab = activeTab === "All Products" || product.status === activeTab;
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, products, search]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / 10));
  const visibleProducts = useMemo(() => filteredProducts.slice((page - 1) * 10, page * 10), [filteredProducts, page]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const openDiscountEditor = (product: Product) => {
    setDiscountProduct(product);
  };

  const openAssetViewer = async (product: Product) => {
    if (!product.id) return;
    setAssetProduct(product);
    setAssetsLoading(true);
    const token = window.localStorage.getItem("marketplace-token");
    const headers = { Authorization: `Bearer ${token}` };
    const baseUrl = `${apiUrl}/creator/storefronts/${encodeURIComponent(decodeURIComponent(storefrontSegment))}/products/${product.id}`;
    try {
      const [previewsResponse, filesResponse] = await Promise.all([fetch(`${baseUrl}/previews`, { headers }), fetch(`${baseUrl}/files`, { headers })]);
      const previews = await previewsResponse.json();
      const files = await filesResponse.json();
      setAssets({ previews: previews.previews ?? [], files: (files.files ?? []).map((file: { url: string }) => ({ ...file, url: `${apiUrl}${file.url}` })) });
    } finally {
      setAssetsLoading(false);
    }
  };

  const saveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editProduct?.id) return;
    const form = new FormData(event.currentTarget);
    const token = window.localStorage.getItem("marketplace-token");
    const response = await fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodeURIComponent(storefrontSegment))}/products/${editProduct.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: form.get("name"), description: form.get("description"), price: form.get("price"), status: form.get("status") }) });
    if (!response.ok) return;
    const data = await response.json();
    const updated = data.product;
    setProducts((current) => current.map((product) => product.id === editProduct.id ? { ...product, name: updated.name, description: updated.description, price: new Intl.NumberFormat("en-US", { style: "currency", currency: updated.currency || "USD" }).format(updated.price), status: (updated.status.charAt(0).toUpperCase() + updated.status.slice(1)) as ProductStatus } : product));
    setEditProduct(null);
  };

  const saveDiscount = async (value: number) => {
    if (!discountProduct?.id) return;
    const token = window.localStorage.getItem("marketplace-token");
    await fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodeURIComponent(storefrontSegment))}/products/${discountProduct.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ discount: value }) });
    setDiscounts((current) => ({ ...current, [String(discountProduct.id ?? discountProduct.name)]: value }));
    setProducts((current) => current.map((product) => product.id === discountProduct.id ? { ...product, discount: value } : product));
    setDiscountProduct(null);
  };

  const openDeleteConfirmation = (product: Product) => {
    setMoreProduct(null);
    setDeleteStep("name");
    setDeleteNameConfirmation("");
    setProductCaptchaValid(false);
    setDeleteProduct(product);
  };

  const confirmDeleteName = () => {
    if (!deleteProduct || deleteNameConfirmation.trim() !== deleteProduct.name.trim()) return;
    setProductCaptchaValid(false);
    setDeleteStep("captcha");
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProduct?.id || !productCaptchaValid) return;
    setDeletingProduct(true);
    const token = window.localStorage.getItem("marketplace-token");
    try {
      const response = await fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(decodeURIComponent(storefrontSegment))}/products/${deleteProduct.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to delete product.");
      setProducts((current) => current.filter((product) => product.id !== deleteProduct.id));
      setDeleteProduct(null);
      setMoreProduct(null);
      setProductNotice({ variant: "success", message: "Product deleted successfully." });
    } catch (deleteError) {
      setProductNotice({
        variant: "error",
        message: deleteError instanceof Error ? deleteError.message : "Unable to delete product.",
      });
    } finally {
      setDeletingProduct(false);
    }
  };

  const productEditPath = (product: Product) => {
    const productKey = product.uuid ?? product.id;
    return productKey ? `${addProductPath.replace(/\/new$/, "")}/${productKey}/edit` : addProductPath;
  };

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {productNotice && (
        <Toast
          variant={productNotice.variant}
          title={productNotice.variant === "success" ? "Product deleted" : "Delete failed"}
          message={productNotice.message}
          duration={4000}
          onClose={() => setProductNotice(null)}
        />
      )}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Products</h1>
          <p className="mt-1 text-sm text-muted">Manage your digital products and courses.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-border-control bg-white px-3 py-2 text-xs font-medium text-body shadow-sm transition hover:bg-surface-control">
            <PublicIcon name="down" className="h-3.5 w-3.5 rotate-180" />
            Export
          </button>
          <Link href={addProductPath} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white no-underline shadow-sm transition hover:bg-[#e65d00]">
            <PublicIcon name="add" className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </header>

      <section className="mt-7 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-divider px-5 pt-4 sm:px-6">
          <nav className="flex gap-6 overflow-x-auto" aria-label="Product status filters">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative whitespace-nowrap pb-3 text-xs font-semibold transition ${activeTab === tab ? "text-primary" : "text-tab-muted hover:text-body"}`}
              >
                {tab}
                {activeTab === tab && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />}
              </button>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pb-4 sm:flex-row sm:justify-end">
            <label className="relative block sm:w-64">
              <span className="sr-only">Search products</span>
              <PublicIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-muted-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="h-9 w-full rounded-lg border border-border-control bg-white pl-9 pr-3 text-xs text-body outline-none placeholder:text-muted-faint focus:border-primary"
              />
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border-control px-3 text-xs font-medium text-muted hover:bg-surface-control"
              >
                <PublicIcon name="settings" className="h-3.5 w-3.5" />
                Filters
              </button>

              {showFilters && (
                <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-[#e7ebf4] bg-white p-3 shadow-lg">
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6d7a96]">
                    Status
                  </label>
                  <select
                    value={activeTab}
                    onChange={(event) => {
                      setActiveTab(event.target.value as (typeof tabs)[number]);
                      setShowFilters(false);
                    }}
                    className="h-9 w-full rounded-lg border border-[#e2e7f1] bg-[#f7f9fd] px-2 text-xs text-[#283554] outline-none focus:border-primary"
                  >
                    {tabs.map((tab) => (
                      <option key={tab} value={tab}>
                        {tab}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <ProductTable products={visibleProducts} discounts={discounts} onDiscount={openDiscountEditor} onEdit={(product) => router.push(productEditPath(product))} onMore={setMoreProduct} isLoading={isLoading} />
        <ProductPagination count={visibleProducts.length} total={filteredProducts.length} page={page} pages={pageCount} onPageChange={setPage} />
      </section>

      <ProductDiscountDialog key={discountProduct?.id ?? "discount"} product={discountProduct} value={discountProduct ? discounts[String(discountProduct.id ?? discountProduct.name)] ?? 0 : 0} onClose={() => setDiscountProduct(null)} onSave={saveDiscount} />

      <Modal open={Boolean(moreProduct)} title={`Actions: ${moreProduct?.name ?? "Product"}`} onClose={() => setMoreProduct(null)}>
        {moreProduct && <div className="grid gap-2">
          <button type="button" onClick={() => { const productKey = moreProduct.uuid ?? moreProduct.id; setMoreProduct(null); router.push(`/creator/storefront/${encodeURIComponent(decodeURIComponent(storefrontSegment))}/products/versions/new?product=${encodeURIComponent(String(productKey))}`); }} className="flex items-center gap-3 rounded-lg border border-border-control px-4 py-3 text-left text-xs font-medium text-body hover:border-primary hover:bg-accent-light"><PublicIcon name="add" className="h-4 w-4 text-primary" />Add Version</button>
          <button type="button" onClick={() => { setMoreProduct(null); router.push(`/creator/storefront/${encodeURIComponent(decodeURIComponent(storefrontSegment))}/preview-assets?product=${encodeURIComponent(moreProduct.name)}`); }} className="flex items-center gap-3 rounded-lg border border-border-control px-4 py-3 text-left text-xs font-medium text-body hover:border-primary hover:bg-accent-light"><PublicIcon name="edit" className="h-4 w-4 text-primary" />Edit Preview</button>
          <button type="button" onClick={() => { setMoreProduct(null); router.push(`/creator/storefront/${encodeURIComponent(decodeURIComponent(storefrontSegment))}/products/files?product=${encodeURIComponent(moreProduct.name)}`); }} className="flex items-center gap-3 rounded-lg border border-border-control px-4 py-3 text-left text-xs font-medium text-body hover:border-primary hover:bg-accent-light"><PublicIcon name="file-search-corner" className="h-4 w-4 text-primary" />Edit File</button>
          <button type="button" onClick={() => { setMoreProduct(null); router.push(`${productEditPath(moreProduct).replace(/\/edit$/, "")}/detail`); }} className="flex items-center gap-3 rounded-lg border border-border-control px-4 py-3 text-left text-xs font-medium text-body hover:border-primary hover:bg-accent-light"><PublicIcon name="view" className="h-4 w-4 text-primary" />View Detail</button>
          <button type="button" onClick={() => openDeleteConfirmation(moreProduct)} className="flex items-center gap-3 rounded-lg border border-status-danger/20 px-4 py-3 text-left text-xs font-medium text-status-danger hover:bg-status-danger-surface"><PublicIcon name="delete" className="h-4 w-4" />Delete Product</button>
        </div>}
      </Modal>

      <Modal open={Boolean(deleteProduct)} title={deleteStep === "name" ? "Confirm product deletion" : "Complete CAPTCHA"} onClose={() => !deletingProduct && setDeleteProduct(null)} footer={<>
        <button type="button" onClick={() => setDeleteProduct(null)} disabled={deletingProduct} className="rounded-lg border border-border-control px-4 py-2 text-xs font-semibold text-body disabled:opacity-50">Cancel</button>
        {deleteStep === "name" ? (
          <button type="button" onClick={confirmDeleteName} disabled={deletingProduct || deleteNameConfirmation.trim() !== deleteProduct?.name.trim()} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">Continue</button>
        ) : (
          <button type="button" onClick={confirmDeleteProduct} disabled={deletingProduct || !productCaptchaValid} className="rounded-lg bg-status-danger px-4 py-2 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-60">{deletingProduct ? "Deleting..." : "Delete product"}</button>
        )}
      </>}>
        {deleteStep === "name" ? (
          <div>
            <p className="text-sm leading-6 text-muted">This will permanently delete <span className="font-semibold text-ink">{deleteProduct?.name ?? "this product"}</span>, including its versions, files, previews, and licences. Type the product name to continue.</p>
            <label className="mt-4 block text-xs font-semibold text-ink">
              Product name
              <input
                value={deleteNameConfirmation}
                onChange={(event) => setDeleteNameConfirmation(event.target.value)}
                placeholder={deleteProduct?.name}
                autoFocus
                className="mt-2 h-10 w-full rounded-lg border border-border-control px-3 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
              />
            </label>
          </div>
        ) : (
          <div>
            <p className="text-sm leading-6 text-muted">Enter the alphanumeric CAPTCHA to permanently delete <span className="font-semibold text-ink">{deleteProduct?.name ?? "this product"}</span>.</p>
            <ClientCaptchaChallenge onValidChange={setProductCaptchaValid} />
          </div>
        )}
      </Modal>

      <Modal open={Boolean(editProduct)} title="Edit product" onClose={() => setEditProduct(null)}>
        {editProduct && <form onSubmit={saveProduct} className="space-y-4">
          <label className="block text-xs font-medium text-body">Name<input name="name" defaultValue={editProduct.name} className="mt-1 h-9 w-full rounded-lg border border-border-control px-3 text-xs" required /></label>
          <label className="block text-xs font-medium text-body">Description<textarea name="description" defaultValue={editProduct.description} className="mt-1 w-full rounded-lg border border-border-control px-3 py-2 text-xs" rows={3} /></label>
          <label className="block text-xs font-medium text-body">Price<input name="price" type="number" min="0" step="0.01" defaultValue={editProduct.price.replace(/[^0-9.]/g, "")} className="mt-1 h-9 w-full rounded-lg border border-border-control px-3 text-xs" required /></label>
          <label className="block text-xs font-medium text-body">Status<select name="status" defaultValue={editProduct.status} className="mt-1 h-9 w-full rounded-lg border border-border-control px-3 text-xs"><option>Draft</option><option>Published</option><option>Archived</option></select></label>
          <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white">Save changes</button>
        </form>}
      </Modal>

      <Modal open={Boolean(assetProduct)} title={`Assets: ${assetProduct?.name ?? ""}`} onClose={() => setAssetProduct(null)}>
        {assetsLoading ? <p className="py-8 text-center text-sm text-muted">Loading assets...</p> : <div className="space-y-4">
          {assets.previews.map((preview) => <img key={preview.id} src={preview.url} alt={preview.title || assetProduct?.name} className="max-h-64 w-full rounded-lg object-contain" />)}
          {assets.files.length > 0 && <div><h3 className="text-xs font-semibold text-heading">Product files</h3>{assets.files.map((file) => <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="mt-2 block rounded-lg border border-border-control px-3 py-2 text-xs text-primary">{file.fileName}</a>)}</div>}
          {!assets.previews.length && !assets.files.length && <p className="py-8 text-center text-sm text-muted">No previews or files available.</p>}
        </div>}
      </Modal>
    </div>
  );
}
