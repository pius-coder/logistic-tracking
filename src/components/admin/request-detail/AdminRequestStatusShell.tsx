import { callAuraServer } from "@/aura/server/call";
import { AdminStatusUpdater } from "@/components/tracking/AdminStatusUpdater";
import type { AdminRequestDetail } from "./types";

export async function AdminRequestStatusShell({ requestId }: { requestId: string }) {
  const request = await callAuraServer<AdminRequestDetail>({
    operationName: "requests.getById",
    params: { id: requestId },
    source: "rsc",
  });

  return (
    <AdminStatusUpdater
      requestId={request.id}
      requestNumber={request.requestNumber}
      currentStatus={request.status as never}
      currentProblemType={request.problemType as never}
    />
  );
}

export function AdminRequestStatusSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-6 py-4">
        <div className="h-5 w-44 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-3 p-6">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-24 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}
