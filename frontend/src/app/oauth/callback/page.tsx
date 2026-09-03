"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routeController";

export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const values = new URLSearchParams(window.location.hash.slice(1));
    const token = values.get("token");
    if (!token) {
      router.replace(routes.auth.login());
      return;
    }
    window.localStorage.setItem("marketplace-token", token);
    router.replace(routes.home());
  }, [router]);

  return <main className="grid min-h-screen place-items-center text-sm text-muted">Completing Google sign-in...</main>;
}