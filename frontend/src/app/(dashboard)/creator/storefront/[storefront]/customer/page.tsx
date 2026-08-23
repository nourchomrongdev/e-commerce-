"use client";

import { useEffect, useMemo, useState } from "react";
import CustomerTable, { type Customer } from "@/components/customers/CustomerTable";
import PublicIcon from "@/components/icons/PublicIcon";
import { Button, InputText } from "@/components/ui";

const storefrontData: Record<string, { displayName: string; type: string }> = {
  NourChomrong: { displayName: "NourChomrong", type: "Templates" },
  DevCourses: { displayName: "DevCourses", type: "Digital Products" },
  "AI Resources": { displayName: "AI Resources", type: "Bundles" },
  DesignHub: { displayName: "DesignHub", type: "UI Kits" },
};

type CustomerSegment = "All Customers" | "New Customers" | "Returning Customers";
const customers: Customer[] = [
  { name: "John Doe", email: "john@example.com", orders: 12, totalSpent: "$345.80", lastOrder: "May 12, 2024", status: "Active", segment: "Returning" },
  { name: "Sak Path", email: "sak@example.com", orders: 8, totalSpent: "$187.50", lastOrder: "May 11, 2024", status: "Active", segment: "New" },
  { name: "Chanda Kim", email: "chanda@example.com", orders: 15, totalSpent: "$324.19", lastOrder: "May 11, 2024", status: "Active", segment: "Returning" },
  { name: "Veronika Meng", email: "veronika@example.com", orders: 4, totalSpent: "$98.00", lastOrder: "May 10, 2024", status: "Inactive", segment: "New" },
  { name: "Pich Samrang", email: "pich@example.com", orders: 4, totalSpent: "$73.40", lastOrder: "May 10, 2024", status: "Inactive", segment: "Returning" },
];

const tabLabels: CustomerSegment[] = ["All Customers", "New Customers", "Returning Customers"];

export default function StorefrontCustomerPage({
  params,
}: {
  params: Promise<{ storefront: string }> | { storefront: string };
}) {
  const [storefrontName, setStorefrontName] = useState<string | null>(
    typeof params === "object" && params !== null && !("then" in params)
      ? (params as { storefront?: string }).storefront ?? null
      : null,
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [activeSegment, setActiveSegment] = useState<CustomerSegment>("All Customers");

  useEffect(() => {
    if (params && typeof (params as Promise<{ storefront: string }>).then === "function") {
      (params as Promise<{ storefront: string }>).then(({ storefront }) => {
        if (storefront) setStorefrontName(storefront);
      });
    }
  }, [params]);

  const storefront =
    storefrontData[decodeURIComponent(storefrontName ?? "NourChomrong")] || storefrontData.NourChomrong;

  const visibleCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSegment =
        activeSegment === "All Customers" ||
        (activeSegment === "New Customers" && customer.segment === "New") ||
        (activeSegment === "Returning Customers" && customer.segment === "Returning");

      const matchesStatus = statusFilter === "All Status" || customer.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        customer.name.toLowerCase().includes(normalizedSearch) ||
        customer.email.toLowerCase().includes(normalizedSearch);

      return matchesSegment && matchesStatus && matchesSearch;
    });
  }, [activeSegment, search, statusFilter]);

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Customers</h1>
          <p className="mt-1 text-sm text-muted">View and manage your customers across the store.</p>
        </div>
        <Button size="sm" variant="secondary"><PublicIcon name="down" className="h-4 w-4 rotate-180" />Export</Button>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total Customers", "2,843", "↑ 15.9% vs. last month"],
          ["New Customers", "386", "↑ 17.6% vs. last month"],
          ["Returning Customers", "1,240", "↑ 18.6% vs. last month"],
          ["Avg. Order Value", "$24.65", "↑ 7.6% vs. last month"],
        ].map(([label, value, detail]) => (
          <article key={label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <p className="text-[10px] text-muted-soft">{label}</p>
            <p className="mt-2 text-lg font-bold text-ink">{value}</p>
            <p className="mt-2 text-[9px] text-status-success">{detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-divider px-5 pt-4 sm:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex shrink-0 flex-wrap gap-5">
              {tabLabels.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveSegment(tab)}
                  className={`relative whitespace-nowrap pb-3 text-[10px] font-semibold transition ${
                    activeSegment === tab
                      ? "text-[var(--color-primary)]"
                      : "text-tab-muted hover:text-body"
                  }`}
                >
                  {tab}
                  {activeSegment === tab && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[var(--color-primary)]" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-stretch gap-2 pb-4 sm:flex-row sm:items-center xl:max-w-[900px]">
              <label className="relative block min-w-[220px] flex-1">
                <span className="sr-only">Search customers</span>
                <PublicIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-muted-faint" />
                <InputText
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customer, email or order..."
                  className="h-9 pl-9 pr-3 text-xs"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-9 rounded-lg border border-border-control bg-white px-3 text-xs text-body outline-none focus:border-primary sm:w-[122px]"
                aria-label="Customer status filter"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          </div>
          <CustomerTable customers={visibleCustomers} total={customers.length} />
      </section>
    </div>
  );
}
