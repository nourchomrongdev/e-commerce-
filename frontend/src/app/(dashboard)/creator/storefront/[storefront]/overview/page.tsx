import Link from "next/link";
import StorefrontHeader from "@/components/dashboard/StorefrontHeader";
import PublicIcon from "@/components/icons/PublicIcon";

const storefrontData: Record<string, { displayName: string; type: string; description: string }> = {
  NourChomrong: {
    displayName: "NourChomrong",
    type: "Templates",
    description: "Professional templates and design resources for modern websites",
  },
  DevCourses: {
    displayName: "DevCourses",
    type: "Digital Products",
    description: "Online courses and resources for developers to level up their skills",
  },
  "AI Resources": {
    displayName: "AI Resources",
    type: "Bundles",
    description: "AI tools and learning bundles for everyone",
  },
  DesignHub: {
    displayName: "DesignHub",
    type: "UI Kits",
    description: "Beautiful UI kits and design systems",
  },
};

const overviewCards = [
  { label: "Products", value: "24", detail: "Published and draft listings", icon: "product", tone: "bg-[#edf5ff] text-blue-700" },
  { label: "Revenue", value: "$1,284.00", detail: "Compared to last month", icon: "dollar", tone: "bg-[#effaf5] text-emerald-700" },
  { label: "Orders", value: "186", detail: "Confirmed from buyers", icon: "receipt", tone: "bg-[#fff3e9] text-primary" },
  { label: "Conversion", value: "3.4%", detail: "Avg. on public storefront", icon: "up", tone: "bg-[#f7f2ff] text-violet-700" },
];

const recentItems = [
  { name: "Laravel API Mastery", status: "Published", sales: "128 sales" },
  { name: "React Code Course", status: "Published", sales: "96 sales" },
  { name: "Vue.js for Beginners", status: "Draft", sales: "Waiting review" },
];

export default async function StorefrontOverviewPage({
  params,
}: {
  params: Promise<{ storefront: string }>;
}) {
  const { storefront: storefrontParam } = await params;
  const storefront =
    storefrontData[decodeURIComponent(storefrontParam)] || storefrontData.NourChomrong;

  return (
    <div className="w-full">
      <StorefrontHeader storefront={storefront} activeTab="Overview" />

      <section className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#111b40]">Overview</h2>
            <p className="mt-1 text-xs text-[#8993aa]">{storefront.description}</p>
          </div>
          <Link
            href={`/creator/storefront/${encodeURIComponent(storefront.displayName)}`}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white no-underline transition hover:opacity-90"
          >
            Open storefront
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map(({ label, value, detail, icon, tone }) => (
            <article key={label} className="rounded-2xl border border-[#e9edf6] bg-[#f9fafc] p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8993aa]">{label}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-[#111b40]">{value}</p>
                </div>
                <span className={`grid h-10 w-10 place-items-center rounded-lg ${tone}`}>
                  <PublicIcon name={icon as any} className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-3 text-[10px] text-[#76829d]">{detail}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <article className="rounded-2xl border border-[#e9edf6] bg-[#f9fafc] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-[#111b40]">Recent products</h2>
              <Link href={`/creator/storefront/${encodeURIComponent(storefront.displayName)}/products`} className="text-xs font-medium text-primary no-underline">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {recentItems.map(({ name, status, sales }) => (
                <div key={name} className="flex items-center justify-between gap-3 rounded-xl border border-[#edf0f5] bg-white px-3 py-3">
                  <div>
                    <p className="text-xs font-semibold text-[#263252]">{name}</p>
                    <p className="mt-1 text-[10px] text-[#8993aa]">{sales}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${status === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[#e9edf6] bg-[#f9fafc] p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#111b40]">Quick links</h2>
            <div className="mt-4 space-y-2">
              <Link href={`/creator/storefront/${encodeURIComponent(storefront.displayName)}/products`} className="flex items-center justify-between gap-3 rounded-lg border border-[#edf0f5] bg-white px-3 py-2.5 text-xs font-medium text-[#263252] no-underline transition hover:bg-[#f7f9ff]">
                Manage products
                <PublicIcon name="right" className="h-3.5 w-3.5" />
              </Link>
              <Link href={`/creator/storefront/${encodeURIComponent(storefront.displayName)}/payment`} className="flex items-center justify-between gap-3 rounded-lg border border-[#edf0f5] bg-white px-3 py-2.5 text-xs font-medium text-[#263252] no-underline transition hover:bg-[#f7f9ff]">
                Payment settings
                <PublicIcon name="right" className="h-3.5 w-3.5" />
              </Link>
              <Link href={`/creator/storefront/${encodeURIComponent(storefront.displayName)}/setting`} className="flex items-center justify-between gap-3 rounded-lg border border-[#edf0f5] bg-white px-3 py-2.5 text-xs font-medium text-[#263252] no-underline transition hover:bg-[#f7f9ff]">
                Store settings
                <PublicIcon name="right" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
