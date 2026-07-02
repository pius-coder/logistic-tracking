"use client";

import { useState } from "react";
import { useAuraMutation } from "@/aura/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTrajectoryStepTypeLabel } from "@/lib/displayLabels";
import { Play, Pause, RotateCcw, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { CopyMessageDialog } from "./CopyMessageDialog";

type TimerStep = {
  id: string;
  locationName: string;
  stepType: string;
  sequence: number;
  reachedAt: string | Date | null;
  timerStartedAt: string | Date | null;
  timerEndsAt: string | Date | null;
  timerDurationHours: number | null;
  isTimerPaused: boolean;
  pausedRemainingMinutes: number | null;
};

type AdminStepTimerControlsProps = {
  steps: TimerStep[];
};

function toDate(d: string | Date | null): Date | null {
  if (!d) return null;
  return typeof d === "string" ? new Date(d) : d;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Arrive";
  const h = Math.floor(ms / (60 * 60 * 1000));
  const m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${h}h ${m}m`;
}

export function AdminStepTimerControls({ steps }: AdminStepTimerControlsProps) {
  const [copyMessage, setCopyMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const controlMutation = useAuraMutation<
    { stepId: string; action: "start" | "pause" | "resume" | "markReached" },
    { success: true; copyMessage: string | null }
  >("admin.controlStepTimer", {
    onSuccess(data) {
      if (data.copyMessage) {
        setCopyMessage(data.copyMessage);
        setDialogOpen(true);
      } else {
        toast.success("Action effectuée");
      }
    },
    onError(error) {
      toast.error("Erreur", { description: error instanceof Error ? error.message : undefined });
    },
  });

  const handleAction = (stepId: string, action: "start" | "pause" | "resume" | "markReached") => {
    controlMutation.mutate({ stepId, action });
  };

  return (
    <>
      <div className="space-y-3">
        {steps.map((step) => {
          const reachedAt = toDate(step.reachedAt);
          const startedAt = toDate(step.timerStartedAt);
          const isReached = !!reachedAt;

          let status: "notStarted" | "running" | "paused" | "completed" = "notStarted";
          let remainingMs = 0;

          if (isReached) {
            status = "completed";
          } else if (startedAt) {
            if (step.isTimerPaused) {
              status = "paused";
              remainingMs = (step.pausedRemainingMinutes || 0) * 60 * 1000;
            } else if (step.timerEndsAt) {
              const ends = new Date(step.timerEndsAt).getTime();
              remainingMs = ends - Date.now();
              status = remainingMs > 0 ? "running" : "completed";
            }
          }

          const totalMs = (step.timerDurationHours || 4) * 60 * 60 * 1000;
          const progress = status === "completed" ? 100 : status === "notStarted" ? 0 : Math.min(100, Math.round(((totalMs - remainingMs) / totalMs) * 100));

          return (
            <Card key={step.id}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {getTrajectoryStepTypeLabel(step.stepType)}
                    </span>
                    <span className="font-semibold text-sm">{step.locationName}</span>
                  </div>
                  <Badge variant={isReached ? "default" : status === "running" ? "secondary" : "outline"}>
                    {isReached ? "Atteint" : status === "running" ? "En cours" : status === "paused" ? "Pause" : "En attente"}
                  </Badge>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-md bg-muted">
                  <div className="h-full rounded-md bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Durée : {step.timerDurationHours}h</span>
                  {status === "running" && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatRemaining(remainingMs)}</span>}
                  {status === "paused" && <span className="flex items-center gap-1"><Pause className="h-3 w-3" /> {formatRemaining(remainingMs)}</span>}
                  {isReached && <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {reachedAt!.toLocaleDateString("fr-FR")}</span>}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!isReached && status === "notStarted" && (
                    <Button size="sm" variant="outline" onClick={() => handleAction(step.id, "start")} disabled={controlMutation.isPending}>
                      <Play className="mr-1 h-3 w-3" /> Démarrer
                    </Button>
                  )}

                  {!isReached && status === "running" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleAction(step.id, "pause")} disabled={controlMutation.isPending}>
                        <Pause className="mr-1 h-3 w-3" /> Pause
                      </Button>
                      <Button size="sm" variant="default" onClick={() => handleAction(step.id, "markReached")} disabled={controlMutation.isPending}>
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Marquer atteint
                      </Button>
                    </>
                  )}

                  {!isReached && status === "paused" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleAction(step.id, "resume")} disabled={controlMutation.isPending}>
                        <RotateCcw className="mr-1 h-3 w-3" /> Reprendre
                      </Button>
                      <Button size="sm" variant="default" onClick={() => handleAction(step.id, "markReached")} disabled={controlMutation.isPending}>
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Marquer atteint
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <CopyMessageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        message={copyMessage}
        title="Message à envoyer au client"
      />
    </>
  );
}
