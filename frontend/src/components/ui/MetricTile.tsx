import type { ReactNode } from "react";
import { Card } from "./Card";

export type MetricTileProps = {
  label: string;
  value: ReactNode;
  change?: ReactNode;
  icon?: ReactNode;
  iconClassName?: string;
  className?: string;
};

/** A consistent, responsive dashboard statistic tile. */
export default function MetricTile({ label, value, change, icon, iconClassName = "text-primary", className = "" }: MetricTileProps) {
  const isNegative = typeof change === "string" && change.trim().startsWith("-");

  return (
        <Card className={`h-[135px] rounded-2xl p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}>
      <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold text-heading">{label}</p>
            {icon && <span className={`shrink-0 ${iconClassName}`}>{icon}</span>}
      </div>
          <p className="mt-3 text-xl font-bold leading-none tracking-tight text-heading">{value}</p>
          {change && <p className={`mt-3 text-[11px] font-medium ${isNegative ? "text-status-danger" : "text-status-success"}`}>{change}</p>}
    </Card>
  );
}
