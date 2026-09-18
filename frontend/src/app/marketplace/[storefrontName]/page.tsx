import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import PublicIcon from "@/components/icons/PublicIcon";
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
  return { title: decodeURIComponent(storefrontName), description: "Browse digital products from this creator." };
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
        <section className="relative mt-4 overflow-hidden rounded-xl border border-[#e4eaf5] bg-gradient-to-r from-[#f7faff] via-[#edf2ff] to-[#dfe4fb] px-6 py-7 shadow-sm sm:px-8">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_60%_40%,rgba(126,145,220,.28),transparent_65%)]" />
          <div className="relative z-10 flex flex-wrap items-center gap-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#f2bd3e] to-[#9b5d10] text-4xl font-semibold text-white shadow-md">N</div>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{name} <span className="text-sm text-indigo-500">●</span></h1>
              <p className="mt-1 text-sm text-indigo-600">Creative Templates &amp; Digital Assets</p>
              <p className="mt-2 max-w-xl text-xs leading-5 text-slate-600">High-quality templates, UI kits, and digital resources to help you build faster and create better.</p>
              <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-slate-600"><span>▣　24 Products</span><span className="text-amber-500">★ <b className="text-slate-600">4.8</b> (124 reviews)</span><span>⌖ Cambodia</span></div>
            </div>
            <button type="button" className="ml-auto rounded-lg bg-white px-4 py-2 text-xs font-bold text-indigo-600 shadow-sm">♧　Follow</button>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)_285px]">
          <aside className="space-y-4">
            <InfoPanel title="▣　 Store Info"><InfoRow icon="▣" text="24 Products" /><InfoRow icon="☆" text="4.8 (124 reviews)" /><InfoRow icon="◷" text="Joined Mar 2024" /><InfoRow icon="⌖" text="Cambodia" /></InfoPanel>
            <InfoPanel title="▦　 Categories"><CategoryRow icon="▤" name="Templates" count="12" /><CategoryRow icon="▦" name="UI Kits" count="6" tone="orange" /><CategoryRow icon="▧" name="Graphics" count="4" tone="violet" /><CategoryRow icon="▥" name="E-books" count="2" tone="green" /></InfoPanel>
          </aside>

          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-bold">Products <span className="text-slate-500">(24)</span></h2><button type="button" className="rounded-md border border-[#dce4f0] bg-white px-3 py-2 text-[10px] text-slate-600">Most Popular　⌄</button></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {products.map(([title, type, price, art], index) => <ProductTile key={title} title={title} type={type} price={price} art={art} featured={index === 0} basePath={basePath} />)}
            </div>
            <div className="mt-3 rounded-xl border border-[#e5ebf4] bg-white p-4 shadow-sm"><div className="flex gap-6 border-b border-[#edf1f7] text-[10px] font-semibold text-indigo-500"><span className="border-b-2 border-indigo-500 pb-3">Description</span><span className="pb-3 text-slate-400">Files Included</span><span className="pb-3 text-slate-400">Version History</span><span className="pb-3 text-slate-400">Reviews (124)</span></div><h3 className="mt-4 text-xs font-bold">About This Store</h3><p className="mt-2 text-[10px] leading-5 text-slate-500">Explore a curated collection of clean, useful digital resources made for modern creators, teams, and growing businesses.</p></div>
          </section>

          <aside className="hidden lg:block"><div className="overflow-hidden rounded-xl border border-[#e5ebf4] bg-white p-3 shadow-sm"><div className="product-art landing grid h-36 place-items-center rounded-lg"><span className="rounded bg-white/90 px-3 py-2 text-sm font-bold text-slate-800 shadow">Startup</span></div><div className="mt-3 flex gap-2">{["landing", "mobile", "cards", "course"].map((art) => <div key={art} className={`product-art ${art} h-9 flex-1 rounded`} />)}</div><h3 className="mt-4 text-sm font-bold">Modern Landing Page Template</h3><p className="mt-1 text-[10px] text-indigo-500">Templates</p><p className="mt-2 text-amber-500 text-xs">★ <b className="text-slate-600">4.8</b> (124 reviews)</p><div className="mt-4 flex items-center gap-3"><b className="text-2xl">$24.00</b><del className="text-[10px] text-slate-400">$39.00</del><span className="rounded bg-orange-100 px-2 py-1 text-[9px] font-bold text-primary">38% OFF</span></div><StorefrontCartButton id="modern-landing-page-template" name="Modern Landing Page Template" type="Templates" price="$24" href={`${basePath}/modern-landing-page-template`} /></div></aside>
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}

function Breadcrumbs({ name }: { name: string }) { return <div className="flex items-center gap-2 text-[10px] text-slate-500"><Link href="/marketplace" className="text-indigo-500">⌂　Marketplace</Link><span>›</span><span>Storefronts</span><span>›</span><b className="text-slate-700">{name}</b></div>; }
function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-xl border border-[#e5ebf4] bg-white p-4 shadow-sm"><h3 className="text-xs font-bold">{title}</h3><div className="mt-4 space-y-4">{children}</div></div>; }
function InfoRow({ icon, text }: { icon: string; text: string }) { return <p className="text-[10px] text-slate-500"><span className="mr-2 text-indigo-500">{icon}</span>{text}</p>; }
function CategoryRow({ icon, name, count, tone = "blue" }: { icon: string; name: string; count: string; tone?: string }) { return <div className="flex items-center gap-2 text-[10px] text-slate-500"><span className={`grid h-6 w-6 place-items-center rounded ${tone === "orange" ? "bg-orange-50 text-orange-500" : tone === "violet" ? "bg-violet-50 text-violet-500" : tone === "green" ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"}`}>{icon}</span><span>{name}</span><span className="ml-auto">{count}　›</span></div>; }
function ProductTile({ title, type, price, art, featured, basePath }: { title: string; type: string; price: string; art: string; featured?: boolean; basePath: string }) { const slug = title.toLowerCase().replaceAll(" ", "-"); return <article className="rounded-lg border border-[#e5ebf4] bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><Link href={`${basePath}/${slug}`} className="no-underline"><div className={`product-art ${art} relative grid h-28 place-items-center rounded-md`}><span className="rounded bg-white/85 px-2 py-1 text-[9px] font-bold text-slate-700 shadow-sm">{featured ? "Featured" : title.split(" ")[0]}</span></div><h3 className="mt-2 truncate text-[10px] font-bold text-slate-800">{title}</h3><p className="mt-1 text-[9px] text-indigo-500">{type}</p><p className="mt-2 text-amber-500 text-[9px]">★ <span className="text-slate-500">4.8 (124)</span></p><b className="mt-1 block text-sm">{price}</b></Link><StorefrontCartButton id={slug} name={title} type={type} price={price} href={`${basePath}/${slug}`} compact /></article>; }
