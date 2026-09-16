"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppBrand, { APP_NAME } from "@/components/AppBrand";
import PublicIcon from "@/components/icons/PublicIcon";
import { routes } from "@/lib/routeController";

export default function BuyerDashboardHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    if (!accountOpen) return;
    const closeMenu = () => setAccountOpen(false);
    window.addEventListener("scroll", closeMenu, { passive: true });
    window.addEventListener("click", closeMenu);
    return () => {
      window.removeEventListener("scroll", closeMenu);
      window.removeEventListener("click", closeMenu);
    };
  }, [accountOpen]);

  const closeAccountMenu = () => setAccountOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#eaebf5] bg-[#fbfbff]/95 px-3 backdrop-blur sm:px-6">
      <div className="flex h-20 w-full items-center gap-3">
        <button type="button" onClick={onMenuOpen} aria-label="Toggle buyer navigation" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xl text-heading hover:bg-accent-light lg:hidden">☰</button>
        <Link href={routes.home()} className="flex min-w-0 items-center no-underline"><AppBrand name={APP_NAME} textClassName="text-base sm:text-xl" logoClassName="h-8 w-8" /></Link>
        <div className="ml-auto flex items-center gap-3">
          <label className="relative hidden sm:block"><span className="sr-only">Search marketplace</span><PublicIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-muted-soft" /><input placeholder="Search anything..." className="h-10 w-64 rounded-lg border border-border-control bg-white pl-9 pr-3 text-xs outline-none placeholder:text-muted-soft focus:border-primary" /></label>
          <button type="button" aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-accent-light"><PublicIcon name="notification" className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" /></button>
          <div className="relative">
            <button type="button" onClick={(event) => { event.stopPropagation(); setAccountOpen((isOpen) => !isOpen); }} aria-expanded={accountOpen} aria-label="Open buyer account menu" className="flex items-center gap-2 rounded-lg p-1 text-left transition hover:bg-accent-light">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#2879c7] text-xs font-bold text-white">B</span>
              <span className="hidden text-left sm:block"><strong className="block text-[11px] text-heading">Buyer</strong><small className="block text-[9px] text-muted">Customer</small></span>
              <PublicIcon name="down" className={`hidden h-4 w-4 shrink-0 text-[#69738f] transition-transform sm:block ${accountOpen ? "rotate-180" : ""}`} />
            </button>
            {accountOpen && <div onClick={(event) => event.stopPropagation()} className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[#e7e9f2] bg-white py-2 shadow-xl">
              <p className="border-b border-gray-100 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">Switch workspace</p>
              <Link href={routes.creator.overview()} onClick={closeAccountMenu} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"><PublicIcon name="store" className="h-5 w-5 text-primary" />Creator Studio</Link>
              <Link href={routes.affiliate.dashboard()} onClick={closeAccountMenu} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"><PublicIcon name="dashboard" className="h-5 w-5 text-primary" />Affiliate Studio</Link>
              <div className="border-t border-gray-100" />
              <Link href={routes.buyer.account()} onClick={closeAccountMenu} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"><PublicIcon name="user" className="h-5 w-5 text-gray-500" />Profile Settings</Link>
              <Link href={routes.contact()} onClick={closeAccountMenu} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"><PublicIcon name="help" className="h-5 w-5 text-gray-500" />Help Center</Link>
              <div className="border-t border-gray-100" />
              <Link href={routes.auth.login()} onClick={() => { window.localStorage.removeItem("marketplace-token"); closeAccountMenu(); }} className="flex items-center gap-3 px-4 py-3 text-sm text-status-danger transition hover:bg-red-50"><PublicIcon name="arrow-left" className="h-5 w-5" />Log out</Link>
            </div>}
          </div>
        </div>
      </div>
    </header>
  );
}
