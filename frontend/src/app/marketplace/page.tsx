import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import ProductGrid, { products } from "@/components/ProductGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Products",
  description:
    "Browse templates, e-books, courses and other downloadable digital products.",
};
const sectionClass = "mt-5";

export default function DigitalProductsPage() {
  return (
    <main className="w-full overflow-x-hidden">
      <div className="min-h-screen w-full overflow-x-hidden bg-background">
        <Navbar active="products" />
        <div className="mx-auto w-full max-w-[1440px] px-3 pb-10 sm:px-6">
          <HeroSection product />
          <section className={sectionClass}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="m-0 border-l-2 border-primary pl-2 text-[13px] font-bold text-slate-900 max-[800px]:text-[11px]">
              Best Sellers
            </h2>
            <a className="text-[9px] font-semibold text-primary no-underline" href="#">
              View all
            </a>
          </div>
          <ProductGrid items={products} product />
          </section>
        </div>
        <PublicFooter />
      </div>
    </main>
  );
}
