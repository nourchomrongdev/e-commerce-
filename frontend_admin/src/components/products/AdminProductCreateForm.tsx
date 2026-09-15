"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "./ProductForm";
import type { ProductFormValues } from "./productTypes";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export default function AdminProductCreateForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  const createProduct = async (values: ProductFormValues) => {
    setError("");
    const token = window.localStorage.getItem("marketplace-token");
    const response = await fetch(`${apiUrl}/admin/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        name: values.name,
        description: values.description,
        price: Number(values.price),
        status: values.status,
        productType: "Digital Download",
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to create product.");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  };

  return <div className="mx-auto w-full max-w-3xl"><header className="mb-6"><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">Administration</p><h1 className="text-2xl font-bold tracking-tight text-heading">Add Product</h1><p className="mt-1 text-sm text-muted">Create a product record for the marketplace.</p></header>{error && <p role="alert" className="mb-4 rounded-lg border border-status-danger/20 bg-red-50 px-4 py-3 text-xs text-status-danger">{error}</p>}<ProductForm submitLabel="Create product" onSubmit={createProduct} onCancel={() => router.push("/admin/products")} /></div>;
}
