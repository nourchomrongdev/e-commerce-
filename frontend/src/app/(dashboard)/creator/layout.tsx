import type { ReactNode } from "react";
import CreatorDashboardShell from "@/components/dashboard/CreatorDashboardShell";

export default function CreatorLayout({ children }: { children: ReactNode }) {
  return <CreatorDashboardShell>{children}</CreatorDashboardShell>;
}
