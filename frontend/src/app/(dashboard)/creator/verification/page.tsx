"use client";

import { useState, type FormEvent } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import { Badge, Button, InputText, Modal, Textarea } from "@/components/ui";

const benefits = [
  {
    title: "Higher Trust",
    description: "Show verified badge to customers",
    icon: "verified",
    tone: "bg-orange-50 text-primary",
  },
  {
    title: "More Sales",
    description: "Increase conversion rates",
    icon: "up",
    tone: "bg-orange-50 text-primary",
  },
  {
    title: "Priority Support",
    description: "Get faster help",
    icon: "user",
    tone: "bg-orange-50 text-primary",
  },
  {
    title: "More Features",
    description: "Access exclusive tools",
    icon: "settings",
    tone: "bg-orange-50 text-primary",
  },
];

const steps = [
  ["Submit Business Information", "Provide store and owner details"],
  ["Upload Required Documents", "Identity and business verification"],
  ["Review Process", "Our team will review your application"],
  ["Get Verified", "Receive your verified badge"],
];

export default function CreatorVerificationPage() {
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApplicationOpen(false);
    setSubmitted(true);
  };

  return (
    <div className="mx-auto w-full max-w-[1120px]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-50 text-primary">
            <PublicIcon name="verification" className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">
              Verification
            </h1>
            <p className="mt-1 text-sm text-muted">
              Verify your creator account for more trust and benefits.
            </p>
          </div>
        </div>
        <Badge tone={submitted ? "warning" : "neutral"}>
          {submitted ? "Application under review" : "Not verified"}
        </Badge>
      </header>

      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="rounded-2xl border border-verification-border bg-gradient-to-br from-verification-surface to-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary bg-orange-50 text-white shadow-sm">
              <img src="/icons/verified.svg" alt="Verified badge" className="h-7 w-7" />
            </span>
            <div>
              <h2 className="text-base font-bold text-ink">
                Become a Verified Creator
              </h2>
              <p className="mt-1 max-w-lg text-xs leading-5 text-muted">
                Confirm your identity as a creator to build trust and unlock
                more opportunities across the marketplace.
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setApplicationOpen(true)}
                disabled={submitted}
              >
                {submitted ? "Application Submitted" : "Apply for Verification"}
              </Button>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
            Creator account status
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span
              className={`grid h-10 w-10 place-items-center rounded-full ${submitted ? "bg-amber-50 text-status-warning" : "bg-slate-100 text-slate-500"}`}
            >
              <PublicIcon
                name={submitted ? "up" : "verification"}
                className="h-5 w-5"
              />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                {submitted ? "Under review" : "Not verified"}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-soft">
                {submitted
                  ? "We will contact you soon"
                  : "Start your application today"}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-bold text-ink">Verification Benefits</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-xl border border-divider p-4"
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg ${benefit.tone}`}
              >
                <PublicIcon
                  name={benefit.icon as "verified"}
                  className="h-4 w-4"
                />
              </span>
              <h3 className="mt-3 text-xs font-semibold text-body">
                {benefit.title}
              </h3>
              <p className="mt-1 text-[10px] text-muted-soft">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-bold text-ink">Verification Steps</h2>
        <div className="mt-5 space-y-4">
          {steps.map(([title, description], index) => (
            <div key={title} className="flex items-start gap-3">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${index === 0 ? "bg-primary text-white" : "bg-divider text-muted"}`}
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-xs font-semibold text-body">{title}</h3>
                <p className="mt-0.5 text-[10px] text-muted-soft">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2.5 text-[10px] text-verification-text">
          <PublicIcon name="notification" className="h-3.5 w-3.5 shrink-0" />
          Usually takes 1-3 business days for verification review.
        </div>
      </section>

      <Modal
        open={applicationOpen}
        title="Verify creator account"
        onClose={() => setApplicationOpen(false)}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setApplicationOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit" form="verification-form">
              Submit application
            </Button>
          </>
        }
      >
        <p className="text-xs text-muted">
          Submit your details so our team can verify your creator account.
        </p>
        <form
          id="verification-form"
          onSubmit={submitApplication}
          className="mt-5 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InputText
              aria-label="Creator full name"
              placeholder="Creator full name"
              required
            />
            <InputText
              aria-label="Account email"
              type="email"
              placeholder="Account email"
              required
            />
          </div>
          <label
            htmlFor="creator-document"
            className="block text-xs font-medium text-body"
          >
            Identity document
            <input
              id="creator-document"
              type="file"
              accept="image/*,.pdf"
              className="mt-2 block w-full rounded-lg border border-border-control bg-white px-3 py-2.5 text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary"
              required
            />
            <span className="mt-1 block text-[11px] font-normal text-muted-light">
              Upload a government-issued ID or business document.
            </span>
          </label>
          <Textarea
            aria-label="Creator details"
            placeholder="Tell us about your creator account and products"
            required
          />
          <p className="text-[10px] leading-4 text-muted-soft">
            By submitting, you confirm that the information provided is accurate
            and belongs to you.
          </p>
        </form>
      </Modal>
    </div>
  );
}
