import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-slate-800">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-3xl border border-accent-light bg-white p-8 shadow-[0_20px_50px_rgba(255,103,0,0.08)] sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            About Marketplace
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Digital products, made easy.
          </h1>
          <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
            MarketPlace connects customers with quality digital products from talented creators.
            We help sellers launch, showcase, and deliver premium downloads while giving buyers a
            trusted, seamless shopping experience.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["10K+", "Products sold"],
              ["2K+", "Verified creators"],
              ["99.9%", "Secure delivery"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-gradient-to-br from-accent-light to-white p-5 ring-1 ring-accent-light">
                <div className="text-2xl font-bold text-primary">{value}</div>
                <div className="mt-2 text-sm text-slate-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
