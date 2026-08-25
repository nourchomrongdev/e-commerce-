import type { ReactNode } from "react";
import AffiliateDashboardShell from "@/components/dashboard/affiliate/AffiliateDashboardShell";

export default function AffiliateLayout({ children }: { children: ReactNode }) {
  return <AffiliateDashboardShell>{children}</AffiliateDashboardShell>;
}
