import { callAuraServer } from "@/aura/server/call";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminRequestDetail } from "./types";

export async function AdminRequestNotificationsShell({ requestId }: { requestId: string }) {
  const request = await callAuraServer<AdminRequestDetail>({
    operationName: "requests.getById",
    params: { id: requestId },
    source: "rsc",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications envoyées</CardTitle>
      </CardHeader>
      <CardContent>
        {request.jcNotifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune notification.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Lue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {request.jcNotifications.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="text-xs">{n.type}</TableCell>
                    <TableCell>{n.title}</TableCell>
                    <TableCell className="text-xs">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{n.isRead ? "Oui" : "Non"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminRequestNotificationsSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-6 py-4">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-2 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}
