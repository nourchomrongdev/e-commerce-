"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import CreatorDashboardHeader from "../CreatorDashboardHeader";
import AdminDashboardSidebar from "./AdminDashboardSidebar";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const adminLoginDestinationKey = "admin-login-next";

export default function AdminDashboardShell({ children, workspace = "admin" }: { children: ReactNode; workspace?: "admin" }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [storefrontOpen, setStorefrontOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<{
    name?: string;
    username?: string | null;
    role?: string;
    roles?: string[];
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const redirectToLogin = () => {
      window.sessionStorage.setItem(adminLoginDestinationKey, pathname);
      router.replace("/login");
    };
    const token = window.localStorage.getItem("marketplace-token");
    if (!token) {
      redirectToLogin();
      return () => controller.abort();
    }

    fetch(`${apiUrl}/admin/session`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          window.localStorage.removeItem("marketplace-token");
          redirectToLogin();
          return;
        }
        const data = await response.json();
        const roleNames = [data.user?.role, ...(data.user?.roles || [])].map((role: string) => role.toLowerCase());
        if (!roleNames.includes("admin") && !roleNames.includes("superadmin")) {
          window.localStorage.removeItem("marketplace-token");
          redirectToLogin();
          return;
        }
        setAdminUser(data.user);
        setAuthorized(true);
      })
      .catch((error: Error) => {
        if (error.name === "AbortError") return;
        window.localStorage.removeItem("marketplace-token");
        redirectToLogin();
      });

    return () => controller.abort();
  }, [pathname, router]);

  const toggleSidebar = () => {
    setStorefrontOpen(false);
    if (window.matchMedia("(min-width: 901px)").matches) setSidebarCollapsed((isCollapsed) => !isCollapsed);
    else setMenuOpen((isOpen) => !isOpen);
  };

  if (!authorized) {
    return <main className="grid min-h-screen place-items-center bg-background text-sm text-[#667085]" aria-live="polite">Verifying admin access...</main>;
  }

  return <main className="admin-workspace flex min-h-screen flex-col bg-background text-[#111b40]"><CreatorDashboardHeader onMenuOpen={toggleSidebar} workspace={workspace} accountUser={adminUser} storefrontOpen={storefrontOpen} onStorefrontToggle={setStorefrontOpen} sidebarOpen={menuOpen} /><div className="flex min-h-0 flex-1"><AdminDashboardSidebar open={menuOpen} collapsed={sidebarCollapsed} onClose={() => setMenuOpen(false)} onToggle={toggleSidebar} /><section className="min-w-0 flex-1 p-5 sm:p-8">{children}</section></div></main>;
}