"use client";

import { useState } from "react";
import { useAuraMutation, useAuraQuery } from "@/aura/client/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MessageCircle, AlertTriangle } from "lucide-react";
import type { AuthSessionResult } from "@/aura/shared/auth-types";

export function WhatsAppChallengeBanner() {
  const { data } = useAuraQuery<AuthSessionResult>("auth.me");
  const user = data?.user;
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const updateMutation = useAuraMutation<{ phoneNumber: string }, { success: true }>(
    "user.updateWhatsappNumber",
    { invalidate: ["auth.me"] },
  );

  if (!user || !user.whatsappChallenge || user.hadWhatsapp !== false) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = phoneNumber.replace(/[\s+\-()]/g, "");
    if (cleaned.length < 8) {
      toast.error("Numéro invalide.");
      return;
    }
    try {
      await updateMutation.mutateAsync({ phoneNumber: cleaned });
      toast.success("Numéro mis à jour. Un message de vérification vient d'être envoyé.");
      setOpen(false);
      setPhoneNumber("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Impossible de mettre à jour le numéro.";
      toast.error(msg);
    }
  }

  return (
    <>
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-1 text-sm dark:border-amber-800 dark:bg-amber-950">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Numéro WhatsApp requis
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Votre numéro n&apos;est pas associé à un compte WhatsApp. Veuillez en fournir un valide pour
              continuer à recevoir les notifications de vos commandes.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setOpen(true)}
          className="bg-amber-600 text-white hover:bg-amber-700"
        >
          <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
          Fournir un numéro WhatsApp
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Numéro WhatsApp</DialogTitle>
            <DialogDescription>
              Entrez un numéro WhatsApp valide. Nous vous enverrons un message de vérification.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-phone">Numéro WhatsApp</Label>
              <Input
                id="whatsapp-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+225 07 00 00 00 00"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={updateMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Format international recommandé, avec l&apos;indicatif du pays.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={updateMutation.isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Envoi..." : "Vérifier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
