"use client";

import { useState } from "react";
import { Button, InputText, Modal } from "@/components/ui";
import type { Product } from "./productTypes";

export default function ProductDiscountDialog({ product, value, onClose, onSave }: { product: Product | null; value: number; onClose: () => void; onSave: (value: number) => void }) {
  const [discount, setDiscount] = useState(value);

  if (!product) return null;

  const save = () => onSave(Math.min(100, Math.max(0, discount)));

  return <Modal open={Boolean(product)} title="Set product discount" onClose={onClose} footer={<><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={save}>Save discount</Button></>}>
    <p className="text-xs text-[#66718e]">{product.name}</p>
    <label htmlFor="product-discount" className="mt-5 block text-xs font-medium text-[#283554]">Discount percentage
      <div className="relative"><InputText id="product-discount" className="mt-2 pr-10" type="number" min="0" max="100" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} /><span className="absolute right-3 top-4 text-sm text-[#8a93a8]">%</span></div>
    </label>
  </Modal>;
}
