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
    <div className="min-h-screen bg-background md:px-56">
      <AdminSidebar />
      <main className="pb-16 mx-auto md:pb-0">{children}</main>
      <AdminMobileNav />
    </div>
  );
}

function AdminLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block w-56 border-r bg-card animate-pulse" />
      <main className="flex-1p-2">
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
