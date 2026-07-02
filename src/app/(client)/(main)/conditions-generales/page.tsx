import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Conditions Générales | JC Import Express",
  description: "Conditions générales d'utilisation et de vente de JC Import Express, plateforme d'import-export pour l'Afrique.",
  path: "/conditions-generales",
});

export default function CGUPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Conditions Générales d&apos;Utilisation et de Vente</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Objet</h2>
          <p>Les présentes Conditions Générales régissent l&apos;utilisation de la plateforme JC Import Express (ci-après &laquo; la Plateforme &raquo;) et les prestations de services d&apos;import-export proposées par JC Import Express aux utilisateurs.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Définitions</h2>
          <p>&laquo; Utilisateur &raquo; : toute personne physique ou morale utilisant la Plateforme. &laquo; Demande &raquo; : toute sollicitation de service d&apos;import ou de transit formulée via la Plateforme. &laquo; Prestataire &raquo; : JC Import Express et ses partenaires logistiques.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Inscription</h2>
          <p>L&apos;accès à la Plateforme nécessite une inscription préalable via numéro de téléphone. L&apos;utilisateur s&apos;engage à fournir des informations exactes et à les tenir à jour.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Services</h2>
          <p>JC Import Express propose un service de mise en relation et d&apos;accompagnement pour l&apos;importation de produits depuis ses hubs internationaux (Chine, France, Allemagne, Dubaï, Italie, USA) vers toute destination en Afrique. Les devis sont fournis sous 24h ouvrées et sont valables 15 jours.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Tarifs et Paiement</h2>
          <p>Les prix sont indiqués en USD. Le paiement s&apos;effectue par Mobile Money, virement bancaire ou dépôt d&apos;espèces selon les moyens disponibles dans le pays de destination. Un acompte peut être exigé à la confirmation de la commande.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Délais</h2>
          <p>Les délais indiqués sont donnés à titre indicatif. JC Import Express s&apos;engage à informer l&apos;utilisateur de tout retard via les canaux de communication habituels (WhatsApp, email).</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Douane et Réglementation</h2>
          <p>JC Import Express accompagne l&apos;utilisateur dans les démarches douanières mais ne saurait être tenu responsable des retards ou frais supplémentaires liés à la réglementation locale du pays de destination.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Responsabilité</h2>
          <p>JC Import Express décline toute responsabilité en cas de force majeure, de retard indépendant de sa volonté, ou de dommages indirects liés à l&apos;utilisation de la Plateforme.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Données Personnelles</h2>
          <p>Les informations collectées sont utilisées pour le traitement des demandes et l&apos;amélioration des services. Conformément à la réglementation en vigueur, l&apos;utilisateur dispose d&apos;un droit d&apos;accès, de rectification et de suppression de ses données.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
          <p>Pour toute réclamation ou question, contactez-nous via WhatsApp ou par email à l&apos;adresse indiquée sur la Plateforme.</p>
        </section>
      </div>
    </main>
  );
}
