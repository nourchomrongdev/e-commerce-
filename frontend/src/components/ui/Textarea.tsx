import type { TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export default function Textarea({ className = "", invalid = false, ...props }: TextareaProps) {
  return <textarea className={`min-h-28 w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-body-strong outline-none transition placeholder:text-muted-faint focus:border-primary focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-surface-control ${invalid ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-border-control"} ${className}`} {...props} />;
}
