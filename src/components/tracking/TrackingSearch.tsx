"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuraQuery } from "@/aura/client/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ArrowRight, AlertCircle } from "lucide-react";

export function TrackingSearch() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [lookupQuery, setLookupQuery] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState(false);

  const { data: lookupResult, isFetching, isFetched, isError } = useAuraQuery<{ id: string; requestNumber: string } | null>(
    "tracking.lookupByRequestNumber",
    { params: { requestNumber: lookupQuery }, enabled: lookupQuery.length > 0 },
  );

  useEffect(() => {
    if (lookupResult) {
      setNotFound(false);
      setLookupQuery("");
      setTrackingNumber("");
      router.push(`/tracking/${lookupResult.id}`);
    }
  }, [lookupResult, router]);

  useEffect(() => {
    if (isError && lookupQuery) {
      setServerError(true);
      setNotFound(false);
      setLookupQuery("");
    }
  }, [isError, lookupQuery]);

  useEffect(() => {
    if (isFetched && !lookupResult && lookupQuery && !isError) {
      setNotFound(true);
      setServerError(false);
      setLookupQuery("");
    }
  }, [isFetched, lookupResult, lookupQuery, isError]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = trackingNumber.trim();
    if (!q) return;
    setNotFound(false);
    setLookupQuery(q);
  }

  return (
    <section>
      <Card className="overflow-hidden rounded-3xl border shadow-elevated">
        <CardContent className="gradient-hero-soft p-6 sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Suivi logistique
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
              Suivez votre expédition en temps réel
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Entrez votre numéro de suivi pour connaître la position exacte de votre marchandise.
            </p>
          </div>
          <form onSubmit={handleSearch} className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Numéro de suivi (ex: GI-12345678-123)"
                value={trackingNumber}
                onChange={(e) => { setTrackingNumber(e.target.value); setNotFound(false); }}
                className="h-12 rounded-md border bg-background pl-11 pr-4 text-sm shadow-sm"
              />
            </div>
            <Button type="submit" className="h-12 rounded-md px-8 text-sm font-semibold" disabled={isFetching}>
              {isFetching ? "Recherche..." : "Rechercher"}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </form>
          {serverError && (
            <div className="mx-auto mt-3 flex max-w-xl items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Erreur de connexion. Veuillez réessayer.
            </div>
          )}
          {notFound && (
            <div className="mx-auto mt-3 flex max-w-xl items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Aucune expédition trouvée avec ce numéro. Vérifiez le numéro et réessayez.
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
