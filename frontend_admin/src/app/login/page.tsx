"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AppBrand from "@/components/AppBrand";
import PublicIcon from "@/components/icons/PublicIcon";
import { Toast } from "@/components/ui";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const adminLoginDestinationKey = "admin-login-next";

function isAdminDestination(value: string | null): value is string {
  return Boolean(value && (value === "/admin" || value.startsWith("/admin/")) && !value.startsWith("//"));
}
type LoginToast = { variant: "success" | "error"; message: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [toast, setToast] = useState<LoginToast | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const legacyDestination = new URLSearchParams(window.location.search).get("next");
    if (isAdminDestination(legacyDestination)) {
      window.sessionStorage.setItem(adminLoginDestinationKey, legacyDestination);
    }
    if (window.location.search) {
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError("");
    setToast(null);
    setSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to sign in.");
      if (!data.token || !["admin", "superadmin"].some((role) => data.user?.roles?.includes(role) || data.user?.role === role)) {
        throw new Error("This account does not have admin access.");
      }
      window.localStorage.setItem("marketplace-token", data.token);
      setToast({ variant: "success", message: "Signed in successfully. Redirecting to the admin dashboard..." });
      const savedDestination = window.sessionStorage.getItem(adminLoginDestinationKey);
      window.sessionStorage.removeItem(adminLoginDestinationKey);
      window.setTimeout(() => {
        router.replace(isAdminDestination(savedDestination) ? savedDestination : "/admin");
      }, 900);
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "Unable to sign in.";
      if (message === "Invalid email or password.") {
        setPasswordError(message);
      } else {
        setToast({ variant: "error", message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f8ff] px-3 py-5 text-[#111b40] sm:px-6 sm:py-8 lg:grid lg:place-items-center">
      <div className="w-full max-w-[1240px] overflow-hidden rounded-xl border border-border bg-white shadow-[0_14px_40px_rgba(17,27,64,0.07)] lg:min-h-[calc(100vh-4rem)] lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="relative flex min-h-[260px] min-w-0 flex-col overflow-hidden bg-gradient-to-br from-[#fffaf5] via-[#fffdfb] to-[#fff2e5] p-6 sm:p-8 lg:min-h-[calc(100vh-4rem)] lg:p-14">
          <AppBrand logoClassName="h-8 w-8" textClassName="text-xs" />

          <div className="relative z-10 mt-8 max-w-[230px] sm:mt-12 lg:mt-14">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-heading sm:text-3xl">
              Welcome <span className="text-primary">back!</span>
            </h1>
            <p className="mt-3 text-[11px] leading-5 text-muted">
              Sign in to your account and continue managing your marketplace.
            </p>
          </div>

          <div className="auth-illustration" aria-hidden="true">
            <span className="auth-illustration__icon">
              <PublicIcon name="user-lock" className="h-9 w-9" />
            </span>
            <span className="auth-illustration__paper" />
          </div>

          <p className="mt-auto pt-8 text-[10px] text-muted">
            Secure, simple, and built for independent creators.
          </p>
        </section>

        <section className="min-w-0 flex flex-col justify-center p-6 sm:p-10 lg:px-20 lg:py-14">
          <h2 className="text-base font-bold text-heading">Sign in to your account</h2>

          <div className="mt-6">
            <form className="min-w-0 w-full space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] font-medium text-body">
                  Email address
                  <span className="relative mt-1.5 block">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setPasswordError("");
                        setToast(null);
                      }}
                      placeholder="Enter your email"
                      autoComplete="username"
                      required
                      className="h-10 w-full rounded-lg border border-border-control bg-white px-3 text-xs text-body outline-none transition placeholder:text-muted-faint focus:border-primary focus:ring-2 focus:ring-orange-100"
                    />
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-body">
                  Password
                  <span className="relative mt-1.5 block">
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setPasswordError("");
                        setToast(null);
                      }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      aria-invalid={Boolean(passwordError)}
                      aria-describedby={passwordError ? "login-password-error" : undefined}
                      className="h-10 w-full rounded-lg border border-border-control bg-white px-3 text-xs text-body outline-none transition placeholder:text-muted-faint focus:border-primary focus:ring-2 focus:ring-orange-100"
                    />
                  </span>
                </label>
                {passwordError && <p id="login-password-error" role="alert" className="mt-1.5 text-xs text-status-danger">{passwordError}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="h-10 w-full rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(245,126,31,0.2)] transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>

          <div className="mt-7 border-t border-divider pt-5 text-center">
            <p className="text-[10px] text-muted">
              Admin access only.
            </p>
          </div>
        </section>
      </div>
      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </main>
  );
}
