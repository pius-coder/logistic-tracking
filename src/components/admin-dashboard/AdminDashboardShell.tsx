import { callAuraServer } from "@/aura/server/call";
import { AdminDashboardContent } from "./AdminDashboardContent";
import { AdminCardSkeleton } from "@/components/admin/AdminCardSkeleton";
import type { AdminDashboardData } from "./AdminDashboardTypes";

export async function AdminDashboardShell() {
  const initialData = await callAuraServer<AdminDashboardData>({
    operationName: "admin.dashboard",
    source: "rsc",
  }).catch(() => null);

  if (!initialData) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:py-12">
        <p className="text-sm text-muted-foreground">Erreur de chargement du tableau de bord.</p>
      </main>
    );
  }

  return <AdminDashboardContent initialData={initialData} />;
}
