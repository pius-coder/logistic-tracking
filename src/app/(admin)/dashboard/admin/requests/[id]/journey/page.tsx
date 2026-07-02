import { JourneyAdminPanel } from "@/components/journeys/admin/JourneyAdminPanel";

export default async function JourneyAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  return <JourneyAdminPanel requestId={id} mapboxToken={mapboxToken} />;
}
