import { Suspense } from "react";
import { AdminRequestHeaderShell, AdminRequestHeaderSkeleton } from "@/components/admin/request-detail/AdminRequestHeaderShell";
import { AdminRequestInfoShell, AdminRequestInfoSkeleton } from "@/components/admin/request-detail/AdminRequestInfoShell";
import { AdminRequestStatusShell } from "@/components/admin/request-detail/AdminRequestStatusShell";
import { AdminRequestHistoryShell } from "@/components/admin/request-detail/AdminRequestHistoryShell";
import { AdminRequestShareShell, AdminRequestShareSkeleton } from "@/components/admin/request-detail/AdminRequestShareShell";
import { AdminRequestTrajectoryShell } from "@/components/admin/request-detail/AdminRequestTrajectoryShell";
import { AdminRequestNotificationsShell } from "@/components/admin/request-detail/AdminRequestNotificationsShell";

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
      <Suspense fallback={<AdminRequestHeaderSkeleton />}>
        <AdminRequestHeaderShell requestId={id} />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Suspense fallback={<AdminRequestInfoSkeleton />}>
            <AdminRequestInfoShell requestId={id} />
          </Suspense>

          <AdminRequestStatusShell requestId={id} />
          <AdminRequestTrajectoryShell requestId={id} />
        </div>

        <div className="space-y-6">
          <Suspense fallback={<AdminRequestShareSkeleton />}>
            <AdminRequestShareShell requestId={id} />
          </Suspense>
          <AdminRequestHistoryShell requestId={id} />
          <AdminRequestNotificationsShell requestId={id} />
        </div>
      </div>
    </div>
  );
}
