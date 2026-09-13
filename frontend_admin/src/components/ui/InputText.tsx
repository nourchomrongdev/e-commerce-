import type { InputHTMLAttributes } from "react";

export type InputTextProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const inputClassName = "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-body-strong shadow-sm outline-none transition placeholder:text-muted-faint focus:border-primary focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-surface-control disabled:text-muted-light";

export default function InputText({ className = "", invalid = false, ...props }: InputTextProps) {
  return <input className={`${inputClassName} ${invalid ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-border-control"} ${className}`} {...props} />;
}
