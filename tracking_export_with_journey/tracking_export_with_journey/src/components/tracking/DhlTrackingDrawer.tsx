"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  GripHorizontal,
  MapPin,
  MapPinned,
  Package,
  PauseCircle,
  Plane,
  Play,
  Route,
  Ship,
  TimerReset,
  Truck,
} from "lucide-react";

import {
  getRequestProblemLabel,
  getRequestStatusLabel,
  getTrajectoryStepTypeLabel,
} from "@/lib/displayLabels";

import {
  formatDuration,
  type VehicleStep,
} from "./useVehiclePosition";

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

type VehicleState = {
  status: "idle" | "moving" | "paused" | "arrived";
  remainingMs: number;
  fromName: string;
  toName: string;
  progressPercent: number;
};

const STATUS_STYLES = {
  TERMINE: {
    icon: "text-[#276149]",
    iconSurface:
      "border-[#276149]/10 bg-[#e9f1ec] text-[#276149]",
    badge:
      "border-[#276149]/12 bg-[#e9f1ec] text-[#276149]",
    dot: "bg-[#34775b]",
  },
  PROBLEME: {
    icon: "text-[#a5403b]",
    iconSurface:
      "border-[#a5403b]/12 bg-[#f7e9e7] text-[#a5403b]",
    badge:
      "border-[#a5403b]/12 bg-[#f7e9e7] text-[#a5403b]",
    dot: "bg-[#b84b45]",
  },
  EN_PAUSE: {
    icon: "text-[#9a681e]",
    iconSurface:
      "border-[#9a681e]/12 bg-[#f5edde] text-[#9a681e]",
    badge:
      "border-[#9a681e]/12 bg-[#f5edde] text-[#9a681e]",
    dot: "bg-[#b47a27]",
  },
  EN_COURS: {
    icon: "text-[#102b49]",
    iconSurface:
      "border-[#102b49]/10 bg-[#e8edf2] text-[#102b49]",
    badge:
      "border-[#102b49]/10 bg-[#e8edf2] text-[#102b49]",
    dot: "bg-[#173f68]",
  },
  DEFAULT: {
    icon: "text-[#0a192f]/50",
    iconSurface:
      "border-black/[0.07] bg-[#efeee9] text-[#0a192f]/50",
    badge:
      "border-black/[0.07] bg-[#efeee9] text-[#0a192f]/55",
    dot: "bg-[#0a192f]/35",
  },
} as const;

const MODE_LABELS = {
  TRUCK: "Transport routier",
  PLANE: "Transport aérien",
  BOAT: "Transport maritime",
} as const;

function cx(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ");
}

function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusStyle(status: string) {
  return (
    STATUS_STYLES[
      status as keyof typeof STATUS_STYLES
    ] ?? STATUS_STYLES.DEFAULT
  );
}

function StatusIcon({
  status,
  className = "size-5",
}: {
  status: string;
  className?: string;
}) {
  const style = getStatusStyle(status);

  switch (status) {
    case "TERMINE":
      return (
        <CheckCircle2
          className={cx(className, style.icon)}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      );

    case "PROBLEME":
      return (
        <AlertTriangle
          className={cx(className, style.icon)}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      );

    case "EN_PAUSE":
      return (
        <PauseCircle
          className={cx(className, style.icon)}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      );

    case "EN_COURS":
      return (
        <Package
          className={cx(className, style.icon)}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      );

    default:
      return (
        <Clock
          className={cx(className, style.icon)}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      );
  }
}

function StepIcon({
  stepType,
  isReached,
  isCurrent,
}: {
  stepType: string;
  isReached: boolean;
  isCurrent: boolean;
}) {
  if (isReached) {
    return (
      <CheckCircle2
        className="size-[15px]"
        strokeWidth={2}
        aria-hidden="true"
      />
    );
  }

  if (isCurrent) {
    return (
      <TimerReset
        className="size-[15px]"
        strokeWidth={2}
        aria-hidden="true"
      />
    );
  }

  if (stepType === "ORIGIN") {
    return (
      <Plane
        className="size-[15px]"
        strokeWidth={1.7}
        aria-hidden="true"
      />
    );
  }

  if (stepType === "DESTINATION") {
    return (
      <MapPin
        className="size-[15px]"
        strokeWidth={1.7}
        aria-hidden="true"
      />
    );
  }

  return (
    <Ship
      className="size-[15px]"
      strokeWidth={1.7}
      aria-hidden="true"
    />
  );
}

function TransportModeIcon({
  mode,
  className = "size-3.5",
}: {
  mode: Step["legMode"];
  className?: string;
}) {
  if (mode === "PLANE") {
    return (
      <Plane
        className={className}
        strokeWidth={1.7}
        aria-hidden="true"
      />
    );
  }

  if (mode === "BOAT") {
    return (
      <Ship
        className={className}
        strokeWidth={1.7}
        aria-hidden="true"
      />
    );
  }

  if (mode === "TRUCK") {
    return (
      <Truck
        className={className}
        strokeWidth={1.7}
        aria-hidden="true"
      />
    );
  }

  return null;
}

function VehicleStateIcon({
  status,
}: {
  status: VehicleState["status"];
}) {
  if (status === "moving") {
    return (
      <Play
        className="size-4 text-[#173f68]"
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
        className="size-4 text-[#276149]"
        strokeWidth={1.9}
        aria-hidden="true"
      />
    );
  }

  return (
    <Clock
      className="size-4 text-[#0a192f]/42"
      strokeWidth={1.8}
      aria-hidden="true"
    />
  );
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
  const drawerId = useId();
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "history"
  >("overview");
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    setNowMs(Date.now());

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isOpen]);

  useEffect(() => {
    if (
      !selectedStepId ||
      !isOpen ||
      activeTab !== "overview"
    ) {
      return;
    }

    const selectedElement =
      stepsContainerRef.current?.querySelector<HTMLElement>(
        `[data-step-id="${selectedStepId}"]`,
      );

    selectedElement?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeTab, isOpen, selectedStepId]);

  const activeStepIndex = useMemo(
    () => steps.findIndex((step) => !step.reachedAt),
    [steps],
  );

  const vehicleSteps: VehicleStep[] = useMemo(
    () =>
      steps.map((step) => ({
        id: step.id,
        locationName: step.locationName,
        latitude: step.latitude ?? null,
        longitude: step.longitude ?? null,
        reachedAt: step.reachedAt ?? null,
        timerStartedAt: step.timerStartedAt ?? null,
        timerEndsAt: step.timerEndsAt ?? null,
        timerDurationHours:
          step.timerDurationHours ?? null,
        isTimerPaused: step.isTimerPaused ?? false,
        pausedRemainingMinutes:
          step.pausedRemainingMinutes ?? null,
      })),
    [steps],
  );

  const vehicleState = useMemo<VehicleState>(() => {
    const validSteps = vehicleSteps.filter(
      (step) =>
        step.latitude != null &&
        step.longitude != null,
    );

    if (validSteps.length === 0) {
      return {
        status: "idle",
        remainingMs: 0,
        fromName: "",
        toName: "",
        progressPercent: 0,
      };
    }

    let lastReachedIndex = -1;

    for (
      let index = 0;
      index < validSteps.length;
      index += 1
    ) {
      if (validSteps[index].reachedAt) {
        lastReachedIndex = index;
      }
    }

    const originIndex =
      lastReachedIndex >= 0 ? lastReachedIndex : 0;

    const fromStep = validSteps[originIndex];
    const toStep = validSteps[originIndex + 1];

    let vehicleStatus: VehicleState["status"] =
      "idle";
    let remainingMs = 0;
    let elapsedMs = 0;
    let totalLegMs = 0;

    if (fromStep && toStep) {
      totalLegMs =
        (fromStep.timerDurationHours || 4) *
        60 *
        60 *
        1000;

      const startedAt = fromStep.timerStartedAt
        ? new Date(fromStep.timerStartedAt).getTime()
        : 0;

      if (!startedAt) {
        vehicleStatus = "idle";
        remainingMs = totalLegMs;
      } else if (
        fromStep.isTimerPaused &&
        fromStep.pausedRemainingMinutes != null
      ) {
        vehicleStatus = "paused";
        remainingMs =
          fromStep.pausedRemainingMinutes *
          60 *
          1000;
        elapsedMs = Math.max(
          0,
          totalLegMs - remainingMs,
        );
      } else {
        const effectiveNowMs =
          nowMs > 0 ? nowMs : startedAt;

        elapsedMs = Math.max(
          0,
          effectiveNowMs - startedAt,
        );

        remainingMs = Math.max(
          0,
          totalLegMs - elapsedMs,
        );

        vehicleStatus =
          remainingMs <= 0 ? "arrived" : "moving";
      }
    } else if (fromStep && !toStep) {
      vehicleStatus = fromStep.reachedAt
        ? "arrived"
        : "idle";
    }

    const totalSegments = Math.max(
      0,
      validSteps.length - 1,
    );

    const completedSegments = Math.min(
      totalSegments,
      Math.max(0, lastReachedIndex),
    );

    const currentLegProgress =
      totalLegMs > 0
        ? Math.min(1, elapsedMs / totalLegMs)
        : 0;

    let progressPercent = 0;

    if (totalSegments > 0) {
      progressPercent = Math.round(
        ((completedSegments +
          (toStep ? currentLegProgress : 0)) /
          totalSegments) *
          100,
      );
    } else if (vehicleStatus === "arrived") {
      progressPercent = 100;
    }

    progressPercent = Math.min(
      100,
      Math.max(0, progressPercent),
    );

    return {
      status: vehicleStatus,
      remainingMs,
      fromName: fromStep?.locationName ?? "",
      toName: toStep?.locationName ?? "",
      progressPercent,
    };
  }, [nowMs, vehicleSteps]);

  const statusStyle = getStatusStyle(status);

  const showCurrentLeg =
    vehicleState.fromName &&
    vehicleState.toName &&
    vehicleState.status !== "arrived";

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30">
      {/* Poignée d’ouverture */}
      <div className="relative z-20 mx-auto flex w-full justify-center px-4">
        <button
          type="button"
          aria-controls={drawerId}
          aria-expanded={isOpen}
          onClick={() =>
            setIsOpen((current) => !current)
          }
          className="
            pointer-events-auto group relative
            flex min-h-[42px] items-center gap-2.5
            rounded-t-[18px]
            border border-b-0 border-black/[0.08]
            bg-[#f4f3ef]/95 px-5
            font-display text-[11px] font-semibold
            tracking-[-0.005em] text-[#0a192f]/52
            ring-1 ring-white/80
            shadow-[0_-8px_28px_-18px_rgba(15,23,42,0.34),inset_0_1px_0_rgba(255,255,255,0.96)]
            backdrop-blur-2xl
            transition-[color,background-color]
            hover:bg-[#faf9f6]
            hover:text-[#0a192f]/75
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#0a192f]/20
          "
        >
          <GripHorizontal
            className="
              size-5 text-[#0a192f]/28
              transition-colors
              group-hover:text-[#0a192f]/45
            "
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <span>
            {isOpen
              ? "Masquer les détails"
              : "Afficher le trajet"}
          </span>

          {isOpen ? (
            <ChevronDown
              className="size-3.5 text-[#0a192f]/38"
              strokeWidth={2}
              aria-hidden="true"
            />
          ) : (
            <ChevronUp
              className="size-3.5 text-[#0a192f]/38"
              strokeWidth={2}
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {/* Drawer */}
      <div
        id={drawerId}
        aria-hidden={!isOpen}
        className={cx(
          "pointer-events-auto relative overflow-hidden rounded-t-[30px] border-x border-t border-black/[0.08] bg-[#f1f0eb]/95 ring-1 ring-white/85 shadow-[0_-2px_5px_rgba(15,23,42,0.04),0_-30px_80px_-45px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl transition-[height,opacity] duration-300 ease-out motion-reduce:transition-none",
          isOpen
            ? "h-[min(62svh,720px)] opacity-100 min-[810px]:h-[min(54vh,680px)]"
            : "pointer-events-none h-0 opacity-0",
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-px rounded-t-[29px] shadow-[inset_1px_0_0_rgba(255,255,255,0.6),inset_-1px_0_0_rgba(15,23,42,0.02),inset_0_1px_0_rgba(255,255,255,0.82)]"
        />

        <div className="relative z-10 flex h-full flex-col">
          {/* Résumé supérieur */}
          <div className="shrink-0 border-b border-black/[0.065] bg-[#f7f6f2]/85">
            <div className="mx-auto grid w-full max-w-[1180px] gap-5 px-5 py-5 min-[810px]:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] min-[810px]:items-center min-[810px]:px-10 min-[810px]:py-6">
              {/* Statut de la demande */}
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className={cx(
                    "flex size-12 shrink-0 items-center justify-center rounded-[16px] border ring-1 ring-white/80 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_10px_22px_-16px_rgba(15,23,42,0.28),inset_0_1px_0_rgba(255,255,255,0.8)]",
                    statusStyle.iconSurface,
                  )}
                >
                  <StatusIcon
                    status={status}
                    className="size-[21px]"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-[#0a192f]/35">
                      Expédition
                    </span>

                    <span className="font-display text-[11px] font-bold tracking-[0.04em] text-[#0a192f]/62">
                      {requestNumber}
                    </span>

                    <span
                      className={cx(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.09em]",
                        statusStyle.badge,
                      )}
                    >
                      <span
                        className={cx(
                          "size-1.5 rounded-full",
                          statusStyle.dot,
                        )}
                      />

                      {getRequestStatusLabel(status)}
                    </span>
                  </div>

                  <h2 className="mt-2 font-display text-[20px] font-bold leading-[1.15] tracking-[-0.035em] text-[#0a192f] min-[810px]:text-[23px]">
                    {problemType
                      ? getRequestProblemLabel(
                          problemType,
                        )
                      : "Suivi de votre expédition"}
                  </h2>

                  {latestMessage ? (
                    <p className="mt-1.5 line-clamp-2 max-w-[620px] font-display text-[13px] leading-[1.55] text-[#0a192f]/50">
                      {latestMessage}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Trajet et progression */}
              <div
                className="
                  rounded-[20px] border border-black/[0.07]
                  bg-white/58 p-4
                  ring-1 ring-white/75
                  shadow-[0_1px_2px_rgba(15,23,42,0.035),inset_0_1px_0_rgba(255,255,255,0.86)]
                "
              >
                {showCurrentLeg ? (
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-[12px] border border-black/[0.06] bg-white/80 text-[#173f68] shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                      <MapPinned
                        className="size-[17px]"
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2 font-display text-[12px] font-semibold tracking-[-0.01em] text-[#0a192f]/72">
                        <span className="truncate">
                          {vehicleState.fromName}
                        </span>

                        <span className="shrink-0 text-[#0a192f]/25">
                          →
                        </span>

                        <span className="truncate">
                          {vehicleState.toName}
                        </span>
                      </div>

                      <div
                        className="mt-1 flex items-center gap-2"
                        aria-live="polite"
                      >
                        <VehicleStateIcon
                          status={
                            vehicleState.status
                          }
                        />

                        <span className="font-display text-[11px] font-semibold text-[#0a192f]/48">
                          {vehicleState.status ===
                            "idle" &&
                            "Départ imminent"}

                          {vehicleState.status ===
                            "moving" &&
                            `Arrivée estimée dans ${formatDuration(
                              vehicleState.remainingMs,
                            )}`}

                          {vehicleState.status ===
                            "paused" &&
                            `Trajet en pause · ${formatDuration(
                              vehicleState.remainingMs,
                            )} restantes`}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-[12px] border border-[#276149]/10 bg-[#e9f1ec] text-[#276149]">
                      <CheckCircle2
                        className="size-[17px]"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <p className="font-display text-[12px] font-semibold text-[#0a192f]/75">
                        Trajet terminé
                      </p>

                      <p className="mt-0.5 font-display text-[11px] text-[#0a192f]/40">
                        Toutes les étapes ont été validées.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-display text-[10px] font-semibold uppercase tracking-[0.11em] text-[#0a192f]/32">
                      Progression globale
                    </span>

                    <span className="font-display text-[11px] font-bold tabular-nums text-[#0a192f]/62">
                      {vehicleState.progressPercent} %
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.075] shadow-[inset_0_1px_1px_rgba(15,23,42,0.08)]">
                    <div
                      className="h-full rounded-full bg-[#173f68] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-[width] duration-500 ease-out motion-reduce:transition-none"
                      style={{
                        width: `${vehicleState.progressPercent}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mx-auto flex w-full max-w-[1180px] px-5 min-[810px]:px-10">
              <div
                className="
                  flex gap-1 rounded-t-[15px]
                  border-x border-t border-black/[0.065]
                  bg-[#ebeae5] p-1
                  ring-1 ring-white/70
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]
                "
                role="tablist"
                aria-label="Informations de suivi"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={
                    activeTab === "overview"
                  }
                  onClick={() =>
                    setActiveTab("overview")
                  }
                  className={cx(
                    "inline-flex min-h-9 items-center gap-2 rounded-[11px] px-4 font-display text-[11px] font-semibold tracking-[-0.005em] outline-none transition-[background-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-[#0a192f]/18",
                    activeTab === "overview"
                      ? "bg-white text-[#0a192f] shadow-[0_1px_2px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,1)]"
                      : "text-[#0a192f]/42 hover:text-[#0a192f]/70",
                  )}
                >
                  <Route
                    className="size-3.5"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  Itinéraire
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={
                    activeTab === "history"
                  }
                  onClick={() =>
                    setActiveTab("history")
                  }
                  className={cx(
                    "inline-flex min-h-9 items-center gap-2 rounded-[11px] px-4 font-display text-[11px] font-semibold tracking-[-0.005em] outline-none transition-[background-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-[#0a192f]/18",
                    activeTab === "history"
                      ? "bg-white text-[#0a192f] shadow-[0_1px_2px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,1)]"
                      : "text-[#0a192f]/42 hover:text-[#0a192f]/70",
                  )}
                >
                  <Clock
                    className="size-3.5"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  Historique

                  {events.length > 0 ? (
                    <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[9px] tabular-nums text-[#0a192f]/45">
                      {events.length}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>
          </div>

          {/* Contenu défilant */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="mx-auto w-full max-w-[1180px] px-5 py-6 min-[810px]:px-10 min-[810px]:py-7">
              {activeTab === "overview" ? (
                <div
                  ref={stepsContainerRef}
                  role="tabpanel"
                  className="mx-auto w-full max-w-[760px]"
                >
                  {steps.length === 0 ? (
                    <div className="rounded-[22px] border border-dashed border-black/[0.10] bg-white/38 px-6 py-10 text-center">
                      <Route
                        className="mx-auto size-6 text-[#0a192f]/25"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />

                      <p className="mt-3 font-display text-[13px] font-semibold text-[#0a192f]/58">
                        Trajet non configuré
                      </p>

                      <p className="mt-1 font-display text-[12px] text-[#0a192f]/38">
                        Les étapes apparaîtront ici dès
                        qu&apos;elles seront disponibles.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {steps.map((step, index) => {
                        const isReached =
                          Boolean(step.reachedAt);
                        const isCurrent =
                          index === activeStepIndex;
                        const isSelected =
                          selectedStepId === step.id;
                        const isLast =
                          index === steps.length - 1;

                        return (
                          <div
                            key={step.id}
                            data-step-id={step.id}
                            className={cx(
                              "group relative grid grid-cols-[38px_minmax(0,1fr)] gap-3 rounded-[20px] px-3 py-1 transition-[background-color,box-shadow] duration-200",
                              isSelected &&
                                "bg-white/72 ring-1 ring-[#173f68]/15 shadow-[0_8px_26px_-20px_rgba(15,23,42,0.28),inset_0_1px_0_rgba(255,255,255,0.85)]",
                            )}
                          >
                            {/* Rail */}
                            <div className="relative flex flex-col items-center">
                              <div
                                className={cx(
                                  "relative z-10 flex size-8 items-center justify-center rounded-[11px] border shadow-[0_1px_2px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.75)]",
                                  isReached
                                    ? "border-[#173f68] bg-[#173f68] text-white"
                                    : isCurrent
                                      ? "border-[#173f68] bg-[#173f68] text-white shadow-[0_0_0_4px_rgba(23,63,104,0.08),0_2px_5px_rgba(15,23,42,0.12)]"
                                      : "border-black/[0.085] bg-[#f8f7f3] text-[#0a192f]/35",
                                )}
                              >
                                <StepIcon
                                  stepType={
                                    step.stepType
                                  }
                                  isReached={isReached}
                                  isCurrent={isCurrent}
                                />
                              </div>

                              {!isLast ? (
                                <div className="relative min-h-10 w-px flex-1">
                                  <span className="absolute inset-y-0 left-0 w-px bg-black/[0.085]" />

                                  {isReached ? (
                                    <span className="absolute inset-x-0 top-0 h-full bg-[#173f68]/32" />
                                  ) : null}
                                </div>
                              ) : null}
                            </div>

                            {/* Contenu */}
                            <div
                              className={cx(
                                "min-w-0 pb-6",
                                !isLast &&
                                  "border-b border-black/[0.055]",
                              )}
                            >
                              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-display text-[9px] font-bold uppercase tracking-[0.14em] text-[#0a192f]/32">
                                      {getTrajectoryStepTypeLabel(
                                        step.stepType,
                                      )}
                                    </span>

                                    {step.legMode &&
                                    !isLast ? (
                                      <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/55 px-2 py-1 font-display text-[8px] font-bold uppercase tracking-[0.08em] text-[#0a192f]/40">
                                        <TransportModeIcon
                                          mode={
                                            step.legMode
                                          }
                                          className="size-3"
                                        />

                                        {
                                          MODE_LABELS[
                                            step.legMode
                                          ]
                                        }
                                      </span>
                                    ) : null}
                                  </div>

                                  <p
                                    className={cx(
                                      "mt-1.5 truncate font-display text-[14px] font-bold leading-[1.35] tracking-[-0.018em]",
                                      isCurrent
                                        ? "text-[#173f68]"
                                        : isReached
                                          ? "text-[#0a192f]"
                                          : "text-[#0a192f]/58",
                                    )}
                                  >
                                    {step.locationName}
                                  </p>
                                </div>

                                <span
                                  className={cx(
                                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.08em]",
                                    isReached
                                      ? "border-[#276149]/10 bg-[#e9f1ec] text-[#276149]"
                                      : isCurrent
                                        ? "border-[#173f68]/10 bg-[#e8edf2] text-[#173f68]"
                                        : "border-black/[0.06] bg-[#ecebe6] text-[#0a192f]/34",
                                  )}
                                >
                                  <span
                                    className={cx(
                                      "size-1.5 rounded-full",
                                      isReached
                                        ? "bg-[#34775b]"
                                        : isCurrent
                                          ? "bg-[#173f68]"
                                          : "bg-[#0a192f]/22",
                                    )}
                                  />

                                  {isReached
                                    ? "Validée"
                                    : isCurrent
                                      ? "En cours"
                                      : "À venir"}
                                </span>
                              </div>

                              <p className="mt-2 font-display text-[11px] leading-[1.5] text-[#0a192f]/36">
                                {isReached &&
                                step.reachedAt
                                  ? `Étape validée le ${formatDateTime(
                                      step.reachedAt,
                                    )}`
                                  : isCurrent
                                    ? "Votre expédition est actuellement associée à cette étape."
                                    : "Cette étape sera mise à jour au fur et à mesure du trajet."}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  role="tabpanel"
                  className="mx-auto w-full max-w-[820px]"
                >
                  {events.length === 0 ? (
                    <div className="rounded-[22px] border border-dashed border-black/[0.10] bg-white/38 px-6 py-10 text-center">
                      <Clock
                        className="mx-auto size-6 text-[#0a192f]/25"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />

                      <p className="mt-3 font-display text-[13px] font-semibold text-[#0a192f]/58">
                        Aucun événement
                      </p>

                      <p className="mt-1 font-display text-[12px] text-[#0a192f]/38">
                        Les nouvelles mises à jour
                        apparaîtront dans cet historique.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {events.map((event) => {
                        const eventStyle =
                          getStatusStyle(
                            event.status,
                          );

                        return (
                          <article
                            key={event.id}
                            className="
                              relative overflow-hidden rounded-[20px]
                              border border-black/[0.07]
                              bg-white/62 p-4
                              ring-1 ring-white/70
                              shadow-[0_1px_2px_rgba(15,23,42,0.035),0_12px_30px_-26px_rgba(15,23,42,0.25),inset_0_1px_0_rgba(255,255,255,0.88)]
                              min-[640px]:p-5
                            "
                          >
                            <div className="flex items-start gap-3.5">
                              <div
                                className={cx(
                                  "flex size-9 shrink-0 items-center justify-center rounded-[12px] border",
                                  eventStyle.iconSurface,
                                )}
                              >
                                <StatusIcon
                                  status={
                                    event.status
                                  }
                                  className="size-[17px]"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="font-display text-[9px] font-bold uppercase tracking-[0.13em] text-[#0a192f]/34">
                                    {getRequestStatusLabel(
                                      event.status,
                                    )}
                                  </span>

                                  <time
                                    dateTime={new Date(
                                      event.createdAt,
                                    ).toISOString()}
                                    className="font-display text-[10px] tabular-nums text-[#0a192f]/32"
                                  >
                                    {formatDateTime(
                                      event.createdAt,
                                    )}
                                  </time>
                                </div>

                                <h3 className="mt-1.5 font-display text-[14px] font-bold leading-[1.35] tracking-[-0.018em] text-[#0a192f]">
                                  {event.title}
                                </h3>

                                <p className="mt-1.5 font-display text-[12px] leading-[1.6] text-[#0a192f]/48">
                                  {event.message}
                                </p>

                                {event.problemType ? (
                                  <p className="mt-2 font-display text-[11px] font-semibold text-[#a5403b]/80">
                                    {getRequestProblemLabel(
                                      event.problemType,
                                    )}
                                  </p>
                                ) : null}

                                {event.createdByLabel ? (
                                  <p className="mt-3 font-display text-[10px] text-[#0a192f]/28">
                                    Mis à jour par{" "}
                                    {event.createdByLabel}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action inférieure */}
          {/* <div className="shrink-0 border-t border-black/[0.065] bg-[#f7f6f2]/90 px-5 py-3.5 min-[810px]:px-10">
            <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4">
              <p className="hidden font-display text-[10px] text-[#0a192f]/30 min-[640px]:block">
                Les informations affichées sont
                synchronisées avec le suivi de cette
                demande.
              </p>

              <Link
                href={`/demande/${requestId}`}
                className="
                  group ml-auto inline-flex min-h-[42px]
                  items-center justify-center gap-2
                  rounded-[14px]
                  border border-[#061321]
                  bg-[#091827] px-5
                  font-display text-[12px] font-semibold
                  tracking-[-0.01em] text-white
                  ring-1 ring-white/10
                  shadow-[0_1px_2px_rgba(0,0,0,0.22),0_12px_24px_-16px_rgba(9,24,39,0.65),inset_0_1px_0_rgba(255,255,255,0.13),inset_0_-1px_0_rgba(0,0,0,0.28)]
                  transition-[transform,background-color,box-shadow]
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-[#102940]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#0a192f]/30
                  focus-visible:ring-offset-2
                "
              >
                Voir tous les détails

                <ArrowUpRight
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}