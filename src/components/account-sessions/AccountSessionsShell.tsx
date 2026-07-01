import { redirect } from "next/navigation";
import { callAuraServer } from "@/aura/server/call";
import { AuraError } from "@/aura/core/errors";
import { AccountSessionsContent } from "./AccountSessionsContent";
import { AccountSessionsSkeleton } from "./AccountSessionsSkeleton";
import type { AccountSessionsData } from "./AccountSessionsTypes";

export async function AccountSessionsShell() {
  let initialData: AccountSessionsData;
  try {
    initialData = await callAuraServer<AccountSessionsData>({
      operationName: "auth.listSessions",
      source: "rsc",
    });
  } catch (err) {
    if (err instanceof AuraError && ["UNAUTHORIZED", "SESSION_EXPIRED", "SESSION_REVOKED"].includes(err.code)) {
      redirect("/login");
    }
    throw err;
  }

  return <AccountSessionsContent initialData={initialData} />;
}
