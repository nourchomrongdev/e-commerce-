"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { routes } from "@/lib/routeController";
import AuthShell, { AuthButton, AuthField, AuthLink, PreventSubmit } from "../AuthShell";

const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const validateEmail = (value: string) => {
    setEmailError(isValidEmail(value) ? "" : "Please enter a valid email address, for example name@example.com.");
  };

  const submitDisabled = loading || !email.trim() || !isValidEmail(email) || Boolean(emailError);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");

    const nextError = !isValidEmail(email) ? "Please enter a valid email address, for example name@example.com." : "";
    setEmailError(nextError);
    if (nextError) return;

    setLoading(true);
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

  return <AuthShell title="Forgot your password?" illustration="reset" footer={<p className="text-[10px] text-muted">Remember your password? <AuthLink href={routes.auth.login()}>Back to sign in →</AuthLink></p>}>
    <PreventSubmit onSubmit={submit} disabled={loading}>
      <AuthField
        name="email"
        value={email}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const value = event.target.value;
          setEmail(value);
          if (emailTimer.current) clearTimeout(emailTimer.current);
          emailTimer.current = setTimeout(() => validateEmail(value), 300);
        }}
        label="Email address"
        type="email"
        placeholder="Enter your email"
        error={emailError}
      />
      {error && <p role="alert" className="text-[10px] text-red-600">{error}</p>}
      <AuthButton disabled={submitDisabled}>{loading ? "Sending..." : "Send OTP"}</AuthButton>
      <p className="rounded-lg bg-[#f7f0ff] px-3 py-2.5 text-[10px] leading-4 text-[#7952b3]">We&apos;ll send a 6-digit code to your email.</p>
    </PreventSubmit>
  </AuthShell>;
}