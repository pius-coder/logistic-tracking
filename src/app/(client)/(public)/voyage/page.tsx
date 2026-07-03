import { JourneySearch } from "@/components/journeys/client/JourneySearch";

export default async function JourneySearchPage({
  searchParams,
}: {
  searchParams: Promise<{ tracking?: string }>;
}) {
  const { tracking } = await searchParams;
  return <JourneySearch initialTracking={tracking} />;
}
