"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { routes } from "@/lib/routeController";
import AuthShell, { AuthButton, AuthField, AuthLink, PreventSubmit } from "../AuthShell";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const oauthErrorMessages: Record<string, string> = {
  "google-account-already-linked": "This Google account is already linked to another account.",
  "google-sign-in-failed": "Google sign-in failed. Please try again.",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorCode = searchParams.get("error");
    setError(errorCode ? oauthErrorMessages[errorCode] || "Unable to sign in with Google. Please try again." : "");
  }, [searchParams]);

  const update = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to sign in.");
      window.localStorage.setItem("marketplace-token", data.token);
      router.push(routes.home());
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to sign in."); }
    finally { setLoading(false); }
  }

  return <AuthShell title="Sign in to your account" illustration="login" footer={<p className="text-[10px] text-muted">New to MarketPlace? <AuthLink href={routes.auth.register()}>Create an account →</AuthLink></p>}>
    <PreventSubmit onSubmit={submit} disabled={loading}>
      <AuthField name="email" value={form.email} onChange={update("email")} label="Email address" type="email" placeholder="Enter your email" />
      <div><AuthField name="password" value={form.password} onChange={update("password")} label="Password" type="password" placeholder="Enter your password" /><div className="mt-2 flex items-center justify-between text-[10px] text-muted"><label className="flex items-center gap-1.5"><input type="checkbox" className="accent-primary" /> Remember me</label><AuthLink href={routes.auth.forgotPassword()}>Forgot password?</AuthLink></div></div>
      {error && <p role="alert" className="text-[10px] text-red-600">{error}</p>}
      <AuthButton>{loading ? "Signing in..." : "Sign In"}</AuthButton>
      <div className="flex items-center gap-3 text-[10px] text-muted-faint"><span className="h-px flex-1 bg-divider" />or continue with<span className="h-px flex-1 bg-divider" /></div>
      <a href={`${apiUrl}/auth/google`} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border-control text-[10px] font-medium text-body no-underline transition hover:bg-surface-hover"><img src="/icons/google-icon-.svg" alt="" aria-hidden="true" className="h-4 w-4" />Continue with Google</a>
      <p className="text-center text-[9px] leading-4 text-muted">By signing in, you agree to our <a href={routes.legal.terms()} className="text-primary underline">Terms and Conditions</a> and <a href={routes.legal.privacy()} className="text-primary underline">Privacy Policy</a></p>
    </PreventSubmit>
  </AuthShell>;
}
