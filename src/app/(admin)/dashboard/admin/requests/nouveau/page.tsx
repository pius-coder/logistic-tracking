"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuraMutation, useAuraQuery } from "@/aura/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { toast } from "sonner";

interface CountryOption {
  id: string;
  name: string;
}

interface ClientOption {
  id: string;
  displayName: string | null;
}

export default function NouveauSuiviPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [originCountryId, setOriginCountryId] = useState("");
  const [destinationCountryId, setDestinationCountryId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [transportMode, setTransportMode] = useState<"AVION" | "BATEAU">("AVION");

  const { data: clientsData } = useAuraQuery<{ users: ClientOption[] }>("admin.users", {
    params: { limit: 100 },
  });
  const { data: countriesData } = useAuraQuery<{ countries: CountryOption[] }>("catalog.countries");

  const createMutation = useAuraMutation<Record<string, unknown>, { id: string }>("admin.createRequest");

  const clients = clientsData?.users ?? [];
  const countries = countriesData?.countries ?? [];

  const handleClientChange = useCallback((v: string | null) => setClientId(v ?? ""), []);
  const handleOriginChange = useCallback((v: string | null) => setOriginCountryId(v ?? ""), []);
  const handleDestChange = useCallback((v: string | null) => setDestinationCountryId(v ?? ""), []);
  const handleTransportChange = useCallback((v: string | null) => setTransportMode((v ?? "AVION") as "AVION" | "BATEAU"), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !destinationCountryId) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }
    try {
      const result = await createMutation.mutateAsync({
        userId: clientId,
        originCountryId: originCountryId || undefined,
        destinationCountryId,
        recipientName,
        recipientPhone,
        deliveryAddress,
        transportMode,
      } as never);
      toast.success("Suivi créé avec succès.");
      router.push(`/dashboard/admin/requests/${(result as { id: string }).id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la création.";
      toast.error(message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Administration</p>
        <h1 className="text-2xl font-semibold tracking-tight">Nouveau suivi</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Client</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Combobox
                value={clientId}
                onValueChange={handleClientChange}
                itemToStringLabel={(id) => clients.find((c) => c.id === id)?.displayName ?? ""}
              >
                <ComboboxInput
                  placeholder="Rechercher un client…"
                  showTrigger
                />
                <ComboboxContent>
                  <ComboboxList>
                    {clients.map((c) => (
                      <ComboboxItem key={c.id} value={c.id}>
                        {c.displayName || "—"}
                      </ComboboxItem>
                    ))}
                    <ComboboxEmpty>Aucun résultat</ComboboxEmpty>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Trajet</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pays d&apos;origine</Label>
              <Combobox
                value={originCountryId}
                onValueChange={handleOriginChange}
                itemToStringLabel={(id) => countries.find((c) => c.id === id)?.name ?? ""}
              >
                <ComboboxInput
                  placeholder="Rechercher un pays…"
                  showTrigger
                  showClear
                />
                <ComboboxContent>
                  <ComboboxList>
                    {countries.map((c) => (
                      <ComboboxItem key={c.id} value={c.id}>
                        {c.name}
                      </ComboboxItem>
                    ))}
                    <ComboboxEmpty>Aucun résultat</ComboboxEmpty>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div className="space-y-2">
              <Label>Pays de destination *</Label>
              <Combobox
                value={destinationCountryId}
                onValueChange={handleDestChange}
                itemToStringLabel={(id) => countries.find((c) => c.id === id)?.name ?? ""}
              >
                <ComboboxInput
                  placeholder="Rechercher un pays…"
                  showTrigger
                />
                <ComboboxContent>
                  <ComboboxList>
                    {countries.map((c) => (
                      <ComboboxItem key={c.id} value={c.id}>
                        {c.name}
                      </ComboboxItem>
                    ))}
                    <ComboboxEmpty>Aucun résultat</ComboboxEmpty>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div className="space-y-2">
              <Label>Mode de transport *</Label>
              <Combobox
                value={transportMode}
                onValueChange={handleTransportChange}
                itemToStringLabel={(v) => v === "AVION" ? "Avion" : "Bateau"}
              >
                <ComboboxInput placeholder="Choisir…" showTrigger />
                <ComboboxContent>
                  <ComboboxList>
                    <ComboboxItem value="AVION">Avion</ComboboxItem>
                    <ComboboxItem value="BATEAU">Bateau</ComboboxItem>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Destinataire</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Nom du destinataire *</Label>
              <Input
                id="recipientName"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="ex: Amadou Diallo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientPhone">Téléphone *</Label>
              <Input
                id="recipientPhone"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="ex: 2250700000001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Adresse de livraison *</Label>
              <Input
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="ex: Rue des Jardins, Cocody, Abidjan"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Création…" : "Créer le suivi"}
          </Button>
        </div>
      </form>
    </main>
  );
}
