"use client";

import type { FormEvent, ReactNode } from "react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuraMutation, useAuraQuery } from "@/aura/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2, Copy, KeyRound, Package, Plane, Ship, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface CountryOption {
  id: string;
  name: string;
}

type TransportMode = "AVION" | "BATEAU";

type CreatedShipment = {
  id: string;
  requestNumber: string;
  client: {
    username: string;
    temporaryPassword: string;
    displayName: string | null;
    phone: string | null;
    email: string | null;
  };
};

const emptyShipment = {
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  clientBusinessName: "",
  originCountryId: "",
  destinationCountryId: "",
  recipientName: "",
  recipientPhone: "",
  deliveryAddress: "",
  city: "",
  region: "",
  packageWeightKg: "",
  packageVolumeM3: "",
  packageCount: "1",
  productDescription: "",
  transportMode: "AVION" as TransportMode,
  adminNotes: "",
};

export default function NouveauSuiviPage() {
  const router = useRouter();
  const [shipmentForm, setShipmentForm] = useState(emptyShipment);
  const [createdShipment, setCreatedShipment] = useState<CreatedShipment | null>(null);

  const { data: countriesData } = useAuraQuery<{ countries: CountryOption[] }>("catalog.countries");
  const createShipment = useAuraMutation<Record<string, unknown>, CreatedShipment>("admin.createShipment", {
    invalidate: ["admin.trackingShipments", "admin.trackingDashboard", "admin.users"],
  });

  const countries = countriesData?.countries ?? [];

  const handleOriginChange = useCallback(
    (value: string | null) => setShipmentForm((current) => ({ ...current, originCountryId: value ?? "" })),
    [],
  );
  const handleDestinationChange = useCallback(
    (value: string | null) => setShipmentForm((current) => ({ ...current, destinationCountryId: value ?? "" })),
    [],
  );

  async function submitShipment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!shipmentForm.destinationCountryId) {
      toast.error("Choisissez le pays de destination.");
      return;
    }

    const created = await createShipment.mutateAsync({
      ...shipmentForm,
      originCountryId: shipmentForm.originCountryId || null,
      clientEmail: shipmentForm.clientEmail || null,
      clientBusinessName: shipmentForm.clientBusinessName || null,
      packageWeightKg: shipmentForm.packageWeightKg || null,
      packageVolumeM3: shipmentForm.packageVolumeM3 || null,
    });

    setCreatedShipment(created);
    toast.success(`Colis ${created.requestNumber} créé.`);
  }

  async function copyCredentials() {
    if (!createdShipment) return;
    await navigator.clipboard.writeText(
      [
        `Colis: ${createdShipment.requestNumber}`,
        `Identifiant: ${createdShipment.client.username}`,
        `Mot de passe provisoire: ${createdShipment.client.temporaryPassword}`,
      ].join("\n"),
    );
    toast.success("Accès client copiés.");
  }

  return (
    <main className="grid min-h-screen gap-6 px-4 py-6 xl:grid-cols-[360px_minmax(0,1fr)] md:px-6">
      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Nouveau tracking</p>
          <h1 className="text-2xl font-semibold tracking-tight">Créer un colis</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Le compte client est créé automatiquement depuis les informations saisies ici.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" />
              Création manuelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">1</span>
              <div>
                <p className="font-medium">Remplir le formulaire</p>
                <p className="text-muted-foreground">Saisir les infos client et colis ci-contre.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">2</span>
              <div>
                <p className="font-medium">Transmettre les accès</p>
                <p className="text-muted-foreground">Un identifiant + mot de passe provisoire est généré automatiquement à partager au client.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">3</span>
              <div>
                <p className="font-medium">Configurer le trajet</p>
                <p className="text-muted-foreground">Définir les étapes, publier et démarrer le suivi.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {createdShipment ? (
          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4" />
                Accès client générés
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-md border bg-muted/50 p-3 space-y-2">
                <InfoLine label="Colis" value={createdShipment.requestNumber} />
                <InfoLine label="Identifiant" value={createdShipment.client.username} />
                <InfoLine label="Mot de passe provisoire" value={createdShipment.client.temporaryPassword} />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                Colis créé — transmettez ces accès au client, puis configurez le trajet.
              </p>
              <div className="grid gap-2">
                <Button type="button" variant="outline" onClick={copyCredentials}>
                  <Copy className="h-4 w-4" />
                  Copier les accès
                </Button>
                <Button type="button" onClick={() => router.push(`/dashboard/admin/requests/${createdShipment.id}/journey`)}>
                  <ArrowRight className="h-4 w-4" />
                  Configurer le trajet
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </section>

      <form onSubmit={submitShipment} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Nom du client *">
              <Input
                value={shipmentForm.clientName}
                onChange={(event) => setShipmentForm((current) => ({ ...current, clientName: event.target.value }))}
                required
              />
            </Field>
            <Field label="Téléphone client *">
              <Input
                value={shipmentForm.clientPhone}
                onChange={(event) => setShipmentForm((current) => ({ ...current, clientPhone: event.target.value }))}
                required
              />
            </Field>
            <Field label="Email">
              <Input
                value={shipmentForm.clientEmail}
                onChange={(event) => setShipmentForm((current) => ({ ...current, clientEmail: event.target.value }))}
                type="email"
              />
            </Field>
            <Field label="Entreprise">
              <Input
                value={shipmentForm.clientBusinessName}
                onChange={(event) => setShipmentForm((current) => ({ ...current, clientBusinessName: event.target.value }))}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mode et destination</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Pays d&apos;origine</Label>
              <Combobox
                value={shipmentForm.originCountryId}
                onValueChange={handleOriginChange}
                itemToStringLabel={(id) => countries.find((country) => country.id === id)?.name ?? ""}
              >
                <ComboboxInput placeholder="Pays d&apos;origine" showTrigger showClear />
                <ComboboxContent>
                  <ComboboxList>
                    {countries.map((country) => (
                      <ComboboxItem key={country.id} value={country.id}>
                        {country.name}
                      </ComboboxItem>
                    ))}
                    <ComboboxEmpty>Aucun pays</ComboboxEmpty>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div className="space-y-2">
              <Label>Pays de destination *</Label>
              <Combobox
                value={shipmentForm.destinationCountryId}
                onValueChange={handleDestinationChange}
                itemToStringLabel={(id) => countries.find((country) => country.id === id)?.name ?? ""}
              >
                <ComboboxInput placeholder="Destination" showTrigger />
                <ComboboxContent>
                  <ComboboxList>
                    {countries.map((country) => (
                      <ComboboxItem key={country.id} value={country.id}>
                        {country.name}
                      </ComboboxItem>
                    ))}
                    <ComboboxEmpty>Aucun pays</ComboboxEmpty>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div className="md:col-span-2">
              <Label>Mode du trajet *</Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[
                  { value: "AVION" as TransportMode, label: "Avion uniquement", icon: Plane },
                  { value: "BATEAU" as TransportMode, label: "Bateau uniquement", icon: Ship },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setShipmentForm((current) => ({ ...current, transportMode: value }))}
                    className={`flex h-12 items-center gap-3 rounded-md border px-3 text-left text-sm transition-colors ${
                      shipmentForm.transportMode === value ? "border-primary bg-primary/10" : "bg-background hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Destinataire et livraison</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Nom du destinataire *">
              <Input
                value={shipmentForm.recipientName}
                onChange={(event) => setShipmentForm((current) => ({ ...current, recipientName: event.target.value }))}
                required
              />
            </Field>
            <Field label="Téléphone destinataire *">
              <Input
                value={shipmentForm.recipientPhone}
                onChange={(event) => setShipmentForm((current) => ({ ...current, recipientPhone: event.target.value }))}
                required
              />
            </Field>
            <Field label="Ville">
              <Input
                value={shipmentForm.city}
                onChange={(event) => setShipmentForm((current) => ({ ...current, city: event.target.value }))}
              />
            </Field>
            <Field label="Région">
              <Input
                value={shipmentForm.region}
                onChange={(event) => setShipmentForm((current) => ({ ...current, region: event.target.value }))}
              />
            </Field>
            <div className="space-y-2 md:col-span-2">
              <Label>Adresse complète *</Label>
              <Textarea
                value={shipmentForm.deliveryAddress}
                onChange={(event) => setShipmentForm((current) => ({ ...current, deliveryAddress: event.target.value }))}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Détails du colis</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Field label="Nombre de colis *">
              <Input
                value={shipmentForm.packageCount}
                onChange={(event) => setShipmentForm((current) => ({ ...current, packageCount: event.target.value }))}
                type="number"
                min="1"
                required
              />
            </Field>
            <Field label="Poids total kg">
              <Input
                value={shipmentForm.packageWeightKg}
                onChange={(event) => setShipmentForm((current) => ({ ...current, packageWeightKg: event.target.value }))}
                type="number"
                min="0"
                step="0.01"
                placeholder="ex: 42.5"
              />
            </Field>
            <Field label="Volume m3">
              <Input
                value={shipmentForm.packageVolumeM3}
                onChange={(event) => setShipmentForm((current) => ({ ...current, packageVolumeM3: event.target.value }))}
                type="number"
                min="0"
                step="0.001"
                placeholder="ex: 1.2"
              />
            </Field>
            <div className="space-y-2 md:col-span-3">
              <Label>Contenu du colis *</Label>
              <Textarea
                value={shipmentForm.productDescription}
                onChange={(event) => setShipmentForm((current) => ({ ...current, productDescription: event.target.value }))}
                placeholder="Décrire clairement ce qui est transporté."
                required
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Notes admin</Label>
              <Textarea
                value={shipmentForm.adminNotes}
                onChange={(event) => setShipmentForm((current) => ({ ...current, adminNotes: event.target.value }))}
                placeholder="Informations internes visibles seulement par l&apos;équipe."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={createShipment.isPending}>
            <Package className="h-4 w-4" />
            Créer le colis
          </Button>
        </div>
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="break-words font-medium">{value}</p>
    </div>
  );
}
