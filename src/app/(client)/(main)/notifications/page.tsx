"use client";

import Link from "next/link";
import { useAuraQuery, useAuraMutation } from "@/aura/client/hooks";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, ArrowUpRight, Package, CheckCircle2, Truck, AlertTriangle } from "lucide-react";

const typeLabels: Record<string, string> = {
  GENERAL: "Général",
  REQUEST_CREATED: "Demande créée",
  REQUEST_STATUS_UPDATED: "Statut mis à jour",
  TRAJECTORY_UPDATED: "Trajectoire mise à jour",
  PAYMENT_TERMS_DEFINED: "Paiement défini",
  PAYMENT_SUBMITTED: "Paiement soumis",
  PAYMENT_VALIDATED: "Paiement validé",
  PAYMENT_REJECTED: "Paiement rejeté",
  WHATSAPP_DISCUSSION_READY: "Discussion WhatsApp",
};

const typeIcons: Record<string, typeof Package> = {
  REQUEST_CREATED: Package,
  REQUEST_STATUS_UPDATED: Truck,
  PAYMENT_VALIDATED: CheckCircle2,
  PAYMENT_REJECTED: AlertTriangle,
  default: Bell,
};

export default function NotificationsPage() {
  const { data, isLoading } = useAuraQuery<{ notifications: Array<{ id: string; type: string; title: string; message: string; createdAt: string; isRead: boolean; deepLink: string }> }>("notifications.getMyNotifications", {});

  const markAsRead = useAuraMutation<{ id: string }, { success: boolean }>("notifications.markAsRead", { invalidate: ["notifications.getMyNotifications"], refresh: true });
  const markAllAsRead = useAuraMutation<void, { success: boolean }>("notifications.markAllAsRead", { invalidate: ["notifications.getMyNotifications"], refresh: true });

  const notifications = data?.notifications ?? [];

  const handleClick = (n: { id: string; isRead: boolean; deepLink: string }) => {
    if (!n.isRead) markAsRead.mutate({ id: n.id });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Notifications</p>
          <h1 className="mt-1 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            Centre de notifications
          </h1>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
          >
            {markAllAsRead.isPending ? "..." : "Tout marquer comme lu"}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border bg-card py-16 shadow-soft animate-fade-in">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <Bell className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Aucune notification</p>
        </div>
      ) : (
        <div className="grid gap-3 animate-fade-in-up delay-100">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || typeIcons.default;
            const content = (
              <div
                className={cn(
                  "flex items-start gap-4 rounded-2xl border p-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft cursor-pointer",
                  n.isRead ? "bg-card opacity-60" : "bg-card shadow-soft"
                )}
              >
                <div className={cn(
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  n.isRead ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {typeLabels[n.type] || n.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                </div>
                {n.deepLink && (
                  <Link
                    href={n.deepLink}
                    className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            );
            return n.deepLink ? (
              <Link key={n.id} href={n.deepLink} onClick={() => handleClick(n)} className="block no-underline text-inherit">
                {content}
              </Link>
            ) : (
              <div key={n.id} onClick={() => handleClick(n)}>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
