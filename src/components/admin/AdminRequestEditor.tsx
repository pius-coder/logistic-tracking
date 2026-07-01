"use client";

import { useMemo, useState } from "react";
import { useAuraMutation } from "@/aura/client/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { toast } from "sonner";
import { getRequestStatusLabel, getTransportModeLabel } from "@/lib/displayLabels";
import { Pencil, Save, X } from "lucide-react";

interface CountryOption {
  id: string;
  name: string;
}

interface AdminRequestEditorProps {
  request: {
    id: string;
    requestNumber: string;
    status: string;
    recipientName: string;
    recipientPhone: string;
    deliveryAddress: string;
    city: string | null;
    region: string | null;
    quantity: number;
    transportMode: string;
    totalCostUsd: number;
    adminNotes: string | null;
    productNameSnapshot: string;
    originCountry: ({ id?: string; name: string }) | null;
    destinationCountry: { id?: string; name: string };
    product: { name: string } | null;
    user: { displayName: string | null; phoneIdentities: { phoneE164: string }[] };
    needsRectification: boolean;
    customProductName: string | null;
    customProductDesc: string | null;
    customWeight: number | null;
    customVolume: number | null;
    originCountryId?: string | null;
    destinationCountryId?: string;
  };
  countries: CountryOption[];
}

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline" | "ghost"
> = {
  EN_ATTENTE: "secondary",
  EN_COURS: "default",
  EN_PAUSE: "outline",
  PROBLEME: "destructive",
  TERMINE: "ghost",
  ANNULEE: "destructive",
};

export function AdminRequestEditor({ request, countries }: AdminRequestEditorProps) {
  const [editing, setEditing] = useState(false);

  // Initialize with current values so the admin sees the existing country,
  // transport mode, etc. instead of an empty "—" option.
  const initialForm = useMemo(
    () => ({
      recipientName: request.recipientName,
      recipientPhone: request.recipientPhone,
      deliveryAddress: request.deliveryAddress,
      city: request.city ?? "",
      region: request.region ?? "",
      quantity: request.quantity,
      transportMode: request.transportMode,
      totalCostUsd: request.totalCostUsd,
      adminNotes: request.adminNotes ?? "",
      originCountryId: request.originCountryId ?? "",
      destinationCountryId: request.destinationCountryId ?? "",
      productNameSnapshot: request.productNameSnapshot,
      customProductName: request.customProductName ?? "",
      customProductDesc: request.customProductDesc ?? "",
      customWeight: request.customWeight ?? 0,
      customVolume: request.customVolume ?? 0,
    }),
    [request],
  );
  const [form, setForm] = useState(initialForm);

  const updateMutation = useAuraMutation("admin.updateRequest");

  async function handleSave() {
    const payload: Record<string, unknown> = { requestId: request.id };
    const diff = <K extends keyof typeof form>(key: K, toNull?: boolean) => {
      const next = form[key];
      const prev = (request as unknown as Record<string, unknown>)[key as string] ?? "";
      if (next !== prev) {
        payload[key as string] = toNull && next === "" ? null : next;
      }
    };

    diff("recipientName");
    diff("recipientPhone");
    diff("deliveryAddress");
    diff("city", true);
    diff("region", true);
    diff("quantity");
    diff("transportMode");
    diff("totalCostUsd");
    diff("adminNotes", true);
    diff("productNameSnapshot");
    diff("customProductName", true);
    diff("customProductDesc", true);

    if (form.originCountryId !== (request.originCountryId ?? "")) {
      payload.originCountryId = form.originCountryId || null;
    }
    if (
      form.destinationCountryId &&
      form.destinationCountryId !== (request.destinationCountryId ?? "")
    ) {
      payload.destinationCountryId = form.destinationCountryId;
    }
    if (form.customWeight !== (request.customWeight ?? 0)) {
      payload.customWeight = form.customWeight || null;
    }
    if (form.customVolume !== (request.customVolume ?? 0)) {
      payload.customVolume = form.customVolume || null;
    }

    try {
      await updateMutation.mutateAsync(payload as never);
      toast.success("Demande mise à jour.");
      setEditing(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur lors de la mise à jour.";
      toast.error(message);
    }
  }

  function handleCancel() {
    setForm(initialForm);
    setEditing(false);
  }

  if (!editing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Informations</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-3 w-3" /> Modifier
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ReadRow
            label="Client"
            value={request.user.displayName || request.user.phoneIdentities[0]?.phoneE164 || "—"}
          />
          <ReadRow label="Destinataire" value={`${request.recipientName} (${request.recipientPhone})`} />
          <ReadRow
            label="Adresse"
            value={`${request.deliveryAddress}${request.city ? `, ${request.city}` : ""}`}
          />
          <ReadRow
            label="Produit"
            value={request.product?.name || request.productNameSnapshot || "Transit"}
          />
          <ReadRow
            label="Origine"
            value={`${request.originCountry?.name || "N/A"} → ${request.destinationCountry.name}`}
          />
          <ReadRow
            label="Transport"
            value={`${getTransportModeLabel(request.transportMode)} · Qté: ${request.quantity}`}
          />
          <ReadRow label="Total" value={`${request.totalCostUsd} USD`} />
          <p className="text-sm">
            <span className="font-medium">Statut:</span>{" "}
            <Badge variant={statusVariant[request.status]}>{getRequestStatusLabel(request.status)}</Badge>
          </p>
          {request.customProductName && (
            <ReadRow label="Produit personnalisé" value={request.customProductName} />
          )}
          {request.customWeight != null && request.customWeight > 0 && (
            <ReadRow label="Poids perso." value={`${request.customWeight} kg`} />
          )}
          {request.customVolume != null && request.customVolume > 0 && (
            <ReadRow label="Volume perso." value={`${request.customVolume} m³`} />
          )}
          {request.adminNotes && (
            <div>
              <span className="font-medium">Notes admin:</span>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-muted-foreground">
                {request.adminNotes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-visible">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Modifier les informations</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-3 w-3" /> Annuler
          </Button>
          <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="h-3 w-3" />{" "}
            {updateMutation.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field label="Destinataire">
          <Input
            value={form.recipientName}
            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
          />
        </Field>
        <Field label="Téléphone">
          <Input
            value={form.recipientPhone}
            onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })}
          />
        </Field>
        <Field label="Adresse" className="sm:col-span-2">
          <Input
            value={form.deliveryAddress}
            onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
          />
        </Field>
        <Field label="Ville">
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </Field>
        <Field label="Région">
          <Input
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          />
        </Field>

        <CountryField
          label="Pays d'origine"
          value={form.originCountryId || null}
          onChange={(id) => setForm({ ...form, originCountryId: id ?? "" })}
          countries={countries}
          allowEmpty
        />
        <CountryField
          label="Pays de destination"
          value={form.destinationCountryId || null}
          onChange={(id) => setForm({ ...form, destinationCountryId: id ?? "" })}
          countries={countries}
        />

        <Field label="Transport">
          <TransportCombobox
            value={form.transportMode}
            onChange={(v) => setForm({ ...form, transportMode: v })}
          />
        </Field>
        <Field label="Quantité">
          <Input
            type="number"
            min={1}
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          />
        </Field>
        <Field label="Total (USD)">
          <Input
            type="number"
            min={0}
            step={0.01}
            value={form.totalCostUsd}
            onChange={(e) => setForm({ ...form, totalCostUsd: Number(e.target.value) })}
          />
        </Field>
        <Field label="Produit (snapshot)">
          <Input
            value={form.productNameSnapshot}
            onChange={(e) => setForm({ ...form, productNameSnapshot: e.target.value })}
          />
        </Field>
        <Field label="Produit personnalisé">
          <Input
            value={form.customProductName}
            onChange={(e) => setForm({ ...form, customProductName: e.target.value })}
          />
        </Field>
        <Field label="Description personnalisée" className="sm:col-span-2">
          <Input
            value={form.customProductDesc}
            onChange={(e) => setForm({ ...form, customProductDesc: e.target.value })}
          />
        </Field>
        <Field label="Poids perso. (kg)">
          <Input
            type="number"
            min={0}
            step={0.1}
            value={form.customWeight}
            onChange={(e) => setForm({ ...form, customWeight: Number(e.target.value) })}
          />
        </Field>
        <Field label="Volume perso. (m³)">
          <Input
            type="number"
            min={0}
            step={0.01}
            value={form.customVolume}
            onChange={(e) => setForm({ ...form, customVolume: Number(e.target.value) })}
          />
        </Field>
        <Field label="Notes admin" className="sm:col-span-2">
          <Textarea
            value={form.adminNotes}
            onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
            rows={3}
          />
        </Field>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ReadRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="font-medium">{label}:</span> {value || "—"}
    </p>
  );
}

function CountryField({
  label,
  value,
  onChange,
  countries,
  allowEmpty = false,
}: {
  label: string;
  value: string | null;
  onChange: (id: string | null) => void;
  countries: CountryOption[];
  allowEmpty?: boolean;
}) {
  const selected = countries.find((c) => c.id === value);
  const emptyMessage =
    countries.length === 0
      ? "Aucun pays configuré. Ajoutez-en dans /dashboard/admin/pays."
      : "Aucun résultat";

  return (
    <Field label={label}>
      <Combobox
        value={value}
        onValueChange={(v) => onChange(v ?? null)}
        itemToStringLabel={(id) =>
          countries.find((c) => c.id === id)?.name ?? (allowEmpty ? "" : "—")
        }
      >
        <ComboboxInput
          placeholder={selected ? selected.name : "Rechercher un pays…"}
          showTrigger
          showClear={allowEmpty && !!value}
        />
        <ComboboxContent>
          <ComboboxList>
            {countries.map((c) => (
              <ComboboxItem key={c.id} value={c.id}>
                {c.name}
              </ComboboxItem>
            ))}
            <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

function TransportCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const options = [
    { value: "AVION", label: "Avion" },
    { value: "BATEAU", label: "Bateau" },
  ];
  const selected = options.find((o) => o.value === value);

  return (
    <Combobox
      value={value}
      onValueChange={(v) => onChange(v ?? value)}
      itemToStringLabel={(v) => options.find((o) => o.value === v)?.label ?? ""}
    >
      <ComboboxInput placeholder={selected?.label ?? "Choisir…"} showTrigger />
      <ComboboxContent>
        <ComboboxList>
          {options.map((o) => (
            <ComboboxItem key={o.value} value={o.value}>
              {o.label}
            </ComboboxItem>
          ))}
          <ComboboxEmpty>Aucun résultat</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
