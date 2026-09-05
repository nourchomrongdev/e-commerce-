import type { ReactNode } from "react";
import PublicIcon from "../icons/PublicIcon";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastProps = {
  message: ReactNode;
  title?: string;
  variant?: ToastVariant;
  icon?: ReactNode;
  onClose?: () => void;
  className?: string;
};

const variants: Record<ToastVariant, { container: string; icon: string; label: string }> = {
  success: {
    container: "border-status-success/20 bg-status-success-surface text-status-success",
    icon: "bg-status-success text-white",
    label: "Success",
  },
  error: {
    container: "border-status-danger/20 bg-status-danger-surface text-status-danger",
    icon: "bg-status-danger text-white",
    label: "Error",
  },
  warning: {
    container: "border-status-warning/20 bg-status-warning-surface text-status-warning",
    icon: "bg-status-warning text-white",
    label: "Warning",
  },
  info: {
    container: "border-status-info/20 bg-status-info-surface text-status-info",
    icon: "bg-status-info text-white",
    label: "Information",
  },
};

export default function Toast({
  message,
  title,
  variant = "info",
  icon,
  onClose,
  className = "",
}: ToastProps) {
  const tone = variants[variant];
  const symbol = variant === "success" ? <PublicIcon name="check" /> : variant === "warning" ? <PublicIcon name="warning" /> : <PublicIcon name="warning"  />;

  return (
    <div
      className={`fixed right-5 top-24 z-[80] flex w-[min(24rem,calc(100vw-2rem))] items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${tone.container} ${className}`}
      role="alert"
    >
      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${tone.icon}`} aria-hidden="true">
        {icon ?? symbol}
      </span>
      <div className="min-w-0 flex-1 text-xs">
        <p className="font-semibold">{title ?? tone.label}</p>
        <div className="mt-0.5 leading-5 opacity-90">{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="shrink-0 text-lg leading-none opacity-60 transition hover:opacity-100"
        >
          <PublicIcon name="x" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
