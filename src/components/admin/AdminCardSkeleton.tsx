import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AdminCardSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:py-12">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-7 w-48 rounded" />
        </div>
        <Skeleton className="h-9 w-24 rounded" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-7 w-16 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-32 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32 rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0 space-y-1">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-48 rounded" />
                  </div>
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              ))}
              <Skeleton className="h-6 w-24 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
