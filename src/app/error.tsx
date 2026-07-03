"use client";

export default function ErrorPage({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h1 className="text-2xl font-black tracking-tight">Une erreur est survenue</h1>
      <p className="text-sm text-muted-foreground">
        Désolé, un problème inattendu s&apos;est produit. Veuillez réessayer.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
      >
        Réessayer
      </button>
    </main>
  );
}
