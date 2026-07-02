export function BlogListSkeleton() {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border bg-card p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-4 w-16 bg-muted animate-pulse rounded-md" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-full bg-muted animate-pulse rounded mb-1" />
          <div className="h-4 w-2/3 bg-muted animate-pulse rounded flex-1" />
          <div className="h-4 w-28 bg-muted animate-pulse rounded mt-4" />
        </div>
      ))}
    </div>
  );
}
