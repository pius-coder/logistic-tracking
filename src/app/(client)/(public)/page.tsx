import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { buttonVariants } from "@/components/ui/button";
import { TrackingSearch } from "@/components/tracking/TrackingSearch";
import { cn } from "@/lib/utils";
import { LandingPage } from "@/components/home/landing";

export const metadata = buildMetadata({
  title: "JC Import Express | Suivi de Colis International — Tracking en Temps Réel",
  description:
    "Suivez vos colis et marchandises en temps réel. Tracking international par avion, bateau et camion. Notification WhatsApp à chaque étape.",
});

export default async function HomePage() {
  return (
   <LandingPage />
  );
}
