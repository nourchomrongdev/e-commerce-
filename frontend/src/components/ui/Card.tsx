import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <article className={`rounded-xl border border-border bg-white shadow-sm ${className}`} {...props}>
      {children}
    </article>
  );
}

export function CardHeader({ children, className = "", ...props }: CardProps) {
  return (
    <div className={`border-b border-divider px-5 py-4 sm:px-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }: CardProps) {
  return (
    <h2 className={`text-sm font-bold text-heading ${className}`} {...props}>
      {children}
    </h2>
  );
}

export function CardContent({ children, className = "", ...props }: CardProps) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}