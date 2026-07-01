"use client";

import Link from "next/link";
import { useAuraQuery } from "@/aura/client";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RevokeAllSessionsButton } from "@/aura/auth/components/sessions";
import type { AccountSessionsData } from "./AccountSessionsTypes";

export function AccountSessionsContent({ initialData }: { initialData: AccountSessionsData }) {
  const { data } = useAuraQuery<AccountSessionsData>("auth.listSessions", {
    initialData,
    staleTime: 15_000,
  });

  const value: AccountSessionsData = data ?? initialData;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Compte</p>
          <h1 className="text-3xl font-semibold tracking-tight">Sessions actives</h1>
        </div>
        <div className="flex gap-2">
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/account/security"
          >
            Sécurité
          </Link>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            Appareils actuellement connectés à votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {value.sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune session active.</p>
          ) : (
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
                {value.sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      {session.current ? (
                        <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                          Actuelle
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(session.lastUsedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(session.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(session.expiresAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex justify-end">
            <RevokeAllSessionsButton />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
