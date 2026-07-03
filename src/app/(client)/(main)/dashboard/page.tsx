import { AdminDashboardShell } from "@/components/admin-dashboard/AdminDashboardShell";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <Suspense fallback={<>Loading...</>}>
      <AdminDashboardShell />
    </Suspense>
  );
}
