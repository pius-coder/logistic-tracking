"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  MapPin,
  Plus,
  Save,
  Ship,
  Plane,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuraMutation } from "@/aura/client";

import type {
  JourneyDto,
  JourneyGeocodingResult,
  JourneyStopType,
  JourneyTransportType,
} from "@/features/journeys/shared/types";
import { JourneyPlaceSearch } from "../shared/JourneyPlaceSearch";
import { JourneyMap } from "../shared/JourneyMap";

type DraftStop = {
  id: string;
  persistedId?: string;
  place: JourneyGeocodingResult | null;
  stopType: JourneyStopType;
  estimatedArrivalAt: string;
  note: string;
};

type Props = {
  requestId: string;
  mapboxToken: string;
  journey: JourneyDto | null;
  onSaved: () => void;
};

let temporaryId = 0;
function makeTemporaryId() {
  temporaryId += 1;
  return `journey-stop-${temporaryId}`;
}

function toLocalDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function createInitialStops(journey: JourneyDto | null): DraftStop[] {
  if (journey?.stops.length) {
    return journey.stops.map((stop) => ({
      id: stop.id,
      persistedId: stop.id,
      place: {
        id: stop.mapboxPlaceId ?? stop.id,
        name: stop.placeName,
        label: stop.placeLabel ?? stop.placeName,
        latitude: stop.latitude,
        longitude: stop.longitude,
      },
      stopType: stop.stopType,
      estimatedArrivalAt: toLocalDateTime(stop.estimatedArrivalAt),
      note: stop.note ?? "",
    }));
  }

  return [
    {
      id: makeTemporaryId(),
      place: null,
      stopType: "DEPART",
      estimatedArrivalAt: "",
      note: "",
    },
    {
      id: makeTemporaryId(),
      place: null,
      stopType: "DESTINATION",
      estimatedArrivalAt: "",
      note: "",
    },
  ];
}

export function JourneyPlanEditor({
  requestId,
  mapboxToken,
  journey,
  onSaved,
}: Props) {
  const [vehicleName, setVehicleName] = useState(journey?.vehicleName ?? "");
  const [transportType, setTransportType] = useState<JourneyTransportType>(
    journey?.transportType ?? "MARITIME",
  );
  const [averageSpeed, setAverageSpeed] = useState(
    journey?.averageSpeed ? String(journey.averageSpeed) : "",
  );
  const [stops, setStops] = useState<DraftStop[]>(() => createInitialStops(journey));

  const saveMutation = useAuraMutation("journey.adminSavePlan");
  const canEdit = !journey || ["BROUILLON", "PLANIFIE"].includes(journey.status);

  const mapStops = useMemo(
    () =>
      stops.flatMap((stop, sequence) =>
        stop.place
          ? [
              {
                id: stop.id,
                placeName: stop.place.name,
                latitude: stop.place.latitude,
                longitude: stop.place.longitude,
                sequence,
                reachedAt: null,
              },
            ]
          : [],
      ),
    [stops],
  );

  function updateStop(id: string, patch: Partial<DraftStop>) {
    setStops((current) => current.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop)));
  }

  function addStop() {
    setStops((current) => {
      const destinationIndex = current.length - 1;
      const next = [...current];
      next.splice(destinationIndex, 0, {
        id: makeTemporaryId(),
        place: null,
        stopType: "ESCALE",
        estimatedArrivalAt: "",
        note: "",
      });
      return next;
    });
  }

  function removeStop(id: string) {
    setStops((current) => current.filter((stop) => stop.id !== id));
  }

  function moveStop(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (index <= 0 || index >= stops.length - 1 || target <= 0 || target >= stops.length - 1) return;
    setStops((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSave() {
    if (!vehicleName.trim()) {
      toast.error(transportType === "MARITIME" ? "Indiquez le nom du navire." : "Indiquez le numéro ou le nom du vol.");
      return;
    }
    if (stops.some((stop) => !stop.place)) {
      toast.error("Sélectionnez un lieu valide pour chaque étape.");
      return;
    }

    try {
      await saveMutation.mutateAsync({
        requestId,
        vehicleName: vehicleName.trim(),
        transportType,
        averageSpeed: averageSpeed ? Number(averageSpeed) : null,
        speedUnit: transportType === "MARITIME" ? "KNOTS" : "KMH",
        stops: stops.map((stop, sequence) => ({
          id: stop.persistedId,
          placeName: stop.place!.name,
          placeLabel: stop.place!.label,
          mapboxPlaceId: stop.place!.id,
          latitude: stop.place!.latitude,
          longitude: stop.place!.longitude,
          stopType: sequence === 0 ? "DEPART" : sequence === stops.length - 1 ? "DESTINATION" : "ESCALE",
          sequence,
          estimatedArrivalAt: stop.estimatedArrivalAt ? new Date(stop.estimatedArrivalAt) : null,
          note: stop.note.trim() || null,
        })),
      } as never);
      toast.success("Le plan du voyage a été enregistré.");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d’enregistrer le trajet.");
    }
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-black/[0.075] bg-[#e9e8e3] p-2 ring-1 ring-white/90 shadow-[0_2px_4px_rgba(15,23,42,0.045),0_28px_75px_-44px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.9)]">
      <div className="grid overflow-hidden rounded-[25px] border border-black/[0.07] bg-[#fbfaf7] shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] min-[1000px]:grid-cols-[minmax(420px,0.92fr)_minmax(0,1.08fr)]">
        <div className="flex flex-col p-5 min-[810px]:p-7">
          <div className="border-b border-black/[0.065] pb-6">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[#0a192f]/35">Configuration du voyage</span>
            <h2 className="mt-2 font-display text-[26px] font-bold leading-[1.05] tracking-[-0.045em] text-[#0a192f]">
              Départ, escales et destination
            </h2>
            <p className="mt-3 max-w-[540px] font-display text-[13px] leading-[1.65] text-[#0a192f]/50">
              Recherchez simplement les ports ou les aéroports. Mapbox enregistre les coordonnées et dessine le trajet automatiquement.
            </p>
          </div>

          <div className="mt-6 grid gap-4 min-[600px]:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-[#0a192f]/42">
                Type de voyage
              </label>
              <div className="grid grid-cols-2 rounded-[16px] border border-black/[0.07] bg-[#ecebe6] p-1 ring-1 ring-white/80">
                {(["MARITIME", "AERIEN"] as const).map((type) => {
                  const active = transportType === type;
                  const Icon = type === "MARITIME" ? Ship : Plane;
                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => setTransportType(type)}
                      className={`flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] font-display text-[12px] font-semibold transition-all ${
                        active
                          ? "bg-white text-[#0a192f] shadow-[0_1px_2px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,1)]"
                          : "text-[#0a192f]/40 hover:text-[#0a192f]/70"
                      }`}
                    >
                      <Icon className="size-4" strokeWidth={1.7} />
                      {type === "MARITIME" ? "Maritime" : "Aérien"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-[#0a192f]/42">
                {transportType === "MARITIME" ? "Nom du navire" : "Vol / appareil"}
              </label>
              <input
                value={vehicleName}
                disabled={!canEdit}
                onChange={(event) => setVehicleName(event.target.value)}
                placeholder={transportType === "MARITIME" ? "Ex. MSC Aurora" : "Ex. AF 946"}
                className="min-h-[54px] rounded-[16px] border border-black/[0.08] bg-[#faf9f6] px-4 font-display text-[14px] font-medium text-[#0a192f] outline-none ring-1 ring-white/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] focus:border-[#173f68]/25 focus:bg-white focus:ring-4 focus:ring-[#173f68]/10"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <label className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-[#0a192f]/42">
              Vitesse moyenne facultative ({transportType === "MARITIME" ? "nœuds" : "km/h"})
            </label>
            <input
              value={averageSpeed}
              disabled={!canEdit}
              onChange={(event) => setAverageSpeed(event.target.value)}
              inputMode="decimal"
              placeholder={transportType === "MARITIME" ? "Ex. 13.7" : "Ex. 850"}
              className="min-h-[50px] rounded-[15px] border border-black/[0.08] bg-[#faf9f6] px-4 font-display text-[14px] text-[#0a192f] outline-none ring-1 ring-white/80 shadow-[0_1px_2px_rgba(15,23,42,0.035),inset_0_1px_0_rgba(255,255,255,0.95)] focus:border-[#173f68]/25 focus:bg-white focus:ring-4 focus:ring-[#173f68]/10"
            />
          </div>

          <div className="mt-7 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-[15px] font-bold tracking-[-0.02em] text-[#0a192f]">Étapes du voyage</h3>
              <p className="mt-1 font-display text-[11px] text-[#0a192f]/38">Le départ reste premier et la destination reste dernière.</p>
            </div>
            {canEdit ? (
              <button
                type="button"
                onClick={addStop}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-[13px] border border-black/[0.08] bg-white px-4 font-display text-[11px] font-semibold text-[#0a192f]/65 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:text-[#0a192f]"
              >
                <Plus className="size-4" /> Ajouter une escale
              </button>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {stops.map((stop, index) => {
              const fixed = index === 0 || index === stops.length - 1;
              const typeLabel = index === 0 ? "Point de départ" : index === stops.length - 1 ? "Destination finale" : `Escale ${index}`;
              return (
                <article
                  key={stop.id}
                  className="relative rounded-[20px] border border-black/[0.07] bg-[#f5f4f0] p-3.5 ring-1 ring-white/75 shadow-[0_1px_2px_rgba(15,23,42,0.035),inset_0_1px_0_rgba(255,255,255,0.82)]"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`flex size-7 items-center justify-center rounded-[9px] font-display text-[10px] font-bold ${fixed ? "bg-[#102b49] text-white" : "border border-black/[0.06] bg-white text-[#0a192f]/60"}`}>
                        {index + 1}
                      </span>
                      <span className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-[#0a192f]/38">{typeLabel}</span>
                    </div>

                    {!fixed && canEdit ? (
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => moveStop(index, -1)} disabled={index === 1} className="flex size-8 items-center justify-center rounded-[10px] text-[#0a192f]/35 hover:bg-black/[0.05] hover:text-[#0a192f] disabled:opacity-25" aria-label="Monter l’escale">
                          <ArrowUp className="size-3.5" />
                        </button>
                        <button type="button" onClick={() => moveStop(index, 1)} disabled={index === stops.length - 2} className="flex size-8 items-center justify-center rounded-[10px] text-[#0a192f]/35 hover:bg-black/[0.05] hover:text-[#0a192f] disabled:opacity-25" aria-label="Descendre l’escale">
                          <ArrowDown className="size-3.5" />
                        </button>
                        <button type="button" onClick={() => removeStop(stop.id)} className="flex size-8 items-center justify-center rounded-[10px] text-[#a5403b]/55 hover:bg-[#f4e7e5] hover:text-[#a5403b]" aria-label="Supprimer l’escale">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <JourneyPlaceSearch
                    transportType={transportType}
                    label={transportType === "MARITIME" ? "Port" : "Aéroport"}
                    value={stop.place}
                    onClear={() => updateStop(stop.id, { place: null })}
                    onSelect={(place) => updateStop(stop.id, { place })}
                  />

                  <div className="mt-3 grid gap-3 min-[520px]:grid-cols-[1fr_1fr]">
                    <label className="flex flex-col gap-1.5">
                      <span className="flex items-center gap-1.5 font-display text-[10px] font-semibold text-[#0a192f]/42">
                        <CalendarClock className="size-3.5" /> ETA estimée
                      </span>
                      <input
                        type="datetime-local"
                        value={stop.estimatedArrivalAt}
                        disabled={!canEdit}
                        onChange={(event) => updateStop(stop.id, { estimatedArrivalAt: event.target.value })}
                        className="min-h-[43px] rounded-[12px] border border-black/[0.07] bg-white/75 px-3 font-display text-[11px] text-[#0a192f] outline-none focus:border-[#173f68]/25 focus:ring-3 focus:ring-[#173f68]/8"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="flex items-center gap-1.5 font-display text-[10px] font-semibold text-[#0a192f]/42">
                        <MapPin className="size-3.5" /> Note facultative
                      </span>
                      <input
                        value={stop.note}
                        disabled={!canEdit}
                        onChange={(event) => updateStop(stop.id, { note: event.target.value })}
                        placeholder="Ex. escale technique"
                        className="min-h-[43px] rounded-[12px] border border-black/[0.07] bg-white/75 px-3 font-display text-[11px] text-[#0a192f] outline-none focus:border-[#173f68]/25 focus:ring-3 focus:ring-[#173f68]/8"
                      />
                    </label>
                  </div>
                </article>
              );
            })}
          </div>

          {canEdit ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-[16px] border border-[#061321] bg-[#091827] px-6 font-display text-[13px] font-semibold text-white ring-1 ring-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.22),0_14px_28px_-17px_rgba(9,24,39,0.65),inset_0_1px_0_rgba(255,255,255,0.13),inset_0_-1px_0_rgba(0,0,0,0.3)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[#102940] disabled:opacity-55"
            >
              <Save className="size-4" />
              {saveMutation.isPending ? "Enregistrement…" : "Enregistrer le trajet"}
            </button>
          ) : (
            <p className="mt-6 rounded-[16px] border border-[#9a681e]/12 bg-[#f5edde] px-4 py-3 font-display text-[12px] leading-[1.5] text-[#7a541d]">
              Le voyage a déjà démarré. Les escales ne peuvent plus être restructurées.
            </p>
          )}
        </div>

        <div className="relative min-h-[540px] border-t border-black/[0.07] min-[1000px]:border-l min-[1000px]:border-t-0">
          {mapStops.length > 0 ? (
            <JourneyMap
              stops={mapStops}
              transportType={transportType}
              mapboxToken={mapboxToken}
              className="h-full min-h-[540px]"
            />
          ) : (
            <div className="flex h-full min-h-[540px] items-center justify-center bg-[#071522] p-8 text-center">
              <div className="max-w-[320px]">
                <MapPin className="mx-auto size-7 text-[#91afd0]/55" strokeWidth={1.5} />
                <p className="mt-4 font-display text-[15px] font-bold text-white/76">La carte se construit automatiquement</p>
                <p className="mt-2 font-display text-[12px] leading-[1.6] text-white/38">Sélectionnez le départ et la destination, puis ajoutez les escales nécessaires.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
