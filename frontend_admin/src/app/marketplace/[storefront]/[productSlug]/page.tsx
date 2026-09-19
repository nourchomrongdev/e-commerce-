import ProductDetailClient from "@/components/marketplace/ProductDetailClient";

export default async function StorefrontProductPage({
  params,
}: {
  params: Promise<{ storefront: string; productSlug: string }>;
}) {
  const { productSlug } = await params;
  return <ProductDetailClient productSlug={productSlug} />;
}
