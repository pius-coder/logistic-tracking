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
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  KeyRound,
  Package,
  Plane,
  Ship,
  UserPlus,
} from "lucide-react";
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
    username: string | null;
    temporaryPassword: string | null;
    displayName: string | null;
    phone: string | null;
    email: string | null;
  };
};

interface UserOption {
  id: string;
  displayName: string | null;
  businessName: string | null;
  phone: string | null;
  email: string | null;
  country: { name: string; iso2: string } | null;
  _count: { requests: number };
}

const emptyShipment = {
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  clientBusinessName: "",
  userId: "",
  originCountryId: "",
  destinationCountryId: "",
  recipientName: "",
  recipientPhone: "",
  deliveryAddress: "",
  city: "",
  region: "",
  packageWeightKg: "",
  packageCount: "1",
  productDescription: "",
  transportMode: "AVION" as TransportMode,
  adminNotes: "",
};


export default function NouveauSuiviPage() {
  const router = useRouter();
  const [shipmentForm, setShipmentForm] = useState(emptyShipment);
  const [createdShipment, setCreatedShipment] =
    useState<CreatedShipment | null>(null);

  const { data: countriesData } = useAuraQuery<{ countries: CountryOption[] }>(
    "catalog.countries",
  );
  const createShipment = useAuraMutation<
    Record<string, unknown>,
    CreatedShipment
  >("admin.createShipment", {
    invalidate: [
      "admin.trackingShipments",
      "admin.trackingDashboard",
      "admin.users",
    ],
  });

  const countries = countriesData?.countries ?? [];

  const handleOriginChange = useCallback(
    (value: string | null) =>
      setShipmentForm((current) => ({
        ...current,
        originCountryId: value ?? "",
      })),
    [],
  );
  const handleDestinationChange = useCallback(
    (value: string | null) =>
      setShipmentForm((current) => ({
        ...current,
        destinationCountryId: value ?? "",
      })),
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
      userId: shipmentForm.userId && shipmentForm.userId !== "search" ? shipmentForm.userId : undefined,
      originCountryId: shipmentForm.originCountryId || null,
      clientEmail: shipmentForm.clientEmail || null,
      clientBusinessName: shipmentForm.clientBusinessName || null,
      packageWeightKg: shipmentForm.packageWeightKg || null,
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
          <p className="text-sm font-medium text-muted-foreground">
            Nouveau tracking
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Créer un colis
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Créez un colis pour un nouveau client ou associez-le à un client
            existant.
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
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                1
              </span>
              <div>
                <p className="font-medium">Remplir le formulaire</p>
                <p className="text-muted-foreground">
                  Saisir les infos client et colis ci-contre.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                2
              </span>
              <div>
                <p className="font-medium">Transmettre les accès</p>
                <p className="text-muted-foreground">
                  Un identifiant + mot de passe provisoire est généré
                  automatiquement à partager au client.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                3
              </span>
              <div>
                <p className="font-medium">Configurer le trajet</p>
                <p className="text-muted-foreground">
                  Définir les étapes, publier et démarrer le suivi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {createdShipment ? (
          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4" />
                {createdShipment.client.temporaryPassword
                  ? "Accès client générés"
                  : "Colis créé"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-md border bg-muted/50 p-3 space-y-2">
                <InfoLine label="Colis" value={createdShipment.requestNumber} />
                {createdShipment.client.temporaryPassword ? (
                  <>
                    <InfoLine
                      label="Identifiant"
                      value={createdShipment.client.username ?? ""}
                    />
                    <InfoLine
                      label="Mot de passe provisoire"
                      value={createdShipment.client.temporaryPassword}
                    />
                  </>
                ) : (
                  <InfoLine
                    label="Client lié"
                    value={`${createdShipment.client.displayName ?? ""} — ${createdShipment.client.phone ?? ""}`}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                {createdShipment.client.temporaryPassword
                  ? "Colis créé — transmettez ces accès au client, puis configurez le trajet."
                  : "Colis créé — le client existant est lié à ce colis."}
              </p>
              <div className="grid gap-2">
                {createdShipment.client.temporaryPassword ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyCredentials}
                  >
                    <Copy className="h-4 w-4" />
                    Copier les accès
                  </Button>
                ) : null}
                <Button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/dashboard/admin/requests/${createdShipment.id}/journey`,
                    )
                  }
                >
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
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center rounded-md border p-1">
              <button
                type="button"
                onClick={() =>
                  setShipmentForm((current) => ({
                    ...current,
                    userId: "",
                    clientName: "",
                    clientPhone: "",
                    clientEmail: "",
                    clientBusinessName: "",
                  }))
                }
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  !shipmentForm.userId
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Nouveau client
              </button>
              <button
                type="button"
                onClick={() =>
                  setShipmentForm((current) => ({ ...current, userId: "search" }))
                }
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  shipmentForm.userId === "search"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Client existant
              </button>
            </div>

            {shipmentForm.userId === "search" ? (
              <ExistingUserSelector
                onSelect={(user) =>
                  setShipmentForm((current) => ({
                    ...current,
                    userId: user.id,
                    clientName: user.displayName ?? "",
                    clientPhone: user.phone ?? "",
                    clientEmail: user.email ?? "",
                    clientBusinessName: user.businessName ?? "",
                  }))
                }
              />
            ) : null}

            {!shipmentForm.userId || shipmentForm.userId === "search" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nom du client *">
                  <Input
                    value={shipmentForm.clientName}
                    onChange={(event) =>
                      setShipmentForm((current) => ({
                        ...current,
                        clientName: event.target.value,
                      }))
                    }
                    required={!shipmentForm.userId}
                  />
                </Field>
                <Field label="Téléphone client *">
                  <Input
                    value={shipmentForm.clientPhone}
                    onChange={(event) =>
                      setShipmentForm((current) => ({
                        ...current,
                        clientPhone: event.target.value,
                      }))
                    }
                    required={!shipmentForm.userId}
                  />
                </Field>
                <Field label="Email">
                  <Input
                    value={shipmentForm.clientEmail}
                    onChange={(event) =>
                      setShipmentForm((current) => ({
                        ...current,
                        clientEmail: event.target.value,
                      }))
                    }
                    type="email"
                  />
                </Field>
                <Field label="Entreprise">
                  <Input
                    value={shipmentForm.clientBusinessName}
                    onChange={(event) =>
                      setShipmentForm((current) => ({
                        ...current,
                        clientBusinessName: event.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
            ) : (
              <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
                <p className="font-medium">{shipmentForm.clientName}</p>
                <p className="text-muted-foreground">{shipmentForm.clientPhone}</p>
                {shipmentForm.clientEmail ? (
                  <p className="text-muted-foreground">{shipmentForm.clientEmail}</p>
                ) : null}
                {shipmentForm.clientBusinessName ? (
                  <p className="text-muted-foreground">{shipmentForm.clientBusinessName}</p>
                ) : null}
              </div>
            )}
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
                itemToStringLabel={(id) =>
                  countries.find((country) => country.id === id)?.name ?? ""
                }
              >
                <ComboboxInput
                  placeholder="Pays d'origine"
                  showTrigger
                  showClear
                />
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
                itemToStringLabel={(id) =>
                  countries.find((country) => country.id === id)?.name ?? ""
                }
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
                  {
                    value: "AVION" as TransportMode,
                    label: "Avion uniquement",
                    icon: Plane,
                  },
                  {
                    value: "BATEAU" as TransportMode,
                    label: "Bateau uniquement",
                    icon: Ship,
                  },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setShipmentForm((current) => ({
                        ...current,
                        transportMode: value,
                      }))
                    }
                    className={`flex h-12 items-center gap-3 rounded-md border px-3 text-left text-sm transition-colors ${
                      shipmentForm.transportMode === value
                        ? "border-primary bg-primary/10"
                        : "bg-background hover:bg-muted"
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
            <CardTitle className="text-base">Détails du colis</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Field label="Nombre de colis *">
              <Input
                value={shipmentForm.packageCount}
                onChange={(event) =>
                  setShipmentForm((current) => ({
                    ...current,
                    packageCount: event.target.value,
                  }))
                }
                type="number"
                min="1"
                required
              />
            </Field>
            <Field label="Poids total kg">
              <Input
                value={shipmentForm.packageWeightKg}
                onChange={(event) =>
                  setShipmentForm((current) => ({
                    ...current,
                    packageWeightKg: event.target.value,
                  }))
                }
                type="number"
                min="0"
                step="0.01"
                placeholder="ex: 42.5"
              />
            </Field>
            <div className="space-y-2 md:col-span-3">
              <Label>Contenu du colis *</Label>
              <Textarea
                value={shipmentForm.productDescription}
                onChange={(event) =>
                  setShipmentForm((current) => ({
                    ...current,
                    productDescription: event.target.value,
                  }))
                }
                placeholder="Décrire clairement ce qui est transporté."
                required
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Notes admin</Label>
              <Textarea
                value={shipmentForm.adminNotes}
                onChange={(event) =>
                  setShipmentForm((current) => ({
                    ...current,
                    adminNotes: event.target.value,
                  }))
                }
                placeholder="Informations internes visibles seulement par l'équipe."
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

function ExistingUserSelector({
  onSelect,
}: {
  onSelect: (user: UserOption) => void;
}) {
  const [search, setSearch] = useState("");

  const { data, isFetching } = useAuraQuery<
    { users: UserOption[]; total: number }
  >("admin.users", { params: { page: 1, limit: 15, search: search || undefined } });

  const users = data?.users ?? [];

  return (
    <div className="space-y-2">
      <Label>Rechercher un client existant</Label>
      <Input
        placeholder="Nom, téléphone, email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {isFetching ? (
        <p className="text-sm text-muted-foreground">Recherche en cours...</p>
      ) : users.length > 0 ? (
        <div className="max-h-52 overflow-y-auto space-y-1 rounded-md border">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelect(user)}
              className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
            >
              <p className="font-medium">
                {user.displayName || user.businessName || "Sans nom"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.phone}
                {user.country ? ` — ${user.country.name}` : ""}
                {user._count.requests > 0
                  ? ` — ${user._count.requests} colis`
                  : ""}
              </p>
            </button>
          ))}
        </div>
      ) : search.trim().length > 0 ? (
        <p className="text-sm text-muted-foreground">Aucun client trouvé.</p>
      ) : null}
    </div>
  );
}
