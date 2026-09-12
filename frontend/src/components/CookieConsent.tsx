"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { routes } from "@/lib/routeController";

const consentKey = "marketplace-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(consentKey) === null);
  }, []);

  if (!visible) return null;

  const choose = (value: "accepted" | "declined") => {
    window.localStorage.setItem(consentKey, value);
    setVisible(false);
  };

  return (
    <aside role="dialog" aria-label="Cookie preferences" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-border bg-white p-4 shadow-xl sm:inset-x-auto sm:right-5 sm:p-5">
      <h2 className="text-sm font-bold text-heading">Cookie preferences</h2>
      <p className="mt-1 text-xs leading-5 text-muted">We use necessary cookies to keep MarketPlace working. Optional analytics or advertising cookies are not active unless you choose to accept them.</p>
      <p className="mt-1 text-xs text-muted"><Link className="font-semibold text-primary underline" href={routes.legal.cookies()}>Read the cookies policy</Link></p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose("declined")} className="rounded-lg border border-border-control bg-white px-3 py-2 text-xs font-semibold text-body hover:bg-surface-control">Decline optional</button>
        <button type="button" onClick={() => choose("accepted")} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover">Accept optional</button>
      </div>
    </aside>
  );
}
