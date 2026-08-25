"use client";

import { useRouter } from "next/navigation";
import { routes } from "@/lib/routeController";
import AuthShell, { AuthButton, AuthField, AuthLink, PreventSubmit } from "../AuthShell";

export default function LoginPage() {
  const router = useRouter();
  return <AuthShell title="Sign in to your account" illustration="login" footer={<p className="text-[10px] text-muted">New to MarketPlace? <AuthLink href={routes.auth.register()}>Create an account →</AuthLink></p>}>
    <PreventSubmit onSubmit={(event) => { event.preventDefault(); router.push(routes.creator.overview()); }}>
      <AuthField label="Email address" type="email" placeholder="Enter your email" />
      <div><AuthField label="Password" type="password" placeholder="Enter your password" /><div className="mt-2 flex items-center justify-between text-[10px] text-muted"><label className="flex items-center gap-1.5"><input type="checkbox" className="accent-primary" /> Remember me</label><AuthLink href={routes.auth.forgotPassword()}>Forgot password?</AuthLink></div></div>
      <AuthButton>Sign In</AuthButton>
      <div className="flex items-center gap-3 text-[10px] text-muted-faint"><span className="h-px flex-1 bg-divider" />or continue with<span className="h-px flex-1 bg-divider" /></div>
      <button type="button" className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border-control text-[10px] font-medium text-body transition hover:bg-surface-hover"><img src="/icons/google-icon-.svg" alt="" className="h-4 w-4" />Continue with Google</button>
      <p className="text-center text-[9px] leading-4 text-muted">By signing in, you agree to our <span className="text-primary">Terms of Service</span> and <span className="text-primary">Privacy Policy</span></p>
    </PreventSubmit>
  </AuthShell>;
}