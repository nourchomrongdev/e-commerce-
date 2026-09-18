import Link from "next/link";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import PublicIcon from "@/components/icons/PublicIcon";
import { routes } from "@/lib/routeController";

const categories = [
  ["Templates", "245 items", "▤", "bg-orange-50 text-primary"],
  ["eBooks", "312 items", "▥", "bg-blue-50 text-blue-600"],
  ["Courses", "156 items", "◆", "bg-emerald-50 text-emerald-600"],
  ["UI Kits", "189 items", "▦", "bg-violet-50 text-violet-600"],
  ["Graphics", "278 items", "▧", "bg-pink-50 text-pink-600"],
  ["Themes", "134 items", "●", "bg-teal-50 text-teal-600"],
];

const products = [
  ["Startup Landing Page", "UI Kit", "$24", "from-orange-100 via-white to-orange-200", "STARTUP"],
  ["The Ultimate Design", "eBook", "$15", "from-sky-950 via-blue-900 to-cyan-500", "DESIGN"],
  ["Full Stack Web Dev", "Course", "$49", "from-violet-900 via-slate-900 to-indigo-500", "< />"],
  ["Modern Resume", "Template", "$9", "from-sky-100 via-white to-pink-200", "RESUME"],
  ["Instagram Post Bundle", "Graphics", "$12", "from-pink-700 via-orange-500 to-amber-300", "SOCIAL"],
  ["Business Plan", "Template", "$18", "from-slate-200 via-white to-blue-200", "BUSINESS"],
];

function ProductArt({ tone, label }: { tone: string; label: string }) {
  return <div className={`relative grid aspect-[1.78/1] overflow-hidden rounded-[5px] bg-gradient-to-br ${tone} p-3`}>
    <div className="absolute -right-4 -top-5 h-24 w-24 rounded-full bg-white/45" />
    <div className="relative self-end rounded-md border border-white/50 bg-white/85 p-2 shadow-sm"><span className="text-[9px] font-bold tracking-wide text-heading">{label}</span><span className="mt-1 block h-1 w-16 rounded bg-primary/75" /><span className="mt-1 block h-1 w-10 rounded bg-slate-300" /></div>
  </div>;
}

export default function MarketplacePage() {
  return <div className="min-h-screen bg-[#f8faff]">
    <Navbar active="products" />
    <main className="mx-auto max-w-[1560px] px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-2xl border border-orange-100 bg-[radial-gradient(circle_at_76%_40%,#ffbd76_0,transparent_19%),linear-gradient(110deg,#fffdfb_0%,#fff2e7_55%,#ffe2c5_100%)] px-6 py-8 shadow-sm sm:px-10 md:min-h-[300px] md:py-12">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-[10px] font-bold text-primary">⚡ Digital Products Marketplace</span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-heading sm:text-4xl">Discover, Create &amp; Grow<br />with <span className="text-primary">Digital Products</span></h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">Premium templates, eBooks, courses, graphics and more — all in one place. Start your journey today.</p>
          <div className="mt-5 flex flex-wrap gap-3"><a href="#best-sellers" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-bold text-white shadow-[0_8px_18px_rgba(245,126,31,.24)] hover:bg-primary-hover">Explore Products <span>→</span></a><Link href={routes.programs.creatorProgram()} className="rounded-lg border border-orange-300 bg-white/80 px-5 py-3 text-xs font-bold text-primary hover:bg-white">Become a Creator</Link></div>
        </div>
        <div aria-hidden="true" className="absolute bottom-0 right-5 hidden h-full w-[47%] min-[800px]:block">
          <div className="absolute bottom-8 right-[25%] h-36 w-56 -rotate-3 rounded-xl border-[7px] border-slate-800 bg-gradient-to-br from-slate-700 to-slate-950 shadow-2xl"><div className="m-5 text-center text-lg font-extrabold tracking-wider text-primary">K</div><div className="mx-5 h-1.5 rounded bg-white/30" /></div>
          <div className="absolute bottom-2 right-[12%] h-14 w-60 rounded-b-3xl bg-slate-400 shadow-xl" />
          {["Ps", "P", "</>", "X"].map((tile, index) => <span key={tile} className={`absolute grid h-14 w-14 place-items-center rounded-xl text-base font-bold text-white shadow-lg ${["right-[55%] top-10 -rotate-6 bg-blue-700", "right-[30%] top-7 rotate-6 bg-orange-500", "right-[7%] top-10 rotate-3 bg-violet-600", "right-[1%] top-[44%] -rotate-6 bg-emerald-600"][index]}`}>{tile}</span>)}
          <div className="absolute bottom-7 right-[1%] h-24 w-28 rotate-6 rounded bg-[#5a261b] shadow-lg" /><div className="absolute bottom-16 right-[4%] h-3 w-36 rotate-6 bg-white/80" />
        </div>
        <div className="relative z-10 mt-7 grid gap-3 border-t border-white/70 pt-4 sm:grid-cols-3 sm:gap-0 sm:pt-3"><Benefit icon="⚡" title="Instant Download" detail="Get your files right away" /><Benefit icon="◈" title="Secure & Safe" detail="DRM protected purchases" /><Benefit icon="✿" title="Fair & Trusted" detail="Verified creators & reviews" /></div>
      </section>

      <SectionHead title="Categories" link="View all" />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{categories.map(([name, count, icon, style]) => <Link href="#best-sellers" key={name} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"><span className={`grid h-11 w-11 place-items-center rounded-xl text-lg ${style}`}>{icon}</span><span><b className="block text-xs text-heading">{name}</b><small className="mt-1 block text-[10px] text-muted">{count}</small></span><span className="ml-auto text-primary">›</span></Link>)}</section>

      <SectionHead title="Best Sellers" link="View all" />
      <section id="best-sellers" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{products.map(([name, type, price, tone, label]) => <Link href={`/marketplace/TestStore/${name.toLowerCase().replaceAll(" ", "-")}`} key={name} className="group rounded-xl border border-border bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"><ProductArt tone={tone} label={label} /><span className="mt-3 inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-semibold text-primary">{type}</span><h2 className="mt-1 truncate text-xs font-bold text-heading">{name}</h2><p className="mt-1 text-[10px] text-muted">by <span className="font-medium text-primary">TestStore</span></p><div className="mt-2 flex items-end justify-between"><span><b className="text-sm text-heading">{price}</b><small className="mt-1 block text-[10px] text-amber-500">★ 4.8 <span className="text-muted">(124)</span></small></span><span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-white"><PublicIcon name="shopping-cart" className="h-3.5 w-3.5" /></span></div></Link>)}</section>
    </main>
    <PublicFooter />
  </div>;
}

function Benefit({ icon, title, detail }: { icon: string; title: string; detail: string }) { return <div className="flex items-center gap-3 rounded-lg bg-white/55 px-3 py-2 sm:rounded-none sm:border-r sm:border-orange-100 last:border-0"><span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm text-primary shadow-sm">{icon}</span><span><b className="block text-[10px] text-heading">{title}</b><small className="block text-[9px] text-muted">{detail}</small></span></div>; }
function SectionHead({ title, link }: { title: string; link: string }) { return <div className="mt-7 mb-3 flex items-center justify-between"><h2 className="border-l-[3px] border-primary pl-2 text-base font-bold text-heading">{title}</h2><a href="#best-sellers" className="text-[10px] font-bold text-primary">{link} →</a></div>; }
