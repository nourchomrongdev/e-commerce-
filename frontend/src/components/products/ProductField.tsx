import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { InputText, Select, Textarea } from "@/components/ui";

type BaseProps = { label: string; id: string; hint?: string };

type ProductFieldProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
type ProductTextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;
type ProductSelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement>;

export function ProductField({ label, id, hint, ...props }: ProductFieldProps) {
  return (
    <label htmlFor={id} className="block text-xs font-medium text-body">
      {label}
      <InputText id={id} {...props} className="mt-2" />
      {hint && <span className="mt-1 block text-[11px] font-normal text-muted-light">{hint}</span>}
    </label>
  );
}

export function ProductTextarea({ label, id, hint, ...props }: ProductTextareaProps) {
  return (
    <label htmlFor={id} className="block text-xs font-medium text-body">
      {label}
      <Textarea id={id} {...props} className="mt-2" />
      {hint && <span className="mt-1 block text-[11px] font-normal text-muted-light">{hint}</span>}
    </label>
  );
}

export function ProductSelect({ label, id, hint, children, ...props }: ProductSelectProps) {
  return (
    <label htmlFor={id} className="block text-xs font-medium text-body">
      {label}
      <Select id={id} {...props} className="mt-2">{children}</Select>
      {hint && <span className="mt-1 block text-[11px] font-normal text-muted-light">{hint}</span>}
    </label>
  );
}
