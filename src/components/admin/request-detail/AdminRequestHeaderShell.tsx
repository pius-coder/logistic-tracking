import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { callAuraServer } from "@/aura/server/call";
import { getRequestStatusLabel, getRequestTypeLabel } from "@/lib/displayLabels";
import type { AdminRequestDetail } from "./types";

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline" | "ghost"
> = {
  EN_ATTENTE: "secondary",
  EN_COURS: "default",
  EN_PAUSE: "outline",
  PROBLEME: "destructive",
  TERMINE: "ghost",
  ANNULEE: "destructive",
};

export async function AdminRequestHeaderShell({ requestId }: { requestId: string }) {
  const request = await callAuraServer<AdminRequestDetail>({
    operationName: "requests.getById",
    params: { id: requestId },
    source: "rsc",
  });

  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>Administration</span>
          <span aria-hidden>·</span>
          <span>{getRequestTypeLabel(request.type)}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {request.requestNumber}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant={statusVariant[request.status]}>
            {getRequestStatusLabel(request.status)}
          </Badge>
          {request.latestStatusMessage && (
            <span className="truncate">{request.latestStatusMessage}</span>
          )}
        </div>
      </div>
      <Link
        className={buttonVariants({ variant: "outline" })}
        href="/dashboard/admin/requests"
      >
        Retour
      </Link>
    </header>
  );
}

export function AdminRequestHeaderSkeleton() {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <div className="h-3 w-40 animate-pulse rounded bg-muted" />
        <div className="h-7 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
    </header>
  );
}
