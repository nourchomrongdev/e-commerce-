"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routeController";
import AuthShell, { AuthButton, AuthField, PreventSubmit } from "../AuthShell";

const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";

export default function OtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const storedEmail = window.sessionStorage.getItem("password-reset-email") || "";
    const storedMaskedEmail = window.sessionStorage.getItem("password-reset-masked-email") || "";

    if (!storedEmail) {
      router.replace(routes.auth.forgotPassword());
      return;
    }

    setEmail(storedEmail);
    setMaskedEmail(storedMaskedEmail);
  }, [router]);

  useEffect(() => {
    if (resendSeconds === 0) return;
    const timer = window.setInterval(() => setResendSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const otpValue = digits.join("");
  const submitDisabled = !/^\d{6}$/.test(otpValue) || !email;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const otp = digits.join("");
    if (!email) { setError("Please request an OTP first."); return; }
    if (!/^\d{6}$/.test(otp)) { setError("Enter the 6-digit OTP from your email."); return; }
    window.sessionStorage.setItem("password-reset-otp", otp);
    router.push(routes.auth.newPassword());
  }

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (!pastedDigits.length) return;
    setDigits([...pastedDigits, ...Array(6 - pastedDigits.length).fill("")]);
    inputRefs.current[Math.min(pastedDigits.length, 6) - 1]?.focus();
  }

  async function resendCode() {
    if (!email || resendSeconds > 0 || resending) return;
    setError(""); setResending(true);
    try {
      const response = await fetch(`${apiUrl}/auth/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to resend OTP.");
      setDigits(["", "", "", "", "", ""]);
      if (data.otp) window.sessionStorage.setItem("password-reset-otp", data.otp);
      if (data.maskedEmail) { setMaskedEmail(data.maskedEmail); window.sessionStorage.setItem("password-reset-masked-email", data.maskedEmail); }
      setResendSeconds(60);
      inputRefs.current[0]?.focus();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to resend OTP."); }
    finally { setResending(false); }
  }

  return <AuthShell title="Enter your OTP" illustration="reset" footer={<p className="text-[10px] text-muted">The code expires after 15 minutes.</p>}>
    <PreventSubmit onSubmit={submit}>
      <p className="text-[11px] text-muted">Enter the 6-digit code sent to <strong className="text-body">{maskedEmail || email || "your email"}</strong>.</p>
      <label className="block min-w-0 text-[10px] font-medium text-body">OTP code
        <span className="mt-1.5 grid w-full min-w-0 grid-cols-6 gap-2">
          {digits.map((digit, index) => <input key={index} ref={(element) => { inputRefs.current[index] = element; }} value={digit} onChange={(event) => updateDigit(index, event.target.value)} onKeyDown={(event) => handleKeyDown(index, event)} onPaste={handlePaste} inputMode="numeric" maxLength={1} autoComplete={index === 0 ? "one-time-code" : "off"} aria-label={`OTP digit ${index + 1}`} className="h-11 w-full min-w-0 rounded-lg border border-border-control bg-white text-center text-base font-semibold text-body outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100" />)}
        </span>
      </label>
      {error && <p role="alert" className="text-[10px] text-red-600">{error}</p>}
      <AuthButton disabled={submitDisabled}>Continue</AuthButton>
      <button type="button" onClick={resendCode} disabled={resendSeconds > 0 || resending} className="w-full text-[10px] font-semibold text-primary disabled:cursor-not-allowed disabled:text-muted-faint">{resending ? "Sending..." : resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}</button>
    </PreventSubmit>
  </AuthShell>;
}
