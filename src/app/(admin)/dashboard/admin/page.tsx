import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminDashboardShell } from "@/components/admin-dashboard/AdminDashboardShell";
import { AdminCardSkeleton } from "@/components/admin/AdminCardSkeleton";

export const metadata: Metadata = {
  title: "Administration | JC Import Express",
  robots: "noindex, nofollow",
};

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminCardSkeleton />}>
      <AdminDashboardShell />
    </Suspense>
  );
}
