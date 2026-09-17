"use client";

import { useState, type ReactNode } from "react";
import BuyerDashboardHeader from "./BuyerDashboardHeader";
import BuyerDashboardSidebar from "./BuyerDashboardSidebar";

export default function BuyerDashboardShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    if (window.matchMedia("(min-width: 901px)").matches) setSidebarCollapsed((collapsed) => !collapsed);
    else setMenuOpen((open) => !open);
  };

  return <main className="flex min-h-screen flex-col bg-background text-[#111b40]"><BuyerDashboardHeader onMenuOpen={toggleSidebar} /><div className="flex min-h-0 flex-1"><BuyerDashboardSidebar open={menuOpen} collapsed={sidebarCollapsed} onClose={() => setMenuOpen(false)} onToggle={toggleSidebar} /><section className="min-w-0 flex-1 p-5 sm:p-8">{children}</section></div></main>;
}