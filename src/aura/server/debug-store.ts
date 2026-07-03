import "server-only";

const MAX_ERRORS = 50;

interface StoredError {
  digest: string;
  timestamp: string;
  operation?: string;
  message: string;
  code?: string;
  status?: number;
  stack?: string;
  cause?: string;
  source?: string;
}

const buffer: StoredError[] = [];

let counter = 0;

function hashDigest(err: unknown): string {
  counter++;
  return `aura_${counter}_${Date.now().toString(36)}`;
}

function errorMeta(err: unknown) {
  if (!err || typeof err !== "object") return {};
  const record = err as { code?: unknown; status?: unknown };
  return {
    code: typeof record.code === "string" ? record.code : undefined,
    status: typeof record.status === "number" ? record.status : undefined,
  };
}

export function captureError(opts: {
  error: unknown;
  operation?: string;
  source?: string;
}): string {
  const err = opts.error;
  const digest = hashDigest(err);
  const { code: auraCode, status: auraStatus } = errorMeta(err);

  const entry: StoredError = {
    digest,
    timestamp: new Date().toISOString(),
    operation: opts.operation,
    message:
      err instanceof Error ? err.message : "Erreur inconnue",
    code: auraCode,
    status: auraStatus,
    stack: err instanceof Error ? err.stack ?? undefined : undefined,
    cause:
      err instanceof Error && err.cause
        ? err.cause instanceof Error
          ? err.cause.stack ?? err.cause.message
          : String(err.cause)
        : undefined,
    source: opts.source,
  };

  buffer.unshift(entry);
  if (buffer.length > MAX_ERRORS) buffer.length = MAX_ERRORS;

  return digest;
}

export function getStoredErrors(): StoredError[] {
  return buffer;
}

export function clearStoredErrors(): void {
  buffer.length = 0;
}
