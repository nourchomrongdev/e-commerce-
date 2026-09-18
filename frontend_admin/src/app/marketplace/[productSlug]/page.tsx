import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import ProductDetailClient from "./ProductDetailClient";

type Props = { params: Promise<{ productSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;
  const title = productSlug.toLowerCase() === "the-ultimate-design" ? "The Ultimate Design" : productSlug;
  return { title, description: "A practical digital design guide from TestStore." };
}

export default async function ProductPage({ params }: Props) {
  const { productSlug } = await params;
  return (
    <div className="min-h-screen bg-[#f8faff]">
      <Navbar active="products" />
      <ProductDetailClient productSlug={productSlug} />
      <PublicFooter />
    </div>
  );
}
