"use client";

import type { ReactNode, MouseEvent } from "react";
import PublicIcon from "@/components/icons/PublicIcon";

export default function Modal({ open, title, titleId = "modal-title", children, footer, onClose, size = "sm" }: { open: boolean; title: string; titleId?: string; children: ReactNode; footer?: ReactNode; onClose: () => void; size?: "sm" | "md" | "lg" }) {
  if (!open) return null;
  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => { if (event.target === event.currentTarget) onClose(); };
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/30 p-4" role="presentation" onMouseDown={handleBackdropClick}>
    <section role="dialog" aria-modal="true" aria-labelledby={titleId} className={`w-full ${widths[size]} rounded-2xl border border-border bg-white p-6 shadow-2xl`}>
      <div className="flex items-start justify-between gap-4"><h2 id={titleId} className="font-semibold text-ink">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="grid h-7 w-7 place-items-center rounded-md text-muted-light hover:bg-surface-control hover:text-ink"><PublicIcon name="x" className="h-4 w-4" /></button></div>
      <div className="mt-5">{children}</div>
      {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
    </section>
  </div>;
}
