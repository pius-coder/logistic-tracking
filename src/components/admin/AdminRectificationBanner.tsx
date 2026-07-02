"use client";

import { useState } from "react";
import { useAuraMutation } from "@/aura/client/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface AdminRectificationBannerProps {
  requestId: string;
  requestNumber: string;
  needsRectification: boolean;
  userDisplayName: string | null;
  currentValues: {
    recipientName: string;
    recipientPhone: string;
    deliveryAddress: string;
    city: string | null;
    transportMode: string;
    quantity: number;
    totalCostUsd: number;
  };
}

export function AdminRectificationBanner({ requestId, requestNumber, needsRectification, userDisplayName, currentValues }: AdminRectificationBannerProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    totalCostUsd: currentValues.totalCostUsd,
    transportMode: currentValues.transportMode,
    adminNotes: "",
  });
  const rectificationMutation = useAuraMutation("admin.updateRequest");

  if (!needsRectification) return null;

  async function handleValidate() {
    try {
      await rectificationMutation.mutateAsync({
        requestId,
        needsRectification: false,
        totalCostUsd: form.totalCostUsd,
        transportMode: form.transportMode,
        adminNotes: form.adminNotes || null,
      } as never);
      toast.success("Rectification validee. Client notifie par WhatsApp.");
      setShowForm(false);
    } catch {
      toast.error("Erreur lors de la validation.");
    }
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50p-2 dark:border-amber-800 dark:bg-amber-950">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              Rectification necessaire — Premiere commande de {userDisplayName || "ce client"}
            </p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              Veuillez verifier et ajuster les informations de la commande {requestNumber} avant de la valider.
              Un message WhatsApp sera envoye au client apres validation.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Masquer" : "Rectifier"}
        </Button>
      </div>

      {showForm && (
        <div className="mt-4 grid gap-4 border-t border-amber-200 pt-4 dark:border-amber-800 sm:grid-cols-2">
          <div>
            <Label className="text-amber-800 dark:text-amber-200">Transport</Label>
            <select
              value={form.transportMode}
              onChange={(e) => setForm({ ...form, transportMode: e.target.value })}
              className="h-6 w-full rounded-md border border-amber-300 bg-white px-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
            >
              <option value="AVION">Avion</option>
              <option value="BATEAU">Bateau</option>
            </select>
          </div>
          <div>
            <Label className="text-amber-800 dark:text-amber-200">Total (USD)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={form.totalCostUsd}
              onChange={(e) => setForm({ ...form, totalCostUsd: Number(e.target.value) })}
              className="border-amber-300 focus-visible:ring-amber-500/30 dark:border-amber-700 dark:bg-amber-950"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-amber-800 dark:text-amber-200">Notes admin (incluses dans le message WhatsApp)</Label>
            <Textarea
              value={form.adminNotes}
              onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
              placeholder="Ajustements effectues, conditions convenues avec le client..."
              className="border-amber-300 focus-visible:ring-amber-500/30 dark:border-amber-700 dark:bg-amber-950"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button
              onClick={handleValidate}
              disabled={rectificationMutation.isPending}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              <CheckCircle className="h-4 w-4" />
              {rectificationMutation.isPending ? "Validation..." : "Valider la rectification + WhatsApp"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
