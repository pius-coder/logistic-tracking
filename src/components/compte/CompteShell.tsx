import { redirect } from "next/navigation";
import { callAuraServer } from "@/aura/server/call";
import { AuraError } from "@/aura/core/errors";
import { CompteContent } from "./CompteContent";
import { CompteSkeleton } from "./CompteSkeleton";
import type { CompteData } from "./CompteTypes";

export async function CompteShell() {
  let initialData: CompteData;
  try {
    initialData = await callAuraServer<CompteData>({
      operationName: "auth.me",
      source: "rsc",
    });
  } catch (err) {
    if (err instanceof AuraError && ["UNAUTHORIZED", "SESSION_EXPIRED", "SESSION_REVOKED"].includes(err.code)) {
      redirect("/login");
    }
    throw err;
  }

  return <CompteContent initialData={initialData} />;
}
