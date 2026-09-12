"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import PublicIcon from "@/components/icons/PublicIcon";
import { Badge, Button, InputText, Modal, Textarea } from "@/components/ui";
import { routes } from "@/lib/routeController";

const benefits = [
  { title: "Launch your storefront", description: "Open a branded storefront and sell digital products fast.", icon: "store", tone: "bg-orange-50 text-primary" },
  { title: "Earn more", description: "Receive payouts and track sales across your product catalog.", icon: "dollar", tone: "bg-orange-50 text-primary" },
  { title: "Build trust", description: "Use verification badges and creator tools to increase conversion.", icon: "verified", tone: "bg-orange-50 text-primary" },
  { title: "Manage everything", description: "Track licenses, orders, reviews, marketing and product files together.", icon: "settings", tone: "bg-orange-50 text-primary" },
];

const steps = [
  ["Apply", "Tell us a bit about your store and products."],
  ["Review", "Our team checks your creator profile and business details."],
  ["Approval", "Get approved and unlock the creator dashboard."],
  ["Launch", "Start selling and manage your digital products."],
];

export default function BecomeCreatorPage() {
  const router = useRouter();
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");
    const redirectToLogin = () => {
      const next = encodeURIComponent(routes.buyer.creatorProgram());
      router.replace(`${routes.auth.login()}?next=${next}`);
    };

    if (!token) {
      redirectToLogin();
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (response) => {
      if (!response.ok) throw new Error("Unauthorized");
      await response.json();
      setCheckingAuth(false);
    }).catch(() => {
      window.localStorage.removeItem("marketplace-token");
      redirectToLogin();
    });
  }, [router]);

  const submitApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApplicationOpen(false);
    setSubmitted(true);
  };

  if (checkingAuth) {
    return (
      <div className="mx-auto w-full max-w-[1120px] py-10 text-center text-sm text-muted">
        Checking your account access...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1120px]">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-light text-primary">
            <PublicIcon name="store" className="h-7 w-7" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Creator Program</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Become a Creator</h1>
            <p className="mt-1 text-sm text-muted">Turn your buyer account into a selling storefront and grow your digital business.</p>
          </div>
        </div>
        <Badge tone={submitted ? "success" : "neutral"}>
          {submitted ? "Application sent" : "Open application"}
        </Badge>
      </header>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border-control bg-accent-light text-primary shadow-sm">
              <PublicIcon name="store" className="h-7 w-7" />
            </span>
            <div>
              <h2 className="text-base font-bold text-ink">Start selling your digital products</h2>
              <p className="mt-1 max-w-xl text-xs leading-5 text-muted">
                Build your storefront, upload products, manage licenses, and keep your customers happy with a polished creator experience.
              </p>
              <Button size="sm" className="mt-4" onClick={() => setApplicationOpen(true)} disabled={submitted}>
                {submitted ? "Application Submitted" : "Apply for Creator Access"}
              </Button>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-soft">Application status</p>
          <div className="mt-4 flex items-center gap-3">
            <span className={`grid h-10 w-10 place-items-center rounded-full ${submitted ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
              <PublicIcon name={submitted ? "verified" : "store"} className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{submitted ? "Pending review" : "Ready to apply"}</p>
              <p className="mt-0.5 text-[10px] text-muted-soft">{submitted ? "We will review your request shortly." : "Create your creator account in minutes."}</p>
            </div>
          </div>
          <Link href={routes.creator.overview()} className="mt-5 inline-flex items-center text-[10px] font-semibold text-primary no-underline">
            Go to creator dashboard →
          </Link>
        </article>
      </section>

      <section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-bold text-ink">Creator benefits</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="rounded-xl border border-divider bg-surface-control p-4">
              <span className={`grid h-8 w-8 place-items-center rounded-lg ${benefit.tone}`}>
                <PublicIcon name={benefit.icon as any} className="h-4 w-4" />
              </span>
              <h3 className="mt-3 text-xs font-semibold text-body">{benefit.title}</h3>
              <p className="mt-1 text-[10px] text-muted-soft">{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-bold text-ink">How it works</h2>
        <div className="mt-5 space-y-4">
          {steps.map(([title, description], index) => (
            <div key={title} className="flex items-start gap-3">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${index === 0 ? "bg-primary text-white" : "bg-divider text-muted"}`}>
                {index + 1}
              </span>
              <div>
                <h3 className="text-xs font-semibold text-body">{title}</h3>
                <p className="mt-0.5 text-[10px] text-muted-soft">{description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 rounded-lg bg-accent-light px-3 py-2.5 text-[10px] text-primary">
          <PublicIcon name="notification" className="h-3.5 w-3.5 shrink-0" />
          Most creator applications are reviewed within 1-3 business days.
        </div>
      </section>

      <Modal
        open={applicationOpen}
        title="Apply to become a creator"
        onClose={() => setApplicationOpen(false)}
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setApplicationOpen(false)}>Cancel</Button>
            <Button size="sm" type="submit" form="creator-application-form">Submit application</Button>
          </>
        }
      >
        <p className="text-xs text-muted">Tell us about your brand, products, and how you plan to sell on MarketPlace.</p>
        <form id="creator-application-form" onSubmit={submitApplication} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputText aria-label="Full name" placeholder="Full name" required />
            <InputText aria-label="Email address" type="email" placeholder="Email address" required />
          </div>

          <InputText aria-label="Store name" placeholder="Store name" required />

          <InputText aria-label="Website or social link" placeholder="Website or social profile link (optional)" />

          <Textarea aria-label="Business overview" placeholder="Tell us about your business, products, and audience." required rows={5} />

          <div className="rounded-xl border border-divider bg-surface-control p-3">
            <p className="text-[10px] font-medium text-muted-soft">Optional verification details</p>
            <p className="mt-1 text-[10px] text-muted">Share only information needed to review your creator application.</p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
