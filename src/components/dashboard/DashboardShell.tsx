import { redirect } from "next/navigation";
import { callAuraServer } from "@/aura/server/call";
import { AuraError } from "@/aura/core/errors";
import { DashboardContent } from "./DashboardContent";
import { DashboardSkeleton } from "./DashboardSkeleton";
import type { DashboardData } from "./DashboardTypes";

export async function DashboardShell() {
  let initialData: DashboardData;
  try {
    initialData = await callAuraServer<DashboardData>({
      operationName: "auth.me",
      source: "rsc",
    });
  } catch (err) {
    if (err instanceof AuraError && ["UNAUTHORIZED", "SESSION_EXPIRED", "SESSION_REVOKED"].includes(err.code)) {
      redirect("/login");
    }
    throw err;
  }

  return <DashboardContent initialData={initialData} />;
}
