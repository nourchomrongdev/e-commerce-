"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routeController";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing Google sign-in...");

  useEffect(() => {
    const hashValues = new URLSearchParams(window.location.hash.slice(1));
    const queryValues = new URLSearchParams(window.location.search.slice(1));
    const token = hashValues.get("token") || queryValues.get("token");
    const error = queryValues.get("error") || hashValues.get("error");

    if (error) {
      setStatus("error");
      setMessage("Google sign-in failed. Please try again.");
      window.setTimeout(() => router.replace(`${routes.auth.login()}?error=${encodeURIComponent(error)}`), 1200);
      return;
    }

    if (!token) {
      setStatus("error");
      setMessage("Google sign-in failed. Please try again.");
      window.setTimeout(() => router.replace(routes.auth.login()), 1200);
      return;
    }

    window.localStorage.setItem("marketplace-token", token);
    setStatus("success");
    setMessage("Google sign-in successful. Redirecting to your dashboard...");
    window.setTimeout(() => router.replace(routes.home()), 800);
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f5fb] px-6 py-8 text-center">
      <div className="flex flex-col items-center gap-3 text-[#1c2438]">
        <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
          <span className={`inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent ${status === "error" ? "text-red-500" : "text-primary"}`} aria-hidden="true" />
          <span>{status === "error" ? "Error" : status === "success" ? "Success" : "Loading"}</span>
        </div>

        <p className={`text-base font-semibold ${status === "error" ? "text-red-600" : "text-[#1c2438]"}`}>
          {status === "error" ? "Google sign-in failed" : status === "success" ? "Welcome back" : "Signing you in..."}
        </p>

        <p role="alert" className="max-w-md text-sm text-[#5c667a]">
          {message}
        </p>
      </div>
    </main>
  );
}