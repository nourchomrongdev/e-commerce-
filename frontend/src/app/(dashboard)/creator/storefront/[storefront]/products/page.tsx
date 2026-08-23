"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import ProductDiscountDialog from "@/components/products/ProductDiscountDialog";
import ProductPagination from "@/components/products/ProductPagination";
import ProductTable from "@/components/products/ProductTable";
import type { Product, ProductStatus } from "@/components/products/productTypes";

const products: Product[] = [
  {
    name: "Laravel API Mastery",
    description: "Complete guide to building RESTful APIs",
    price: "$45.00",
    discount: 20,
    status: "Published",
    sales: 128,
    createdAt: "May 12, 2024",
    icon: "#25376f",
  },
  {
    name: "Flutter UI Design Course",
    description: "Build beautiful mobile apps with Flutter",
    price: "$39.00",
    discount: 0,
    status: "Published",
    sales: 96,
    createdAt: "May 8, 2024",
    icon: "#176b8d",
  },
  {
    name: "Vue.js for Beginners",
    description: "Learn Vue.js from scratch",
    price: "$29.00",
    discount: 0,
    status: "Draft",
    sales: 0,
    createdAt: "May 6, 2024",
    icon: "#1d5c45",
  },
  {
    name: "JavaScript Fundamentals",
    description: "Core JavaScript concepts",
    price: "$19.00",
    discount: 15,
    status: "Published",
    sales: 210,
    createdAt: "May 1, 2024",
    icon: "#b27b1b",
  },
  {
    name: "Database Design Basics",
    description: "Design better databases",
    price: "$25.00",
    discount: 0,
    status: "Archived",
    sales: 45,
    createdAt: "Apr 28, 2024",
    icon: "#18254f",
  },
];

const tabs: Array<"All Products" | ProductStatus> = ["All Products", "Published", "Draft", "Archived"];

export default function CreatorProductsPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All Products");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [discounts, setDiscounts] = useState<Record<string, number>>(
    Object.fromEntries(products.map((product) => [product.name, product.discount])),
  );
  const [discountProduct, setDiscountProduct] = useState<Product | null>(null);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesTab = activeTab === "All Products" || product.status === activeTab;
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, search]);

  const openDiscountEditor = (product: Product) => {
    setDiscountProduct(product);
  };

  return (
    <div className="mx-auto w-full max-w-[1400px]">
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
          <Link href="/creator/storefront" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white no-underline shadow-sm transition hover:bg-[#e65d00]">
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

        <ProductTable products={visibleProducts} discounts={discounts} onDiscount={openDiscountEditor} />
        <ProductPagination count={visibleProducts.length} total={products.length} />
      </section>

      <ProductDiscountDialog product={discountProduct} value={discountProduct ? discounts[discountProduct.name] ?? 0 : 0} onClose={() => setDiscountProduct(null)} onSave={(value) => { if (discountProduct) setDiscounts((current) => ({ ...current, [discountProduct.name]: value })); setDiscountProduct(null); }} />
    </div>
  );
}