"use client";

import { useState } from "react";
import { useAuraMutation } from "@/aura/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { getRequestStatusLabel, getRequestProblemLabel } from "@/lib/displayLabels";
import { toast } from "sonner";
import { CopyMessageDialog } from "./CopyMessageDialog";

type Status = "EN_ATTENTE" | "EN_COURS" | "EN_PAUSE" | "PROBLEME" | "TERMINE" | "ANNULEE";
type ProblemType = "DOUANE" | "POLICE" | "DOCUMENTATION" | "RETARD_LOGISTIQUE" | "PAIEMENT" | "AUTRE";

const STATUSES: Status[] = [
  "EN_ATTENTE",
  "EN_COURS",
  "EN_PAUSE",
  "PROBLEME",
  "TERMINE",
  "ANNULEE",
];

const PROBLEMS: ProblemType[] = [
  "DOUANE",
  "POLICE",
  "DOCUMENTATION",
  "RETARD_LOGISTIQUE",
  "PAIEMENT",
  "AUTRE",
];

interface AdminStatusUpdaterProps {
  requestId: string;
  requestNumber: string;
  currentStatus?: Status;
  currentProblemType?: ProblemType | null;
}

export function AdminStatusUpdater({
  requestId,
  currentStatus = "EN_COURS",
  currentProblemType,
}: AdminStatusUpdaterProps) {
  const [status, setStatus] = useState<Status>(currentStatus);
  const [problemType, setProblemType] = useState<ProblemType>(
    currentProblemType ?? "DOUANE",
  );
  const [title, setTitle] = useState("Mise à jour logistique");
  const [message, setMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const updateMutation = useAuraMutation<
    { requestId: string; status: Status; problemType?: ProblemType; title: string; message: string },
    { success: true; copyMessage: string }
  >("admin.updateStatus", {
    onSuccess(data) {
      setCopyMessage(data.copyMessage);
      setDialogOpen(true);
      setMessage("");
    },
    onError(error) {
      const m = error instanceof Error ? error.message : "Erreur inconnue.";
      toast.error(m);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 2) {
      toast.error("Le titre doit contenir au moins 2 caractères.");
      return;
    }
    if (message.trim().length < 3) {
      toast.error("Le message doit contenir au moins 3 caractères.");
      return;
    }
    updateMutation.mutate({
      requestId,
      status,
      problemType: status === "PROBLEME" ? problemType : undefined,
      title: title.trim(),
      message: message.trim(),
    });
  };

  return (
    <>
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Mettre à jour le statut</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Nouveau statut</Label>
              <div className="mt-1">
                <Combobox
                  value={status}
                  onValueChange={(v) => setStatus((v ?? status) as Status)}
                  itemToStringLabel={(v) =>
                    v ? getRequestStatusLabel(v as Status) : ""
                  }
                >
                  <ComboboxInput
                    placeholder={getRequestStatusLabel(status)}
                    showTrigger
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {STATUSES.map((s) => (
                        <ComboboxItem key={s} value={s}>
                          {getRequestStatusLabel(s)}
                        </ComboboxItem>
                      ))}
                      <ComboboxEmpty>Aucun résultat</ComboboxEmpty>
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>

            {status === "PROBLEME" && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Type de problème
                </Label>
                <div className="mt-1">
                  <Combobox
                    value={problemType}
                    onValueChange={(v) => setProblemType((v ?? problemType) as ProblemType)}
                    itemToStringLabel={(v) =>
                      v ? getRequestProblemLabel(v as ProblemType) : ""
                    }
                  >
                    <ComboboxInput
                      placeholder={getRequestProblemLabel(problemType)}
                      showTrigger
                    />
                    <ComboboxContent>
                      <ComboboxList>
                        {PROBLEMS.map((p) => (
                          <ComboboxItem key={p} value={p}>
                            {getRequestProblemLabel(p)}
                          </ComboboxItem>
                        ))}
                        <ComboboxEmpty>Aucun résultat</ComboboxEmpty>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Titre</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la mise à jour"
                maxLength={160}
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Message (pour le client)
              </Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message détaillé pour le client…"
                rows={4}
                maxLength={1200}
                className="mt-1"
              />
            </div>

            <Button type="submit" disabled={updateMutation.isPending} className="w-full">
              {updateMutation.isPending ? "Publication…" : "Publier le statut"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <CopyMessageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        message={copyMessage}
        title="Message à envoyer au client"
      />
    </>
  );
}
