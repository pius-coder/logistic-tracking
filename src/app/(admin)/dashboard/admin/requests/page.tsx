import Link from "next/link";
import { Suspense } from "react";
import { AdminShipmentsShell } from "@/components/admin/tracking/AdminShipmentsShell";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminRequestsPage() {
  return (
    <main className="flex min-h-screen w-full flex-col gap-6 px-4 py-6 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Tracking admin</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Colis et trajets</h1>
        </div>
        <Link href="/dashboard/admin/requests/nouveau" className={buttonVariants()}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nouveau suivi
        </Link>
      </div>
      <Suspense fallback={<AdminTableSkeleton />}>
        <AdminShipmentsShell />
      </Suspense>
    </main>
  );
}
