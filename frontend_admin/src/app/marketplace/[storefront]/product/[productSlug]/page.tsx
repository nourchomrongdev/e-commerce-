import ProductPage from "../../../[productSlug]/page";

export default async function StorefrontProductPage({ params }: { params: Promise<{ productSlug: string }> }) {
  const { productSlug } = await params;
  return <ProductPage params={Promise.resolve({ productSlug })} />;
}
