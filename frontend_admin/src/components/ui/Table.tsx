import type { ReactNode, TableHTMLAttributes } from "react";

export function Table({ className = "", ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <div className="overflow-x-auto"><table className={`w-full min-w-[760px] table-auto border-separate border-spacing-0 text-left text-xs ${className}`} {...props} /></div>;
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="bg-surface-muted text-[10px] font-medium uppercase tracking-[0.08em] text-muted">{children}</thead>;
}

export function TableRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <tr className={`border-t border-divider align-middle ${className}`}>{children}</tr>;
}
