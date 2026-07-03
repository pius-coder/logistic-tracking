export function AdminCardSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}
