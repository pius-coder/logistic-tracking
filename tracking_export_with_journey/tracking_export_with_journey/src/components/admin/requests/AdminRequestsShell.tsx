import { callAuraServer } from "@/aura/server/call";
import { AdminRequestsContent } from "./AdminRequestsContent";
import type { AdminRequestListData, AdminRequestListParams } from "./types";

export async function AdminRequestsShell({
  params = {} as AdminRequestListParams,
}: {
  params?: AdminRequestListParams;
}) {
  const initialData = await callAuraServer<AdminRequestListData>({
    operationName: "admin.requests",
    params,
    source: "rsc",
  });

  return <AdminRequestsContent initialData={initialData} params={params} />;
}
