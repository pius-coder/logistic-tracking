import { callAuraServer } from "@/aura/server/call";
import { AdminProductsContent } from "./AdminProductsContent";
import type { AdminProductListData, AdminProductListParams } from "./types";

export async function AdminProductsShell({ params }: { params: AdminProductListParams }) {
  const initialData = await callAuraServer<AdminProductListData>({
    operationName: "admin.products",
    params,
    source: "rsc",
  });

  return <AdminProductsContent initialData={initialData} params={params} />;
}
