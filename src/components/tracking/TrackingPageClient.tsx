"use client";

import { useAuraQuery } from "@/aura/client";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { DhlTrackingMap } from "./DhlTrackingMap";
import { DhlTrackingDrawer } from "./DhlTrackingDrawer";

type TrajectoryStep = {
  id: string;
  locationName: string;
  stepType: string;
  legMode?: "TRUCK" | "PLANE" | "BOAT";
  sequence: number;
  reachedAt: string | null;
  country: { name: string } | null;
  latitude: number | null;
  longitude: number | null;
  timerStartedAt: string | null;
  timerEndsAt: string | null;
  timerDurationHours: number | null;
  isTimerPaused: boolean;
  pausedRemainingMinutes: number | null;
};

type StatusEvent = {
  id: string;
  status: string;
  problemType: string | null;
  title: string;
  message: string;
  createdAt: string;
  createdByLabel: string | null;
};

type TrackingData = {
  id: string;
  requestNumber: string;
  status: string;
  problemType: string | null;
  latestStatusMessage: string | null;
  transportMode: string;
  trajectorySteps: TrajectoryStep[];
  statusEvents: StatusEvent[];
};

type TrackingPageClientProps = {
  initialData: TrackingData;
  requestId: string;
  mapboxToken: string;
  backHref: string;
  /** Which aura operation to poll — "tracking.getByRequest" or "tracking.getByRequestPublic" */
  operationName: string;
};

export function TrackingPageClient({
  initialData,
  requestId,
  mapboxToken,
  backHref,
  operationName,
}: TrackingPageClientProps) {
  const queryClient = useQueryClient();
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const { data } = useAuraQuery<TrackingData>(operationName, {
    params: { requestId },
    initialData,
    refetchInterval: 10_000,
    showBumps: false,
  });

  const request = data ?? initialData;

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["aura", operationName] });
  }, [queryClient, operationName]);

  return (
    <>
      <DhlTrackingMap
        steps={request.trajectorySteps.map((step) => ({
          id: step.id,
          locationName: step.locationName,
          stepType: step.stepType,
          legMode: step.legMode,
          reachedAt: step.reachedAt,
          latitude: step.latitude,
          longitude: step.longitude,
          timerStartedAt: step.timerStartedAt,
          timerEndsAt: step.timerEndsAt,
          timerDurationHours: step.timerDurationHours,
          isTimerPaused: step.isTimerPaused,
          pausedRemainingMinutes: step.pausedRemainingMinutes,
        }))}
        mapboxToken={mapboxToken}
        transportMode={request.transportMode}
        requestId={request.id}
        backHref={backHref}
        onRefresh={handleRefresh}
        onStepSelect={setSelectedStepId}
      />
      <DhlTrackingDrawer
        selectedStepId={selectedStepId}
        steps={request.trajectorySteps.map((step) => ({
          id: step.id,
          locationName: step.locationName,
          stepType: step.stepType,
          legMode: step.legMode,
          reachedAt: step.reachedAt,
          timerStartedAt: step.timerStartedAt,
          timerEndsAt: step.timerEndsAt,
          timerDurationHours: step.timerDurationHours,
          isTimerPaused: step.isTimerPaused,
          pausedRemainingMinutes: step.pausedRemainingMinutes,
        }))}
        events={request.statusEvents.map((event) => ({
          id: event.id,
          status: event.status,
          problemType: event.problemType,
          title: event.title,
          message: event.message,
          createdAt: event.createdAt,
          createdByLabel: event.createdByLabel,
        }))}
        requestNumber={request.requestNumber}
        status={request.status}
        problemType={request.problemType}
        latestMessage={request.latestStatusMessage}
        requestId={request.id}
      />
    </>
  );
}
