export function AdminFormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-7 w-64 bg-muted rounded" />
        </div>
        <div className="h-9 w-24 bg-muted rounded" />
      </div>
      <div className="rounded-lg border bg-card p-6 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-9 w-full bg-muted rounded" />
          </div>
        ))}
        <div className="h-10 w-32 bg-muted rounded" />
      </div>
    </div>
  );
}
