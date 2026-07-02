import { JourneyTrackingClient } from "@/components/journeys/client/JourneyTrackingClient";

export default async function JourneyPublicPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  return <JourneyTrackingClient publicToken={token} mapboxToken={mapboxToken} />;
}
