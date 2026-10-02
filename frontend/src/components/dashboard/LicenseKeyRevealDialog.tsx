"use client";

import { FormEvent, useRef, useState } from "react";
import { Modal } from "@/components/ui";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export default function LicenseKeyRevealDialog({ licenseId, storefrontName, onClose }: { licenseId: number; storefrontName: string; onClose: () => void }) {
  const [method, setMethod] = useState<"password" | "otp">("password");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputs = useRef<Array<HTMLInputElement | null>>([]);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [revealedKey, setRevealedKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endpoint = `${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/licenses/keys/${licenseId}`;
  const authHeaders = () => ({ Authorization: `Bearer ${window.localStorage.getItem("marketplace-token") || ""}` });

  const sendCode = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${endpoint}/reveal-otp`, { method: "POST", headers: authHeaders() });
      const data = await response.json().catch(() => ({}));
      if (response.status === 429 && data.codeAlreadySent) {
        setMaskedEmail(String(data.maskedEmail || "your email"));
        setOtpSent(true);
        return;
      }
      if (!response.ok) throw new Error(data.error || "Unable to send the email code.");
      setMaskedEmail(String(data.maskedEmail || "your email"));
      setOtpSent(true);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send the email code.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${endpoint}/reveal`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(method === "password" ? { password } : { otp: otp.join("") }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to reveal this license key.");
      setRevealedKey(String(data.key || ""));
      setPassword("");
      setOtp(["", "", "", "", "", ""]);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Unable to reveal this license key.");
    } finally {
      setBusy(false);
    }
  };

  const selectMethod = (nextMethod: "password" | "otp") => {
    setMethod(nextMethod);
    setOtp(["", "", "", "", "", ""]);
    setOtpSent(false);
    setError("");
  };

  return <Modal
    open
    title={revealedKey ? "License key revealed" : "Verify to reveal key"}
    onClose={() => { if (!busy) onClose(); }}
    size="sm"
    footer={revealedKey ? <button type="button" onClick={onClose} className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white">Close</button> : <>
      <button type="button" disabled={busy} onClick={onClose} className="rounded-lg border border-border-control px-4 py-2.5 text-xs font-semibold text-body disabled:opacity-60">Cancel</button>
      {method === "otp" && !otpSent ? <button type="button" onClick={() => void sendCode()} disabled={busy} className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60">{busy ? "Sending..." : "Send email code"}</button> : <button form="license-key-reveal-form" type="submit" disabled={busy} className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60">{busy ? "Verifying..." : "Verify and reveal"}</button>}
    </>}
  >
    {revealedKey ? <div className="grid gap-3">
      <p className="text-xs text-muted">This key is visible only until this dialog closes.</p>
      <output className="break-all rounded-lg border border-border-control bg-surface-muted px-3 py-3 font-mono text-sm font-semibold text-heading">{revealedKey}</output>
    </div> : <form id="license-key-reveal-form" onSubmit={verify} className="grid gap-4">
      <p className="text-xs leading-5 text-muted">Verify your identity before displaying this key. The key is not included in the license list.</p>
      <div role="tablist" aria-label="Verification method" className="flex w-fit overflow-hidden rounded-lg border border-border-control">
        {(["password", "otp"] as const).map((option) => <button key={option} type="button" role="tab" disabled={busy} aria-selected={method === option} onClick={() => selectMethod(option)} className={`border-r border-border-control px-3 py-2 text-[11px] last:border-r-0 disabled:cursor-not-allowed disabled:opacity-60 ${method === option ? "bg-accent-light font-semibold text-primary" : "bg-white font-medium text-muted hover:text-heading"}`}>{option === "password" ? "Password" : "Email OTP"}</button>)}
      </div>
      {method === "password" ? <label className="grid gap-1.5 text-xs font-semibold text-body">Current password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required disabled={busy} className="h-11 rounded-lg border border-border-control px-3 text-sm font-normal outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60" /></label> : otpSent ? <>
        <p className="text-xs text-muted">Enter the six-digit code sent to {maskedEmail}. It expires in 10 minutes.</p>
        <div className="grid gap-1.5 text-xs font-semibold text-body">
          <label htmlFor="license-otp-0">Email code</label>
          <div role="group" aria-label="Six-digit email code" className="grid max-w-[360px] grid-cols-6 gap-2">
            {otp.map((digit, index) => <input
              key={index}
              ref={(element) => { otpInputs.current[index] = element; }}
              id={`license-otp-${index}`}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${index + 1} of 6`}
              value={digit}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, "").slice(0, 6);
                const next = [...otp];
                if (digits.length > 1) {
                  for (let offset = 0; offset < digits.length; offset += 1) next[offset] = digits[offset];
                  setOtp(next);
                  otpInputs.current[Math.min(digits.length, 5)]?.focus();
                  return;
                }
                next[index] = digits;
                setOtp(next);
                if (digits && index < 5) otpInputs.current[index + 1]?.focus();
              }}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && !digit && index > 0) otpInputs.current[index - 1]?.focus();
                if (event.key === "ArrowLeft" && index > 0) otpInputs.current[index - 1]?.focus();
                if (event.key === "ArrowRight" && index < 5) otpInputs.current[index + 1]?.focus();
              }}
              onPaste={(event) => {
                const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                if (!digits) return;
                event.preventDefault();
                const next = ["", "", "", "", "", ""];
                for (let offset = 0; offset < digits.length; offset += 1) next[offset] = digits[offset];
                setOtp(next);
                otpInputs.current[Math.min(digits.length, 5)]?.focus();
              }}
              pattern="[0-9]"
              maxLength={6}
              required
              disabled={busy}
              className="h-12 min-w-0 rounded-lg border border-border-control text-center text-lg font-semibold text-heading outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
            />)}
          </div>
        </div>
      </> : <p className="text-xs text-muted">A one-time code will be sent to the email on your account.</p>}
      {error && <p role="alert" className="rounded-lg border border-status-danger/20 bg-status-danger-surface px-3 py-2 text-xs text-status-danger">{error}</p>}
    </form>}
  </Modal>;
}
