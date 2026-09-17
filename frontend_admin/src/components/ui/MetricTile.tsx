import type { ReactNode } from "react";

export type MetricTileProps = {
  label: string;
  value: ReactNode;
  change?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

/** A consistent, responsive dashboard statistic tile. */
export default function MetricTile({ label, value, change, icon, className = "" }: MetricTileProps) {
  const isNegative = typeof change === "string" && change.trim().startsWith("-");

  return (
    <article className={`rounded-xl border border-border bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold text-heading">{label}</p>
        {icon && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-orange-50 text-primary">{icon}</span>}
      </div>
      <p className="mt-3 text-xl font-bold leading-none tracking-tight text-heading">{value}</p>
      {change && <p className={`mt-1 text-[10px] font-semibold ${isNegative ? "text-status-danger" : "text-status-success"}`}>{change}</p>}
    </article>
  );
}
