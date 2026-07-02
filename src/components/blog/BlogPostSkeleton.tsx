import { Skeleton } from "@/components/ui/skeleton";

export function BlogPostSkeleton() {
  return (
    <article>
      <header className="mb-8">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <Skeleton className="h-10 w-3/4 rounded mb-3" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </header>

      <div className="mb-8 rounded-lg overflow-hidden bg-muted">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>

      <div className="prose prose-sm max-w-none space-y-3">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-4/5 rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>
    </article>
  );
}
