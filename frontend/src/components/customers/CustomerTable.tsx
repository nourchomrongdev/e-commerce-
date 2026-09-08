import PublicIcon from "@/components/icons/PublicIcon";
import { Badge, Table, TableHeader, TableRow } from "@/components/ui";

export type CustomerStatus = "Active" | "Inactive";

export type Customer = {
  name: string;
  email: string;
  orders: number;
  totalSpent: string;
  lastOrder: string;
  status: CustomerStatus;
  segment: "New" | "Returning";
};

const statusTone = {
  Active: "success",
  Inactive: "neutral",
} as const;

export default function CustomerTable({
  customers,
  total,
}: {
  customers: Customer[];
  total: number;
}) {
  return (
    <>
      <div className="customer-responsive-table">
        <Table className="min-w-[900px]">
        <TableHeader>
          <tr>
            <th className="px-6 py-3 font-medium">Customer</th>
            <th className="py-3 font-medium">Orders</th>
            <th className="py-3 font-medium">Total Spent</th>
            <th className="py-3 font-medium">Last Order</th>
            <th className="py-3 font-medium">Status</th>
            <th className="px-6 py-3 text-right font-medium">Actions</th>
          </tr>
        </TableHeader>
        <tbody>
          {customers.map((customer) => (
            <TableRow key={customer.email} className="text-body transition hover:bg-surface-hover">
              <td data-label="Customer" className="px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1f2433] text-[10px] font-semibold text-white">
                    {customer.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold text-body-strong">{customer.name}</p>
                    <p className="text-[8px] text-muted-soft">{customer.email}</p>
                  </div>
                </div>
              </td>
              <td data-label="Orders" className="py-3 font-medium">{customer.orders}</td>
              <td data-label="Total Spent" className="py-3 font-medium text-body-strong">{customer.totalSpent}</td>
              <td data-label="Last Order" className="py-3 text-muted">{customer.lastOrder}</td>
              <td data-label="Status" className="py-3"><Badge tone={statusTone[customer.status]}>{customer.status}</Badge></td>
              <td data-label="Actions" className="px-6 py-3 text-right">
                <button
                  type="button"
                  aria-label={`More actions for ${customer.name}`}
                  className="inline-grid h-7 w-7 place-items-center rounded-md border border-border-action text-muted hover:border-primary hover:text-primary"
                >
                  <PublicIcon name="ellipsis-vertical" className="h-3.5 w-3.5" />
                </button>
              </td>
            </TableRow>
          ))}
        </tbody>
        </Table>
      </div>
      {customers.length === 0 && <p className="px-6 py-12 text-center text-sm text-muted">No customers match your filters.</p>}
      <footer className="flex flex-col gap-3 border-t border-divider px-6 py-4 text-[10px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>Showing {customers.length} of {total} customers</span>
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button type="button" aria-label="Previous page" disabled className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted-faint disabled:cursor-not-allowed disabled:opacity-60">
            <PublicIcon name="left" className="h-3 w-3" />
          </button>
          <button type="button" aria-current="page" className="grid h-7 w-7 place-items-center rounded-md bg-primary text-[10px] font-semibold text-white">1</button>
          <button type="button" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted hover:border-primary hover:text-primary">2</button>
          <button type="button" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted hover:border-primary hover:text-primary">3</button>
          <button type="button" aria-label="Next page" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted hover:border-primary hover:text-primary">
            <PublicIcon name="right" className="h-3 w-3" />
          </button>
        </div>
      </footer>
    </>
  );
}
