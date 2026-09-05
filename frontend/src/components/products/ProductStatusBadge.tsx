import type { ProductStatus } from "./productTypes";

export default function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const classes = {
    Published: "bg-status-success-surface text-status-success",
    Draft: "bg-slate-100 text-muted",
    Archived: "bg-slate-100 text-muted-soft",
  }[status];

  return <span className={`rounded-md px-2.5 py-1.5 text-[9px] font-medium ${classes}`}>{status}</span>;
}
