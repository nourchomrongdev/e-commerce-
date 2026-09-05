"use client";

import { useState, type FormEvent } from "react";
import { ProductField, ProductSelect, ProductTextarea } from "./ProductField";
import type { ProductFormValues, ProductStatus } from "./productTypes";

const initialValues: ProductFormValues = { name: "", description: "", price: "", discount: 0, status: "Draft" };

export default function ProductForm({ initialValue = initialValues, submitLabel = "Save product", onSubmit, onCancel }: { initialValue?: ProductFormValues; submitLabel?: string; onSubmit: (values: ProductFormValues) => void; onCancel?: () => void }) {
  const [values, setValues] = useState<ProductFormValues>(initialValue);
  const update = <Key extends keyof ProductFormValues>(key: Key, value: ProductFormValues[Key]) => setValues((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSubmit(values); };

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        <ProductField label="Product name" id="product-name" value={values.name} onChange={(event) => update("name", event.target.value)} placeholder="e.g. UI Design Course" required />
        <ProductField label="Price" id="product-price" type="number" min="0" step="0.01" value={values.price} onChange={(event) => update("price", event.target.value)} placeholder="29.00" required />
      </div>
      <ProductTextarea label="Description" id="product-description" value={values.description} onChange={(event) => update("description", event.target.value)} placeholder="Describe what customers will receive" required />
      <div className="grid gap-5 sm:grid-cols-2">
        <ProductField label="Discount" id="product-form-discount" type="number" min="0" max="100" value={values.discount} onChange={(event) => update("discount", Number(event.target.value))} hint="Enter a percentage between 0 and 100." />
        <ProductSelect label="Status" id="product-status" value={values.status} onChange={(event) => update("status", event.target.value as ProductStatus)}>
          <option value="Draft">Draft</option><option value="Published">Published</option><option value="Archived">Archived</option>
        </ProductSelect>
      </div>
      <div className="flex justify-end gap-2 border-t border-divider pt-5"><button type="button" onClick={onCancel} className="rounded-lg border border-border-control px-4 py-2 text-xs font-medium text-muted hover:bg-surface-control">Cancel</button><button type="submit" className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover">{submitLabel}</button></div>
    </form>
  );
}
