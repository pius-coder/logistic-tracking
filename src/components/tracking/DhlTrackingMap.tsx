
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  LocateFixed,
  MapPin,
  Minus,
  PauseCircle,
  Plane,
  Play,
  Plus,
  RefreshCw,
  Route,
  Ship,
  Truck,
} from "lucide-react";
import {
  Layer,
  Map as MapboxMap,
  Marker,
  Source,
  type MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  useMultiModalRoute,
  type LegMode,
} from "./useMultiModalRoute";
import {
  formatDuration,
  useVehiclePosition,
  type VehicleStep,
} from "./useVehiclePosition";

type Step = {
  id: string;
  locationName: string;
  stepType: string;
  legMode?: LegMode;
  reachedAt?: string | Date | null;
  latitude: number | null;
  longitude: number | null;
  timerStartedAt?: string | Date | null;
  timerEndsAt?: string | Date | null;
  timerDurationHours?: number | null;
  isTimerPaused?: boolean;
  pausedRemainingMinutes?: number | null;
};

type Props = {
  steps: Step[];
  mapboxToken: string;
  transportMode: string;
  requestId: string;
  backHref?: string;
  onRefresh?: () => void | Promise<void>;
  onStepSelect?: (stepId: string) => void;
};

type RoutePoint = Step & {
  lat: number;
  lng: number;
};

const LEG_MODE_META: Record<
  LegMode,
  {
    label: string;
    color: string;
    mutedColor: string;
  }
> = {
  TRUCK: {
    label: "Transport routier",
    color: "#C58B48",
    mutedColor: "#746454",
  },
  PLANE: {
    label: "Transport aérien",
    color: "#6F9DCA",
    mutedColor: "#64768A",
  },
  BOAT: {
    label: "Transport maritime",
    color: "#5F9587",
    mutedColor: "#5E746F",
  },
};

function cx(
  ...classes: Array<string | null | false | undefined>
) {
  return classes.filter(Boolean).join(" ");
}

function normalizeTransportMode(mode: string): LegMode {
  const normalizedMode = mode.toUpperCase();

  if (
    normalizedMode === "PLANE" ||
    normalizedMode === "AVION" ||
    normalizedMode === "AIR"
  ) {
    return "PLANE";
  }

  if (
    normalizedMode === "BOAT" ||
    normalizedMode === "BATEAU" ||
    normalizedMode === "SHIP" ||
    normalizedMode === "SEA"
  ) {
    return "BOAT";
  }

  return "TRUCK";
}

function TransportIcon({
  legMode,
  className = "size-5",
}: {
  legMode: LegMode;
  className?: string;
}) {
  if (legMode === "PLANE") {
    return (
      <Plane
        className={className}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    );
  }

  if (legMode === "BOAT") {
    return (
      <Ship
        className={className}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    );
  }

  return (
    <Truck
      className={className}
      strokeWidth={1.8}
      aria-hidden="true"
    />
  );
}

function VehicleStatusIcon({
  status,
}: {
  status: "idle" | "moving" | "paused" | "arrived";
}) {
  if (status === "moving") {
    return (
      <Play
        className="size-3.5 text-[#173f68]"
        fill="currentColor"
        strokeWidth={0}
        aria-hidden="true"
      />
    );
  }

  if (status === "paused") {
    return (
      <PauseCircle
        className="size-4 text-[#9a681e]"
        strokeWidth={1.9}
        aria-hidden="true"
      />
    );
  }

  if (status === "arrived") {
    return (
      <CheckCircle2
        className="size-4 text-[#2f7156]"
        strokeWidth={1.9}
        aria-hidden="true"
      />
    );
  }

  return (
    <Clock3
      className="size-4 text-[#0a192f]/48"
      strokeWidth={1.8}
      aria-hidden="true"
    />
  );
}

function MapControlButton({
  label,
  onClick,
  children,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="
        flex size-10 items-center justify-center
        text-[#0a192f]/58
        outline-none
        transition-[background-color,color]
        duration-200
        hover:bg-black/[0.045]
        hover:text-[#0a192f]
        focus-visible:bg-black/[0.045]
        focus-visible:text-[#0a192f]
        disabled:pointer-events-none
        disabled:opacity-35
      "
    >
      {children}
    </button>
  );
}

export function DhlTrackingMap({
  steps,
  mapboxToken,
  transportMode,
  requestId,
  backHref,
  onRefresh,
  onStepSelect,
}: Props) {
  const mapRef = useRef<MapRef>(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const routePoints = useMemo<RoutePoint[]>(
    () =>
      steps.flatMap((step) => {
        if (
          step.latitude == null ||
          step.longitude == null
        ) {
          return [];
        }

        return [
          {
            ...step,
            lat: step.latitude,
            lng: step.longitude,
          },
        ];
      }),
    [steps],
  );

  const waypoints = useMemo(
    () =>
      routePoints.map((point) => ({
        latitude: point.lat,
        longitude: point.lng,
      })),
    [routePoints],
  );

  const legModes = useMemo<LegMode[]>(
    () =>
      routePoints
        .slice(0, -1)
        .map((point) => point.legMode ?? "TRUCK"),
    [routePoints],
  );

  const usedModes = useMemo(
    () => Array.from(new Set(legModes)),
    [legModes],
  );

  const { legs, loading } = useMultiModalRoute({
    waypoints,
    legModes,
    mapboxToken,
  });

  /*
   * Les étapes du véhicule doivent suivre le même tableau
   * filtré que les segments retournés par useMultiModalRoute.
   */
  const vehicleSteps = useMemo<VehicleStep[]>(
    () =>
      routePoints.map((step) => ({
        id: step.id,
        locationName: step.locationName,
        latitude: step.lat,
        longitude: step.lng,
        reachedAt: step.reachedAt ?? null,
        timerStartedAt: step.timerStartedAt ?? null,
        timerEndsAt: step.timerEndsAt ?? null,
        timerDurationHours:
          step.timerDurationHours ?? null,
        isTimerPaused: step.isTimerPaused ?? false,
        pausedRemainingMinutes:
          step.pausedRemainingMinutes ?? null,
      })),
    [routePoints],
  );

  const vehicle = useVehiclePosition(
    vehicleSteps,
    legs,
  );

  const allStepsReached = useMemo(
    () =>
      routePoints.length > 0 &&
      routePoints.every((step) => Boolean(step.reachedAt)),
    [routePoints],
  );

  const activeStepIndex = useMemo(() => {
    const firstUnreachedIndex = routePoints.findIndex(
      (step) => !step.reachedAt,
    );

    if (firstUnreachedIndex >= 0) {
      return firstUnreachedIndex;
    }

    return Math.max(0, routePoints.length - 1);
  }, [routePoints]);

  const activeLegIndex = useMemo(() => {
    if (allStepsReached) {
      return -1;
    }

    return Math.max(0, activeStepIndex - 1);
  }, [activeStepIndex, allStepsReached]);

  const defaultMode = useMemo(
    () => normalizeTransportMode(transportMode),
    [transportMode],
  );

  const currentLegMode = useMemo<LegMode>(() => {
    if (
      vehicle &&
      vehicle.status !== "arrived" &&
      legModes[vehicle.legIndex]
    ) {
      return legModes[vehicle.legIndex];
    }

    return defaultMode;
  }, [defaultMode, legModes, vehicle]);

  const initialCenter = useMemo(() => {
    if (vehicle) {
      return {
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
      };
    }

    const activePoint =
      routePoints[activeStepIndex] ?? routePoints[0];

    if (activePoint) {
      return {
        latitude: activePoint.lat,
        longitude: activePoint.lng,
      };
    }

    return {
      latitude: 5.3599,
      longitude: -4.0083,
    };
  }, [activeStepIndex, routePoints, vehicle]);

  const fitRouteBounds = useCallback(() => {
    const map = mapRef.current;

    if (!map || routePoints.length === 0) {
      return;
    }

    if (routePoints.length === 1) {
      map.flyTo({
        center: [
          routePoints[0].lng,
          routePoints[0].lat,
        ],
        zoom: 7,
        duration: 800,
      });

      return;
    }

    const longitudes = routePoints.map(
      (point) => point.lng,
    );
    const latitudes = routePoints.map(
      (point) => point.lat,
    );

    const bounds: [
      [number, number],
      [number, number],
    ] = [
      [
        Math.min(...longitudes),
        Math.min(...latitudes),
      ],
      [
        Math.max(...longitudes),
        Math.max(...latitudes),
      ],
    ];

    map.fitBounds(bounds, {
      padding: {
        top: 130,
        right: 80,
        bottom: 220,
        left: 80,
      },
      maxZoom: 7,
      duration: 900,
    });
  }, [routePoints]);

  useEffect(() => {
    if (!isMapReady) {
      return;
    }

    fitRouteBounds();
  }, [fitRouteBounds, isMapReady]);

  const handleStepClick = useCallback(
    (
      stepId: string,
      latitude: number,
      longitude: number,
    ) => {
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: 8,
        duration: 850,
        essential: true,
      });

      onStepSelect?.(stepId);
    },
    [onStepSelect],
  );

  const handleVehicleCenter = useCallback(() => {
    if (vehicle) {
      mapRef.current?.flyTo({
        center: [
          vehicle.longitude,
          vehicle.latitude,
        ],
        zoom: 7.5,
        duration: 700,
        essential: true,
      });

      return;
    }

    fitRouteBounds();
  }, [fitRouteBounds, vehicle]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) {
      return;
    }

    try {
      setIsRefreshing(true);
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefresh]);

  const getVehicleStatusText = useCallback(() => {
    if (!vehicle) {
      return "Localisation indisponible";
    }

    if (vehicle.status === "idle") {
      return "Départ imminent";
    }

    if (vehicle.status === "paused") {
      return `Trajet en pause · ${formatDuration(
        vehicle.remainingMs,
      )} restantes`;
    }

    if (vehicle.status === "arrived") {
      return "Arrivé à destination";
    }

    return `Arrivée estimée dans ${formatDuration(
      vehicle.remainingMs,
    )}`;
  }, [vehicle]);

  if (routePoints.length === 0) {
    return (
      <div className="relative flex h-full min-h-[520px] w-full items-center justify-center overflow-hidden bg-[#091521] px-5">
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0
            bg-[radial-gradient(circle_at_center,rgba(76,115,153,0.15),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent)]
          "
        />

        <Link
          href={backHref ?? `/demande/${requestId}`}
          className="
            absolute left-4 top-4 z-10
            inline-flex min-h-11 items-center gap-2
            rounded-[15px] border border-white/[0.10]
            bg-[#0a192f]/80 px-4
            font-display text-[12px] font-semibold
            text-white/72
            shadow-[0_1px_2px_rgba(0,0,0,0.2),0_14px_30px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.07)]
            backdrop-blur-xl
            transition-[background-color,color]
            hover:bg-[#102640]
            hover:text-white
          "
        >
          <ArrowLeft
            className="size-4"
            strokeWidth={1.9}
            aria-hidden="true"
          />
          Retour
        </Link>

        <div
          className="
            relative z-10 flex w-full max-w-[430px]
            flex-col items-center rounded-[28px]
            border border-white/[0.09]
            bg-white/[0.055] px-7 py-10
            text-center
            ring-1 ring-black/20
            shadow-[0_2px_5px_rgba(0,0,0,0.22),0_30px_80px_-42px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.07)]
            backdrop-blur-2xl
          "
        >
          <div
            className="
              flex size-14 items-center justify-center
              rounded-[18px] border border-white/[0.10]
              bg-white/[0.06] text-[#91afd0]
              shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.07)]
            "
          >
            <MapPin
              className="size-6"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </div>

          <h2 className="mt-5 font-display text-[20px] font-bold tracking-[-0.035em] text-white">
            Itinéraire indisponible
          </h2>

          <p className="mt-3 max-w-[330px] font-display text-[13px] leading-[1.65] text-white/46">
            La carte apparaîtra dès que les coordonnées
            des étapes de cette expédition auront été
            renseignées.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate h-full min-h-[520px] w-full overflow-hidden bg-[#08131f]">
      {/* Assombrissement périphérique */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 z-[1]
          bg-[radial-gradient(circle_at_center,transparent_52%,rgba(2,8,16,0.20)_100%)]
        "
      />

      {/* Barre supérieure */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-4 min-[810px]:p-5">
        <Link
          href={backHref ?? `/demande/${requestId}`}
          className="
            pointer-events-auto group inline-flex
            min-h-11 items-center gap-2
            rounded-[15px]
            border border-white/[0.11]
            bg-[#091827]/80 px-4
            font-display text-[12px] font-semibold
            tracking-[-0.01em] text-white/70
            ring-1 ring-black/20
            shadow-[0_1px_2px_rgba(0,0,0,0.22),0_14px_32px_-20px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.08)]
            backdrop-blur-2xl
            transition-[background-color,border-color,color]
            duration-200
            hover:border-white/[0.17]
            hover:bg-[#102640]/90
            hover:text-white
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-white/35
          "
        >
          <ArrowLeft
            className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            strokeWidth={1.9}
            aria-hidden="true"
          />

          <span className="hidden min-[390px]:inline">
            Retour
          </span>
        </Link>

        <div
          className="
            pointer-events-auto flex overflow-hidden
            rounded-[16px]
            border border-black/[0.09]
            bg-[#f5f4f0]/94
            ring-1 ring-white/80
            shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_35px_-22px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.95)]
            backdrop-blur-2xl
          "
        >
          <MapControlButton
            label="Zoom avant"
            onClick={() =>
              mapRef.current
                ?.getMap()
                .zoomIn({ duration: 220 })
            }
          >
            <Plus
              className="size-4"
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </MapControlButton>

          <div className="w-px bg-black/[0.07]" />

          <MapControlButton
            label="Zoom arrière"
            onClick={() =>
              mapRef.current
                ?.getMap()
                .zoomOut({ duration: 220 })
            }
          >
            <Minus
              className="size-4"
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </MapControlButton>

          <div className="w-px bg-black/[0.07]" />

          <MapControlButton
            label={
              vehicle
                ? "Recentrer sur le véhicule"
                : "Afficher l’itinéraire complet"
            }
            onClick={handleVehicleCenter}
          >
            <LocateFixed
              className="size-4"
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </MapControlButton>

          {onRefresh ? (
            <>
              <div className="w-px bg-black/[0.07]" />

              <MapControlButton
                label="Rafraîchir le suivi"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={cx(
                    "size-4",
                    isRefreshing && "animate-spin",
                  )}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
              </MapControlButton>
            </>
          ) : null}
        </div>
      </div>

      {/* État du véhicule */}
      {vehicle ? (
        <div
          className="
            pointer-events-none absolute left-1/2 top-[72px]
            z-30 -translate-x-1/2
            min-[810px]:top-5
          "
        >
          <div
            className="
              flex max-w-[calc(100vw-32px)] items-center
              gap-2.5 rounded-full
              border border-black/[0.08]
              bg-[#f6f5f1]/94 px-4 py-2.5
              ring-1 ring-white/80
              shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_38px_-24px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.96)]
              backdrop-blur-2xl
            "
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-white/75">
              <VehicleStatusIcon status={vehicle.status} />
            </span>

            <span className="truncate font-display text-[11px] font-semibold tracking-[-0.005em] text-[#0a192f]/68">
              {getVehicleStatusText()}
            </span>
          </div>
        </div>
      ) : null}

      {/* Légende */}
      {usedModes.length > 0 ? (
        <div
          className="
            pointer-events-none absolute left-5 top-[74px]
            z-20 hidden flex-col gap-2
            min-[810px]:flex
          "
        >
          <div
            className="
              rounded-[16px]
              border border-white/[0.09]
              bg-[#091827]/72 p-3
              shadow-[0_1px_2px_rgba(0,0,0,0.2),0_16px_34px_-24px_rgba(0,0,0,0.68),inset_0_1px_0_rgba(255,255,255,0.07)]
              backdrop-blur-xl
            "
          >
            <div className="mb-2.5 flex items-center gap-2">
              <Route
                className="size-3.5 text-white/38"
                strokeWidth={1.7}
                aria-hidden="true"
              />

              <span className="font-display text-[9px] font-bold uppercase tracking-[0.14em] text-white/32">
                Modes de transport
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {usedModes.map((mode) => (
                <div
                  key={mode}
                  className="flex items-center gap-2.5"
                >
                  <span
                    className="h-0.5 w-5 rounded-full"
                    style={{
                      backgroundColor:
                        LEG_MODE_META[mode].color,
                    }}
                  />

                  <TransportIcon
                    legMode={mode}
                    className="size-3.5 text-white/48"
                  />

                  <span className="font-display text-[10px] font-medium text-white/48">
                    {LEG_MODE_META[mode].label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <MapboxMap
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          latitude: initialCenter.latitude,
          longitude: initialCenter.longitude,
          zoom: 4,
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        minZoom={2}
        maxZoom={16}
        maxPitch={0}
        dragRotate={false}
        touchPitch={false}
        reuseMaps
        onLoad={() => setIsMapReady(true)}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {/* Segments de l’itinéraire */}
        {legs.map((leg) => {
          const destinationReached = Boolean(
            routePoints[leg.fromIndex + 1]?.reachedAt,
          );

          const isCurrentLeg =
            !destinationReached &&
            !allStepsReached &&
            leg.fromIndex === activeLegIndex;

          const mode =
            leg.legMode in LEG_MODE_META
              ? leg.legMode
              : "TRUCK";

          const modeMeta = LEG_MODE_META[mode];

          const routeColor = destinationReached
            ? modeMeta.mutedColor
            : isCurrentLeg
              ? modeMeta.color
              : "#708092";

          const lineOpacity = destinationReached
            ? 0.82
            : isCurrentLeg
              ? 0.98
              : 0.3;

          const lineWidth = destinationReached
            ? 4.5
            : isCurrentLeg
              ? 6
              : 3;

          const dashArray =
            mode === "PLANE" ? [1.6, 2.2] : [1, 0];

          const sourceId = `route-leg-${leg.fromIndex}`;
          const casingId = `route-casing-${leg.fromIndex}`;
          const glowId = `route-glow-${leg.fromIndex}`;
          const lineId = `route-line-${leg.fromIndex}`;

          return (
            <Source
              key={sourceId}
              id={sourceId}
              type="geojson"
              data={{
                type: "Feature",
                properties: {
                  legMode: mode,
                  state: destinationReached
                    ? "completed"
                    : isCurrentLeg
                      ? "current"
                      : "future",
                },
                geometry: leg.geometry,
              }}
            >
              {/* Contour sombre assurant la lisibilité */}
              <Layer
                id={casingId}
                type="line"
                layout={{
                  "line-cap": "round",
                  "line-join": "round",
                }}
                paint={{
                  "line-color": "#06101D",
                  "line-width": lineWidth + 4,
                  "line-opacity":
                    destinationReached || isCurrentLeg
                      ? 0.72
                      : 0.25,
                  "line-blur": 0.5,
                  "line-dasharray": dashArray,
                }}
              />

              {/* Halo réservé au segment actif */}
              {isCurrentLeg ? (
                <Layer
                  id={glowId}
                  type="line"
                  layout={{
                    "line-cap": "round",
                    "line-join": "round",
                  }}
                  paint={{
                    "line-color": modeMeta.color,
                    "line-width": lineWidth + 9,
                    "line-opacity": 0.2,
                    "line-blur": 7,
                    "line-dasharray": dashArray,
                  }}
                />
              ) : null}

              <Layer
                id={lineId}
                type="line"
                layout={{
                  "line-cap": "round",
                  "line-join": "round",
                }}
                paint={{
                  "line-color": routeColor,
                  "line-width": lineWidth,
                  "line-opacity": lineOpacity,
                  "line-dasharray": dashArray,
                }}
              />
            </Source>
          );
        })}

        {/* Marqueurs des étapes */}
        {routePoints.map((step, index) => {
          const isReached = Boolean(step.reachedAt);
          const isCurrent =
            !allStepsReached &&
            index === activeStepIndex;

          return (
            <Marker
              key={step.id}
              latitude={step.lat}
              longitude={step.lng}
              anchor="bottom"
            >
              <button
                type="button"
                aria-label={`Afficher l’étape ${
                  index + 1
                } : ${step.locationName}`}
                title={step.locationName}
                onClick={(event) => {
                  event.stopPropagation();

                  handleStepClick(
                    step.id,
                    step.lat,
                    step.lng,
                  );
                }}
                className="
                  group relative flex flex-col items-center
                  outline-none
                "
              >
                {/* Infobulle */}
                <span
                  className="
                    pointer-events-none absolute bottom-full
                    left-1/2 mb-2.5 w-max max-w-[220px]
                    -translate-x-1/2 translate-y-1
                    rounded-[10px]
                    border border-white/[0.09]
                    bg-[#071524]/94 px-3 py-2
                    font-display text-[10px] font-semibold
                    text-white/78 opacity-0
                    shadow-[0_8px_24px_-14px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)]
                    backdrop-blur-xl
                    transition-[opacity,transform]
                    duration-200
                    group-hover:translate-y-0
                    group-hover:opacity-100
                    group-focus-visible:translate-y-0
                    group-focus-visible:opacity-100
                  "
                >
                  {step.locationName}
                </span>

                <span
                  className={cx(
                    "relative flex items-center justify-center border shadow-[0_2px_5px_rgba(0,0,0,0.28),0_10px_22px_-13px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.18)] transition-[transform,box-shadow] duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1",
                    isCurrent
                      ? "size-10 rounded-[14px] border-white/70 bg-[#173f68] text-white ring-4 ring-[#6f9dca]/20"
                      : isReached
                        ? "size-8 rounded-[11px] border-white/65 bg-[#315e52] text-white"
                        : "size-8 rounded-[11px] border-white/70 bg-[#ecebe6] text-[#0a192f]/70",
                  )}
                >
                  {isCurrent ? (
                    <MapPin
                      className="size-[18px]"
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                  ) : isReached ? (
                    <CheckCircle2
                      className="size-[15px]"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="font-display text-[10px] font-bold tabular-nums">
                      {index + 1}
                    </span>
                  )}
                </span>

                <span
                  aria-hidden="true"
                  className={cx(
                    "h-2 w-px",
                    isCurrent
                      ? "bg-[#173f68]"
                      : isReached
                        ? "bg-[#315e52]"
                        : "bg-[#ecebe6]",
                  )}
                />
              </button>
            </Marker>
          );
        })}

        {/* Véhicule */}
        {vehicle ? (
          <Marker
            latitude={vehicle.latitude}
            longitude={vehicle.longitude}
            anchor="center"
          >
            <div
              className="
                pointer-events-none relative
                flex items-center justify-center
              "
              aria-label="Position actuelle du véhicule"
            >
              {vehicle.status === "moving" ? (
                <>
                  <span
                    aria-hidden="true"
                    className="
                      absolute size-16 animate-ping
                      rounded-full bg-[#6f9dca]/15
                    "
                  />

                  <span
                    aria-hidden="true"
                    className="
                      absolute size-12 rounded-full
                      border border-[#6f9dca]/24
                      bg-[#6f9dca]/10
                    "
                  />
                </>
              ) : null}

              <div
                className="
                  relative flex size-11 items-center
                  justify-center rounded-[15px]
                  border border-white/80
                  bg-[#102b49] text-white
                  ring-1 ring-black/35
                  shadow-[0_2px_5px_rgba(0,0,0,0.32),0_16px_30px_-17px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.17),inset_0_-1px_0_rgba(0,0,0,0.25)]
                "
              >
                <span
                  className="flex items-center justify-center"
                  style={{
                    transform: `rotate(${vehicle.heading}deg)`,
                  }}
                >
                  <TransportIcon
                    legMode={currentLegMode}
                    className="size-5"
                  />
                </span>

                <span
                  className={cx(
                    "absolute -right-1 -top-1 size-3 rounded-full border-2 border-[#102b49]",
                    vehicle.status === "moving" &&
                      "bg-[#66aa87]",
                    vehicle.status === "paused" &&
                      "bg-[#c28b3f]",
                    vehicle.status === "idle" &&
                      "bg-[#8190a0]",
                    vehicle.status === "arrived" &&
                      "bg-[#66aa87]",
                  )}
                />
              </div>
            </div>
          </Marker>
        ) : null}
      </MapboxMap>

      {/* État de chargement */}
      {loading ? (
        <div
          className="
            absolute inset-0 z-40 flex
            items-center justify-center
            bg-[#06101f]/58 px-5
            backdrop-blur-[3px]
          "
        >
          <div
            className="
              flex items-center gap-3
              rounded-[18px]
              border border-white/[0.10]
              bg-[#091827]/92 px-5 py-4
              text-white
              ring-1 ring-black/25
              shadow-[0_2px_5px_rgba(0,0,0,0.28),0_24px_60px_-32px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)]
              backdrop-blur-2xl
            "
            role="status"
            aria-live="polite"
          >
            <span
              className="
                flex size-9 items-center justify-center
                rounded-[12px] border border-white/[0.08]
                bg-white/[0.055]
              "
            >
              <Loader2
                className="size-[18px] animate-spin text-[#91afd0]"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>

            <div className="flex flex-col">
              <span className="font-display text-[12px] font-semibold tracking-[-0.01em] text-white/78">
                Calcul de l&apos;itinéraire
              </span>

              <span className="mt-0.5 font-display text-[10px] text-white/34">
                Optimisation des différents segments…
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}