import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Mentions Légales | JC Import Express",
  description: "Mentions légales de JC Import Express, plateforme d'import-export pour l'Afrique.",
  path: "/mentions-legales",
});

export default function LegalPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Mentions Légales</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Éditeur</h2>
          <p><strong>JC Import Express</strong><br />Plateforme de services d&apos;import-export<br />Contact : support@jc-import-express.online</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Hébergement</h2>
          <p>La Plateforme est hébergée par des serveurs sécurisés. L&apos;accès au site est disponible 24h/24 et 7j/7, sous réserve des opérations de maintenance nécessaires au bon fonctionnement.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Propriété Intellectuelle</h2>
          <p>L&apos;ensemble des contenus de la Plateforme (textes, images, logos, marques) est la propriété exclusive de JC Import Express. Toute reproduction ou utilisation sans autorisation est interdite.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>Pour nous contacter :<br />WhatsApp : disponible depuis l&apos;application<br />Email : support@jc-import-express.online</p>
        </section>
      </div>
    </main>
  );
}
