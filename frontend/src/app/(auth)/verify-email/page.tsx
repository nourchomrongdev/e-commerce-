"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AppBrand from "@/components/AppBrand";
import { routes } from "@/lib/routeController";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const updateCode = (index: number, value: string) => setCode((current) => current.map((item, itemIndex) => itemIndex === index ? value.slice(-1) : item));
  return <main className="grid min-h-screen place-items-center bg-[#f8f8ff] px-4 py-8"><section className="w-full max-w-[430px] rounded-xl border border-border bg-white p-7 shadow-[0_14px_40px_rgba(17,27,64,0.07)] sm:p-10"><AppBrand logoClassName="h-8 w-8" textClassName="text-xs" /><div className="mt-12 text-center"><h1 className="text-xl font-bold text-heading">Enter verification code</h1><p className="mt-2 text-xs leading-5 text-muted">We&apos;ve sent a 6-digit code to<br /><strong className="text-body">john.doe@example.com</strong></p><form onSubmit={(event) => { event.preventDefault(); router.push(routes.creator.overview()); }}><div className="mt-7 grid grid-cols-6 gap-2">{code.map((value, index) => <input key={index} value={value} onChange={(event) => updateCode(index, event.target.value)} inputMode="numeric" maxLength={1} aria-label={`Verification digit ${index + 1}`} className="h-11 min-w-0 rounded-lg border border-border-control text-center text-sm font-semibold text-heading outline-none focus:border-primary focus:ring-2 focus:ring-orange-100" />)}</div><p className="mt-4 text-center text-[10px] text-muted">Didn&apos;t receive the code? <span className="text-primary">Resend (00:45)</span></p><button type="submit" className="mt-6 h-10 w-full rounded-lg bg-primary text-xs font-semibold text-white hover:bg-primary-hover">Verify Code</button></form><button type="button" onClick={() => router.push(routes.auth.login())} className="mt-6 text-[10px] font-semibold text-primary">Back to sign in</button></div></section></main>;
}