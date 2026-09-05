"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routeController";
import AuthShell, { AuthButton, AuthField, AuthLink, PreventSubmit } from "../AuthShell";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send OTP.");
      window.sessionStorage.setItem("password-reset-email", email);
      window.sessionStorage.setItem("password-reset-masked-email", data.maskedEmail || email);
      if (data.otp) window.sessionStorage.setItem("password-reset-otp", data.otp);
      router.push(routes.auth.otp());
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to send OTP."); }
    finally { setLoading(false); }
  }

  return <AuthShell title="Reset your password" illustration="reset" footer={<p className="text-[10px] text-muted">Remember your password? <AuthLink href={routes.auth.login()}>Back to sign in →</AuthLink></p>}>
    <PreventSubmit onSubmit={submit} disabled={loading}>
      <AuthField name="email" value={email} onChange={(event) => setEmail(event.target.value)} label="Email address" type="email" placeholder="Enter your email" />
      {error && <p role="alert" className="text-[10px] text-red-600">{error}</p>}
      <AuthButton>{loading ? "Sending..." : "Send OTP"}</AuthButton>
      <p className="rounded-lg bg-[#f7f0ff] px-3 py-2.5 text-[10px] leading-4 text-[#7952b3]">We&apos;ll send a 6-digit code to your email.</p>
    </PreventSubmit>
  </AuthShell>;
}
