import PublicIcon from "@/components/icons/PublicIcon";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import { Button } from "@/components/ui";

const storefrontData: Record<string, { displayName: string; type: string }> = {
  NourChomrong: { displayName: "NourChomrong", type: "Templates" },
  DevCourses: { displayName: "DevCourses", type: "Digital Products" },
  "AI Resources": { displayName: "AI Resources", type: "Bundles" },
  DesignHub: { displayName: "DesignHub", type: "UI Kits" },
};

const metrics = [
  ["Total Revenue", "$1,284.50", "+12.5%", "dollar", "text-primary", "bg-orange-50"],
  ["Total Orders", "248", "+8.2%", "receipt", "text-status-info", "bg-blue-50"],
  ["Visitors", "3,652", "+15.7%", "eye", "text-status-success", "bg-emerald-50"],
  ["Conversion Rate", "3.24%", "+2.1%", "up", "text-primary", "bg-orange-50"],
  ["Avg. Order Value", "$24.65", "+6.4%", "dollar", "text-status-info", "bg-blue-50"],
  ["Returning Customers", "68.7%", "+4.8%", "user", "text-violet-600", "bg-violet-50"],
] as const;

const trafficSources = [
  ["Direct", "1,520", "42%"],
  ["Search Engines", "1,025", "28%"],
  ["Social Media", "643", "18%"],
  ["Referral", "302", "8%"],
  ["Email", "162", "4%"],
];

const topPages = [
  ["/", "1,248", "$420.50"],
  ["/products", "824", "$286.00"],
  ["/products/laravel-api", "645", "$198.00"],
  ["/products/react-course", "404", "$152.00"],
  ["/about", "278", "$84.00"],
];

function Panel({ title, action, children, className = "" }: { title: string; action?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-bold text-heading sm:text-sm">{title}</h2>
        {action && <Button size="sm" variant="secondary" className="px-2.5 py-1.5 text-[10px]">{action}<PublicIcon name="down" className="h-3 w-3" /></Button>}
      </div>
      {children}
    </section>
  );
}

export default async function StorefrontAnalyticsPage({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront: storefrontParam } = await params;
  const storefront = storefrontData[decodeURIComponent(storefrontParam)] ?? storefrontData.NourChomrong;

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Analytics</h1>
          <p className="mt-1 text-sm text-muted">Track your storefront performance and key metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary">This Month <PublicIcon name="down" className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="secondary"><PublicIcon name="down" className="h-3.5 w-3.5 rotate-180" />Export</Button>
        </div>
      </header>

      <p className="mt-2 text-[10px] font-medium text-muted-soft">{storefront.displayName} / {storefront.type}</p>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map(([label, value, change, icon, iconColor, iconBg]) => (
          <article key={label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2"><p className="text-[10px] text-muted-soft">{label}</p><span className={`grid h-7 w-7 place-items-center rounded-lg ${iconBg} ${iconColor}`}><PublicIcon name={icon as any} className="h-3.5 w-3.5" /></span></div>
            <p className="mt-2 text-lg font-bold text-ink">{value}</p>
            <p className="mt-1 text-[9px] text-status-success">↑ {change} vs. last month</p>
          </article>
        ))}
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Revenue Over Time" action="This Month">
          <div className="mt-5 grid grid-cols-[32px_1fr] gap-3"><div className="flex h-44 flex-col justify-between text-[9px] text-muted-soft"><span>$1,500</span><span>$1,000</span><span>$500</span><span>$0</span></div><div className="relative h-44 border-b border-l border-divider bg-[linear-gradient(to_bottom,transparent_24%,#eef1f6_25%,transparent_26%,transparent_49%,#eef1f6_50%,transparent_51%,transparent_74%,#eef1f6_75%,transparent_76%)]"><AnalyticsChart values={[22, 35, 28, 61, 45, 73, 49, 64, 54, 78, 62, 86]} color="#7656f4" fill="#7656f4" /></div></div>
          <div className="mt-2 flex justify-between pl-11 text-[9px] text-muted-soft"><span>May 1</span><span>May 8</span><span>May 15</span><span>May 22</span><span>May 31</span></div>
        </Panel>
        <Panel title="Orders Over Time" action="This Month">
          <div className="mt-5 grid grid-cols-[32px_1fr] gap-3"><div className="flex h-44 flex-col justify-between text-[9px] text-muted-soft"><span>80</span><span>60</span><span>40</span><span>0</span></div><div className="relative h-44 border-b border-l border-divider bg-[linear-gradient(to_bottom,transparent_24%,#eef1f6_25%,transparent_26%,transparent_49%,#eef1f6_50%,transparent_51%,transparent_74%,#eef1f6_75%,transparent_76%)]"><AnalyticsChart values={[18, 32, 26, 51, 39, 63, 48, 69, 58, 73, 67, 82]} color="#ff7a36" fill="#ff7a36" /></div></div>
          <div className="mt-2 flex justify-between pl-11 text-[9px] text-muted-soft"><span>May 1</span><span>May 8</span><span>May 15</span><span>May 22</span><span>May 31</span></div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel title="Traffic Sources" className="lg:col-span-1"><div className="mt-4 space-y-3">{trafficSources.map(([source, visits, share], index) => <div key={source}><div className="flex justify-between text-[10px]"><span className="text-body">{source}</span><span className="text-muted-soft">{visits} ({share})</span></div><div className="mt-1 h-1.5 rounded-full bg-surface-muted"><div className={`h-full rounded-full ${["bg-primary", "bg-orange-400", "bg-status-info", "bg-status-success", "bg-slate-300"][index]}`} style={{ width: share }} /></div></div>)}</div></Panel>
        <Panel title="Device Breakdown" className="lg:col-span-1"><div className="mt-4 flex items-center justify-center gap-6"><div className="grid h-32 w-32 place-items-center rounded-full bg-[conic-gradient(#7656f4_0_54%,#ff7a36_54%_78%,#2f80ed_78%_100%)]"><div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center"><span className="text-lg font-bold text-ink">3,652</span><span className="text-[8px] text-muted-soft">Visitors</span></div></div><div className="space-y-3 text-[10px] text-body"><p><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#7656f4]" />Desktop <span className="ml-3 text-muted-soft">54%</span></p><p><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#ff7a36]" />Mobile <span className="ml-3 text-muted-soft">24%</span></p><p><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#2f80ed]" />Tablet <span className="ml-3 text-muted-soft">22%</span></p></div></div></Panel>
        <Panel title="Top Pages" action="View Full Report" className="lg:col-span-1"><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[260px] text-left text-[10px]"><thead className="border-b border-divider text-muted"><tr><th className="py-2 font-medium">Page</th><th className="py-2 font-medium">Views</th><th className="py-2 text-right font-medium">Revenue</th></tr></thead><tbody>{topPages.map(([page, views, revenue]) => <tr key={page} className="border-b border-divider last:border-0"><td className="max-w-[130px] truncate py-2 text-body">{page}</td><td className="py-2 text-muted">{views}</td><td className="py-2 text-right text-muted">{revenue}</td></tr>)}</tbody></table></div></Panel>
      </div>
    </div>
  );
}
