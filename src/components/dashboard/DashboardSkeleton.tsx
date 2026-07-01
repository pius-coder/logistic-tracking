import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-56 rounded" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded" />
          <Skeleton className="h-9 w-24 rounded" />
        </div>
      </header>

      <div className="h-32 rounded-lg border bg-card p-6 space-y-3">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-4 w-48 rounded" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-4 w-48 rounded" />
            </CardHeader>
          </Card>
        ))}
        <Card className="transition-colors hover:bg-muted/50 border-primary/30">
          <CardHeader>
            <Skeleton className="h-5 w-28 rounded" />
            <Skeleton className="h-4 w-56 rounded" />
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}
