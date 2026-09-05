import type { SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export default function Select({ className = "", invalid = false, ...props }: SelectProps) {
  return <select className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-body-strong outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-surface-control ${invalid ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-border-control"} ${className}`} {...props} />;
}
