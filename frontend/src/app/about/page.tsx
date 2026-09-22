import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";

const team = [
  ["LS", "Lim Sokmeng", "Team Leader", "Leading the team and keeping our marketplace focused and useful.", "/images/limsokmeng.png"],
  ["NC", "Nour Chomrong", "Member", "Helping build reliable digital product experiences for creators and buyers.", "/images/nourchomrong.jpg"],
  ["CT", "Chhouy Theary", "Member", "Supporting clear, thoughtful experiences across the marketplace.", "/images/chhouytheary.jpg"],
  ["HS", "Hour Sivchhing", "Member", "Helping make product discovery and delivery easier to use.", "/images/hoursivchhing.jpg"],
  ["CK", "Cheat Kimhong", "Member", "Contributing to dependable tools and better creator support.", "/images/cheatkimhong.jpg"],
  ["OL", "Ouen Lihor", "Member", "Helping the team turn useful ideas into practical products.", "/images/ouenlihor.jpg"],
];

const capabilities = [
  ["01", "Discover", "Find templates, courses, graphics, and tools made for real work."],
  ["02", "Purchase", "Review formats, licences, versions, and pricing before you commit."],
  ["03", "Keep access", "Return to your library for downloads, licences, and eligible updates."],
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7fb] text-[#142b4d]">
      <Navbar active={null} />
      <section className="relative border-b border-[#e5eaf3] bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">About KhmerDigital</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.04] tracking-[-0.03em] text-[#10264b] sm:text-6xl">Digital work deserves a better home.</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#61738f] sm:text-lg">KhmerDigital helps independent creators turn useful digital work into products people can discover, trust, and use. Buyers get a clearer path from idea to download.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/marketplace" className="inline-flex items-center rounded-md bg-primary px-5 py-3 text-xs font-bold text-white no-underline shadow-sm transition hover:bg-primary-hover">Explore products</Link><Link href="/contact-us" className="inline-flex items-center rounded-md border border-[#d9e1ed] bg-white px-5 py-3 text-xs font-bold text-[#18345d] no-underline transition hover:border-primary hover:text-primary">Talk to our team</Link></div>
          </div>
          <div className="relative min-h-[300px] overflow-hidden rounded-[28px] bg-[#102b55] p-6 text-white shadow-[0_20px_60px_rgba(16,43,85,0.18)] sm:min-h-[360px] sm:p-8"><div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-[22px] border-[#ff8a35]/30" /><div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#ff8a35]" /><div className="relative flex h-full flex-col justify-between"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[#b9cae4]"><span>Since 2026</span><span>KH / DIGITAL</span></div><div><p className="max-w-xs text-3xl font-extrabold leading-tight sm:text-4xl">Make useful things easier to find.</p><p className="mt-4 max-w-sm text-sm leading-6 text-[#d7e2f1]">A marketplace for creators, teams, students, and growing businesses.</p></div></div></div>
        </div>
      </section>
      <section className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:px-10"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">The experience</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#10264b]">From discovery to delivery.</h2></div><p className="max-w-md text-sm leading-6 text-[#61738f]">Everything is designed to make the important details visible before a buyer clicks download.</p></div><div className="mt-8 grid gap-4 md:grid-cols-3">{capabilities.map(([number, title, description]) => <div key={number} className="border-t-2 border-primary bg-white p-5 shadow-[0_8px_24px_rgba(20,43,77,0.05)]"><span className="text-xs font-black text-primary">{number}</span><h3 className="mt-8 text-lg font-extrabold text-[#10264b]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#61738f]">{description}</p></div>)}</div></section>
      <section className="border-y border-[#e5eaf3] bg-white"><div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:px-10"><div className="text-center"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">People behind the platform</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#10264b] sm:text-4xl">Our team</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#61738f]">Meet the people helping KhmerDigital make digital products easier to discover and use.</p></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{team.map(([initials, name, role, description, image], index) => <article key={name} className="group overflow-hidden border border-[#e2e8f1] bg-[#f8faff] transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"><div className={`relative grid aspect-[1.05/1] place-items-center overflow-hidden bg-gradient-to-br ${index % 2 === 0 ? "from-[#dbeafe] to-[#8db7e7]" : "from-[#ffe0c5] to-[#ff9c55]"}`}>{image ? <Image src={image} alt={`${name}, ${role}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" /> : <span className="grid h-24 w-24 place-items-center rounded-full border-8 border-white/60 bg-white/75 text-2xl font-black text-[#18345d] shadow-sm">{initials}</span>}</div><div className="p-5"><h3 className="font-extrabold text-[#10264b]">{name}</h3><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{role}</p><p className="mt-3 text-xs leading-5 text-[#61738f]">{description}</p></div></article>)}</div></div></section>
      <section className="mx-auto grid max-w-[1180px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-10"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">What we stand for</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#10264b]">Useful beats noisy.</h2><p className="mt-4 text-sm leading-7 text-[#61738f]">We believe a marketplace should earn trust through clarity: honest product information, visible licences, dependable access, and support that respects people’s time.</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="border-l-2 border-primary bg-white p-5"><h3 className="font-extrabold text-[#10264b]">For creators</h3><p className="mt-2 text-sm leading-6 text-[#61738f]">Storefronts, files, previews, versions, orders, and a professional way to share your work.</p></div><div className="border-l-2 border-[#8db7e7] bg-white p-5"><h3 className="font-extrabold text-[#10264b]">For buyers</h3><p className="mt-2 text-sm leading-6 text-[#61738f]">Clear product details, secure delivery, purchase history, licences, and eligible lifetime updates.</p></div></div></section>
      <PublicFooter />
    </main>
  );
}
