"use client";

import { useState, useCallback, useMemo } from "react";
import { Layer, Map, Marker, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useMultiModalRoute, type LegMode } from "./useMultiModalRoute";
import { LocationPickerDialog } from "@/components/country/LocationPickerDialog";
import { useAuraMutation } from "@/aura/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Truck,
  Plane,
  Ship,
  GripVertical,
  Trash2,
  Plus,
  Save,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { CopyMessageDialog } from "./CopyMessageDialog";

type StepDraft = {
  id: string;
  locationName: string;
  stepType: "ORIGIN" | "ESCALE" | "DESTINATION";
  legMode: LegMode;
  sequence: number;
  timerDurationHours: number;
  latitude: number | null;
  longitude: number | null;
};

type Props = {
  requestId: string;
  initialSteps: StepDraft[];
  mapboxToken: string;
};

const LEG_MODE_ICONS: Record<LegMode, typeof Truck> = {
  TRUCK: Truck,
  PLANE: Plane,
  BOAT: Ship,
};

const LEG_MODE_COLORS: Record<LegMode, string> = {
  TRUCK: "#FF5733",
  PLANE: "#3388FF",
  BOAT: "#2ECC71",
};

let _idCounter = 0;
function makeId() {
  _idCounter++;
  return `step_${_idCounter}`;
}

export function AdminTrajectoryEditor({ requestId, initialSteps, mapboxToken }: Props) {
  const [steps, setSteps] = useState<StepDraft[]>(() =>
    initialSteps.length > 0
      ? initialSteps.map((s) => ({ ...s, id: s.id || makeId() }))
      : [
          { id: makeId(), locationName: "", stepType: "ORIGIN", legMode: "TRUCK", sequence: 0, timerDurationHours: 48, latitude: null, longitude: null },
          { id: makeId(), locationName: "", stepType: "DESTINATION", legMode: "TRUCK", sequence: 1, timerDurationHours: 24, latitude: null, longitude: null },
        ],
  );

  const [pickerStepId, setPickerStepId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const waypoints = useMemo(
    () => steps.filter((s) => s.latitude != null && s.longitude != null),
    [steps],
  );

  const legModes = useMemo(
    () => waypoints.slice(0, -1).map((_, i) => steps.find((s) => s.id === waypoints[i].id)?.legMode ?? "TRUCK"),
    [waypoints, steps],
  );

  const { legs, loading: routeLoading } = useMultiModalRoute({
    waypoints: waypoints.map((s) => ({ latitude: s.latitude!, longitude: s.longitude! })),
    legModes,
    mapboxToken,
  });

  const [copyMessage, setCopyMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const saveMutation = useAuraMutation<{ requestId: string; steps: any[] }, { success: true; copyMessage: string }>("admin.saveTrajectory", {
    onSuccess: (data) => {
      setCopyMessage(data.copyMessage);
      setDialogOpen(true);
    },
    onError: (e) => toast.error("Erreur", { description: e instanceof Error ? e.message : undefined }),
  });

  const updateStep = useCallback((id: string, patch: Partial<StepDraft>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const addStep = useCallback(() => {
    setSteps((prev) => [
      ...prev,
      { id: makeId(), locationName: "", stepType: "ESCALE", legMode: "TRUCK", sequence: prev.length, timerDurationHours: 4, latitude: null, longitude: null },
    ]);
  }, []);

  const removeStep = useCallback((id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, sequence: i })));
  }, []);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(steps);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setSteps(items.map((s, i) => ({ ...s, sequence: i })));
  }, [steps]);

  const handleLocationSelect = useCallback((value: { locationName: string; latitude: number; longitude: number }) => {
    if (pickerStepId) {
      updateStep(pickerStepId, {
        locationName: value.locationName,
        latitude: value.latitude,
        longitude: value.longitude,
      });
    }
  }, [pickerStepId, updateStep]);

  const handleSave = useCallback(() => {
    const valid = steps.filter((s) => s.locationName.trim() && s.latitude != null && s.longitude != null);
    if (valid.length < 2) {
      toast.error("Au moins 2 etapes valides sont requises.");
      return;
    }
    saveMutation.mutate({
      requestId,
      steps: valid.map((s) => ({
        locationName: s.locationName,
        stepType: s.stepType,
        legMode: s.legMode,
        sequence: s.sequence,
        timerDurationHours: s.timerDurationHours,
        latitude: s.latitude,
        longitude: s.longitude,
        note: "",
      })),
    });
  }, [saveMutation, requestId, steps]);

  const bounds = useMemo(() => {
    const coords = waypoints.filter((s) => s.latitude && s.longitude).map((s) => [s.longitude!, s.latitude!] as [number, number]);
    if (coords.length < 2) return null;
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    return { minLng: Math.min(...lngs), maxLng: Math.max(...lngs), minLat: Math.min(...lats), maxLat: Math.max(...lats) };
  }, [waypoints]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,440px]">
      {/* Map */}
      <Card className="overflow-hidden">
        <div className="relative h-[500px] w-full">
          <Map
            mapboxAccessToken={mapboxToken}
            initialViewState={
              bounds
                ? {
                    latitude: (bounds.minLat + bounds.maxLat) / 2,
                    longitude: (bounds.minLng + bounds.maxLng) / 2,
                    zoom: Math.max(2, Math.min(8, Math.log2(360 / Math.max(bounds.maxLng - bounds.minLng, bounds.maxLat - bounds.minLat)))),
                  }
                : { latitude: 5.3599, longitude: -4.0083, zoom: 3 }
            }
            mapStyle="mapbox://styles/mapbox/streets-v12"
          >
            {legs.map((leg) => (
              <Source
                key={`leg-${leg.fromIndex}`}
                id={`leg-${leg.fromIndex}`}
                type="geojson"
                data={{ type: "Feature", geometry: leg.geometry, properties: { legMode: leg.legMode } }}
              >
                <Layer
                  id={`leg-line-${leg.fromIndex}`}
                  type="line"
                  paint={{
                    "line-color": LEG_MODE_COLORS[leg.legMode],
                    "line-width": 3.5,
                    "line-opacity": 0.85,
                    "line-dasharray": leg.legMode === "PLANE" ? [2, 4] : [1, 0],
                  }}
                />
              </Source>
            ))}

            {waypoints.map((step, idx) => (
              <Marker key={step.id} latitude={step.latitude!} longitude={step.longitude!} anchor="bottom">
                <div className="flex h-6 w-8 items-center justify-center rounded-md border-2 border-background bg-card text-xs font-bold shadow-md">
                  {idx + 1}
                </div>
              </Marker>
            ))}
          </Map>

          {routeLoading && (
            <div className="absolute inset-x-0 top-4 mx-auto w-fit rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg">
              Calcul de l&apos;itineraire...
            </div>
          )}
        </div>
      </Card>

      {/* Step List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Etapes du trajet</h3>
          <Button size="sm" variant="outline" onClick={addStep} type="button">
            <Plus className="mr-1 h-4 w-4" /> Ajouter
          </Button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="steps">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {steps.map((step, idx) => (
                  <Draggable key={step.id} draggableId={step.id} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`rounded-lg border bg-card p-3 transition-colors ${snapshot.isDragging ? "shadow-lg ring-2 ring-primary" : ""}`}
                      >
                        <div className="flex items-start gap-2">
                          {/* Drag handle (the whole card is a handle) */}

                          {/* Number badge */}
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold">
                            {idx + 1}
                          </span>

                          {/* Fields */}
                          <div className="flex-1 space-y-1.5 min-w-0">
                            {/* Location picker */}
                            <button
                              type="button"
                              onClick={() => { setPickerStepId(step.id); setPickerOpen(true); }}
                              className="flex h-8 w-full items-center gap-2 rounded-md border bg-background px-3 text-xs text-left hover:bg-accent transition-colors"
                            >
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              {step.locationName ? (
                                <span className="truncate">{step.locationName}</span>
                              ) : (
                                <span className="text-muted-foreground">Choisir un lieu...</span>
                              )}
                              {step.latitude != null && step.longitude != null && (
                                <span className="ml-auto text-[9px] text-muted-foreground shrink-0">
                                  {step.latitude.toFixed(2)}, {step.longitude.toFixed(2)}
                                </span>
                              )}
                            </button>

                            {/* Step type + Leg mode + Timer */}
                            <div className="flex items-center gap-2">
                              <select
                                value={step.stepType}
                                onChange={(e) => updateStep(step.id, { stepType: e.target.value as StepDraft["stepType"] })}
                                className="h-6 rounded border bg-background px-1 text-[10px]"
                              >
                                <option value="ORIGIN">Depart</option>
                                <option value="ESCALE">Escale</option>
                                <option value="DESTINATION">Arrivee</option>
                              </select>

                              <div className="flex gap-0.5">
                                {(Object.keys(LEG_MODE_COLORS) as LegMode[]).map((mode) => {
                                  const Icon = LEG_MODE_ICONS[mode];
                                  const isActive = step.legMode === mode;
                                  return (
                                    <button
                                      key={mode}
                                      type="button"
                                      onClick={() => updateStep(step.id, { legMode: mode })}
                                      className={`flex h-6 w-6 items-center justify-center rounded border transition-colors ${
                                        isActive ? "border-current bg-current/10" : "border-muted text-muted-foreground hover:bg-muted"
                                      }`}
                                      style={isActive ? { borderColor: LEG_MODE_COLORS[mode], color: LEG_MODE_COLORS[mode] } : undefined}
                                      title={mode}
                                    >
                                      <Icon className="h-3 w-3" />
                                    </button>
                                  );
                                })}
                              </div>

                              <Input
                                type="number"
                                min={1}
                                max={240}
                                value={step.timerDurationHours}
                                onChange={(e) => updateStep(step.id, { timerDurationHours: Number(e.target.value) })}
                                className="h-6 w-16 text-[10px]"
                                title="Heures de transit"
                              />
                              <span className="text-[10px] text-muted-foreground">h</span>
                            </div>

                            {/* Coordinates display (read-only) */}
                            {step.latitude != null && step.longitude != null && (
                              <p className="text-[9px] text-muted-foreground">
                                {step.latitude.toFixed(4)}, {step.longitude.toFixed(4)}
                              </p>
                            )}
                          </div>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => removeStep(step.id)}
                            className="mt-1 shrink-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <Button className="w-full" onClick={handleSave} disabled={saveMutation.isPending} type="button">
          <Save className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? "Enregistrement..." : "Enregistrer le trajet"}
        </Button>
      </div>

      <CopyMessageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        message={copyMessage}
        title="Message à envoyer au client"
      />
      <LocationPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(value) => {
          handleLocationSelect(value);
          setPickerStepId(null);
        }}
        enableLocationSearch
      />
    </div>
  );
}
