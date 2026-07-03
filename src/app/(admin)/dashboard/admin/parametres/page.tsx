"use client";

import { useState } from "react";
import { useAuraMutation, useAuraQuery } from "@/aura/client/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UpdateSettingsInput } from "@/features/admin/shared/schemas";

export default function AdminSettingsPage() {
  const { data: settingsData } = useAuraQuery<{
    settings: { adminWhatsAppNumber: string | null; evolutionInstanceId: string | null };
  }>("admin.getSettings", {});
  const settings = settingsData?.settings;

  const updateSettings = useAuraMutation<UpdateSettingsInput, { settings: { adminWhatsAppNumber: string | null; evolutionInstanceId: string | null } }>("admin.updateSettings", {
    invalidate: ["admin.getSettings"],
    refresh: true,
  });

  const [whatsapp, setWhatsapp] = useState(settings?.adminWhatsAppNumber || "");
  const [evolution, setEvolution] = useState(settings?.evolutionInstanceId || "");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ adminWhatsAppNumber: whatsapp || null, evolutionInstanceId: evolution || null });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-8 md:py-12">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Administration</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Paramètres</h1>
        </div>
      </header>

      <Card>
        <CardHeader><CardTitle>Configuration système</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Numéro WhatsApp admin</Label>
              <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+2250123456789" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evolution">Evolution API Instance ID</Label>
              <Input id="evolution" value={evolution} onChange={(e) => setEvolution(e.target.value)} placeholder="jc-import-express" />
            </div>
            <Button type="submit" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
