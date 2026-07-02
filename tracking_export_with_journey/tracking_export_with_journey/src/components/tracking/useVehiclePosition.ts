"use client";

import { useState, useEffect, useMemo } from "react";
import along from "@turf/along";
import length from "@turf/length";
import bearing from "@turf/bearing";
import { feature } from "@turf/helpers";
import type { RouteLeg } from "./useMultiModalRoute";

export type VehicleStep = {
  id: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  reachedAt: string | Date | null;
  timerStartedAt: string | Date | null;
  timerEndsAt: string | Date | null;
  timerDurationHours: number | null;
  isTimerPaused: boolean;
  pausedRemainingMinutes: number | null;
};

export interface VehicleState {
  latitude: number;
  longitude: number;
  heading: number;
  legIndex: number;
  progress: number;
  remainingMs: number;
  totalMs: number;
  status: "idle" | "moving" | "paused" | "arrived";
  fromName: string;
  toName: string;
}

function msFromHours(h: number): number {
  return h * 60 * 60 * 1000;
}

function toDate(d: string | Date | null): Date | null {
  if (!d) return null;
  return typeof d === "string" ? new Date(d) : d;
}

function getPointOnLeg(geometry: GeoJSON.LineString, progress: number) {
  const clamped = Math.max(0, Math.min(1, progress));
  const lineFeat = feature(geometry);
  const totalKm = length(lineFeat, { units: "kilometers" });
  const walkedKm = totalKm * clamped;
  const point = along(lineFeat, walkedKm, { units: "kilometers" });
  const coords = point.geometry.coordinates as [number, number];

  const nextProgress = Math.min(1, clamped + 0.002);
  const nextWalkedKm = totalKm * nextProgress;
  const nextPoint = along(lineFeat, nextWalkedKm, { units: "kilometers" });
  const nextCoords = nextPoint.geometry.coordinates as [number, number];
  const head = bearing(coords, nextCoords);

  return {
    latitude: coords[1],
    longitude: coords[0],
    heading: isNaN(head) ? 0 : head,
  };
}

export function useVehiclePosition(
  steps: VehicleStep[],
  legs: RouteLeg[] = [],
): VehicleState | null {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const validSteps = steps.filter((s) => s.latitude != null && s.longitude != null);
    if (validSteps.length < 2) return null;

    let lastReachedIndex = -1;
    for (let i = 0; i < validSteps.length; i++) {
      if (validSteps[i].reachedAt) lastReachedIndex = i;
    }

    const legIndex = Math.max(0, lastReachedIndex);
    const fromStep = validSteps[legIndex];
    const toStep = validSteps[legIndex + 1];

    if (!toStep) {
      return {
        latitude: fromStep.latitude!,
        longitude: fromStep.longitude!,
        heading: 0,
        legIndex,
        progress: 1,
        remainingMs: 0,
        totalMs: 0,
        status: "arrived",
        fromName: fromStep.locationName,
        toName: fromStep.locationName,
      };
    }

    const totalMs = msFromHours(fromStep.timerDurationHours || 4);
    const legGeometry = legs[legIndex]?.geometry;

    const startedAt = toDate(fromStep.timerStartedAt);

    // Idle
    if (!startedAt) {
      const pos = legGeometry
        ? getPointOnLeg(legGeometry, 0)
        : { latitude: fromStep.latitude!, longitude: fromStep.longitude!, heading: 0 };
      return {
        ...pos,
        legIndex,
        progress: 0,
        remainingMs: totalMs,
        totalMs,
        status: "idle",
        fromName: fromStep.locationName,
        toName: toStep.locationName,
      };
    }

    // Paused
    if (fromStep.isTimerPaused && fromStep.pausedRemainingMinutes != null) {
      const pausedRemainingMs = fromStep.pausedRemainingMinutes * 60 * 1000;
      const progress = Math.max(0, 1 - pausedRemainingMs / totalMs);
      const pos = legGeometry
        ? getPointOnLeg(legGeometry, progress)
        : {
            latitude: fromStep.latitude! + (toStep.latitude! - fromStep.latitude!) * progress,
            longitude: fromStep.longitude! + (toStep.longitude! - fromStep.longitude!) * progress,
            heading: 0,
          };
      return {
        ...pos,
        legIndex,
        progress,
        remainingMs: pausedRemainingMs,
        totalMs,
        status: "paused",
        fromName: fromStep.locationName,
        toName: toStep.locationName,
      };
    }

    // Moving
    const now = Date.now();
    const elapsedMs = now - startedAt.getTime();
    const progress = Math.min(1, elapsedMs / totalMs);
    const remainingMs = Math.max(0, totalMs - elapsedMs);

    const pos = legGeometry
      ? getPointOnLeg(legGeometry, progress)
      : {
          latitude: fromStep.latitude! + (toStep.latitude! - fromStep.latitude!) * progress,
          longitude: fromStep.longitude! + (toStep.longitude! - fromStep.longitude!) * progress,
          heading: 0,
        };

    return {
      ...pos,
      legIndex,
      progress,
      remainingMs,
      totalMs,
      status: progress >= 1 ? "arrived" : "moving",
      fromName: fromStep.locationName,
      toName: toStep.locationName,
    };
  }, [steps, legs]);
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return "Arrive";
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (days > 0) return `${days}j ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
