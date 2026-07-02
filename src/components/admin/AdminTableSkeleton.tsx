import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AdminTableSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:py-12">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-7 w-48 rounded" />
        </div>
        <Skeleton className="h-9 w-32 rounded" />
      </header>

      <Card>
        <CardHeader><Skeleton className="h-6 w-40 rounded" /></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 7 }).map((_, i) => (
                  <TableHead key={i}><Skeleton className="h-4 w-20 rounded" /></TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, row) => (
                <TableRow key={row}>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <TableCell key={i}><Skeleton className="h-4 w-full rounded" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
