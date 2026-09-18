import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import ProductBreadcrumbs from "@/components/ProductBreadcrumbs";

type Props = { params: Promise<{ storefrontName: string; productSlug: string }> };

const versions = [
  ["v3.2.7", "Sep 18, 2026", "Current version"],
  ["v3.2.6", "Aug 29, 2026", "Improved templates and documentation"],
  ["v3.2.5", "Jul 12, 2026", "Performance and file updates"],
  ["v3.2.4", "Jun 03, 2026", "Minor fixes and improvements"],
  ["v3.2.3", "May 16, 2026", "Initial public release"],
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;
  const title = productSlug.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
  return { title: `${title} versions`, description: `Version history for ${title}.` };
}

export default async function ProductVersionsPage({ params }: Props) {
  const { storefrontName, productSlug } = await params;
  const seller = decodeURIComponent(storefrontName);
  const productName = productSlug.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
  const productPath = `/marketplace/${encodeURIComponent(storefrontName)}/${productSlug}`;

  return (
    <div className="min-h-screen bg-[#f7f9fd] text-[#142b4d]"><Navbar active="products" /><main className="mx-auto max-w-[960px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <ProductBreadcrumbs productName={productName} productPath={productPath} current="Versions" />
      <section className="mt-6 border border-border bg-white p-6 shadow-sm sm:p-8"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-primary">{seller} · Product history</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-heading">{productName} versions</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted">Browse previous releases and download the version that matches your files or project.</p><div className="mt-6 divide-y divide-divider border-y border-divider">{versions.map(([version, date, note], index) => <div key={version} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><div className="flex items-center gap-2"><h2 className="text-sm font-bold text-heading">{version}</h2>{index === 0 && <span className="rounded bg-accent-light px-2 py-1 text-[9px] font-semibold text-primary">Current</span>}</div><p className="mt-1 text-[10px] text-muted">Released {date} · {note}</p></div><Link href={`${productPath}?version=${version}`} className="rounded border border-primary px-4 py-2 text-[10px] font-semibold text-primary transition hover:bg-primary hover:text-white">Download {version}</Link></div>)}</div><Link href={productPath} className="mt-6 inline-block text-xs font-semibold text-primary">← Back to product</Link></section>
    </main><PublicFooter /></div>
  );
}

