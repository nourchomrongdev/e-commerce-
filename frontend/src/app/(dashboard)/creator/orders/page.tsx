"use client";

import { useMemo, useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import { Badge, Button, InputText, Table, TableHeader, TableRow } from "@/components/ui";

type OrderStatus = "Completed" | "Pending" | "Processing" | "Cancelled";
type Order = { id: string; product: string; buyer: string; email: string; amount: string; status: OrderStatus; date: string; time: string; color: string };

const orders: Order[] = [
  { id: "#ORD-250187", product: "Laravel API Mastery", buyer: "John Doe", email: "john.doe@example.com", amount: "$36.00", status: "Completed", date: "May 12, 2024", time: "10:24 AM", color: "#25376f" },
  { id: "#ORD-250186", product: "Figma UI Design Course", buyer: "Sok Piseth", email: "sok.piseth@gmail.com", amount: "$39.00", status: "Completed", date: "May 11, 2024", time: "03:15 PM", color: "#176b8d" },
  { id: "#ORD-250185", product: "Vue.js for Beginners", buyer: "Chenda Kim", email: "chenda.kim@gmail.com", amount: "$29.00", status: "Pending", date: "May 11, 2024", time: "09:42 AM", color: "#1d5c45" },
  { id: "#ORD-250184", product: "JavaScript Fundamentals", buyer: "Vannak Heng", email: "vannak.heng@example.com", amount: "$16.15", status: "Completed", date: "May 10, 2024", time: "08:30 PM", color: "#b27b1b" },
  { id: "#ORD-250183", product: "Database Design Basics", buyer: "Pich Samnang", email: "pich.samnang@gmail.com", amount: "$25.00", status: "Cancelled", date: "May 10, 2024", time: "11:10 AM", color: "#18254f" },
];

const tabs: Array<"All Orders" | OrderStatus> = ["All Orders", "Pending", "Processing", "Completed", "Cancelled"];
const statusTone = { Completed: "success", Processing: "primary", Pending: "warning", Cancelled: "danger" } as const;
const products = Array.from(new Set(orders.map((order) => order.product)));

function SummaryCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: string; tone: string }) {
  return <article className="rounded-xl border border-border bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] text-muted-soft">{label}</p><p className="mt-2 text-lg font-bold text-ink">{value}</p></div><span className={`grid h-9 w-9 place-items-center rounded-lg ${tone}`}><PublicIcon name={icon as any} className="h-5 w-5" /></span></div><p className="mt-2 text-[9px] text-muted-soft">{detail}</p></article>;
}

function FilterSelects({ product, status, setProduct, setStatus }: { product: string; status: string; setProduct: (value: string) => void; setStatus: (value: string) => void }) {
  return <div className="grid gap-2 sm:grid-cols-2"><select aria-label="Product filter" value={product} onChange={(event) => setProduct(event.target.value)} className="h-9 rounded-lg border border-border-control bg-white px-3 text-xs text-body outline-none focus:border-primary"><option>All Products</option>{products.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Status filter" value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-lg border border-border-control bg-white px-3 text-xs text-body outline-none focus:border-primary"><option>All Status</option>{tabs.slice(1).map((item) => <option key={item}>{item}</option>)}</select></div>;
}

export default function CreatorOrdersPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All Orders");
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("All Products");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const visibleOrders = useMemo(() => orders.filter((order) => { const query = search.trim().toLowerCase(); return (activeTab === "All Orders" || order.status === activeTab) && (statusFilter === "All Status" || order.status === statusFilter) && (productFilter === "All Products" || order.product === productFilter) && (!query || `${order.id} ${order.product} ${order.buyer} ${order.email}`.toLowerCase().includes(query)); }), [activeTab, productFilter, search, statusFilter]);

  return <div className="mx-auto w-full max-w-[1400px]">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Orders</h1><p className="mt-1 text-sm text-muted">Manage your customer orders and digital product deliveries.</p></div><Button size="sm" variant="secondary"><PublicIcon name="down" className="h-4 w-4 rotate-180" />Export</Button></header>
    <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"><SummaryCard label="Total Orders" value="248" detail="↑ 18.4% vs. last month" icon="shopping-cart" tone="bg-orange-50 text-primary" /><SummaryCard label="Total Revenue" value="$1,284.50" detail="↑ 16.7% vs. last month" icon="dollar" tone="bg-blue-50 text-status-info" /><SummaryCard label="Completed Orders" value="215" detail="86.7% of total" icon="verified" tone="bg-emerald-50 text-status-success" /><SummaryCard label="Pending Orders" value="18" detail="7.3% of total" icon="notification" tone="bg-purple-50 text-purple-600" /><SummaryCard label="Cancelled Orders" value="15" detail="6.0% of total" icon="delete" tone="bg-red-50 text-status-danger" /></section>
    <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="border-b border-divider px-5 pt-4 sm:px-6"><div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><nav className="flex shrink-0 gap-5 overflow-x-auto" aria-label="Order status filters">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`relative whitespace-nowrap pb-3 text-[10px] font-semibold ${activeTab === tab ? "text-primary" : "text-tab-muted hover:text-body"}`}>{tab}{activeTab === tab && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />}</button>)}</nav><div className="flex min-w-0 flex-1 gap-2 pb-4 xl:max-w-[900px]"><label className="relative min-w-0 flex-1"><span className="sr-only">Search orders</span><PublicIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-muted-faint" /><InputText value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order ID, customer or product..." className="h-9 pl-9 pr-3 text-xs" /></label><div className="hidden min-w-0 flex-1 xl:block"><FilterSelects product={productFilter} status={statusFilter} setProduct={setProductFilter} setStatus={setStatusFilter} /></div><Button size="sm" variant="secondary" className="shrink-0 xl:hidden" onClick={() => setMobileFiltersOpen((open) => !open)}><PublicIcon name="settings" className="h-3.5 w-3.5" />Filters</Button><Button size="sm" variant="secondary" className="hidden shrink-0 xl:inline-flex"><PublicIcon name="settings" className="h-3.5 w-3.5" />Filters</Button></div></div><div className={`${mobileFiltersOpen ? "block" : "hidden"} border-t border-divider py-3 xl:hidden`}><FilterSelects product={productFilter} status={statusFilter} setProduct={setProductFilter} setStatus={setStatusFilter} /></div></div>
      <Table className="min-w-[980px]"><TableHeader><tr><th className="px-6 py-3 font-medium">Order ID</th><th className="py-3 font-medium">Customer</th><th className="py-3 font-medium">Product</th><th className="py-3 font-medium">Amount</th><th className="py-3 font-medium">Status</th><th className="py-3 font-medium">Date</th><th className="px-6 py-3 text-right font-medium">Actions</th></tr></TableHeader><tbody>{visibleOrders.map((order) => <TableRow key={order.id} className="text-body transition hover:bg-surface-hover"><td className="px-6 py-3 text-[10px] font-medium text-body-strong">{order.id}</td><td className="py-3"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: order.color }}>{order.buyer.charAt(0)}</span><span><strong className="block text-[10px] text-body-strong">{order.buyer}</strong><span className="block text-[8px] text-muted-soft">{order.email}</span></span></div></td><td className="py-3"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-md text-[10px] text-white" style={{ backgroundColor: order.color }}>✦</span><strong className="max-w-[150px] truncate text-[10px] text-body-strong">{order.product}</strong></div></td><td className="py-3 font-semibold text-primary">{order.amount}</td><td className="py-3"><Badge tone={statusTone[order.status]}>{order.status}</Badge></td><td className="py-3 whitespace-nowrap text-muted"><span className="block">{order.date}</span><span className="text-[8px]">{order.time}</span></td><td className="px-6 py-3 text-right"><button type="button" aria-label={`View ${order.id}`} className="inline-grid h-7 w-7 place-items-center rounded-md border border-border-action text-muted hover:border-primary hover:text-primary"><PublicIcon name="view" className="h-3.5 w-3.5" /></button></td></TableRow>)}</tbody></Table>
      {visibleOrders.length === 0 && <p className="px-6 py-12 text-center text-sm text-muted">No orders match your search.</p>}
      <footer className="flex items-center justify-between border-t border-divider px-6 py-4 text-[10px] text-muted"><span>Showing {visibleOrders.length} of {orders.length} orders</span><span>Page 1 of 25</span></footer>
    </section>
  </div>;
}
