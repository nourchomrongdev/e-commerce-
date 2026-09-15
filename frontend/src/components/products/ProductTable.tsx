import PublicIcon from "@/components/icons/PublicIcon";
import ProductStatusBadge from "./ProductStatusBadge";
import type { Product } from "./productTypes";

type ProductTableProps = {
  products: Product[];
  discounts: Record<string, number>;
  onDiscount: (product: Product) => void;
  isLoading?: boolean;
  onEdit?: (product: Product) => void;
  onMore?: (product: Product) => void;
};

export default function ProductTable({ products, discounts, onDiscount, isLoading = false, onEdit, onMore }: ProductTableProps) {
  return (
    <div className="overflow-x-auto product-responsive-table">
      <table className="w-full min-w-[900px] text-left text-xs">
        <thead className="bg-[#fcfcfe] text-[10px] text-[#66718e]">
          <tr>
            <th className="px-6 py-3 font-medium">Product</th>
            <th className="py-3 font-medium">Price</th>
            <th className="py-3 font-medium">Discount</th>
            <th className="py-3 font-medium">Status</th>
            <th className="py-3 font-medium">Sales</th>
            <th className="py-3 font-medium">Created At</th>
            <th className="px-6 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#66718e]">
                Loading products...
              </td>
            </tr>
          ) : products.map((product) => {
            const productKey = String(product.id ?? product.name);
            const discount = discounts[productKey] ?? 0;
            const price = Number(product.price.slice(1));

            return (
              <tr key={productKey} className="border-t border-[#edf0f5] text-[#283554] transition hover:bg-[#fffaf6]">
                <td data-label="Product" className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-sm text-white shadow-sm" style={{ backgroundColor: product.icon }}>✦</span>
                    <span className="min-w-0">
                      <strong className="block truncate text-[11px] font-semibold text-[#172141]">{product.name}</strong>
                      <span className="mt-0.5 block truncate text-[9px] text-[#7b849a]">{product.description}</span>
                    </span>
                  </div>
                </td>
                <td data-label="Price" className="font-medium text-[#172141]">
                  {discount > 0 ? <><span className="text-primary">${(price * (1 - discount / 100)).toFixed(2)}</span><span className="ml-2 text-[10px] text-[#9aa2b5] line-through">{product.price}</span></> : product.price}
                </td>
                <td data-label="Discount">
                  {discount > 0 ? <button type="button" onClick={() => onDiscount(product)} className="rounded-md bg-orange-50 px-2 py-1 text-[9px] font-semibold text-primary hover:bg-orange-100">-{discount}%</button> : <button type="button" onClick={() => onDiscount(product)} className="text-[10px] font-medium text-[#8a93a8] hover:text-primary">Add discount</button>}
                </td>
                <td data-label="Status"><ProductStatusBadge status={product.status} /></td>
                <td data-label="Sales">{product.sales}</td>
                <td data-label="Created At" className="text-[#66718e]">{product.createdAt}</td>
                <td data-label="Actions" className="px-6">
                  <div className="flex justify-end gap-2">
                    <button type="button" aria-label={`Edit ${product.name}`} onClick={() => onEdit?.(product)} className="product-action-secondary grid h-7 w-7 place-items-center rounded-md border border-[#e4e7ef] text-[#66718e] hover:border-primary hover:text-primary"><PublicIcon name="edit" className="h-3.5 w-3.5 text-primary" /></button>
                    <button type="button" aria-label={`Set discount for ${product.name}`} onClick={() => onDiscount(product)} className="product-action-secondary grid h-7 w-7 place-items-center rounded-md border border-[#e4e7ef] text-[10px] font-semibold text-[#66718e] hover:border-primary hover:text-primary"><PublicIcon name="percent" className="h-3.5 w-3.5" /></button>
                    <button type="button" aria-label={`More actions for ${product.name}`} onClick={() => onMore?.(product)} className="grid h-7 w-7 place-items-center rounded-md border border-[#e4e7ef] text-[#66718e] hover:border-primary hover:text-primary"><PublicIcon name="ellipsis-vertical" className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!isLoading && products.length === 0 && <p className="px-6 py-12 text-center text-sm text-[#66718e]">No products match your search.</p>}
    </div>
  );
}
