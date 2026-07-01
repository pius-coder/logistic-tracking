import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Politique de Confidentialité | JC Import Express",
  description: "Politique de confidentialité de JC Import Express. Comment nous collectons, utilisons et protégeons vos données personnelles.",
  path: "/confidentialite",
});

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Politique de Confidentialité</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Collecte des Données</h2>
          <p>Nous collectons les informations que vous nous fournissez directement : nom, numéro de téléphone, adresse email, adresse de livraison, et informations de paiement nécessaires au traitement de vos demandes d&apos;import.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Utilisation des Données</h2>
          <p>Vos données sont utilisées pour : traiter vos demandes d&apos;import et de transit, vous notifier via WhatsApp de l&apos;évolution de vos demandes, améliorer nos services, et vous contacter en cas de besoin.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Partage des Données</h2>
          <p>Nous ne partageons vos données qu&apos;avec nos partenaires logistiques et douaniers strictement nécessaires au traitement de votre demande. Nous ne vendons jamais vos données personnelles.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Sécurité</h2>
          <p>Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Vos Droits</h2>
          <p>Conformément à la réglementation, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et de portabilité de vos données. Pour exercer ces droits, contactez-nous via WhatsApp.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Cookies</h2>
          <p>Notre site utilise uniquement des cookies techniques nécessaires à son fonctionnement. Nous n&apos;utilisons pas de cookies publicitaires ou de traçage tiers.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
          <p>Pour toute question relative à la protection de vos données, contactez-nous directement via WhatsApp ou par email.</p>
        </section>
      </div>
    </main>
  );
}
