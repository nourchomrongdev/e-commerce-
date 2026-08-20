import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PublicIcon from "@/components/icons/PublicIcon";
import { routes } from "@/lib/routeController";

const storefronts: Record<string, {
  displayName: string;
  type: string;
  description: string;
  accent: string;
  products: { name: string; type: string; price: string; icon: string }[];
}> = {
  DevCourses: {
    displayName: "DevCourses",
    type: "Digital Products",
    description: "Online courses and resources for developers to level up their skills.",
    accent: "var(--storefront-blue)",
    products: [
      { name: "Full Stack Web Dev", type: "Video Course", price: "$49", icon: "JS" },
      { name: "React Code Course", type: "Video Course", price: "$39", icon: "R" },
      { name: "API Mastery", type: "Developer Guide", price: "$24", icon: "API" },
      { name: "Modern Resume", type: "Template", price: "$9", icon: "CV" },
    ],
  },
  "AI Resources": {
    displayName: "AI Resources",
    type: "Bundles",
    description: "AI tools and learning bundles for everyone.",
    accent: "var(--storefront-teal)",
    products: [
      { name: "AI Starter Bundle", type: "Bundle", price: "$29", icon: "AI" },
      { name: "Prompt Library", type: "Resource Pack", price: "$15", icon: "P" },
    ],
  },
  NourChomrong: {
    displayName: "NourChomrong",
    type: "Templates",
    description: "Professional templates and design resources for modern websites.",
    accent: "var(--storefront-blue)",
    products: [
      { name: "Startup Landing Page", type: "UI Kit", price: "$24", icon: "UI" },
      { name: "Business Plan", type: "Template", price: "$18", icon: "BP" },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: { storefrontName: string };
}): Promise<Metadata> {
  const storefront = storefronts[decodeURIComponent(params.storefrontName)] || storefronts.DevCourses;
  return {
    title: storefront.displayName,
    description: storefront.description,
  };
}

export default function PublicStorefrontPage({
  params,
}: {
  params: { storefrontName: string };
}) {
  const storefront = storefronts[decodeURIComponent(params.storefrontName)] || storefronts.DevCourses;
  const storefrontUrl = routes.marketplaceStorefront(storefront.displayName);

  return (
    <main className="min-h-screen bg-background text-[#111b40]">
      <Navbar active="products" />
      <div className="mx-auto max-w-[1180px] px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2 text-xs text-[#8993aa]">
          <Link href={routes.marketplace()} className="text-primary no-underline hover:underline">Marketplace</Link>
          <span>/</span>
          <span>{storefront.displayName}</span>
        </div>

        <section className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_rgba(17,27,64,0.06)]">
          <div className="relative px-6 py-10 text-white sm:px-10" style={{ backgroundColor: storefront.accent }}>
            <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full border-[28px] border-white/10" />
            <div className="relative max-w-2xl">
              <span className="rounded-md bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80">
                {storefront.type}
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{storefront.displayName}</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">{storefront.description}</p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/75">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-300" />Active storefront</span>
                <span>12 products</span>
                <span>4.9 average rating</span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_230px]">
            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#111b40]">Featured products</h2>
                  <p className="mt-1 text-xs text-[#8993aa]">Explore the latest resources from this creator.</p>
                </div>
                <span className="text-xs font-medium text-[#8993aa]">{storefront.products.length} shown</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {storefront.products.map((product, index) => (
                  <article key={product.name} className="group rounded-xl border border-[#e8ecf4] bg-[#fafbfe] p-4 transition hover:-translate-y-0.5 hover:border-[#dce2ef] hover:bg-white hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-xl text-xs font-bold text-white" style={{ backgroundColor: [storefront.accent, "var(--storefront-orange)", "var(--storefront-pink)", "var(--storefront-navy)"][index % 4] }}>
                        {product.icon}
                      </div>
                      <button type="button" aria-label={`Add ${product.name} to cart`} className="grid h-8 w-8 place-items-center rounded-lg bg-white text-primary shadow-sm transition group-hover:bg-accent-light">
                        <PublicIcon name="shopping-cart" className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-5 text-sm font-bold text-[#111b40]">{product.name}</p>
                    <p className="mt-1 text-xs text-[#8993aa]">{product.type}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">{product.price}</span>
                      <span className="text-[11px] text-[#8993aa]">4.8 <span className="text-secondary">★</span></span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="h-fit rounded-xl border border-[#e8ecf4] bg-[#fafbfe] p-5 text-center">
              <h2 className="text-sm font-bold text-[#111b40]">Share this storefront</h2>
              <p className="mt-1 text-[11px] leading-5 text-[#8993aa]">Scan the QR code to open this store on another device.</p>
              <div className="mx-auto mt-5 grid w-fit place-items-center rounded-xl bg-white p-3 shadow-sm">
                <QRCodeSVG value={storefrontUrl} size={150} bgColor="#ffffff" fgColor="#111b40" includeMargin />
              </div>
              <p className="mt-4 break-all text-[10px] leading-4 text-[#8993aa]">{storefrontUrl}</p>
              <button type="button" className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90">
                Share Storefront
              </button>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
