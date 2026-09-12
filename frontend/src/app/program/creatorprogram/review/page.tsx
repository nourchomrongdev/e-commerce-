"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import PublicIcon from "@/components/icons/PublicIcon";
import { Button } from "@/components/ui";
import { routes } from "@/lib/routeController";

type Application = { status: string; submittedAt: string };

export default function CreatorProgramReviewPage() {
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("creator-program-application");
    if (stored) {
      try {
        setApplication(JSON.parse(stored) as Application);
      } catch {
        window.localStorage.removeItem("creator-program-application");
      }
    }
  }, []);

  const submittedDate = application ? new Date(application.submittedAt).toLocaleDateString() : null;

  return (
    <main className="min-h-screen bg-[#f5f5fb] text-body">
      <Navbar active="programs" />
      <div className="mx-auto max-w-[760px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href={routes.programs.creatorProgram()} className="text-xs font-semibold text-primary no-underline hover:underline">← Creator Program</Link>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Application review</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading">Check your application</h1>
          <p className="mt-2 text-sm text-muted">Review status is shown here after an application is submitted.</p>
        </div>

        {application ? (
          <section className="border-y border-emerald-300 bg-emerald-50/60 py-6 sm:py-8">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-emerald-600"><PublicIcon name="verified" className="h-6 w-6" /></span>
              <div>
                <h2 className="text-lg font-bold text-emerald-950">Application received</h2>
                <p className="mt-1 text-sm text-emerald-800">Your creator application is currently under review.</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 px-1 py-3 text-xs"><span className="text-muted">Status</span><strong className="text-body-strong">{application.status}</strong></div>
              <div className="flex items-center justify-between border-b border-emerald-200 px-1 py-3 text-xs"><span className="text-muted">Submitted</span><strong className="text-body-strong">{submittedDate}</strong></div>
            </div>
            <p className="mt-5 text-xs leading-5 text-emerald-800">Keep an eye on the email address used in your application for the next update.</p>
          </section>
        ) : (
          <section className="border-y border-[#e2e2ed] py-6 sm:py-8">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-light text-primary"><PublicIcon name="store" className="h-6 w-6" /></span>
              <div>
                <h2 className="text-lg font-bold text-heading">No application found</h2>
                <p className="mt-1 text-sm leading-6 text-muted">Submit a creator application first, then return here to review its status.</p>
              </div>
            </div>
            <Link href={routes.programs.creatorProgramApply()} className="mt-6 inline-flex no-underline"><Button size="sm">Start an application</Button></Link>
          </section>
        )}
      </div>
      <PublicFooter />
    </main>
  );
}
