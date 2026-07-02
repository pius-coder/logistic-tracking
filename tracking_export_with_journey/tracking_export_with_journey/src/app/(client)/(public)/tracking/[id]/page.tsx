import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { TrackingPageClient } from "@/components/tracking/TrackingPageClient";
import { TrackingSkeleton } from "@/components/tracking/TrackingSkeleton";
import { callAuraServer } from "@/aura/server/call";
import type { AuraError } from "@/aura/core/errors";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const data = await callAuraServer<{ requestNumber: string }>({
      operationName: "tracking.getByRequestPublic", params: { requestId: id }, source: "rsc",
    });
    return buildMetadata({
      title: `Suivi ${data?.requestNumber || id} | JC Import Express`,
      description: "Suivez votre expédition JC Import Express en temps réel.",
      path: `/tracking/${id}`,
    });
  } catch { return buildMetadata({ title: "Suivi | JC Import Express", description: "" }); }
}

type TrackingData = {
  id: string;
  requestNumber: string;
  status: string;
  problemType: string | null;
  latestStatusMessage: string | null;
  transportMode: string;
  trajectorySteps: Array<{
    id: string;
    locationName: string;
    stepType: string;
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
  }>;
  statusEvents: Array<{
    id: string;
    status: string;
    problemType: string | null;
    title: string;
    message: string;
    createdAt: string;
    createdByLabel: string | null;
  }>;
};

async function fetchTrackingData(id: string): Promise<{ data: TrackingData; isAuth: boolean } | null> {
  try {
    const data = await callAuraServer<TrackingData>({
      operationName: "tracking.getByRequest",
      params: { requestId: id },
      source: "rsc",
    });
    return { data, isAuth: true };
  } catch (err) {
    const error = err as AuraError;
    if (
      error.code === "UNAUTHORIZED" ||
      error.code === "SESSION_EXPIRED" ||
      error.code === "SESSION_REVOKED" ||
      error.code === "FORBIDDEN"
    ) {
      try {
        const publicData = await callAuraServer<TrackingData>({
          operationName: "tracking.getByRequestPublic",
          params: { requestId: id },
          source: "rsc",
        });
        return { data: publicData, isAuth: false };
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function TrackingContent({ id }: { id: string }) {
  const result = await fetchTrackingData(id);

  if (!result) {
    notFound();
  }

  const { data: request, isAuth } = result;
  const backHref = isAuth ? `/demande/${request.id}` : "/";
  const operationName = isAuth ? "tracking.getByRequest" : "tracking.getByRequestPublic";

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <TrackingPageClient
        initialData={request}
        requestId={request.id}
        mapboxToken={mapboxToken}
        backHref={backHref}
        operationName={operationName}
      />
    </div>
  );
}

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<TrackingSkeleton />}>
      <TrackingContent id={id} />
    </Suspense>
  );
}
