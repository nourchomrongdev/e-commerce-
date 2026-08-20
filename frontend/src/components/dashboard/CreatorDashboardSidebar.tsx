"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PublicIcon from "@/components/icons/PublicIcon";
import {
  creatorNavigation,
  creatorUtilityNavigation,
} from "./creator-navigation";

export default function CreatorDashboardSidebar({
  open,
  collapsed,
  onClose,
  onToggle,
}: {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  const links = (
    items: readonly { label: string; href: string; icon: string }[],
  ) =>
    items.map(({ label, href, icon }) => (
      <Link
        href={href}
        key={label}
        onClick={onClose}
        className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm no-underline ${pathname === href ? "bg-accent-light font-medium text-primary" : "text-[#1d294b] hover:bg-slate-50"}`}
      >
        <PublicIcon name={icon as any} />
        {label}
      </Link>
    ));

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close dashboard navigation"
          onClick={onClose}
          className="fixed inset-x-0 bottom-0 top-20 z-30 bg-slate-950/30 lg:hidden"
        />
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`fixed top-20 z-[60] hidden h-9 w-9 place-items-center rounded-br-lg border-b border-r border-[#e1e5ee] bg-white text-xl shadow-md transition-[left] duration-300 hover:bg-accent-light lg:grid ${collapsed ? "left-0" : "left-[228px]"}`}
      >
        {collapsed ? "›" : "‹"}
      </button>
      <aside
        className={`scrollbar-hidden fixed bottom-0 left-0 top-20 z-40 flex w-[85%] flex-col overflow-y-auto overscroll-contain border-r border-[#eaebf5] bg-white px-5 py-5 shadow-xl transition-[width,transform,padding] duration-300 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "lg:w-0 lg:overflow-hidden lg:border-r-0 lg:px-0" : "lg:w-[264px]"}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="mb-4 self-end text-lg lg:hidden"
          aria-label="Close dashboard navigation"
        >
          ×
        </button>
        <div className="space-y-1">{links(creatorNavigation)}</div>
        <div className="my-6 border-t border-[#e9ebf2]" />
        <div className="space-y-1">{links(creatorUtilityNavigation)}</div>
        <div className="mt-auto rounded-xl border border-accent-light bg-gradient-to-br from-primary to-secondary p-5 shadow-sm">
          <p className="flex items-center gap-2 font-semibold text-white">
            Become a<br />
            &nbsp;&nbsp; Verified Creator
            <PublicIcon name="verification" className="ml-2 h-6 w-6" />
          </p>
          <p className="mt-6 text-xs leading-5 text-white/80">
            Get verified badge and increase customer trust.
          </p>
          <Link
            href="/creator/verification"
            onClick={onClose}
            className="mt-5 block rounded-lg bg-white py-2.5 text-center text-xs font-semibold text-primary no-underline transition hover:bg-gray-100"
          >
            Apply Now
          </Link>
        </div>
      </aside>
    </>
  );
}
