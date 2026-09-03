"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routeController";
import AuthShell, { AuthButton, AuthField, AuthLink, PreventSubmit } from "../AuthShell";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export default function NewPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(window.sessionStorage.getItem("password-reset-email") || "");
    setOtp(window.sessionStorage.getItem("password-reset-otp") || "");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!email || !/^\d{6}$/.test(otp)) { setError("Your OTP session is missing or invalid. Please request a new code."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmation) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to reset password.");
      window.sessionStorage.removeItem("password-reset-email");
      window.sessionStorage.removeItem("password-reset-masked-email");
      window.sessionStorage.removeItem("password-reset-otp");
      router.push(routes.auth.login());
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to reset password."); }
    finally { setLoading(false); }
  }

  return <AuthShell title="Create a new password" illustration="reset" footer={<p className="text-[10px] text-muted">Remember your password? <AuthLink href={routes.auth.login()}>Back to sign in →</AuthLink></p>}>
    <PreventSubmit onSubmit={submit} disabled={loading}>
      <AuthField name="password" value={password} onChange={(event) => setPassword(event.target.value)} label="New password" type="password" placeholder="Enter a new password" />
      <AuthField name="confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} label="Confirm password" type="password" placeholder="Confirm your new password" />
      {error && <p role="alert" className="text-[10px] text-red-600">{error}</p>}
      <AuthButton>{loading ? "Saving..." : "Change Password"}</AuthButton>
    </PreventSubmit>
  </AuthShell>;
}
