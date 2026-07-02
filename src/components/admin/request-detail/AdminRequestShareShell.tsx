import { callAuraServer } from "@/aura/server/call";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { AdminRequestDetail } from "./types";

export async function AdminRequestShareShell({ requestId }: { requestId: string }) {
  const request = await callAuraServer<AdminRequestDetail>({
    operationName: "requests.getById",
    params: { id: requestId },
    source: "rsc",
  });

  const appUrl = process.env.AURA_APP_URL || "http://localhost:3000";
  const trackingUrl = `${appUrl}/tracking/${request.id}`;
  const whatsappText = encodeURIComponent(
    `Bonjour, suivez votre expédition JC Import Express en temps réel ici : ${trackingUrl}`,
  );
  const phoneForWhatsapp = request.recipientPhone.replace(/\D/g, "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lien de suivi WhatsApp</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Partagez ce lien avec le client pour qu&apos;il suive son expédition en temps
          réel.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            readOnly
            value={trackingUrl}
            className="flex-1 min-w-[240px] rounded-md border bg-muted px-3 py-2 text-sm"
          />
          <a
            href={`https://wa.me/${phoneForWhatsapp}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Envoyer WhatsApp
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminRequestShareSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-2">
      <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      <div className="h-4 w-80 animate-pulse rounded bg-muted" />
      <div className="flex gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}
