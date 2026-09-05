"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routeController";
import AuthShell, { AuthButton, AuthField, AuthLink, PreventSubmit } from "../AuthShell";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
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
      <AuthField name="name" value={form.name} onChange={update("name")} label="Full name" placeholder="Enter your full name" />
      <AuthField name="username" value={form.username} onChange={update("username")} label="Username" placeholder="Choose a username" />
      <AuthField name="email" value={form.email} onChange={update("email")} label="Email address" type="email" placeholder="Enter your email" />
      <AuthField name="password" value={form.password} onChange={update("password")} label="Password" type="password" placeholder="Create a password" />
      <AuthField name="confirmPassword" value={form.confirmPassword} onChange={update("confirmPassword")} label="Confirm password" type="password" placeholder="Confirm your password" />
      <label className="flex items-start gap-2 text-[10px] leading-4 text-muted"><input type="checkbox" required className="mt-0.5 accent-primary" />I agree to the <span className="text-primary">Terms of Service</span> and <span className="text-primary">Privacy Policy</span></label>
      {error && <p role="alert" className="text-[10px] text-red-600">{error}</p>}
      <AuthButton>{loading ? "Creating account..." : "Create Account"}</AuthButton>
      <div className="flex items-center gap-3 text-[10px] text-muted-faint"><span className="h-px flex-1 bg-divider" />or continue with<span className="h-px flex-1 bg-divider" /></div>
      <a href={`${apiUrl}/auth/google`} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border-control text-[10px] font-medium text-body no-underline transition hover:bg-surface-hover"><img src="/icons/google-icon-.svg" alt="" className="h-4 w-4" />Continue with Google</a>
    </PreventSubmit>
  </AuthShell>;
}
