import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import StorefrontCartButton from "@/components/StorefrontCartButton";

const products = [
  ["Modern Landing Page Template", "Templates", "$24", "landing"],
  ["Mobile App UI Kit", "UI Kits", "$18", "mobile"],
  ["Business Card Templates", "Templates", "$12", "cards"],
  ["Stock Photos Collection", "Graphics", "$16", "photos"],
  ["Dashboard UI Kit", "UI Kits", "$22", "dashboard"],
  ["E-book: Digital Marketing Guide", "E-books", "$10", "book"],
  ["Royalty Free Music Pack", "Audio", "$14", "music"],
  ["Web Development Course", "Video Courses", "$29", "course"],
] as const;

type Props = { params: Promise<{ storefrontName: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storefrontName } = await params;
  return {
    title: decodeURIComponent(storefrontName),
    description: "Browse digital products from this creator.",
  };
}

export default async function StorefrontPage({ params }: Props) {
  const { storefrontName } = await params;
  const name = decodeURIComponent(storefrontName);
  const basePath = `/marketplace/${encodeURIComponent(storefrontName)}`;

  return (
    <main className="min-h-screen bg-[#f7f9fd] text-[#142b4d]">
      <Navbar active="products" />
      <div className="mx-auto max-w-[1280px] px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <Breadcrumbs name={name} />
        <section className="relative mt-4 overflow-hidden rounded-md border border-storefront-orange bg-storefront-orange px-6 py-7 text-white shadow-sm sm:px-8">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-white/10" />
          <div className="relative z-10 flex flex-wrap items-center gap-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 border-white/30 bg-white/15 text-4xl font-semibold text-white shadow-lg">
              N
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {name} <span className="text-sm text-white/80">●</span>
              </h1>
              <p className="mt-1 text-sm text-white/90">
                Creative Templates &amp; Digital Assets
              </p>
              <p className="mt-2 max-w-xl text-xs leading-5 text-white/75">
                High-quality templates, UI kits, and digital resources to help
                you build faster and create better.
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-white/80">
                <span>▣　24 Products</span>
                <span className="text-amber-300">
                  ★ <b className="text-white">4.8</b> (124 reviews)
                </span>
                <span>⌖ Cambodia</span>
              </div>
            </div>
            <button
              type="button"
              className="ml-auto rounded-md bg-white px-4 py-2 text-xs font-bold text-storefront-orange shadow-sm transition hover:bg-orange-50"
            >
              ♧　Follow
            </button>
          </div>
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_285px]">
          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">
                Products <span className="text-slate-500">(24)</span>
              </h2>
              <button
                type="button"
                className="rounded-md border border-[#dce4f0] bg-white px-3 py-2 text-[10px] text-slate-600"
              >
                Most Popular　⌄
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {products.map(([title, type, price, art], index) => (
                <ProductTile
                  key={title}
                  title={title}
                  type={type}
                  price={price}
                  art={art}
                  featured={index === 0}
                  basePath={basePath}
                />
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-[#e5ebf4] bg-white p-4 shadow-sm">
              <div className="flex gap-6 border-b border-[#edf1f7] text-[10px] font-semibold text-indigo-500">
                <span className="border-b-2 border-indigo-500 pb-3">
                  Description
                </span>
                <span className="pb-3 text-slate-400">Files Included</span>
                <span className="pb-3 text-slate-400">Version History</span>
                <span className="pb-3 text-slate-400">Reviews (124)</span>
              </div>
              <h3 className="mt-4 text-xs font-bold">About This Store</h3>
              <p className="mt-2 text-[10px] leading-5 text-slate-500">
                Explore a curated collection of clean, useful digital resources
                made for modern creators, teams, and growing businesses.
              </p>
            </div>
          </section>

          <aside className="hidden xl:block">
            <div className="overflow-hidden rounded-md border border-slate-200 bg-white p-3 shadow-sm">
              <div className="product-art landing grid h-36 place-items-center rounded-md">
                <span className="rounded bg-white/90 px-3 py-2 text-sm font-bold text-slate-800 shadow">
                  Startup
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                {["landing", "mobile", "cards", "course"].map((art) => (
                  <div
                    key={art}
                    className={`product-art ${art} h-9 flex-1 rounded-md`}
                  />
                ))}
              </div>
              <h3 className="mt-4 text-sm font-bold">
                Modern Landing Page Template
              </h3>
              <p className="mt-1 text-[10px] text-primary">Templates</p>
              <p className="mt-2 text-amber-500 text-xs">
                ★ <b className="text-slate-600">4.8</b> (124 reviews)
              </p>
              <div className="mt-4 flex items-center gap-3">
                <b className="text-2xl">$24.00</b>
                <del className="text-[10px] text-slate-400">$39.00</del>
                <span className="rounded bg-orange-100 px-2 py-1 text-[9px] font-bold text-primary">
                  38% OFF
                </span>
              </div>
              <div className="mt-4 grid grid-cols-[7fr_3fr] gap-2">
                <StorefrontCartButton
                  id="modern-landing-page-template"
                  name="Modern Landing Page Template"
                  type="Templates"
                  price="$24"
                  href={`${basePath}/modern-landing-page-template`}
                  className="h-9 px-2 text-[9px]"
                />
                <Link
                  href={`${basePath}/modern-landing-page-template`}
                  aria-label="View Modern Landing Page Template details"
                  title="View product details"
                  className="flex h-9 items-center justify-center rounded-md border border-primary px-2 text-center text-[9px] font-semibold text-primary no-underline hover:bg-accent-light"
                >
                  View Details
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}

function Breadcrumbs({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] text-slate-500">
      <Link href="/marketplace" className="text-primary">Marketplace</Link>
      <span className="text-storefront-blue">/</span>
      <span className="font-medium text-muted" aria-current="page">{name}</span>
    </div>
  );
}
function ProductTile({
  title,
  type,
  price,
  art,
  featured,
  basePath,
}: {
  title: string;
  type: string;
  price: string;
  art: string;
  featured?: boolean;
  basePath: string;
}) {
  const slug = title.toLowerCase().replaceAll(" ", "-");
  return (
    <article className="flex min-h-[250px] flex-col rounded-md border border-slate-200 bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <Link href={`${basePath}/${slug}`} className="min-w-0 no-underline">
        <div
          className={`product-art ${art} relative grid aspect-[1.7/1] place-items-center rounded-md`}
        >
          <span className="rounded bg-white/85 px-2 py-1 text-[9px] font-bold text-slate-700 shadow-sm">
            {featured ? "Featured" : title.split(" ")[0]}
          </span>
        </div>
        <h3 className="mt-2 truncate text-[10px] font-bold text-slate-800">
          {title}
        </h3>
        <p className="mt-1 text-[9px] text-primary">{type}</p>
        <p className="mt-2 text-amber-500 text-[9px]">
          ★ <span className="text-slate-500">4.8 (124)</span>
        </p>
        <b className="mt-1 block text-sm">{price}</b>
      </Link>
      <div className="mt-auto grid grid-cols-[minmax(0,7fr)_minmax(78px,3fr)] gap-2 pt-3">
        <StorefrontCartButton
          id={slug}
          name={title}
          type={type}
          price={price}
          href={`${basePath}/${slug}`}
          className="h-9 px-2 text-[9px]"
        />
        <Link
          href={`${basePath}/${slug}`}
          aria-label={`View ${title} details`}
          title="View product details"
          className="flex h-9 min-w-0 items-center justify-center whitespace-nowrap rounded-md border border-primary px-0.5 text-center text-[8px] font-semibold leading-none tracking-tight text-primary no-underline hover:bg-accent-light sm:px-1 sm:text-[9px]"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
