"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { routes } from "@/lib/routeController";
import { Toast } from "@/components/ui";
import AuthShell, {
  AuthButton,
  AuthField,
  AuthLink,
  PreventSubmit,
} from "../AuthShell";

const apiUrl =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ??
  "http://localhost:5000/api";
const oauthErrorMessages: Record<string, string> = {
  "google-account-already-linked":
    "This Google account is already linked to another account.",
  "google-account-unavailable":
    "This account is unavailable. Please contact support.",
  "google-sign-in-failed": "Google sign-in failed. Please try again.",
};

function formatTimeRemaining(endTime: string, now: number) {
  const endTimestamp = new Date(endTime).getTime();
  if (Number.isNaN(endTimestamp)) return "End time unavailable";
  const remainingSeconds = Math.ceil((endTimestamp - now) / 1000);
  if (remainingSeconds <= 0) return "End time reached";

  const units: [string, number][] = [
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
  ];
  let secondsLeft = remainingSeconds;
  const parts = units.flatMap(([unit, secondsPerUnit]) => {
  const value = Math.floor(secondsLeft / secondsPerUnit);
  secondsLeft %= secondsPerUnit;
  return value > 0 ? [`${value} ${unit}${value === 1 ? "" : "s"}`] : [];
  });

  return parts.slice(0, 3).join(", ");
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loginMessage, setLoginMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [disabledAccount, setDisabledAccount] = useState<{
    status: "suspended" | "banned";
    message: string;
    name: string;
    username: string;
    email: string;
    startsAt: string | null;
    suspendedUntil: string | null;
  } | null>(() => {
    const errorCode = searchParams.get("error");
    if (errorCode !== "account-banned" && errorCode !== "account-suspended") return null;
    return {
      status: errorCode === "account-banned" ? "banned" : "suspended",
      message: searchParams.get("message") || "Your account access has been restricted.",
      name: searchParams.get("name") || "",
      username: searchParams.get("username") || "",
      email: searchParams.get("email") || "",
      startsAt: searchParams.get("startsAt"),
      suspendedUntil: searchParams.get("suspendedUntil"),
    };
  });
  const [error, setError] = useState(() => {
    const errorCode = searchParams.get("error");
    if (!errorCode || errorCode === "account-banned" || errorCode === "account-suspended") return "";
    return oauthErrorMessages[errorCode] || "Unable to sign in with Google. Please try again.";
  });
  const [clockNow, setClockNow] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const validationTimers = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  useEffect(() => {
    const storedMessage = sessionStorage.getItem("creator-login-message");
    if (storedMessage) {
      setLoginMessage(storedMessage);
      sessionStorage.removeItem("creator-login-message");
    }

    if (!next || !next.startsWith("/")) return;

    sessionStorage.setItem("auth-redirect", next);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("next");
    const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", cleanUrl);
  }, [next, searchParams]);

  useEffect(() => {
    if (!disabledAccount?.suspendedUntil) return;
    setClockNow(Date.now());
    const intervalId = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [disabledAccount?.suspendedUntil]);

  const validateField = (field: keyof typeof form, value: string) => {
    const nextMessage =
      field === "email"
        ? value.trim()
          ? ""
          : "Please enter a valid email address, for example name@example.com."
        : value.trim()
          ? ""
          : "Please enter your password.";

    setFieldErrors((current) => ({ ...current, [field]: nextMessage }));
  };

  const update =
    (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((current) => ({ ...current, [field]: value }));
      setDisabledAccount(null);

      if (validationTimers.current[field]) {
        clearTimeout(validationTimers.current[field]);
      }

      validationTimers.current[field] = setTimeout(() => {
        validateField(field, value);
      }, 300);
    };

  const submitDisabled =
    loading ||
    !form.email.trim() ||
    !form.password.trim() ||
    Object.values(fieldErrors).some(Boolean);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setDisabledAccount(null);

    const nextErrors = {
      email: !form.email.trim()
        ? "Please enter a valid email address, for example name@example.com."
        : "",
      password: !form.password.trim() ? "Please enter your password." : "",
    };

    setFieldErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.code === "ACCOUNT_SUSPENDED" || data.code === "ACCOUNT_BANNED") {
          setDisabledAccount({
            status: data.code === "ACCOUNT_BANNED" ? "banned" : "suspended",
            message: data.message || "Your account access has been temporarily disabled.",
            name: data.name || "",
            username: data.username || "",
            email: data.email || form.email.trim(),
            startsAt: data.startsAt || null,
            suspendedUntil: data.suspendedUntil || null,
          });
        }
        throw new Error(data.error || "Unable to sign in.");
      }
      window.localStorage.setItem("marketplace-token", data.token);

      const redirectedTarget =
        sessionStorage.getItem("auth-redirect") ||
        (next && next.startsWith("/") ? next : "");
      const destination = redirectedTarget || routes.home();
      sessionStorage.removeItem("auth-redirect");
      router.push(destination);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign in.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {loginMessage && (
        <Toast
          variant="warning"
          message={loginMessage}
          onClose={() => undefined}
        />
      )}
      <AuthShell
        title="Sign in to your account"
        illustration="login"
        footer={
          <p className="text-[10px] text-muted">
            New to MarketPlace?{" "}
            <AuthLink href={routes.auth.register()}>
              Create an account →
            </AuthLink>
          </p>
        }
      >
        <PreventSubmit onSubmit={submit} disabled={loading}>
          <AuthField
            name="email"
            value={form.email}
            onChange={update("email")}
            label="Email address"
            type="email"
            placeholder="Enter your email"
            error={fieldErrors.email}
          />
          <div>
            <AuthField
              name="password"
              value={form.password}
              onChange={update("password")}
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={fieldErrors.password}
            />
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" className="accent-primary" /> Remember me
              </label>
              <AuthLink href={routes.auth.forgotPassword()}>
                Forgot password?
              </AuthLink>
            </div>
          </div>
          {!disabledAccount && error ? (
            <p role="alert" className="text-[10px] text-red-600">
              {error}
            </p>
          ) : null}
          <AuthButton disabled={submitDisabled}>
            {loading ? "Signing in..." : "Sign In"}
          </AuthButton>
          <div className="flex items-center gap-3 text-[10px] text-muted-faint">
            <span className="h-px flex-1 bg-divider" />
            or continue with
            <span className="h-px flex-1 bg-divider" />
          </div>
          <a
            href={`${apiUrl}/auth/google`}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border-control text-[10px] font-medium text-body no-underline transition hover:bg-surface-hover"
          >
            <img
              src="/icons/google-icon-.svg"
              alt=""
              aria-hidden="true"
              className="h-4 w-4"
            />
            Continue with Google
          </a>
          <a
            href={`${apiUrl}/auth/paypal`}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#1d4ed8] text-[10px] font-medium text-[#1d4ed8] no-underline transition hover:bg-[#eff6ff]"
          >
            <img
              src="/icons/paypal.svg"
              alt=""
              aria-hidden="true"
              className="h-6 w-6"
            />
            Continue with PayPal
          </a>
          <p className="text-center text-[9px] leading-4 text-muted">
            By signing in, you agree to our{" "}
            <a href={routes.legal.terms()} className="text-primary underline">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href={routes.legal.privacy()} className="text-primary underline">
              Privacy Policy
            </a>
          </p>
        </PreventSubmit>
      </AuthShell>
      {disabledAccount && (
        <div className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto bg-slate-950/55 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="login-restriction-title"
            className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="h-1 bg-primary" />
            <div className="p-5">
              <h2 id="login-restriction-title" className="text-xl font-bold text-heading">
                Account {disabledAccount.status === "banned" ? "banned" : "disabled"}
              </h2>
              <dl className="mt-4 space-y-4 border-t border-slate-200 pt-4 text-sm">
                <div className="grid gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  {disabledAccount.name && (
                    <div className="flex justify-between gap-3">
                      <dt className="font-medium text-muted">Name</dt>
                      <dd className="text-right font-medium text-body-strong">{disabledAccount.name}</dd>
                    </div>
                  )}
                  {disabledAccount.username && (
                    <div className="flex justify-between gap-3">
                      <dt className="font-medium text-muted">Username</dt>
                      <dd className="text-right font-medium text-body-strong">@{disabledAccount.username}</dd>
                    </div>
                  )}
                  {disabledAccount.email && (
                    <div className="flex justify-between gap-3">
                      <dt className="font-medium text-muted">Email</dt>
                      <dd className="break-all text-right font-medium text-body-strong">{disabledAccount.email}</dd>
                    </div>
                  )}
                </div>
                <div>
                  <dt className="font-semibold text-body">Reason</dt>
                  <dd className="mt-1 whitespace-pre-wrap leading-5 text-body-strong">{disabledAccount.message}</dd>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <dt className="font-medium text-muted">Start time</dt>
                    <dd className="mt-1 font-medium text-body-strong">
                      {disabledAccount.startsAt
                        ? clockNow === null
                          ? "Loading..."
                          : new Date(disabledAccount.startsAt).toLocaleString()
                        : "Not specified"}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <dt className="font-medium text-muted">End time</dt>
                    <dd className="mt-1 font-medium text-body-strong">
                      {disabledAccount.suspendedUntil
                        ? clockNow === null
                          ? "Loading..."
                          : new Date(disabledAccount.suspendedUntil).toLocaleString()
                        : "Permanent"}
                    </dd>
                  </div>
                </div>
                {disabledAccount.suspendedUntil && (
                  <div className="rounded-lg bg-orange-50 px-3 py-2">
                    <dt className="font-medium text-primary-hover">Time remaining</dt>
                    <dd className="mt-0.5 font-bold text-heading" aria-live="off">
                      {clockNow === null
                        ? "Calculating..."
                        : formatTimeRemaining(disabledAccount.suspendedUntil, clockNow)}
                    </dd>
                  </div>
                )}
              </dl>
              <button
                type="button"
                onClick={() => setDisabledAccount(null)}
                className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f8ff]" />}>
      <LoginPageContent />
    </Suspense>
  );
}
