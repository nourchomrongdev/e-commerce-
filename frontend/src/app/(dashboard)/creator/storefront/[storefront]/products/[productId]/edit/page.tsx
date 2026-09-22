"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AddProductForm from "@/components/products/AddProductForm";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type EditableProduct = {
  id: number;
  uuid?: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  discount: number;
  status: "Draft" | "Published" | "Archived";
  productType: string;
};

export default function EditProductPage() {
  const params = useParams<{ storefront: string; productId: string }>();
  const storefront = decodeURIComponent(params.storefront);
  const productsPath = `/creator/storefront/${encodeURIComponent(storefront)}/products`;
  const [product, setProduct] = useState<EditableProduct | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");
    fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefront)}/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load product.");
        return data.products ?? [];
      })
      .then((products: EditableProduct[]) => {
        const selected = products.find((item) => item.uuid === params.productId || String(item.id) === params.productId);
        if (!selected) throw new Error("Product not found.");
        setProduct({ ...selected, status: (selected.status.charAt(0).toUpperCase() + selected.status.slice(1)) as EditableProduct["status"] });
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load product."));
  }, [params.productId, storefront]);

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-muted"><Link href={productsPath} className="text-primary no-underline hover:underline">Products</Link><span aria-hidden="true">/</span><span>Edit Product</span></div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Edit Product</h1>
          <p className="mt-1 text-sm text-muted">Update the complete product setup.</p>
        </div>
      </header>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</p>}
      {!product && !error && <p className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">Loading product...</p>}
      {product && <AddProductForm productsPath={productsPath} storefrontName={storefront} editProduct={product} />}
    </div>
  );
}
