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
  "google-sign-in-failed": "Google sign-in failed. Please try again.",
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loginMessage, setLoginMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
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
    const errorCode = searchParams.get("error");
    setError(
      errorCode
        ? oauthErrorMessages[errorCode] ||
            "Unable to sign in with Google. Please try again."
        : "",
    );
  }, [searchParams]);

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
      if (!response.ok) throw new Error(data.error || "Unable to sign in.");
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
          {error && (
            <p role="alert" className="text-[10px] text-red-600">
              {error}
            </p>
          )}
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
