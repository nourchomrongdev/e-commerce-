import ProductDetailClient from "./ProductDetailClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;

  return <ProductDetailClient productSlug={productSlug} />;
}
