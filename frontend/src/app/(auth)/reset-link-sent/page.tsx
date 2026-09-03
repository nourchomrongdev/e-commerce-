"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppBrand from "@/components/AppBrand";
import { routes } from "@/lib/routeController";

export default function ResetLinkSentPage() {
  const [email, setEmail] = useState("your email address");
  const [resetUrl, setResetUrl] = useState("");
  useEffect(() => { setEmail(new URLSearchParams(window.location.search).get("email") || "your email address"); setResetUrl(window.sessionStorage.getItem("password-reset-url") || ""); }, []);
  return <main className="grid min-h-screen place-items-center bg-[#f8f8ff] px-4 py-8"><section className="w-full max-w-[430px] rounded-xl border border-border bg-white p-7 text-center shadow-[0_14px_40px_rgba(17,27,64,0.07)] sm:p-10"><AppBrand className="justify-center" logoClassName="h-8 w-8" textClassName="text-xs" /><span className="mx-auto mt-10 grid h-14 w-14 place-items-center rounded-full bg-[#e4f8ed] text-2xl text-status-success">✓</span><h1 className="mt-5 text-xl font-bold text-heading">Check your email</h1><p className="mx-auto mt-2 max-w-[290px] text-xs leading-5 text-muted">We&apos;ve sent a password reset link to <strong className="text-body">{email}</strong>.</p><p className="mt-5 rounded-lg bg-[#f7f0ff] px-3 py-2.5 text-[10px] text-[#7952b3]">The link will expire in 15 minutes.</p>{resetUrl && <a href={resetUrl} className="mt-5 block text-[10px] font-semibold text-primary">Open reset link for local testing</a>}<Link href={routes.auth.login()} className="mt-6 block text-[10px] font-semibold text-primary no-underline">Back to sign in →</Link></section></main>;
}