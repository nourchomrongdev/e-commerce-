import type { ReactNode } from "react";
import AdminDashboardShell from "@/components/dashboard/admin/AdminDashboardShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminDashboardShell workspace="admin">{children}</AdminDashboardShell>;
}