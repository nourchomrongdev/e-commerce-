  ["Admin", "/admin", "Manage users, moderation, orders, licenses, and analytics.", "⌘", "from-secondary to-primary"],
import Link from "next/link";
import { routes } from "@/lib/routeController";

const roles = [
  ["Admin", routes.admin.dashboard(), "Manage users, moderation, orders, licenses, and analytics.", "⌘", "from-secondary to-primary"],
  ["Creator", routes.creator.overview(), "Manage your storefront, products, earnings, and payouts.", "✦", "from-secondary to-primary"],
  ["Buyer", routes.buyer.dashboard(), "Access purchases, downloads, licenses, and reviews.", "◈", "from-cyan-500 to-blue-600"],
];

export default function RoleLanding() {
  return <main className="min-h-screen bg-background p-5 text-[#111b40] sm:p-10"><section className="mx-auto max-w-6xl"><Link href={routes.home()} className="flex w-fit items-center gap-2 text-xl font-bold no-underline text-[#111b40]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">♜</span>MarketPlace</Link><p className="mt-16 text-sm font-semibold uppercase tracking-[.16em] text-primary">Workspace</p><h1 className="mt-3 text-4xl font-bold">Choose your dashboard</h1><p className="mt-3 text-[#66718e]">Select the workspace for your marketplace role.</p><div className="mt-10 grid gap-5 md:grid-cols-3">{roles.map(([name, href, description, icon, color]) => <Link key={name} href={href} className="rounded-2xl border border-[#e7e9f2] bg-white p-6 no-underline shadow-sm transition hover:-translate-y-1"><span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br text-xl text-white ${color}`}>{icon}</span><h2 className="mt-6 text-xl font-bold text-[#111b40]">{name}</h2><p className="mt-3 min-h-14 text-sm leading-6 text-[#66718e]">{description}</p><p className="mt-6 text-sm font-semibold text-primary">Open workspace →</p></Link>)}</div></section></main>;
}
