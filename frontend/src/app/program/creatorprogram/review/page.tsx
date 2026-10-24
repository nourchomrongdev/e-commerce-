"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import PublicIcon from "@/components/icons/PublicIcon";
import { routes } from "@/lib/routeController";

export default function CreatorProgramReviewPage() {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const candidates = ["marketplace-user", "current-user"];

    for (const key of candidates) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);
        const email = parsed?.email || parsed?.user?.email || "";
        if (email) {
          setUserEmail(email);
          return;
        }
      } catch {
        continue;
      }
    }
  }, []);

  const maskedEmail = userEmail ? userEmail.replace(/(^.).*(@.*$)/, "$1******$2") : "c******@gmail.com";

  return (
    <main className="flex min-h-screen flex-col bg-[var(--creator-page-bg)] text-slate-800">
      <Navbar active="programs" />

      <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1100px] pt-2">
          <div className="mb-6 max-w-[620px]">
            <Link href={routes.programs.creatorProgram()} className="inline-flex items-center gap-2 text-sm font-semibold text-primary no-underline hover:underline">
              <span aria-hidden="true" className="text-base text-primary">←</span>
              <span>Creator Program</span>
            </Link>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Application review</p>
            <h1 className="mt-3 text-[42px] font-extrabold leading-[1.02] tracking-[-2px] text-[var(--creator-page-heading)] sm:text-[54px]">Check your application</h1>
            <p className="mt-4 text-[18px] leading-8 text-[var(--creator-page-text-soft)]">
              Review status is shown here after an application is submitted.
            </p>
          </div>

          <section className="overflow-hidden rounded-[8px] border border-[#dfe7ea] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
            <div className="border-b border-[#cfe9dc] bg-[#dff7eb] p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#cfeee1] text-[#1a7d5d] shadow-inner ring-1 ring-[#bde3d0]">
                  <PublicIcon name="verification" className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[28px] font-extrabold tracking-[-1px] text-[#0f172a]">Creator account verified</h2>
                  <p className="mt-2 text-[15px] leading-6 text-slate-600">Your creator profile is currently verified and active.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 bg-white/50 p-5 sm:p-6 md:grid-cols-3">
              <div className="flex min-h-[120px] items-center gap-3 rounded-[6px] border border-[#d6f0e2] bg-[#edf9f2] p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#1a7d5d] shadow-sm ring-1 ring-[#dfeee5]">
                  <PublicIcon name="calendar" className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1a7d5d]">Status</p>
                  <p className="mt-2 text-[15px] font-semibold text-slate-900">Verified</p>
                  <p className="text-[11px] text-slate-600">Creator profile approved</p>
                </div>
              </div>

              <div className="flex min-h-[120px] items-center gap-3 rounded-[6px] border border-[#f3e2c9] bg-[#fff4e6] p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#cc7f20] shadow-sm ring-1 ring-[#f2dcc1]">
                  <PublicIcon name="notification" className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b46e1d]">Access</p>
                  <p className="mt-2 text-[15px] font-semibold text-slate-900">Creator dashboard enabled</p>
                  <p className="text-[11px] text-slate-600">Marketplace tools unlocked</p>
                </div>
              </div>

              <div className="flex min-h-[120px] items-center gap-3 rounded-[6px] border border-[#d6eaf7] bg-[#edf6ff] p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#2f82d0] shadow-sm ring-1 ring-[#d4e8fb]">
                  <PublicIcon name="mail" className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2f82d0]">Note</p>
                  <p className="mt-2 text-[15px] font-semibold text-slate-900">Keep an eye on</p>
                  <p className="text-[11px] text-slate-600">{maskedEmail}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-[#cfe9dc] bg-[#dff7eb] px-5 py-5 text-sm leading-6 text-[#1a7d5d] sm:px-6">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#bfe8d4] text-[#176c4e]">
                <PublicIcon name="info" className="h-3.5 w-3.5" />
              </span>
              <p>
                <span className="font-semibold text-[#0f172a]">Verified account</span>
                <span className="ml-1 text-slate-700">This profile matches the backend verification flag and is active in the marketplace.</span>
              </p>
            </div>
          </section>
        </div>
      </div>

      <PublicFooter />
    </main>
  );
}
