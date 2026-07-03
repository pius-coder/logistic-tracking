import { Suspense } from "react";
import { redirect } from "next/navigation";
import { callAuraServer } from "@/aura/server/call";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

async function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  let user;
  try {
    const result = await callAuraServer<{ user: { isAdmin: boolean } }>({ operationName: "auth.me", source: "rsc" });
    user = result.user;
    if (!user.isAdmin) redirect("/dashboard");
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/20 md:pl-64">
      <AdminSidebar />
      <div className="sticky top-0 z-20 border-b bg-background/90 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Administration</p>
            <p className="text-sm font-semibold">Gestion colis et contenu</p>
          </div>
          <div className="hidden rounded-md border px-3 py-1.5 text-xs text-muted-foreground sm:block">
            Mode admin manuel
          </div>
        </div>
      </div>
      <main className="mx-auto w-full max-w-7xl pb-20 md:pb-8">{children}</main>
      <AdminMobileNav />
    </div>
  );
}

function AdminLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-64 animate-pulse border-r bg-card md:block" />
      <main className="flex-1 p-4">
        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
      </main>
    </div>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminLayoutSkeleton />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
