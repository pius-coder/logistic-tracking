import Link from "next/link";
import { callAuraServer } from "@/aura/server/call";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { AdminTrackingLive } from "@/components/tracking/AdminTrackingLive";
import type { AdminRequestDetail } from "./types";

export async function AdminRequestTrajectoryShell({ requestId }: { requestId: string }) {
  const request = await callAuraServer<AdminRequestDetail>({
    operationName: "requests.getById",
    params: { id: requestId },
    source: "rsc",
  });

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  return (
    <Card className="overflow-visible">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trajectoire logistique</CardTitle>
        <Link
          className={buttonVariants({ variant: "outline", size: "sm" })}
          href={`/tracking/${request.id}`}
          target="_blank"
        >
          Voir le suivi
        </Link>
      </CardHeader>
      <CardContent>
        <AdminTrackingLive
          requestId={request.id}
          initialSteps={request.trajectorySteps}
          mapboxToken={mapboxToken}
        />
      </CardContent>
    </Card>
  );
}

export function AdminRequestTrajectorySkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="h-6 w-28 animate-pulse rounded bg-muted" />
      </div>
      <div className="p-6">
        <div className="h-[460px] animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
