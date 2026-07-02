import { Suspense } from "react";
import { AdminClientsShell } from "@/components/admin-clients/AdminClientsShell";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";

export const dynamic = "force-dynamic";

export default function AdminClientsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:py-12">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Administration</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Clients</h1>
      </div>
      <Suspense fallback={<AdminTableSkeleton />}>
        <AdminClientsShell />
      </Suspense>
    </main>
  );
}
