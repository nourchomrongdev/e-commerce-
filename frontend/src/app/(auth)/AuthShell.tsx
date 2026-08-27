"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import AppBrand from "@/components/AppBrand";
import PublicIcon from "@/components/icons/PublicIcon";

type AuthShellProps = {
  title: string;
  children: ReactNode;
  footer: ReactNode;
  illustration: "login" | "register" | "reset";
};

const copy = {
  login: [
    "Welcome",
    "back!",
    "Sign in to your account and continue managing your marketplace.",
  ],
  register: [
    "Create",
    "your account",
    "Join thousands of creators and start selling your digital products.",
  ],
  reset: [
    "Reset",
    "your password",
    "No worries! Enter your email and we will send you a link to reset your password.",
  ],
} as const;

export function AuthField({
  label,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  type?: string;
  placeholder: string;
  required?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const password = type === "password";
  return (
    <label className="block text-[10px] font-medium text-body">
      {label}
      <span className="relative mt-1.5 block">
        <input
          required={required}
          type={password && showPassword ? "text" : type}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-border-control bg-white px-3 text-xs text-body outline-none transition placeholder:text-muted-faint focus:border-primary focus:ring-2 focus:ring-orange-100"
        />
        {password && (
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-soft"
          >
            <PublicIcon
              name={showPassword ? "eye" : "eye-closed"}
              className="h-4 w-4"
            />
          </button>
        )}
      </span>
    </label>
  );
}

export function AuthButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="h-10 w-full rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(245,126,31,0.2)] transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-orange-200"
    >
      {children}
    </button>
  );
}

export function PreventSubmit({
  onSubmit,
  children,
}: {
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  return (
    <form
      onSubmit={onSubmit ?? ((event) => event.preventDefault())}
      className="space-y-4"
    >
      {children}
    </form>
  );
}

export default function AuthShell({
  title,
  children,
  footer,
  illustration,
}: AuthShellProps) {
  const [heading, accent, description] = copy[illustration];
  return (
    <main className="min-h-screen bg-[#f8f8ff] px-3 py-5 text-[#111b40] sm:px-6 sm:py-8 lg:grid lg:place-items-center">
      <div className="w-full max-w-[1240px] overflow-hidden rounded-xl border border-border bg-white shadow-[0_14px_40px_rgba(17,27,64,0.07)] lg:min-h-[calc(100vh-4rem)] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative flex min-h-[260px] flex-col overflow-hidden bg-gradient-to-br from-[#fffaf5] via-[#fffdfb] to-[#fff2e5] p-6 sm:p-8 lg:min-h-[calc(100vh-4rem)] lg:p-14">
          <AppBrand logoClassName="h-8 w-8" textClassName="text-xs" />
          <div className="relative z-10 mt-8 max-w-[230px] sm:mt-12 lg:mt-14">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-heading sm:text-3xl">
              {heading} <span className="text-primary">{accent}</span>
            </h1>
            <p className="mt-3 text-[11px] leading-5 text-muted">
              {description}
            </p>
          </div>
          <div className="auth-illustration" aria-hidden="true">
            <span className="auth-illustration__icon">
              <PublicIcon
                name={
                  illustration === "login"
                    ? "user-lock"
                    : illustration === "register"
                      ? "user-round"
                      : "mail"
                }
                className="h-9 w-9"
              />
            </span>
            <span className="auth-illustration__paper" />
          </div>
          <p className="mt-auto pt-8 text-[10px] text-muted">
            Secure, simple, and built for independent creators.
          </p>
        </section>
        <section className="flex flex-col justify-center p-6 sm:p-10 lg:px-20 lg:py-14">
          <h2 className="text-base font-bold text-heading">{title}</h2>
          <div className="mt-6">{children}</div>
          <div className="mt-7 border-t border-divider pt-5 text-center">
            {footer}
          </div>
        </section>
      </div>
    </main>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-semibold text-primary no-underline hover:text-primary-hover"
    >
      {children}
    </Link>
  );
}
