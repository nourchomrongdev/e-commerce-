import Link from "next/link";
import PublicIcon from "@/components/icons/PublicIcon";
import { Card, MetricTile } from "@/components/ui";
import { formatCompactCurrency } from "@/lib/formatCurrency";

const stats = [
  { label: "Total Sales", value: "$1,284.50", change: "↑ 12.5%", icon: "cart" },
  { label: "Revenue", value: "$1,152.30", change: "↑ 8.2%", icon: "dollar" },
  { label: "Products", value: "24", change: "+3 this week", icon: "shopping-basket" },
  { label: "Customers", value: "386", change: "↑ 15.4%", icon: "user" },
  { label: "Total Storefronts", value: "3", change: "+1 this month", icon: "store" },
];

const products = [
  ["UI Template", "Published", "42", "$210.00", "#172c57"],
  ["E-book", "Published", "31", "$155.00", "#80542e"],
  ["Icon Pack", "Draft", "—", "—", "#213c63"],
  ["Dashboard UI Kit", "Published", "18", "$126.00", "#5d3b99"],
  ["Wireframe Kit", "Draft", "—", "—", "#3830a4"],
];

const orders = [
  ["#ORD-3256", "$19.99", "2 mins ago"],
  ["#ORD-3255", "$14.99", "12 mins ago"],
  ["#ORD-3254", "$9.99", "45 mins ago"],
  ["#ORD-3253", "$29.99", "1 hour ago"],
];

export default function CreatorOverview() {
  return (
    <div className="creator-overview w-full">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#101a3c] sm:text-[28px]">
          Good evening, Chomrong <span aria-hidden>.</span>
        </h1>
        <p className="mt-1 text-sm text-[#66718e] sm:text-base">
          Manage your store, products and earnings.
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px] 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-5">
          <section className="summary-cards grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {stats.map(({ label, value, change, icon }) => (
              <MetricTile
                key={label}
                label={label}
                value={value.startsWith("$") ? formatCompactCurrency(value) : value}
                change={change}
                icon={<PublicIcon name={icon as any} className="h-7 w-7" />}
              />
            ))}
          </section>

          <section>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-[#111b40]">Sales Overview</h2>
                <span className="rounded-lg border border-[#e4e7ef] px-3 py-2 text-xs text-[#283554]">
                  This Month　⌄
                </span>
              </div>

              <div className="mt-6 flex gap-3">
                <div className="flex flex-col justify-between pb-6 text-[11px] text-[#6f7894]">
                  <span>$600</span>
                  <span>$400</span>
                  <span>$200</span>
                  <span>$0</span>
                </div>
                <div className="relative flex-1">
                  <div className="absolute inset-x-0 top-0 border-t border-[#edf0f5]" />
                  <div className="absolute inset-x-0 top-1/3 border-t border-[#edf0f5]" />
                  <div className="absolute inset-x-0 top-2/3 border-t border-[#edf0f5]" />
                  <svg
                    viewBox="0 0 660 180"
                    preserveAspectRatio="none"
                    className="relative h-[152px] w-full"
                    aria-label="Static sales trend chart"
                  >
                    <defs>
                      <linearGradient id="sales" x1="0" x2="0" y1="0" y2="1">
                        <stop stopColor="#ff5a1f" stopOpacity=".16" />
                        <stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0 135 30 150 60 132 90 126 120 100 150 64 180 94 210 91 240 30 270 95 300 84 330 78 360 32 390 90 420 48 450 68 480 65 510 20 525 -10 555 40 585 34 615 12 660 5V180H0Z" fill="url(#sales)" />
                    <path d="M0 135 30 150 60 132 90 126 120 100 150 64 180 94 210 91 240 30 270 95 300 84 330 78 360 32 390 90 420 48 450 68 480 65 510 20 525 -10 555 40 585 34 615 12 660 5" fill="none" stroke="#ff5a1f" strokeWidth="2.5" />
                  </svg>
                  <div className="flex justify-between text-[11px] text-[#6f7894]">
                    <span>Aug 1</span>
                    <span>Aug 6</span>
                    <span>Aug 11</span>
                    <span>Aug 16</span>
                    <span>Aug 21</span>
                    <span>Aug 26</span>
                    <span>Aug 31</span>
                  </div>
                </div>
              </div>
            </Card>

          </section>

          <Card className="overflow-hidden">
            <h2 className="px-5 py-4 font-semibold text-[#111b40]">Recent Products</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="border-y border-[#edf0f5] bg-[#fcfcfe] text-[#4c5675]">
                  <tr>
                    <th className="px-7 py-3 font-medium">Product</th>
                    <th className="font-medium">Status</th>
                    <th className="font-medium">Sales</th>
                    <th className="font-medium">Revenue</th>
                    <th className="font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(([name, status, sales, revenue, color]) => (
                    <tr key={name} className="border-b border-[#edf0f5]">
                      <td className="px-7 py-2">
                        <span className="mr-4 inline-grid h-9 w-9 place-items-center rounded-md text-white" style={{ background: color }}>
                          ✦
                        </span>
                        {name}
                      </td>
                      <td>
                        <span className={`rounded px-4 py-1.5 text-[10px] ${status === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {status}
                        </span>
                      </td>
                      <td>{sales}</td>
                      <td>{revenue}</td>
                      <td>
                        <Link href="/creator/products" className="flex items-center gap-2 font-medium text-primary no-underline">
                          <PublicIcon name="edit" className="h-4 w-4 text-primary" />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link href="/creator/products" className="block py-4 text-center text-xs font-medium text-primary no-underline">
              <span className="inline-flex items-center gap-1">
                <span>View all products</span>
                <PublicIcon name="right" className="shrink-0 text-primary" />
              </span>
            </Link>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#111b40]">Store Performance</h2>
            <button
              type="button"
              className="flex items-center justify-center rounded-lg border border-[#e7ebf4] bg-[#f7f9fd] px-3 py-1.5 text-xs font-medium text-[#33405d]"
            >
                This Month 
              <PublicIcon name="down" className="inline-block h-3 w-3" />
            </button>
            </div>
            <div className="mt-4 space-y-0">
              {[
                ["Store Views", "2,458", "↑ 18.6%"],
                ["Conversion Rate", "3.24%", "↑ 6.3%"],
                ["Avg. Order Value", "$24.65", "↑ 4.8%"],
                ["Return Customers", "68", "↑ 12.1%"],
              ].map(([label, value, change]) => (
                <div key={label} className="flex items-center justify-between border-b border-[#edf0f5] py-3 last:border-0">
                  <span className="text-xs text-[#273252]">{label}</span>
                  <span className="text-xs font-medium text-[#111b40]">{value}</span>
                  <span className="text-[10px] font-medium text-emerald-600">{change}</span>
                </div>
              ))}
            </div>
          </Card>

          <article className="rounded-2xl bg-gradient-to-br from-primary to-secondary p-5 text-white shadow-sm">
            <p className="flex items-center text-sm font-semibold">
              Verification Status
              <img src="/icons/verified.svg" alt="Verified" className="ml-2 h-6 w-6" />
            </p>
            <span className="mt-5 inline-flex items-center rounded bg-white px-3 py-1.5 text-xs font-semibold text-primary">
              Verified Creator
            </span>
            <p className="mt-4 text-xs leading-5 text-orange-50">
              Your account is verified.<br />
              Your storefront displays the verified badge.
            </p>
            <Link href="/creator/verification" className="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-xs font-medium text-primary no-underline">
              View Details
            </Link>
          </article>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#111b40]">Recent Orders</h2>
              <Link href="/creator/orders" className="text-xs font-medium text-primary no-underline">View all</Link>
            </div>
            <div className="mt-4 space-y-3">
              {orders.map(([number, price, time]) => (
                <div key={number} className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded bg-[#13295a] text-[10px] text-white">✦</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-[#1b2748]">{number}</p>
                    <p className="text-[9px] text-[#79819a]">{time}</p>
                  </div>
                  <span className="text-[10px] font-medium">{price}</span>
                  <span className="rounded bg-emerald-50 px-1.5 py-1 text-[8px] text-emerald-700">Completed</span>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
