import { callAuraServer } from "@/aura/server/call";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRequestStatusLabel } from "@/lib/displayLabels";
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

export async function AdminRequestHistoryShell({ requestId }: { requestId: string }) {
  const request = await callAuraServer<AdminRequestDetail>({
    operationName: "requests.getById",
    params: { id: requestId },
    source: "rsc",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des statuts</CardTitle>
      </CardHeader>
      <CardContent>
        {request.statusEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun événement.</p>
        ) : (
          <div className="space-y-3">
            {request.statusEvents.map((event) => (
              <div key={event.id} className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[event.status]}>
                    {getRequestStatusLabel(event.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminRequestHistorySkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-6 py-4">
        <div className="h-5 w-44 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-3 p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 animate-pulse rounded bg-muted" />
              <div className="h-3 w-28 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
