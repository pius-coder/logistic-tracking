"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  PauseCircle,
  Play,
  RotateCcw,
  Send,
  Ship,
  Plane,
} from "lucide-react";
import { toast } from "sonner";
import { useAuraMutation } from "@/aura/client";

import type { JourneyDto } from "@/features/journeys/shared/types";
import { formatDate } from "../shared/journey-geometry";

type Props = {
  journey: JourneyDto;
  onChanged: () => void;
};

const STATUS_LABELS: Record<JourneyDto["status"], string> = {
  BROUILLON: "Brouillon",
  PLANIFIE: "Planifié",
  EN_COURS: "En cours",
  EN_PAUSE: "En pause",
  PROBLEME: "Incident",
  TERMINE: "Terminé",
  ANNULE: "Annulé",
};

export function JourneyOperations({ journey, onChanged }: Props) {
  const [problemMessage, setProblemMessage] = useState("");
  const [etaValue, setEtaValue] = useState("");
  const [etaReason, setEtaReason] = useState("");

  const publishMutation = useAuraMutation("journey.adminPublish");
  const startMutation = useAuraMutation("journey.adminStart");
  const confirmMutation = useAuraMutation("journey.adminConfirmNextStop");
  const pauseMutation = useAuraMutation("journey.adminPause");
  const resumeMutation = useAuraMutation("journey.adminResume");
  const problemMutation = useAuraMutation("journey.adminReportProblem");
  const etaMutation = useAuraMutation("journey.adminUpdateEta");

  const orderedStops = useMemo(
    () => [...journey.stops].sort((a, b) => a.sequence - b.sequence),
    [journey.stops],
  );
  const completedCount = orderedStops.filter((stop) => stop.reachedAt).length;
  const nextStop = orderedStops.find((stop) => !stop.reachedAt) ?? null;
  const currentStop = completedCount > 0 ? orderedStops[completedCount - 1] : null;
  const progress = journey.status === "TERMINE" ? 100 : Math.round((completedCount / orderedStops.length) * 100);
  const TransportIcon = journey.transportType === "MARITIME" ? Ship : Plane;

  async function run(action: () => Promise<unknown>, success: string) {
    try {
      await action();
      toast.success(success);
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action impossible.");
    }
  }

  async function copyPublicLink() {
    const link = `${window.location.origin}/voyage/${journey.publicToken}`;
    await navigator.clipboard.writeText(link);
    toast.success("Lien public copié.");
  }

  return (
    <section className="grid gap-5 min-[980px]:grid-cols-[minmax(0,1.18fr)_minmax(340px,0.82fr)]">
      <div className="overflow-hidden rounded-[30px] border border-black/[0.075] bg-[#fbfaf7] ring-1 ring-white/85 shadow-[0_2px_4px_rgba(15,23,42,0.04),0_24px_65px_-42px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,1)]">
        <header className="flex flex-col gap-5 border-b border-black/[0.065] p-6 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-[16px] border border-black/[0.06] bg-[#102b49] text-white ring-1 ring-white/20 shadow-[0_2px_5px_rgba(15,23,42,0.18),0_12px_25px_-16px_rgba(15,23,42,0.55),inset_0_1px_0_rgba(255,255,255,0.15)]">
              <TransportIcon className="size-[21px]" strokeWidth={1.7} />
            </span>
            <div>
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-[#0a192f]/35">
                {journey.requestNumber} · {journey.transportType === "MARITIME" ? "Voyage maritime" : "Voyage aérien"}
              </span>
              <h2 className="mt-1.5 font-display text-[24px] font-bold tracking-[-0.04em] text-[#0a192f]">{journey.vehicleName}</h2>
              <p className="mt-1 font-display text-[12px] text-[#0a192f]/45">Dernière mise à jour : {formatDate(journey.updatedAt)}</p>
            </div>
          </div>

          <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[0.1em] ${
            journey.status === "TERMINE"
              ? "border-[#276149]/12 bg-[#e9f1ec] text-[#276149]"
              : journey.status === "PROBLEME"
                ? "border-[#a5403b]/12 bg-[#f7e9e7] text-[#a5403b]"
                : journey.status === "EN_PAUSE"
                  ? "border-[#9a681e]/12 bg-[#f5edde] text-[#9a681e]"
                  : "border-[#173f68]/10 bg-[#e8edf2] text-[#173f68]"
          }`}>
            <span className="size-1.5 rounded-full bg-current opacity-75" />
            {STATUS_LABELS[journey.status]}
          </span>
        </header>

        <div className="p-6">
          <div className="grid gap-4 min-[600px]:grid-cols-3">
            <div className="rounded-[18px] border border-black/[0.065] bg-[#f3f2ed] p-4 ring-1 ring-white/75">
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.11em] text-[#0a192f]/34">Progression</span>
              <p className="mt-2 font-display text-[27px] font-bold tracking-[-0.045em] text-[#0a192f]">{progress} %</p>
              <p className="mt-1 font-display text-[11px] text-[#0a192f]/40">{completedCount}/{orderedStops.length} étapes confirmées</p>
            </div>
            <div className="rounded-[18px] border border-black/[0.065] bg-[#f3f2ed] p-4 ring-1 ring-white/75">
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.11em] text-[#0a192f]/34">Dernière position</span>
              <p className="mt-2 line-clamp-2 font-display text-[14px] font-bold leading-[1.3] text-[#0a192f]">{currentStop?.placeName ?? "Départ non confirmé"}</p>
              <p className="mt-1 font-display text-[11px] text-[#0a192f]/40">Position confirmée par l’admin</p>
            </div>
            <div className="rounded-[18px] border border-black/[0.065] bg-[#f3f2ed] p-4 ring-1 ring-white/75">
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.11em] text-[#0a192f]/34">Prochaine étape</span>
              <p className="mt-2 line-clamp-2 font-display text-[14px] font-bold leading-[1.3] text-[#0a192f]">{nextStop?.placeName ?? "Voyage terminé"}</p>
              <p className="mt-1 font-display text-[11px] text-[#0a192f]/40">{nextStop ? `ETA : ${formatDate(nextStop.estimatedArrivalAt)}` : "Toutes les étapes sont validées"}</p>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/[0.07] shadow-[inset_0_1px_1px_rgba(15,23,42,0.08)]">
            <div className="h-full rounded-full bg-[#173f68] transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {journey.status === "BROUILLON" ? (
              <button
                type="button"
                onClick={() => run(() => publishMutation.mutateAsync({ requestId: journey.requestId } as never), "Le voyage est maintenant publié.")}
                disabled={publishMutation.isPending}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[15px] border border-[#061321] bg-[#091827] px-5 font-display text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.2),0_12px_25px_-16px_rgba(9,24,39,0.65),inset_0_1px_0_rgba(255,255,255,0.13)] hover:bg-[#102940] disabled:opacity-50"
              >
                <Send className="size-4" /> Publier le voyage
              </button>
            ) : null}

            {journey.status === "PLANIFIE" ? (
              <button
                type="button"
                onClick={() => run(() => startMutation.mutateAsync({ requestId: journey.requestId } as never), "Le voyage a démarré.")}
                disabled={startMutation.isPending}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[15px] border border-[#061321] bg-[#091827] px-5 font-display text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.2),0_12px_25px_-16px_rgba(9,24,39,0.65),inset_0_1px_0_rgba(255,255,255,0.13)] hover:bg-[#102940] disabled:opacity-50"
              >
                <Play className="size-4" /> Confirmer le départ
              </button>
            ) : null}

            {["EN_COURS", "EN_PAUSE", "PROBLEME"].includes(journey.status) && nextStop ? (
              <button
                type="button"
                onClick={() => run(() => confirmMutation.mutateAsync({ requestId: journey.requestId } as never), nextStop.stopType === "DESTINATION" ? "Le voyage est terminé." : `Arrivée à ${nextStop.placeName} confirmée.`)}
                disabled={confirmMutation.isPending}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[15px] border border-[#276149]/20 bg-[#276149] px-5 font-display text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.14),0_12px_25px_-16px_rgba(39,97,73,0.55),inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-[#317458] disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" /> Confirmer l’arrivée à {nextStop.placeName}
              </button>
            ) : null}

            {journey.status === "EN_COURS" ? (
              <button
                type="button"
                onClick={() => run(() => pauseMutation.mutateAsync({ requestId: journey.requestId } as never), "Voyage mis en pause.")}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[15px] border border-black/[0.08] bg-white px-5 font-display text-[12px] font-semibold text-[#0a192f]/65 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:text-[#0a192f]"
              >
                <PauseCircle className="size-4" /> Mettre en pause
              </button>
            ) : null}

            {["EN_PAUSE", "PROBLEME"].includes(journey.status) ? (
              <button
                type="button"
                onClick={() => run(() => resumeMutation.mutateAsync({ requestId: journey.requestId } as never), "Le voyage a repris.")}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[15px] border border-black/[0.08] bg-white px-5 font-display text-[12px] font-semibold text-[#0a192f]/65 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:text-[#0a192f]"
              >
                <RotateCcw className="size-4" /> Reprendre le voyage
              </button>
            ) : null}

            {journey.status !== "BROUILLON" ? (
              <button
                type="button"
                onClick={copyPublicLink}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[15px] border border-black/[0.08] bg-white px-5 font-display text-[12px] font-semibold text-[#0a192f]/65 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:text-[#0a192f]"
              >
                <Clipboard className="size-4" /> Copier le lien client
              </button>
            ) : null}

            {journey.status !== "BROUILLON" ? (
              <a
                href={`/voyage/${journey.publicToken}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[15px] border border-black/[0.08] bg-white px-5 font-display text-[12px] font-semibold text-[#0a192f]/65 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:text-[#0a192f]"
              >
                <ExternalLink className="size-4" /> Aperçu client
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-5">
        {nextStop && journey.status !== "BROUILLON" && journey.status !== "TERMINE" ? (
          <div className="rounded-[26px] border border-black/[0.075] bg-[#fbfaf7] p-5 ring-1 ring-white/85 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_45px_-32px_rgba(15,23,42,0.32),inset_0_1px_0_rgba(255,255,255,1)]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-[13px] border border-black/[0.06] bg-[#f1f0eb] text-[#173f68]"><CalendarClock className="size-[18px]" /></span>
              <div>
                <h3 className="font-display text-[14px] font-bold text-[#0a192f]">Modifier l’ETA</h3>
                <p className="font-display text-[11px] text-[#0a192f]/40">{nextStop.placeName}</p>
              </div>
            </div>
            <input
              type="datetime-local"
              value={etaValue}
              onChange={(event) => setEtaValue(event.target.value)}
              className="mt-4 min-h-[46px] w-full rounded-[13px] border border-black/[0.08] bg-[#faf9f6] px-3 font-display text-[12px] text-[#0a192f] outline-none focus:border-[#173f68]/25 focus:ring-4 focus:ring-[#173f68]/8"
            />
            <input
              value={etaReason}
              onChange={(event) => setEtaReason(event.target.value)}
              placeholder="Motif facultatif"
              className="mt-2 min-h-[44px] w-full rounded-[13px] border border-black/[0.08] bg-[#faf9f6] px-3 font-display text-[12px] text-[#0a192f] outline-none focus:border-[#173f68]/25 focus:ring-4 focus:ring-[#173f68]/8"
            />
            <button
              type="button"
              disabled={!etaValue || etaMutation.isPending}
              onClick={() => run(
                () => etaMutation.mutateAsync({ requestId: journey.requestId, stopId: nextStop.id, estimatedArrivalAt: new Date(etaValue), reason: etaReason || undefined } as never),
                "L’ETA a été actualisée.",
              )}
              className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-[13px] border border-black/[0.08] bg-white font-display text-[11px] font-semibold text-[#0a192f]/65 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:text-[#0a192f] disabled:opacity-45"
            >
              Enregistrer l’ETA
            </button>
          </div>
        ) : null}

        {["PLANIFIE", "EN_COURS", "EN_PAUSE"].includes(journey.status) ? (
          <div className="rounded-[26px] border border-[#a5403b]/10 bg-[#fbfaf7] p-5 ring-1 ring-white/85 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-[13px] border border-[#a5403b]/10 bg-[#f7e9e7] text-[#a5403b]"><AlertTriangle className="size-[18px]" /></span>
              <div>
                <h3 className="font-display text-[14px] font-bold text-[#0a192f]">Signaler un incident</h3>
                <p className="font-display text-[11px] text-[#0a192f]/40">Le message sera visible par le client.</p>
              </div>
            </div>
            <textarea
              rows={3}
              value={problemMessage}
              onChange={(event) => setProblemMessage(event.target.value)}
              placeholder="Ex. escale retardée en raison des conditions météorologiques…"
              className="mt-4 w-full resize-none rounded-[14px] border border-black/[0.08] bg-[#faf9f6] px-3 py-3 font-display text-[12px] leading-[1.55] text-[#0a192f] outline-none focus:border-[#a5403b]/25 focus:ring-4 focus:ring-[#a5403b]/8"
            />
            <button
              type="button"
              disabled={problemMessage.trim().length < 3 || problemMutation.isPending}
              onClick={() => run(
                async () => {
                  await problemMutation.mutateAsync({ requestId: journey.requestId, message: problemMessage.trim() } as never);
                  setProblemMessage("");
                },
                "L’incident a été signalé.",
              )}
              className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-[13px] border border-[#a5403b]/16 bg-[#a5403b] font-display text-[11px] font-semibold text-white shadow-[0_8px_20px_-14px_rgba(165,64,59,0.65),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-[#b24b45] disabled:opacity-45"
            >
              Signaler le problème
            </button>
          </div>
        ) : null}
      </aside>
    </section>
  );
}
