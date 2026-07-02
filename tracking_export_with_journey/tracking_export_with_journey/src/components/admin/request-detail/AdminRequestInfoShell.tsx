import { callAuraServer } from "@/aura/server/call";
import { AdminRectificationBanner } from "@/components/admin/AdminRectificationBanner";
import { AdminRequestEditor } from "@/components/admin/AdminRequestEditor";
import type { AdminRequestCountryOption, AdminRequestDetail } from "./types";

/**
 * Atomic section: loads the request + countries in parallel, renders the
 * rectification banner + the editor. Independent Suspense boundary from
 * payments, trajectory, history, notifications.
 */
export async function AdminRequestInfoShell({ requestId }: { requestId: string }) {
  const [request, countriesResult] = await Promise.all([
    callAuraServer<AdminRequestDetail>({
      operationName: "requests.getById",
      params: { id: requestId },
      source: "rsc",
    }),
    callAuraServer<{ countries: AdminRequestCountryOption[] }>({
      operationName: "catalog.countries",
      source: "rsc",
    }).catch<{ countries: AdminRequestCountryOption[] }>(() => ({ countries: [] })),
  ]);

  return (
    <div className="space-y-6">
      <AdminRectificationBanner
        requestId={request.id}
        requestNumber={request.requestNumber}
        needsRectification={request.needsRectification}
        userDisplayName={request.user.displayName}
        currentValues={{
          recipientName: request.recipientName,
          recipientPhone: request.recipientPhone,
          deliveryAddress: request.deliveryAddress,
          city: request.city,
          transportMode: request.transportMode,
          quantity: request.quantity,
          totalCostUsd: request.totalCostUsd,
        }}
      />
      <AdminRequestEditor
        request={request}
        countries={countriesResult.countries}
      />
    </div>
  );
}

export function AdminRequestInfoSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-lg border border-amber-200/50 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/30" />
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-3 p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
