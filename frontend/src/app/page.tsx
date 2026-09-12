import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import type { Metadata } from "next";
import { routes } from "@/lib/routeController";
export const metadata: Metadata = { title: "MarketPlace | Digital Products" };
const categories = [
  ["▦", "Templates", "UI, web and docs", "bg-orange-50 text-primary"],
  ["✦", "Graphics", "Icons and assets", "bg-blue-50 text-blue-600"],
  ["♫", "Music", "Audio and tracks", "bg-violet-50 text-violet-600"],
  ["▤", "E-books", "Books and guides", "bg-emerald-50 text-emerald-600"],
  ["♜", "Courses", "Learn and grow", "bg-amber-50 text-amber-600"],
  ["⌘", "Software", "Tools and apps", "bg-sky-50 text-sky-600"],
];
const features = [
  ["⌕", "Discover", "Explore products made to help you create and ship faster.", "bg-orange-50 text-primary"],
  ["✎", "Create", "Build your own digital products with powerful tools.", "bg-indigo-50 text-indigo-600"],
  ["▣", "Organize", "Keep files, projects and licenses easy to find.", "bg-sky-50 text-sky-600"],
];
export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-slate-800">
      <Navbar />
      <div className="w-full px-4 pb-8 sm:px-8 lg:px-[5%]">
        <HeroSection />
        <section className="mt-10 grid gap-8 border-b border-slate-100 pb-10 lg:grid-cols-[.8fr_2fr] lg:items-end">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[.18em] text-primary">Key features</p>
              <h2 className="mt-1 text-xl font-extrabold leading-tight text-[#09234a] sm:text-2xl">Everything you need in one platform</h2>
              <p className="mt-2 max-w-md text-[10px] leading-4 text-slate-500">Create, manage and share your digital content in one simple place.</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {features.map(([icon, title, text, color]) => (
              <a key={title} href={routes.digitalProducts()} className={`group min-h-[126px] border border-slate-200 p-4 no-underline shadow-sm transition hover:border-primary hover:shadow-md ${color}`}>
                <span className="grid h-7 w-7 place-items-center rounded-md bg-white text-sm shadow-sm">{icon}</span>
                <b className="mt-3 block text-sm text-[#09234a]">{title}</b>
                <p className="mt-1 text-[9px] leading-4 text-slate-500">{text}</p>
              </a>
            ))}
          </div>
        </section>
        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
            <p className="text-[8px] font-bold uppercase tracking-[.18em] text-primary">Categories</p>
              <h2 className="mt-1 text-xl font-extrabold text-[#09234a]">Explore by category</h2>
            </div>
            <a href={routes.marketplace()} className="text-[10px] font-semibold text-primary no-underline">View all →</a>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(([icon, title, subtitle, color]) => (
            <a
              href={routes.marketplace()}
              key={title}
              className="flex min-h-[72px] items-center gap-3 border border-slate-200 bg-white px-3 py-2 text-left no-underline shadow-sm transition hover:border-primary hover:shadow-md"
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs ${color}`}>
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
          </div>
        </section>
        <section className="relative mt-8 overflow-hidden bg-gradient-to-r from-primary to-[#ff9b42] px-5 py-6 text-white sm:px-8">
          <div className="relative z-10">
            <h2 className="text-lg font-extrabold">Ready to create something great?</h2>
            <p className="mt-1 text-[9px] text-white/80">Join thousands of creators and users already building, learning and achieving more.</p>
            <a href={routes.digitalProducts()} className="mt-3 inline-flex rounded-full bg-white px-4 py-1.5 text-[9px] font-bold text-primary no-underline">Get started →</a>
          </div>
          <span className="absolute -right-8 -top-20 h-48 w-48 rounded-full border-[22px] border-white/15" />
        </section>
      </div>
      <PublicFooter />
    </main>
  );
}
