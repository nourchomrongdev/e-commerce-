"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import PublicIcon from "@/components/icons/PublicIcon";
import { Button } from "@/components/ui";
import { routes } from "@/lib/routeController";

type Application = { status: string; submittedAt: string };

const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";

export default function CreatorProgramReviewPage() {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userVerified, setUserVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");

    if (!token) {
      const next = encodeURIComponent(routes.programs.creatorProgramReview());
      router.replace(`${routes.auth.login()}?next=${next}`);
      setIsLoading(false);
      return;
    }

    const loadUserEmail = async () => {
      let foundEmail = "";

      try {
        const stored = window.localStorage.getItem("creator-program-application");
        if (stored) {
          try {
            setApplication(JSON.parse(stored) as Application);
          } catch {
            window.localStorage.removeItem("creator-program-application");
          }
        }

        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          window.localStorage.removeItem("marketplace-token");
          window.localStorage.removeItem("marketplace-user");
          window.localStorage.removeItem("current-user");
          const next = encodeURIComponent(routes.programs.creatorProgramReview());
          router.replace(`${routes.auth.login()}?next=${next}`);
          return;
        }

        const result = await response.json();
        foundEmail = result?.user?.email || "";
        setUserVerified(Boolean(result?.user?.isVerified));

        if (!foundEmail) {
          const candidates = ["marketplace-user", "current-user"];
          for (const key of candidates) {
            const raw = window.localStorage.getItem(key);
            if (!raw) continue;

            try {
              const parsed = JSON.parse(raw);
              foundEmail = parsed?.email || parsed?.user?.email || "";
              if (foundEmail) break;
            } catch {
              continue;
            }
          }
        }

        if (foundEmail) {
          setUserEmail(foundEmail);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserEmail();
  }, []);

  const submittedDate = application ? new Date(application.submittedAt).toLocaleDateString() : null;
  const maskedEmail = userEmail ? userEmail.replace(/(^.).*(@.*$)/, "$1******$2") : "";
  const isVerifiedState = userVerified && !application;

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

          {isLoading ? (
            <div className="mt-4 flex items-center gap-3 py-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--creator-page-border)] border-t-primary" aria-label="Loading application" />
              <p className="text-[18px] font-semibold text-[var(--creator-page-heading)]">Checking your application...</p>
            </div>
          ) : userVerified ? (
            <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,29,60,0.04)]">
              <div className="border-b border-emerald-200 bg-emerald-50 p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 shadow-inner ring-1 ring-emerald-200">
                    <PublicIcon name="verification" className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[28px] font-extrabold tracking-[-1px] text-emerald-900">Creator account verified</h2>
                    <p className="mt-2 text-[15px] leading-6 text-slate-600">Your creator profile is currently verified and active.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 bg-white/50 p-5 sm:p-6 md:grid-cols-3">
                <div className="flex min-h-[120px] items-center gap-3 rounded-[16px] border border-emerald-100 bg-emerald-50/60 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200">
                    <PublicIcon name="calendar" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">Status</p>
                    <p className="mt-2 text-[15px] font-semibold text-slate-900">Verified</p>
                    <p className="text-[11px] text-slate-600">Creator profile approved</p>
                  </div>
                </div>

                <div className="flex min-h-[120px] items-center gap-3 rounded-[16px] border border-amber-100 bg-amber-50/70 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-amber-600 shadow-sm ring-1 ring-amber-200">
                    <PublicIcon name="notification" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">Access</p>
                    <p className="mt-2 text-[15px] font-semibold text-slate-900">Creator dashboard enabled</p>
                    <p className="text-[11px] text-slate-600">Marketplace tools unlocked</p>
                  </div>
                </div>

                <div className="flex min-h-[120px] items-center gap-3 rounded-[16px] border border-sky-100 bg-sky-50/70 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-sky-600 shadow-sm ring-1 ring-sky-200">
                    <PublicIcon name="mail" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">Note</p>
                    <p className="mt-2 text-[15px] font-semibold text-slate-900">Keep an eye on</p>
                    {maskedEmail ? <p className="text-[11px] text-slate-600">{maskedEmail}</p> : null}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-emerald-200 bg-emerald-100/50 px-5 py-5 text-sm leading-6 text-emerald-900 sm:px-6">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-200 text-emerald-800">
                  <PublicIcon name="info" className="h-3.5 w-3.5" />
                </span>
                <p>
                  <span className="font-semibold text-emerald-950">Verified account</span>
                  <span className="ml-1">This profile matches the backend verification flag and is active in the marketplace.</span>
                </p>
              </div>
            </section>
          ) : application ? (
            <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,29,60,0.04)]">
              <div className="border-b border-amber-200 bg-amber-50 p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700 shadow-inner ring-1 ring-amber-200">
                    <PublicIcon name="verification" className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[28px] font-extrabold tracking-[-1px] text-amber-900">Application received</h2>
                    <p className="mt-2 text-[15px] leading-6 text-slate-600">Your creator application is currently under review.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 bg-white/40 p-5 sm:p-6 md:grid-cols-3">
                <div className="flex min-h-[120px] items-center gap-3 rounded-[16px] border border-slate-200 bg-white/70 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 shadow-sm ring-1 ring-slate-200">
                    <PublicIcon name="calendar" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Submitted</p>
                    <p className="mt-2 text-[15px] font-semibold text-slate-900">{submittedDate}</p>
                    <p className="text-[11px] text-slate-600">Application created</p>
                  </div>
                </div>

                <div className="flex min-h-[120px] items-center gap-3 rounded-[16px] border border-amber-200 bg-amber-100/60 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-amber-600 shadow-sm ring-1 ring-amber-200">
                    <PublicIcon name="notification" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">Status</p>
                    <p className="mt-2 text-[15px] font-semibold text-slate-900">{application.status}</p>
                    <p className="text-[11px] text-slate-600">Waiting for review</p>
                  </div>
                </div>

                <div className="flex min-h-[120px] items-center gap-3 rounded-[16px] border border-sky-200 bg-sky-50/80 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-sky-600 shadow-sm ring-1 ring-sky-200">
                    <PublicIcon name="mail" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">Note</p>
                    <p className="mt-2 text-[15px] font-semibold text-slate-900">Keep an eye on</p>
                    {maskedEmail ? <p className="text-[11px] text-slate-600">{maskedEmail}</p> : null}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-amber-200 bg-amber-100/60 px-5 py-5 text-sm leading-6 text-amber-900 sm:px-6">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-200 text-amber-800">
                  <PublicIcon name="info" className="h-3.5 w-3.5" />
                </span>
                <p>
                  <span className="font-semibold text-amber-950">What happens next?</span>
                  <span className="ml-1">Our team will review your application. You will receive an email notification once there are updates.</span>
                </p>
              </div>
            </section>
          ) : (
            <section className="rounded-[22px] border border-[var(--creator-review-border)] bg-[var(--creator-page-bg)] p-6 shadow-[0_12px_32px_rgba(15,29,60,0.04)] sm:p-8">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--creator-page-bg)] text-primary">
                  <PublicIcon name="store" className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-[28px] font-extrabold tracking-[-1px] text-[var(--creator-page-ink)]">No application found</h2>
                  <p className="mt-2 text-[16px] leading-7 text-slate-500">
                    Submit a creator application first, then return here to review its status.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Link href={routes.programs.creatorProgramApply()} className="inline-flex no-underline">
                  <Button size="sm" className="!px-5 !py-3 !text-[12px] !font-semibold">Start an application</Button>
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
