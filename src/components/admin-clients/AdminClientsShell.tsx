import { callAuraServer } from "@/aura/server/call";
import { AdminClientsContent } from "./AdminClientsContent";
import type { AdminClientsData, AdminClientsParams } from "./AdminClientsTypes";

export async function AdminClientsShell({ params = {} as AdminClientsParams }: { params?: AdminClientsParams }) {
  const initialData = await callAuraServer<AdminClientsData>({
    operationName: "admin.users",
    params,
    source: "rsc",
  });

  return <AdminClientsContent initialData={initialData} params={params} />;
}
