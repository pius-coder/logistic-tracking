import { buildMetadata } from "@/lib/metadata";
import { LandingPage } from "@/components/home/landing";
import { BlogSection } from "@/components/home/blog-section";

export const metadata = buildMetadata({
  title: "JC Import Express | Suivi de Colis International — Tracking en Temps Réel",
  description:
    "Suivez vos colis et marchandises en temps réel. Tracking international par avion, bateau et camion. Notification WhatsApp à chaque étape.",
});

export default async function HomePage() {
  const blogSection = <BlogSection />;
  return <LandingPage blogSection={blogSection} />;
}
