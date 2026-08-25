import type { ReactNode } from "react";
import BuyerDashboardShell from "@/components/dashboard/BuyerDashboardShell";

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return <BuyerDashboardShell>{children}</BuyerDashboardShell>;
}