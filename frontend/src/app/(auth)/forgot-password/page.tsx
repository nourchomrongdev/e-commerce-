"use client";

import { useRouter } from "next/navigation";
import { routes } from "@/lib/routeController";
import AuthShell, { AuthButton, AuthField, AuthLink, PreventSubmit } from "../AuthShell";

export default function ForgotPasswordPage() {
  const router = useRouter();
  return <AuthShell title="Forgot your password?" illustration="reset" footer={<p className="text-[10px] text-muted">Remember your password? <AuthLink href={routes.auth.login()}>Back to sign in →</AuthLink></p>}>
    <PreventSubmit onSubmit={(event) => { event.preventDefault(); router.push(routes.auth.resetLinkSent()); }}>
      <AuthField label="Email address" type="email" placeholder="Enter your email" />
      <AuthButton>Send Reset Link</AuthButton>
      <p className="rounded-lg bg-[#f7f0ff] px-3 py-2.5 text-[10px] leading-4 text-[#7952b3]">We&apos;ll send you an email with instructions to reset your password.</p>
    </PreventSubmit>
  </AuthShell>;
}