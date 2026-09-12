import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
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
    <main className="min-h-screen bg-[#f4f5f7] text-[#111b40]">
      <Navbar active="products" />
      <div className="mx-auto max-w-[1180px] px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2 text-xs text-[#8993aa]">
          <Link href={routes.marketplace()} className="text-primary no-underline hover:underline">Marketplace</Link>
          <span>/</span>
          <span>{storefront.displayName}</span>
        </div>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="rounded-xl border border-[#dfe3ea] bg-[#eceef1] p-4 shadow-sm sm:p-5">
            <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-lg bg-[#e2e4e7] p-6 sm:min-h-[470px]">
              <div className="absolute inset-x-0 bottom-0 h-24 bg-[#0b3a73]" />
              <div className="relative z-10 grid w-full max-w-[520px] grid-cols-3 gap-3 sm:gap-5">
                {[
                  ["People", "bg-[#37a8d0]"],
                  ["Teams", "bg-[#f2a719]"],
                  ["Growth", "bg-[#1ba6a6]"],
                  ["Payroll", "bg-[#d15a2e]"],
                  ["HR", "bg-white"],
                  ["Reports", "bg-[#ef9f12]"],
                ].map(([label, color], index) => (
                  <div key={label} className={`grid aspect-square place-items-center rounded-xl border-4 border-white/90 ${color} p-2 text-center shadow-md ${index === 4 ? "col-start-2" : ""}`}>
                    <span className="text-[10px] font-bold text-[#233044] sm:text-xs">{label}</span>
                  </div>
                ))}
              </div>
              <p className="absolute bottom-7 z-10 text-center text-lg font-semibold text-white sm:text-2xl">{storefront.displayName}</p>
            </div>
          </div>

          <div className="flex flex-col px-1 py-2 sm:px-3 lg:py-4">
            <span className="w-fit rounded-md bg-accent-light px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{storefront.type}</span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#202735] sm:text-5xl">{storefront.displayName}</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#647087]">{storefront.description}</p>
            <div className="mt-5 flex flex-wrap gap-4 border-b border-[#d9dde5] pb-5 text-xs text-[#58657d]">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Available now</span>
              <span>{storefront.products.length} listed products</span>
            </div>
            <div className="mt-6 flex overflow-hidden rounded-xl border border-primary">
              <Link href={routes.marketplace()} className="flex flex-1 items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-bold text-white no-underline hover:bg-primary-hover">
                <PublicIcon name="download" className="h-4 w-4" /> Browse products
              </Link>
              <a href="mailto:support@marketplace.com" className="flex flex-1 items-center justify-center gap-2 bg-white px-4 py-3 text-sm font-bold text-primary no-underline hover:bg-accent-light">
                <PublicIcon name="mail" className="h-4 w-4" /> Contact us
              </a>
            </div>
            <div className="mt-6 rounded-xl bg-[#eef0f3] p-4">
              <p className="text-xs font-semibold text-[#202735]">Share this storefront</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="rounded-lg bg-white p-2"><QRCodeSVG value={storefrontUrl} size={72} bgColor="#ffffff" fgColor="#111b40" includeMargin /></div>
                <p className="max-w-[220px] text-[10px] leading-5 text-[#647087]">Scan to open this storefront on another device.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#111b40]">Featured products</h2>
              <p className="mt-1 text-xs text-[#8993aa]">Explore the latest resources from this creator.</p>
            </div>
            <span className="text-xs font-medium text-[#8993aa]">{storefront.products.length} shown</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {storefront.products.map((product, index) => (
              <article key={product.name} className="group rounded-xl border border-[#e0e4ea] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl text-xs font-bold text-white" style={{ backgroundColor: [storefront.accent, "var(--storefront-orange)", "var(--storefront-pink)", "var(--storefront-navy)"][index % 4] }}>
                    {product.icon}
                  </div>
                  <button type="button" aria-label={`Add ${product.name} to cart`} className="grid h-8 w-8 place-items-center rounded-lg bg-accent-light text-primary">
                    <PublicIcon name="shopping-cart" className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-5 text-sm font-bold text-[#111b40]">{product.name}</p>
                <p className="mt-1 text-xs text-[#8993aa]">{product.type}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">{product.price}</span>
                  <span className="text-[11px] text-[#8993aa]">Digital download</span>
                </div>
              </article>
            ))}
          </div>
        </section>

      </div>
      <PublicFooter />
    </main>
  );
}
