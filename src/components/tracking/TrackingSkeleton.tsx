export function TrackingSkeleton() {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-muted/20 animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted" />
          <div className="h-4 w-48 bg-muted rounded mx-auto" />
          <div className="h-3 w-32 bg-muted rounded mx-auto" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <div className="rounded-xl border bg-card p-2 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div className="space-y-1 flex-1">
              <div className="h-4 w-36 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
            <div className="h-6 w-20 bg-muted rounded" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-6 w-8 rounded-full bg-muted" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 w-32 bg-muted rounded" />
                  <div className="h-2 w-20 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
