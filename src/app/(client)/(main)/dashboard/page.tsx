import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardShell />
    </Suspense>
  );
}
