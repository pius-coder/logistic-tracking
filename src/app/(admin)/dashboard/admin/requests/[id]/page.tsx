import { AdminShipmentDetail } from "@/components/admin/tracking/AdminShipmentDetail";

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="px-4 py-6 md:px-6">
      <AdminShipmentDetail requestId={id} />
    </main>
  );
}
