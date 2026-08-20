import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "MarketPlace | Digital Products" };
const categories = [
  ["♜", "Software", "Tools & Apps", "bg-accent-light text-primary"],
  ["▦", "Templates", "UI, Web, Docs", "bg-accent-soft text-primary"],
  ["✦", "Graphics", "Icons, Assets", "bg-accent-light text-primary"],
  ["▤", "E-Books", "Books & Guides", "bg-accent-soft text-primary"],
  ["♫", "Music", "Audio & Tracks", "bg-accent-light text-primary"],
  ["▧", "Stock Photos", "Images & Photos", "bg-accent-soft text-primary"],
  ["▣", "Video Courses", "Learn & Grow", "bg-accent-light text-primary"],
  ["A", "Fonts", "Typography", "bg-accent-soft text-primary"],
];
const products = [
  [
    "Soft UI Dashboard Pro",
    "Web Templates",
    "4.9 (128)",
    "$24.99",
    "from-[#092d57] via-[#3157a2] to-[#101c53]",
    "▦",
  ],
  [
    "Line Awesome Icons",
    "Icons",
    "4.8 (215)",
    "$9.99",
    "from-[#f5f0ff] to-[#e9e5ff]",
    "✣",
  ],
  [
    "SaaS Landing Page Kit",
    "Web Templates",
    "4.7 (163)",
    "$19.99",
    "from-[#0a123d] via-[#41236d] to-[#111847]",
    "SaaS",
  ],
  [
    "The Design System",
    "E-Books",
    "4.9 (98)",
    "$7.99",
    "from-[#faf5ed] to-[#f0ddd0]",
    "The\nDesign",
  ],
  [
    "Chill Lo-fi Music Pack",
    "Music",
    "4.8 (76)",
    "$14.99",
    "from-[#0c2631] via-[#283d35] to-[#0c1d28]",
    "◕",
  ],
  [
    "Nature Stock Photo Pack",
    "Stock Photos",
    "4.7 (134)",
    "$12.99",
    "from-[#3a6889] via-[#7da4b3] to-[#375644]",
    "⌁",
  ],
];
const stats = [
  ["♧", "10K+", "Happy Customers", "Trustors worldwide"],
  ["♧", "24K+", "Digital Products", "High quality digital products"],
  ["♙", "2K+", "Verified Creators", "Talented creators and developers"],
  ["♢", "99.9%", "Secure Downloads", "DRM protection & secure delivery"],
  ["☆", "4.8/5", "Customer Rating", "Based on thousands of reviews"],
];
export default function Home() {
  return (
    <main className="min-h-screen bg-background text-slate-800">
      <Navbar />
      <div className="mx-auto max-w-[1440px] px-3 pb-5 sm:px-6">
        <HeroSection />
        <section className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-9">
          {categories.map(([icon, title, subtitle, color]) => (
            <a
              href="/marketplace"
              key={title}
              className="flex min-h-[62px] items-center gap-2 rounded-xl border border-slate-100 px-3 py-2 no-underline shadow-[0_2px_7px_rgba(15,23,42,.025)] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs ${color}`}
              >
                {icon}
              </span>
              <span>
                <b className="block whitespace-nowrap text-[9px] text-slate-700">
                  {title}
                </b>
                <small className="block whitespace-nowrap text-[7px] text-slate-400">
                  {subtitle}
                </small>
              </span>
            </a>
          ))}
          <a
            href="/digital-products"
            className="hidden items-center justify-center gap-2 rounded-xl border border-slate-100 text-[9px] font-semibold text-slate-700 no-underline lg:flex"
          >
            View All{" "}
            <span className="text-lg font-light text-slate-400">›</span>
          </a>
        </section>
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-extrabold text-slate-900">
                Featured Products
              </h2>
              <span className="rounded bg-accent-light px-1.5 py-0.5 text-[7px] font-semibold text-primary">
                Handpicked for you
              </span>
            </div>
            <a
              href="/digital-products"
              className="text-[9px] font-semibold text-primary no-underline"
            >
              View all products　›
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {products.map(([name, type, rating, price, background, art]) => (
              <article key={name} className="min-w-0">
                <div
                  className={`relative grid h-[105px] place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${background} p-3 shadow-sm`}
                >
                  <span className="whitespace-pre-line text-center text-[18px] font-bold leading-none text-white/90">
                    {art}
                  </span>
                  <button className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-xs text-primary">
                    ♡
                  </button>
                </div>
                <b className="mt-2 block truncate text-[10px] text-slate-700">
                  {name}
                </b>
                <small className="block text-[8px] text-slate-400">
                  {type}
                </small>
                <div className="mt-1 flex items-center justify-between">
                  <small className="text-[8px] text-slate-500">
                    <span className="text-[#ff9c1a]">★</span> {rating}
                  </small>
                  <b className="text-[9px] text-[#ff681c]">{price}</b>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="mt-6 grid divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_5px_16px_rgba(15,23,42,.06)] sm:grid-cols-5 sm:divide-x sm:divide-y-0 sm:px-5">
          {stats.map(([icon, number, title, subtitle]) => (
            <div key={title} className="flex items-center gap-3 px-3 py-2">
              <span className="text-2xl text-[#ff681c]">{icon}</span>
              <span>
                <b className="block text-[13px] text-[#09234a]">{number}</b>
                <strong className="block text-[8px] text-slate-600">
                  {title}
                </strong>
                <small className="block text-[7px] text-slate-400">
                  {subtitle}
                </small>
              </span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
