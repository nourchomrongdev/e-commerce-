import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import PublicIcon from "@/components/icons/PublicIcon";
import StorefrontCartButton from "@/components/StorefrontCartButton";
import StorefrontLicenseTable from "@/components/StorefrontLicenseTable";

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

const previewImages: Record<string, string> = {
  landing:
    "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=85",
  mobile:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85",
  cards:
    "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=900&q=85",
  photos:
    "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=900&q=85",
  dashboard:
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85",
  book:
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
  music:
    "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=85",
  course:
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85",
};

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
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 xl:grid-cols-4">
              {products.map(([title, type, price, art], index) => (
                <ProductTile
                  key={title}
                  title={title}
                  type={type}
                  price={price}
                  art={art}
                  featured={index === 0}
                  basePath={basePath}
                  sellerName={name}
                />
              ))}
            </div>
            <StorefrontLicenseTable compact />
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
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div
                className="product-art relative aspect-video w-full overflow-hidden rounded-none"
              >
                <img
                  src={previewImages.landing}
                  alt="Modern Landing Page Template preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-3">
              <div className="flex gap-2">
                {["landing", "mobile", "cards", "course"].map((art) => (
                  <div
                    key={art}
                    className="product-art aspect-video min-w-0 flex-1 overflow-hidden rounded-md"
                  >
                    <img
                      src={previewImages[art]}
                      alt={`${art} product preview`}
                      className="h-full w-full object-cover"
                    />
                  </div>
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
              <div className="mt-4">
                <StorefrontCartButton
                  id="modern-landing-page-template"
                  name="Modern Landing Page Template"
                  type="Templates"
                  price="$24"
                  href={`${basePath}/modern-landing-page-template`}
                  className="h-9 w-full px-2 text-[9px]"
                />
              </div>
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
  sellerName,
}: {
  title: string;
  type: string;
  price: string;
  art: string;
  featured?: boolean;
  basePath: string;
  sellerName: string;
}) {
  const slug = title.toLowerCase().replaceAll(" ", "-");
  return (
    <article className="group relative flex min-h-[290px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_12px_28px_rgba(17,27,64,0.12)]">
      <Link href={`${basePath}/${slug}`} className="min-w-0 no-underline">
        <div
          className="product-art relative aspect-video overflow-hidden rounded-none"
        >
          <img
            src={previewImages[art]}
            alt={`${title} preview`}
            className="h-full w-full object-cover"
          />
        </div>
      </Link>
      <div className="min-w-0 px-3 pt-2.5">
        <Link href={`${basePath}/${slug}`} className="block min-w-0 no-underline">
          <h3 className="truncate text-[11px] font-bold text-slate-800">
            {title}
          </h3>
          <p className="mt-0.5 text-[8px] text-slate-500">{type}</p>
        </Link>
        <Link
          href={basePath}
          className="mt-1 block text-[8px] font-semibold text-primary no-underline hover:text-primary-hover"
        >
          by {sellerName}
        </Link>
        <Link href={`${basePath}/${slug}`} className="block no-underline">
          <b className="mt-2 block text-[20px] font-bold leading-none text-slate-900">{price}</b>
          <p className="mt-1 text-[8px] text-amber-500">
            ★ <span className="text-slate-500">4.8 (124)</span>
          </p>
        </Link>
      </div>
      <div className="mt-auto px-3 pb-3 pt-2.5">
        <StorefrontCartButton
          id={slug}
          name={title}
          type={type}
          price={price}
          href={`${basePath}/${slug}`}
          className="h-9 w-full px-1 text-[9px]"
        />
      </div>
      <button type="button" aria-label={`Save ${title}`} className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full border border-white/70 bg-white/80 text-slate-500 transition hover:text-primary">
        <PublicIcon name="heart-plus" className="h-3.5 w-3.5 text-slate-500" />
      </button>
    </article>
  );
}
