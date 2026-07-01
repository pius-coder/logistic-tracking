import { Suspense } from "react";
import { AccountSessionsShell } from "@/components/account-sessions/AccountSessionsShell";
import { AccountSessionsSkeleton } from "@/components/account-sessions/AccountSessionsSkeleton";

export default function AccountSessionsPage() {
  return (
    <Suspense fallback={<AccountSessionsSkeleton />}>
      <AccountSessionsShell />
    </Suspense>
  );
}
