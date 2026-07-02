"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface LocationPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: { locationName: string; latitude: number; longitude: number }) => void;
  enableLocationSearch?: boolean;
}

export function LocationPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: LocationPickerDialogProps) {
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const handleConfirm = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!locationName || isNaN(lat) || isNaN(lng)) return;
    onSelect({ locationName, latitude: lat, longitude: lng });
    setLocationName("");
    setLatitude("");
    setLongitude("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choisir un emplacement</DialogTitle>
          <DialogDescription>
            Saisissez le nom et les coordonnées GPS du point de passage.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="location-name">Nom du lieu</Label>
            <Input
              id="location-name"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Ex: Port de Shanghai"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location-lat">Latitude</Label>
            <Input
              id="location-lat"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Ex: 31.2304"
              type="number"
              step="any"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location-lng">Longitude</Label>
            <Input
              id="location-lng"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Ex: 121.4737"
              type="number"
              step="any"
            />
          </div>
          <Button onClick={handleConfirm} disabled={!locationName || !latitude || !longitude}>
            Confirmer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
