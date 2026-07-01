import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AccountSessionsSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="mt-1 h-6 w-48 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded" />
          <Skeleton className="h-9 w-24 rounded" />
        </div>
      </header>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-4 w-64 rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière utilisation</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Expire le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 rounded" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end">
            <Skeleton className="h-9 w-44 rounded" />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
