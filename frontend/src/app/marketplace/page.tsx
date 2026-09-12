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
const categories = [
  ["▤", "Templates", "245 items"],
  ["▥", "eBooks", "312 items"],
  ["◇", "Courses", "156 items"],
  ["▪", "UI Kits", "189 items"],
  ["◌", "Graphics", "278 items"],
  ["▣", "Themes", "134 items"],
];
const sectionClass = "mt-5";

export default function DigitalProductsPage() {
  return (
    <main>
      <div className="min-h-screen w-full bg-background">
        <Navbar active="products" />
        <div className="mx-auto max-w-[1440px] px-3 pb-5 sm:px-6">
          <HeroSection product />
          <section className={sectionClass} id="categories">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="m-0 text-[13px] font-semibold text-slate-900 max-[800px]:text-[11px]">
              Categories
            </h2>
            <a className="text-[9px] font-semibold text-primary no-underline" href="#">
              View all
            </a>
          </div>
          <div className="grid grid-cols-6 gap-2.5 max-[800px]:grid-cols-4 max-[800px]:gap-[7px]">
            {categories.map(([icon, name, count]) => (
              <article
                className="flex h-12 items-center gap-[9px] rounded-lg border border-accent-light bg-white p-[9px] shadow-sm transition hover:border-primary/40 hover:shadow-md max-[800px]:h-[58px] max-[800px]:block max-[800px]:p-[5px] max-[800px]:text-center"
                key={name}
              >
                <i className="rounded-lg bg-accent-light p-[7px] text-[11px] not-italic text-primary max-[800px]:inline-block max-[800px]:p-[5px] max-[800px]:text-[10px]">
                  {icon}
                </i>
                <div>
                  <strong className="block text-[9px] text-slate-800 max-[800px]:mt-0.5 max-[800px]:text-[7px]">
                    {name}
                  </strong>
                  <span className="mt-[3px] block text-[8px] text-slate-500 max-[800px]:hidden">
                    {count}
                  </span>
                </div>
              </article>
            ))}
          </div>
          </section>
          <section className={sectionClass}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="m-0 text-[13px] font-semibold text-slate-900 max-[800px]:text-[11px]">
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
