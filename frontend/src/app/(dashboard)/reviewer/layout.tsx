import type { ReactNode } from "react";
import ReviewerDashboardShell from "@/components/dashboard/reviewer/ReviewerDashboardShell";

export default function ReviewerLayout({ children }: { children: ReactNode }) {
  return <ReviewerDashboardShell>{children}</ReviewerDashboardShell>;
}