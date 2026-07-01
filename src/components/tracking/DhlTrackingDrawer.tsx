"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, GripHorizontal, CheckCircle2, TimerReset, Plane, Ship, Truck, MapPin, Package, AlertTriangle, Clock, PauseCircle, Play, MapPinned } from "lucide-react";
import { getTrajectoryStepTypeLabel, getRequestStatusLabel, getRequestProblemLabel } from "@/lib/displayLabels";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDuration, type VehicleStep } from "./useVehiclePosition";

type Step = {
  id: string;
  locationName: string;
  stepType: string;
  legMode?: "TRUCK" | "PLANE" | "BOAT" | null;
  reachedAt?: string | Date | null;
  latitude?: number | null;
  longitude?: number | null;
  timerStartedAt?: string | Date | null;
  timerEndsAt?: string | Date | null;
  timerDurationHours?: number | null;
  isTimerPaused?: boolean;
  pausedRemainingMinutes?: number | null;
};

type Event = {
  id: string;
  status: string;
  problemType?: string | null;
  title: string;
  message: string;
  createdAt: string | Date;
  createdByLabel: string | null;
};

type DhlTrackingDrawerProps = {
  steps: Step[];
  events: Event[];
  requestNumber: string;
  status: string;
  problemType?: string | null;
  latestMessage: string | null;
  requestId: string;
  selectedStepId?: string | null;
};

function StepIcon({ stepType, isReached, isCurrent }: { stepType: string; isReached: boolean; isCurrent: boolean }) {
  if (isReached) return <CheckCircle2 className="h-4 w-4 text-primary-foreground" />;
  if (isCurrent) return <TimerReset className="h-4 w-4 text-primary-foreground" />;
  if (stepType === "ORIGIN") return <Plane className="h-4 w-4 text-muted-foreground" />;
  if (stepType === "DESTINATION") return <MapPin className="h-4 w-4 text-muted-foreground" />;
  return <Ship className="h-4 w-4 text-muted-foreground" />;
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "TERMINE": return <CheckCircle2 className="h-5 w-5 text-primary" />;
    case "PROBLEME": return <AlertTriangle className="h-5 w-5 text-destructive" />;
    case "EN_PAUSE": return <PauseCircle className="h-5 w-5 text-yellow-500" />;
    case "EN_COURS": return <Package className="h-5 w-5 text-primary" />;
    default: return <Clock className="h-5 w-5 text-muted-foreground" />;
  }
}

export function DhlTrackingDrawer({
  steps,
  events,
  requestNumber,
  status,
  problemType,
  latestMessage,
  requestId,
  selectedStepId,
}: DhlTrackingDrawerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");
  const [, setTick] = useState(0);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isOpen]);

  useEffect(() => {
    if (!selectedStepId || !isOpen) return;
    const el = stepsContainerRef.current?.querySelector(`[data-step-id="${selectedStepId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedStepId, isOpen]);

  const nowMs = Date.now();
  const activeStepIndex = steps.findIndex((s) => !s.reachedAt);

  // Compute vehicle state for display
  const vehicleSteps: VehicleStep[] = useMemo(
    () =>
      steps.map((s) => ({
        id: s.id,
        locationName: s.locationName,
        latitude: s.latitude ?? null,
        longitude: s.longitude ?? null,
        reachedAt: s.reachedAt ?? null,
        timerStartedAt: s.timerStartedAt ?? null,
        timerEndsAt: s.timerEndsAt ?? null,
        timerDurationHours: s.timerDurationHours ?? null,
        isTimerPaused: s.isTimerPaused ?? false,
        pausedRemainingMinutes: s.pausedRemainingMinutes ?? null,
      })),
    [steps]
  );

  // Compute vehicle state for display
  let vehicleStatus: "idle" | "moving" | "paused" | "arrived" = "idle";
  let remainingMs = 0;
  let elapsedMs = 0;
  let totalMsLeg = 0;
  let fromName = "";
  let toName = "";

  const validSteps = vehicleSteps.filter((s) => s.latitude != null && s.longitude != null);
  let lastReachedIndex = -1;
  for (let i = 0; i < validSteps.length; i++) {
    if (validSteps[i].reachedAt) lastReachedIndex = i;
  }

  const fromStep = validSteps[Math.max(0, lastReachedIndex)];
  const toStep = validSteps[lastReachedIndex + 1];

  if (fromStep && toStep) {
    fromName = fromStep.locationName;
    toName = toStep.locationName;
    totalMsLeg = (fromStep.timerDurationHours || 4) * 60 * 60 * 1000;
    const startedAt = fromStep.timerStartedAt ? new Date(fromStep.timerStartedAt).getTime() : 0;

    if (!startedAt) {
      vehicleStatus = "idle";
      remainingMs = totalMsLeg;
    } else if (fromStep.isTimerPaused && fromStep.pausedRemainingMinutes != null) {
      vehicleStatus = "paused";
      remainingMs = fromStep.pausedRemainingMinutes * 60 * 1000;
      elapsedMs = totalMsLeg - remainingMs;
    } else {
      elapsedMs = Math.max(0, nowMs - startedAt);
      remainingMs = Math.max(0, totalMsLeg - elapsedMs);
      vehicleStatus = remainingMs <= 0 ? "arrived" : "moving";
    }
  } else if (fromStep && !toStep) {
    vehicleStatus = "arrived";
  }

  const totalSteps = validSteps.length;
  const completedSteps = Math.max(0, lastReachedIndex + 1);
  const legWeight = totalSteps > 1 ? 1 / (totalSteps - 1) : 0;
  const legProgress = totalMsLeg > 0 ? Math.min(1, elapsedMs / totalMsLeg) : 0;
  const progressPercent = totalSteps > 1
    ? Math.round(((completedSteps - 1 + legProgress) / (totalSteps - 1)) * 100)
    : vehicleStatus === "arrived" ? 100 : 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-center gap-2 rounded-t-2xl bg-background py-2"
      >
        <GripHorizontal className="h-5 w-5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {isOpen ? "Masquer les details" : "Voir le trajet"}
        </span>
        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
      </button>

      <div
        className={`overflow-y-auto bg-background border-x transition-all duration-300 ${isOpen ? "h-[45vh]" : "h-0"
          }`}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
              <StatusIcon status={status} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{requestNumber}</p>
              <h2 className="text-lg font-bold">{getRequestStatusLabel(status)}</h2>
              {problemType && (
                <p className="text-xs font-medium text-destructive">{getRequestProblemLabel(problemType)}</p>
              )}
              {latestMessage && (
                <p className="mt-1 text-sm text-muted-foreground">{latestMessage}</p>
              )}
            </div>
          </div>

          {/* Vehicle leg info */}
          {vehicleStatus !== "arrived" && fromName && toName && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPinned className="h-4 w-4 text-primary" />
                <span className="font-medium">{fromName}</span>
                <span className="text-muted-foreground">&rarr;</span>
                <span className="font-medium">{toName}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                {vehicleStatus === "idle" && <Clock className="h-4 w-4 text-muted-foreground" />}
                {vehicleStatus === "moving" && <Play className="h-4 w-4 text-primary" />}
                {vehicleStatus === "paused" && <PauseCircle className="h-4 w-4 text-yellow-500" />}
                <span className="text-sm font-semibold">
                  {vehicleStatus === "idle" && "Depart imminent"}
                  {vehicleStatus === "moving" && `En route — ${formatDuration(remainingMs)}`}
                  {vehicleStatus === "paused" && `En pause — ${formatDuration(remainingMs)}`}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progression</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-md bg-muted">
              <div
                className="h-full rounded-md bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
                }`}
            >
              Itineraire
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
                }`}
            >
              Historique
            </button>
          </div>

          {activeTab === "overview" && (
            <div ref={stepsContainerRef} className="space-y-0">
              {steps.length === 0 && (
                <p className="text-sm text-muted-foreground">Le trajet n&apos;a pas encore ete configure.</p>
              )}
              {steps.map((step, idx) => {
                const isReached = !!step.reachedAt;
                const isCurrent = idx === activeStepIndex;
                const isSelected = selectedStepId === step.id;
                const isLast = idx === steps.length - 1;
                const LegIcon = step.legMode === "PLANE" ? Plane : step.legMode === "BOAT" ? Ship : null;

                return (
                  <div key={step.id} data-step-id={step.id} className={`flex gap-3 rounded-lg p-2 transition-colors ${isSelected ? "bg-primary/10 ring-1 ring-primary/30" : ""}`}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-6 w-8 items-center justify-center rounded-md border-2 ${isReached
                            ? "border-primary bg-primary text-primary-foreground"
                            : isCurrent
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted bg-background text-muted-foreground"
                          }`}
                      >
                        <StepIcon stepType={step.stepType} isReached={isReached} isCurrent={isCurrent} />
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 flex-1 ${isReached ? "bg-primary" : "bg-muted"}`} />
                      )}
                    </div>

                    <div className={`pb-4 ${isLast ? "" : "flex-1"}`}>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {getTrajectoryStepTypeLabel(step.stepType)}
                        </p>
                        {LegIcon && !isLast && (
                          <LegIcon className="h-3 w-3 text-muted-foreground" />
                        )}
                        {step.legMode && !isLast && (
                          <span className="text-[9px] uppercase text-muted-foreground">{step.legMode}</span>
                        )}
                      </div>
                      <p className={`font-semibold ${isCurrent ? "text-primary" : ""}`}>
                        {step.locationName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isReached
                          ? `Validee le ${new Date(step.reachedAt!).toLocaleDateString("fr-FR")}`
                          : isCurrent
                            ? "En cours"
                            : "A venir"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {events.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun evenement.</p>
              )}
              {events.map((event) => (
                <div key={event.id} className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={event.status} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {getRequestStatusLabel(event.status)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="mt-1 font-semibold">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.message}</p>
                </div>
              ))}
            </div>
          )}

          <Link href={`/demande/${requestId}`}>
            <Button className="w-full rounded-md">Plus de details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
