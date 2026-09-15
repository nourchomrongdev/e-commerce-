"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routeController";
import AuthShell, { AuthButton, AuthField, AuthLink, PreventSubmit } from "../AuthShell";

const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ name: "", username: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const validationTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const validateField = (field: keyof typeof form, value: string) => {
    const nextMessage = field === "name"
      ? (value.trim() ? "" : "Please enter your full name.")
      : field === "username"
        ? (value.trim() ? "" : "Please choose a username.")
        : field === "email"
          ? (value.trim() ? "" : "Please enter a valid email address, for example name@example.com.")
          : field === "password"
            ? (value.trim() ? "" : "Please enter a password.")
            : (value.trim() ? "" : "Please confirm your password.");

    setFieldErrors((current) => ({ ...current, [field]: nextMessage }));
  };

  const update = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));

    if (validationTimers.current[field]) {
      clearTimeout(validationTimers.current[field]);
    }

    validationTimers.current[field] = setTimeout(() => {
      validateField(field, value);
    }, 300);
  };

  const submitDisabled = loading || !form.name.trim() || !form.username.trim() || !form.email.trim() || !form.password.trim() || !form.confirmPassword.trim() || form.password !== form.confirmPassword || Object.values(fieldErrors).some(Boolean);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");

    const nextErrors = {
      name: form.name.trim() ? "" : "Please enter your full name.",
      username: form.username.trim() ? "" : "Please choose a username.",
      email: form.email.trim() ? "" : "Please enter a valid email address, for example name@example.com.",
      password: form.password.trim() ? "" : "Please enter a password.",
      confirmPassword: form.confirmPassword.trim() ? "" : "Please confirm your password.",
    };

    setFieldErrors(nextErrors);
    if (!form.password || !form.confirmPassword || form.password !== form.confirmPassword) {
      setFieldErrors((current) => ({
        ...current,
        password: form.password.trim() ? "" : "Please enter a password.",
        confirmPassword: form.confirmPassword.trim() ? "" : "Please confirm your password.",
      }));
      if (form.password !== form.confirmPassword) {
        setFieldErrors((current) => ({ ...current, confirmPassword: "Passwords do not match." }));
      }
    }

    if (nextErrors.name || nextErrors.username || nextErrors.email || nextErrors.password || nextErrors.confirmPassword || form.password !== form.confirmPassword) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, username: form.username, email: form.email, password: form.password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create account.");
      window.localStorage.setItem("marketplace-token", data.token);
      router.push(routes.auth.accountCreated());
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to create account."); }
    finally { setLoading(false); }
  }

  return <AuthShell title="Create a new account" illustration="register" footer={<p className="text-[10px] text-muted">Already have an account? <AuthLink href={routes.auth.login()}>Sign in instead →</AuthLink></p>}>
    <PreventSubmit onSubmit={submit} disabled={loading}>
      <AuthField name="name" value={form.name} onChange={update("name")} label="Full name" placeholder="Enter your full name" error={fieldErrors.name} />
      <AuthField name="username" value={form.username} onChange={update("username")} label="Username" placeholder="Choose a username" error={fieldErrors.username} />
      <AuthField name="email" value={form.email} onChange={update("email")} label="Email address" type="email" placeholder="Enter your email" error={fieldErrors.email} />
      <AuthField name="password" value={form.password} onChange={update("password")} label="Password" type="password" placeholder="Create a password" error={fieldErrors.password} />
      <AuthField name="confirmPassword" value={form.confirmPassword} onChange={update("confirmPassword")} label="Confirm password" type="password" placeholder="Confirm your password" error={fieldErrors.confirmPassword} />
      <label className="flex items-start gap-2 text-[10px] leading-4 text-muted"><input type="checkbox" required className="mt-0.5 accent-primary" />I agree to the <a href={routes.legal.terms()} className="text-primary underline">Terms and Conditions</a> and <a href={routes.legal.privacy()} className="text-primary underline">Privacy Policy</a></label>
      {error && <p role="alert" className="text-[10px] text-red-600">{error}</p>}
      <AuthButton disabled={submitDisabled}>{loading ? "Creating account..." : "Create Account"}</AuthButton>
      <div className="flex items-center gap-3 text-[10px] text-muted-faint"><span className="h-px flex-1 bg-divider" />or continue with<span className="h-px flex-1 bg-divider" /></div>
      <a href={`${apiUrl}/auth/google`} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border-control text-[10px] font-medium text-body no-underline transition hover:bg-surface-hover"><img src="/icons/google-icon-.svg" alt="" aria-hidden="true" className="h-4 w-4" />Continue with Google</a>
      <a href={`${apiUrl}/auth/paypal`} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#1d4ed8] text-[10px] font-medium text-[#1d4ed8] no-underline transition hover:bg-[#eff6ff]"><img src="/icons/paypal-icon.svg" alt="" aria-hidden="true" className="h-4 w-4" />Continue with PayPal</a>
    </PreventSubmit>
  </AuthShell>;
}
