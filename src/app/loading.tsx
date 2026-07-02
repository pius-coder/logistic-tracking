export default function LoadingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div className="animate-pulse">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="mt-3h-6 w-64 rounded bg-muted" />
      </div>
      <div className="animate-pulse space-y-4">
        <div className="h-48 w-full rounded-3xl bg-muted" />
        <div className="h-24 w-full rounded-3xl bg-muted" />
        <div className="h-24 w-full rounded-3xl bg-muted" />
      </div>
    </main>
  );
}
