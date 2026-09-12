import Link from "next/link";
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
  return (
    <main className="min-h-screen bg-background text-body">
      <Navbar active="programs" />
      <div className="mx-auto max-w-[1120px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden border-b border-divider pb-10 pt-4 sm:pb-14 sm:pt-8">
          <div className="relative z-10 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Creator program</p>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-light text-primary">
                <PublicIcon name="store" className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-soft">Marketplace</p>
                <p className="text-sm font-bold text-ink">For digital creators</p>
              </div>
            </div>
            <h1 className="mt-6 text-3xl font-black leading-tight tracking-[-0.04em] text-heading sm:text-5xl">
              Share your knowledge.<br />
              Earn from your work.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
              Apply to sell digital products through a creator storefront with product management, checkout, and delivery tools.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={routes.auth.login()} className="no-underline">
                <Button type="button" size="sm">Apply to become a creator</Button>
              </Link>
              <Link href={routes.programs.creatorProgramReview()} className="no-underline">
                <Button type="button" size="sm" variant="secondary">Review application</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 border-b border-divider pb-8 sm:pb-10">
          <h2 className="text-xl font-bold text-heading">Why become a creator?</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {benefits.map(([icon, title, description]) => (
              <article key={title} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-light text-sm font-bold text-primary">
                  {icon === "verified" ? "✓" : icon === "dollar" ? "$" : icon === "shopping-cart" ? "▣" : "↗"}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-body-strong">{title}</h3>
                <p className="mt-1 text-[11px] leading-5 text-muted">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 pb-4">
          <h2 className="text-xl font-bold text-heading">How it works</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {process.map(([step, description], index) => (
              <div key={step} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-white">{index + 1}</span>
                <p className="mt-3 text-sm font-semibold text-body-strong">{step}</p>
                <p className="mt-2 text-[11px] leading-5 text-muted">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <PublicFooter />
    </main>
  );
}
