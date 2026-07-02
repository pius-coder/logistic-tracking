"use client";

import { useAuraQuery } from "@/aura/client";
import { AdminTrajectoryEditor } from "./AdminTrajectoryEditor";
import { AdminStepTimerControls } from "./AdminStepTimerControls";

type TrajectoryStep = {
  id: string;
  locationName: string;
  stepType: string;
  legMode?: "TRUCK" | "PLANE" | "BOAT";
  sequence: number;
  reachedAt: string | null;
  country: { id: string; name: string } | null;
  latitude: number | null;
  longitude: number | null;
  timerDurationHours: number | null;
  timerStartedAt: string | null;
  timerEndsAt: string | null;
  isTimerPaused: boolean;
  pausedRemainingMinutes: number | null;
  note: string | null;
};

type RequestData = {
  id: string;
  trajectorySteps: TrajectoryStep[];
  [key: string]: unknown;
};

type AdminTrackingLiveProps = {
  requestId: string;
  initialSteps: TrajectoryStep[];
  mapboxToken: string;
};

export function AdminTrackingLive({
  requestId,
  initialSteps,
  mapboxToken,
}: AdminTrackingLiveProps) {
  const { data } = useAuraQuery<RequestData>("requests.getById", {
    params: { id: requestId },
    refetchInterval: 5_000,
    showBumps: false,
  });

  // Use live data if available, otherwise fall back to SSR initial data
  const liveSteps = data?.trajectorySteps ?? initialSteps;

  // Build a stable key from step IDs — forces re-mount when trajectory is saved
  const editorKey = liveSteps.map((s) => s.id).join(",");

  return (
    <div className="space-y-6">
      <AdminTrajectoryEditor
        key={editorKey}
        requestId={requestId}
        initialSteps={liveSteps.map((s) => ({
          id: s.id,
          locationName: s.locationName,
          stepType: s.stepType as "ORIGIN" | "ESCALE" | "DESTINATION",
          legMode: s.legMode || "TRUCK",
          sequence: s.sequence,
          timerDurationHours: s.timerDurationHours || 4,
          latitude: s.latitude,
          longitude: s.longitude,
        }))}
        mapboxToken={mapboxToken}
      />

      <AdminStepTimerControls
        steps={liveSteps.map((s) => ({
          id: s.id,
          locationName: s.locationName,
          stepType: s.stepType,
          sequence: s.sequence,
          reachedAt: s.reachedAt,
          timerStartedAt: s.timerStartedAt,
          timerEndsAt: s.timerEndsAt,
          timerDurationHours: s.timerDurationHours,
          isTimerPaused: s.isTimerPaused,
          pausedRemainingMinutes: s.pausedRemainingMinutes,
        }))}
      />
    </div>
  );
}
