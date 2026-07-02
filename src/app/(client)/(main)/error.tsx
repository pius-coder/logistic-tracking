"use client";

import { useEffect } from "react";

export default function MainLayoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[main] Route group error:", error.digest ?? error.message, error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h1 className="text-2xl font-black tracking-tight">Une erreur est survenue</h1>
      <p className="text-sm text-muted-foreground">
        Désolé, un problème inattendu s&apos;est produit. Veuillez vous reconnecter.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
        >
          Réessayer
        </button>
        <a
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-md border px-6 text-sm font-semibold transition-colors hover:bg-muted"
        >
          Connexion
        </a>
      </div>
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          Code d&apos;erreur : <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{error.digest}</code>
          <br />
          <span>Communiquez ce code au support.</span>
        </p>
      )}
    </main>
  );
}
