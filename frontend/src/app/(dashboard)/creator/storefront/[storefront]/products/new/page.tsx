import Link from "next/link";
import AddProductForm from "@/components/products/AddProductForm";

export default async function AddProductPage({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront: storefrontParam } = await params;
  const storefront = decodeURIComponent(storefrontParam);
  const productsPath = `/creator/storefront/${encodeURIComponent(storefront)}/products`;

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-muted">
            <Link href={productsPath} className="text-primary no-underline hover:underline">Products</Link>
            <span aria-hidden="true">/</span>
            <span>Add Product</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Add Product</h1>
          <p className="mt-1 text-sm text-muted">Create a new digital product for {storefront}.</p>
        </div>
      </header>
      <AddProductForm productsPath={productsPath} storefrontName={storefront} />
    </div>
  );
}
