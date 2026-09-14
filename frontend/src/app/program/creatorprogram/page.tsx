"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import PublicIcon from "@/components/icons/PublicIcon";
import { Button } from "@/components/ui";
import { routes } from "@/lib/routeController";

const benefits = [
  ["verified", "Build trust", "Create a polished storefront buyers can recognize."],
  ["dollar", "Earn more", "Turn your expertise into digital product income."],
  ["shopping-cart", "Reach buyers", "Share your products with marketplace customers."],
  ["up", "Grow smarter", "Use product, order, and storefront tools together."],
];

const process = [
  ["Apply", "Tell us about your work and the digital products you want to offer."],
  ["Create your storefront", "Set up your profile, brand, storefront details, and customer experience."],
  ["Upload products", "Add files, previews, pricing, and license information for each product."],
  ["Start selling", "Share your storefront, manage orders, and grow your digital product business."],
];

export default function CreatorProgramPage() {
  const router = useRouter();
  const [lockedForExistingUser, setLockedForExistingUser] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");
    if (!token) {
      setLockedForExistingUser(false);
      return;
    }

    const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";

    fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (response) => {
      if (!response.ok) throw new Error("Unauthorized");
      const result = await response.json();
      const user = result.user ?? {};
      const hasExistingCreatorApplication = Boolean(window.localStorage.getItem("creator-program-application"));
      const isAlreadyCreator = user.role === "creator";
      const shouldLock = Boolean(isAlreadyCreator || hasExistingCreatorApplication);
      setLockedForExistingUser(shouldLock);
    }).catch(() => {
      setLockedForExistingUser(false);
    });
  }, [router]);

  const requireLoginBeforeNavigation = (event: MouseEvent<HTMLAnchorElement>, destination: string) => {
    if (window.localStorage.getItem("marketplace-token")) return;

    event.preventDefault();
    sessionStorage.setItem("creator-login-message", "Please log in or register an account to apply for a creator program.");
    router.push(`${routes.auth.login()}?next=${encodeURIComponent(destination)}`);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--creator-page-bg)] text-slate-800">
      <Navbar active="programs" />
      <div className="mx-auto max-w-[1120px] px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden pb-10 pt-8 sm:pb-14 sm:pt-10">
          <div className="relative z-10 max-w-3xl px-0 sm:px-0 lg:px-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Marketplace</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl border border-[var(--creator-page-action-ring)] bg-white text-primary shadow-[0_0_0_1px_rgba(245,126,31,0.08)]">
                <PublicIcon name="store" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">For digital creators</p>
              </div>
            </div>
            <h1 className="mt-6 text-[42px] font-extrabold leading-[1.02] tracking-[-2px] text-[var(--creator-page-ink)] sm:text-[54px] lg:text-[60px]">
              Share your knowledge.
              <span className="mt-2 block">Earn from your work.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[13px] leading-5 text-slate-600 sm:text-[15px]">
              Apply to sell digital products through a creator storefront with product management, checkout, and delivery tools.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {!lockedForExistingUser && (
                <Link
                  href={routes.programs.creatorProgramApply()}
                  onClick={(event) => requireLoginBeforeNavigation(event, routes.programs.creatorProgramApply())}
                  className="no-underline"
                >
                  <Button type="button" size="sm" className="!px-5 !py-3 !text-[12px] !font-semibold">Apply to become a creator</Button>
                </Link>
              )}
              <Link
                href={routes.programs.creatorProgramReview()}
                onClick={(event) => requireLoginBeforeNavigation(event, routes.programs.creatorProgramReview())}
                className="no-underline"
              >
                <Button type="button" size="sm" variant={lockedForExistingUser ? "primary" : "secondary"} className="!px-5 !py-3 !text-[12px] !font-semibold">{lockedForExistingUser ? "View application" : "Review application"}</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12 border-b border-slate-200 pb-10">
          <h2 className="text-2xl font-extrabold text-[var(--creator-page-ink)]">Why become a creator?</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {benefits.map(([icon, title, description]) => (
              <article key={title} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,.04)]">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--creator-page-action-bg)] text-lg font-bold text-primary">
                  {icon === "verified" ? "✓" : icon === "dollar" ? "$" : icon === "shopping-cart" ? "▣" : "↗"}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--creator-page-ink)]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 pb-4">
          <h2 className="text-2xl font-extrabold text-[var(--creator-page-ink)]">How it works</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {process.map(([step, description], index) => (
              <div key={step} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,.04)]">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-white">{index + 1}</span>
                <p className="mt-4 text-lg font-semibold text-[var(--creator-page-ink)]">{step}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <PublicFooter />
    </main>
  );
}
