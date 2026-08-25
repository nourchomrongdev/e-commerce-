"use client";

import { useRouter } from "next/navigation";
import { routes } from "@/lib/routeController";
import AuthShell, { AuthButton, AuthField, AuthLink, PreventSubmit } from "../AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  return <AuthShell title="Create a new account" illustration="register" footer={<p className="text-[10px] text-muted">Already have an account? <AuthLink href={routes.auth.login()}>Sign in instead →</AuthLink></p>}>
    <PreventSubmit onSubmit={(event) => { event.preventDefault(); router.push(routes.auth.accountCreated()); }}>
      <AuthField label="Full name" placeholder="Enter your full name" />
      <AuthField label="Email address" type="email" placeholder="Enter your email" />
      <AuthField label="Password" type="password" placeholder="Create a password" />
      <AuthField label="Confirm password" type="password" placeholder="Confirm your password" />
      <label className="flex items-start gap-2 text-[10px] leading-4 text-muted"><input type="checkbox" required className="mt-0.5 accent-primary" />I agree to the <span className="text-primary">Terms of Service</span> and <span className="text-primary">Privacy Policy</span></label>
      <AuthButton>Create Account</AuthButton>
      <div className="flex items-center gap-3 text-[10px] text-muted-faint"><span className="h-px flex-1 bg-divider" />or continue with<span className="h-px flex-1 bg-divider" /></div>
      <button type="button" className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border-control text-[10px] font-medium text-body transition hover:bg-surface-hover"><img src="/icons/google-icon-.svg" alt="" className="h-4 w-4" />Continue with Google</button>
    </PreventSubmit>
  </AuthShell>;
}