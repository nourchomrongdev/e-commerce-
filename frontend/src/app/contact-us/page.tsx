import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import { routes } from "@/lib/routeController";

export default function ContactUsPage() {
  return (
    <main className="min-h-screen bg-background text-slate-800">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-3xl border border-accent-light bg-white p-8 text-center shadow-[0_20px_50px_rgba(255,103,0,0.08)] sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Contact Us</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            How can we help?
          </h1>
          <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
            Get in touch with the MarketPlace team for help with products, orders, or your creator account.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:support@marketplace.com"
              className="inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-secondary"
            >
              support@marketplace.com
            </a>
            <a
              href={routes.digitalProducts()}
              className="inline-block rounded-xl border border-accent-soft bg-accent-light px-5 py-3 text-sm font-semibold text-primary no-underline transition hover:bg-accent-soft"
            >
              Browse products
            </a>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
