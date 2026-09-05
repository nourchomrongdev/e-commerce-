"use client";

import { useState, type ReactNode } from "react";
import CreatorDashboardHeader from "./CreatorDashboardHeader";
import AffiliateDashboardSidebar from "./AffiliateDashboardSidebar";

export default function AffiliateDashboardShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setSidebarCollapsed((isCollapsed) => !isCollapsed);
      return;
    }

    setMenuOpen((isOpen) => !isOpen);
  };

  return (
    <main className="flex min-h-screen flex-col bg-background text-[#111b40]">
      <CreatorDashboardHeader onMenuOpen={toggleSidebar} />
      <div className="flex min-h-0 flex-1">
        <AffiliateDashboardSidebar
          open={menuOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setMenuOpen(false)}
          onToggle={toggleSidebar}
        />
        <section className="min-w-0 flex-1 p-5 sm:p-8">{children}</section>
      </div>
    </main>
  );
}
