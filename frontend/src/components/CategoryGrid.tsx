import Link from "next/link";

export type Category = {
  icon: string;
  name: string;
  detail: string;
  tone: "blue" | "indigo" | "orange" | "teal" | "pink" | "navy";
};

export const marketplaceCategories: Category[] = [
  { icon: "▤", name: "Templates", detail: "245 items", tone: "orange" },
  { icon: "▥", name: "eBooks", detail: "312 items", tone: "teal" },
  { icon: "◇", name: "Courses", detail: "156 items", tone: "indigo" },
  { icon: "▪", name: "UI Kits", detail: "189 items", tone: "blue" },
  { icon: "◌", name: "Graphics", detail: "278 items", tone: "pink" },
  { icon: "▣", name: "Themes", detail: "134 items", tone: "navy" },
];

export default function CategoryGrid({ compact = false }: { compact?: boolean }) {
  return <div className={`grid gap-2.5 ${compact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"}`}>
    {marketplaceCategories.map((category) => <Link key={category.name} href={`/marketplace?category=${encodeURIComponent(category.name)}`} className={`group flex min-h-[72px] items-center gap-3 rounded-md border border-slate-200 border-t-2 bg-white px-3 py-2 text-left no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${category.tone === "orange" ? "border-t-storefront-orange" : category.tone === "teal" ? "border-t-storefront-teal" : category.tone === "indigo" ? "border-t-storefront-indigo" : category.tone === "blue" ? "border-t-storefront-blue" : category.tone === "pink" ? "border-t-storefront-pink" : "border-t-storefront-navy"}`}>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-50 text-xs ${category.tone === "orange" ? "text-storefront-orange" : category.tone === "teal" ? "text-storefront-teal" : category.tone === "indigo" ? "text-storefront-indigo" : category.tone === "blue" ? "text-storefront-blue" : category.tone === "pink" ? "text-storefront-pink" : "text-storefront-navy"}`}>{category.icon}</span>
      <span className="min-w-0"><b className="block truncate text-[10px] font-semibold text-storefront-navy">{category.name}</b><small className="mt-1 block text-[8px] text-muted">{category.detail}</small></span>
      <span className="ml-auto text-xs text-storefront-orange transition group-hover:translate-x-0.5">→</span>
    </Link>)}
  </div>;
}
