export function CompteSkeleton() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="h-8 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-48 animate-pulse rounded-lg bg-muted" />
    </main>
  );
}
