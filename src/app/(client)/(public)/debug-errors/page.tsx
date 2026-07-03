"use client";

import { useState, useEffect, useCallback } from "react";

type StoredError = {
  digest: string;
  timestamp: string;
  operation?: string;
  message: string;
  code?: string;
  status?: number;
  stack?: string;
  cause?: string;
  source?: string;
};

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function StackFrame({ line }: { line: string }) {
  const match = line.match(/^\s*at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)$/);
  if (match) {
    const [, fn, file, lineNum, col] = match;
    const shortFile = file.replace(/^.*\/\.next\//, ".next/").replace(/^.*\/node_modules\//, "node_modules/");
    return (
      <div className="flex gap-2 text-xs leading-6">
        <span className="w-4 shrink-0 text-muted-foreground">→</span>
        <span className="font-medium text-foreground">{fn}</span>
        <span className="text-muted-foreground">
          ({shortFile}:{lineNum}:{col})
        </span>
      </div>
    );
  }
  return <div className="text-xs leading-6 text-muted-foreground">{line}</div>;
}

function ErrorCard({ err }: { err: StoredError }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-destructive/20 bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
      >
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-destructive/10 text-[10px] font-bold text-destructive">
          !
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-destructive">
              {err.code ?? "ERROR"}
            </span>
            {err.status && (
              <span className="rounded bg-muted px-1 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                {err.status}
              </span>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground">
              {formatTime(err.timestamp)}
            </span>
          </div>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            {err.message}
          </p>
          {err.operation && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              op: <code className="rounded bg-muted px-1 font-mono">{err.operation}</code>
              {err.source && <> · src: {err.source}</>}
              <> · digest: <code className="rounded bg-muted px-1 font-mono">{err.digest}</code></>
            </p>
          )}
        </div>
        <div className="shrink-0 text-xs text-muted-foreground">{open ? "−" : "+"}</div>
      </button>

      {open && (
        <div className="border-t px-4 py-3">
          {err.stack && (
            <div className="mb-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Stack trace
              </p>
              <div className="overflow-auto rounded bg-black p-3 font-mono text-xs leading-6 text-green-400">
                {err.stack.split("\n").map((l, i) => (
                  <div key={i} className="whitespace-nowrap">
                    {i === 0 ? (
                      <span className="text-red-400">{l}</span>
                    ) : (
                      <StackFrame line={l} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {err.cause && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Cause
              </p>
              <pre className="overflow-auto rounded bg-black p-3 text-xs text-orange-400">
                {err.cause}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getInitialDebugKey() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("key") ?? "";
}

export default function DebugErrorsPage() {
  const [key, setKey] = useState(getInitialDebugKey);
  const [submittedKey, setSubmittedKey] = useState<string | null>(() => getInitialDebugKey() || null);
  const [errors, setErrors] = useState<StoredError[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchErrors = useCallback(async (k: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/debug/errors?key=${encodeURIComponent(k)}`);
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Erreur de chargement");
        setErrors([]);
      } else {
        setErrors(json.errors ?? []);
      }
    } catch {
      setError("Impossible de charger les erreurs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!submittedKey) return;
    const timeoutId = window.setTimeout(() => fetchErrors(submittedKey), 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchErrors, submittedKey]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    setSubmittedKey(key);
    const url = new URL(window.location.href);
    url.searchParams.set("key", key);
    window.history.replaceState({}, "", url.toString());
    fetchErrors(key);
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight">Debug Errors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Erreurs capturées côté serveur (<code className="rounded bg-muted px-1 font-mono text-xs">DEBUG_KEY</code> protégé)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="DEBUG_KEY"
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/90"
        >
          Charger
        </button>
      </form>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && submittedKey && errors.length === 0 && !error && (
        <div className="rounded-lg border bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">Aucune erreur capturée.</p>
        </div>
      )}

      {!loading && errors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {errors.length} erreur{errors.length > 1 ? "s" : ""} • plus récente en premier
            </p>
            <button
              type="button"
              onClick={async () => {
                if (!submittedKey) return;
                await fetch(`/api/debug/errors?key=${encodeURIComponent(submittedKey)}&clear=1`);
                setErrors([]);
              }}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Effacer
            </button>
          </div>
          {errors.map((err) => (
            <ErrorCard key={err.digest} err={err} />
          ))}
        </div>
      )}

      <div className="mt-8 border-t pt-4 text-center text-xs text-muted-foreground">
        <p>Erreurs stockées en mémoire (50 max). Perdues au redémarrage du conteneur.</p>
        <p>Pour activer : <code className="rounded bg-muted px-1 font-mono">DEBUG_KEY=votre_clef</code> dans les variables d&apos;environnement.</p>
      </div>
    </main>
  );
}
