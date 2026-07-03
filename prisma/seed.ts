import {
  PrismaClient,
  TransportMode,
  RequestStatus,
  TrajectoryStepType,
  BlogPostType,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("[seed] DATABASE_URL is required");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const seedCountriesData = [
  { name: "Cote d'Ivoire", slug: "cote-divoire", iso2: "CI", dialingCode: "+225", currencyCode: "XOF", currencyName: "Franc CFA BCEAO", currencySymbol: "F CFA", usdExchangeRate: 605, continent: "Africa", isFeatured: true },
  { name: "Senegal", slug: "senegal", iso2: "SN", dialingCode: "+221", currencyCode: "XOF", currencyName: "Franc CFA BCEAO", currencySymbol: "F CFA", usdExchangeRate: 605, continent: "Africa", isFeatured: true },
  { name: "Mali", slug: "mali", iso2: "ML", dialingCode: "+223", currencyCode: "XOF", currencyName: "Franc CFA BCEAO", currencySymbol: "F CFA", usdExchangeRate: 605, continent: "Africa", isFeatured: true },
  { name: "Nigeria", slug: "nigeria", iso2: "NG", dialingCode: "+234", currencyCode: "NGN", currencyName: "Naira", currencySymbol: "N", usdExchangeRate: 1450, continent: "Africa", isFeatured: true },
  { name: "Ghana", slug: "ghana", iso2: "GH", dialingCode: "+233", currencyCode: "GHS", currencyName: "Cedi", currencySymbol: "GHc", usdExchangeRate: 15.2, continent: "Africa" },
  { name: "Cameroon", slug: "cameroon", iso2: "CM", dialingCode: "+237", currencyCode: "XAF", currencyName: "Franc CFA BEAC", currencySymbol: "F CFA", usdExchangeRate: 605, continent: "Africa" },
  { name: "Benin", slug: "benin", iso2: "BJ", dialingCode: "+229", currencyCode: "XOF", currencyName: "Franc CFA BCEAO", currencySymbol: "F CFA", usdExchangeRate: 605, continent: "Africa" },
  { name: "Togo", slug: "togo", iso2: "TG", dialingCode: "+228", currencyCode: "XOF", currencyName: "Franc CFA BCEAO", currencySymbol: "F CFA", usdExchangeRate: 605, continent: "Africa" },
  { name: "Republique democratique du Congo", slug: "rdc", iso2: "CD", dialingCode: "+243", currencyCode: "CDF", currencyName: "Franc congolais", currencySymbol: "FC", usdExchangeRate: 2850, continent: "Africa" },
  { name: "Maroc", slug: "maroc", iso2: "MA", dialingCode: "+212", currencyCode: "MAD", currencyName: "Dirham marocain", currencySymbol: "DH", usdExchangeRate: 10.1, continent: "Africa" },
  { name: "Chine", slug: "chine", iso2: "CN", dialingCode: "+86", currencyCode: "CNY", currencyName: "Yuan", currencySymbol: "¥", usdExchangeRate: 7.2, continent: "Asia", isHub: true },
  { name: "Emirats arabes unis", slug: "emirats-arabes-unis", iso2: "AE", dialingCode: "+971", currencyCode: "AED", currencyName: "Dirham des EAU", currencySymbol: "AED", usdExchangeRate: 3.67, continent: "Asia", isHub: true },
  { name: "France", slug: "france", iso2: "FR", dialingCode: "+33", currencyCode: "EUR", currencyName: "Euro", currencySymbol: "€", usdExchangeRate: 0.92, continent: "Europe", isHub: true },
  { name: "Allemagne", slug: "allemagne", iso2: "DE", dialingCode: "+49", currencyCode: "EUR", currencyName: "Euro", currencySymbol: "€", usdExchangeRate: 0.92, continent: "Europe", isHub: true },
  { name: "Italie", slug: "italie", iso2: "IT", dialingCode: "+39", currencyCode: "EUR", currencyName: "Euro", currencySymbol: "€", usdExchangeRate: 0.92, continent: "Europe", isHub: true },
  { name: "Etats-Unis", slug: "etats-unis", iso2: "US", dialingCode: "+1", currencyCode: "USD", currencyName: "Dollar", currencySymbol: "$", usdExchangeRate: 1, continent: "America", isHub: true },
];

async function seedCountries() {
  for (const country of seedCountriesData) {
    await prisma.country.upsert({
      where: { slug: country.slug },
      update: country,
      create: country,
    });
  }
  console.log(`[seed] ${seedCountriesData.length} countries`);
}

async function seedAdminUser() {
  const coteIvoire = await prisma.country.findUnique({ where: { slug: "cote-divoire" } });
  const adminUsername = "admin";
  const adminEmail = "admin@jc-import-express.internal";
  const adminPassword = process.env.JC_IMPORT_EXPRESS_ADMIN_PASSWORD || "Admin@12345";

  const existing = await prisma.auraUser.findUnique({
    where: { username: adminUsername },
  });

  if (existing) {
    await prisma.auraUser.update({
      where: { id: existing.id },
      data: {
        isAdmin: true, displayName: "Admin JC Import Express", businessName: "JC Import Express",
        countryId: coteIvoire?.id, currencyCode: "XOF", email: adminEmail,
      },
    });
    console.log("[seed] Admin user updated");
    return;
  }

  const user = await prisma.auraUser.create({
    data: {
      username: adminUsername, email: adminEmail, displayName: "Admin JC Import Express",
      businessName: "JC Import Express", isAdmin: true, countryId: coteIvoire?.id, currencyCode: "XOF",
      passwordCredential: {
        create: { passwordHash: hashSync(adminPassword, 12) },
      },
    },
  });
  console.log(`[seed] Admin user created: ${user.id}`);
}

async function seedRequests(clientId: string) {
  const coteIvoire = await prisma.country.findUnique({ where: { slug: "cote-divoire" } });
  const chine = await prisma.country.findUnique({ where: { slug: "chine" } });

  if (!coteIvoire || !chine) {
    console.log("[seed] Skipping requests - missing countries");
    return;
  }

  async function upsertRequest(requestNumber: string, data: Parameters<typeof prisma.request.create>[0]["data"]) {
    const existing = await prisma.request.findUnique({ where: { requestNumber } });
    if (existing) {
      await prisma.trajectoryStep.deleteMany({ where: { requestId: existing.id } });
      await prisma.jcNotification.deleteMany({ where: { requestId: existing.id } });
      await prisma.requestStatusEvent.deleteMany({ where: { requestId: existing.id } });
      await prisma.request.update({ where: { id: existing.id }, data });
      return prisma.request.findUniqueOrThrow({ where: { id: existing.id } });
    }
    return prisma.request.create({ data });
  }

  const request1 = await upsertRequest("GI-240101-001", {
    requestNumber: "GI-240101-001",
    type: "SHIPMENT",
    userId: clientId,
    originCountryId: chine.id,
    destinationCountryId: coteIvoire.id,
    recipientName: "Amadou Diallo",
    recipientPhone: "2250700000001",
    deliveryAddress: "Rue des Jardins, Cocody, Abidjan",
    city: "Abidjan",
    packageCount: 2,
    productDescription: "Smartphones et accessoires",
    transportMode: TransportMode.AVION,
    status: RequestStatus.EN_COURS,
    latestStatusMessage: "Votre expedition est en cours de transit vers Abidjan.",
    statusEvents: {
      create: [
        { status: RequestStatus.EN_ATTENTE, title: "Demande recue", message: "Votre demande a ete enregistree.", createdByLabel: "Systeme" },
        { status: RequestStatus.EN_COURS, title: "Expedition confirmee", message: "Votre expedition est en preparation.", createdByLabel: "Systeme" },
      ],
    },
  });

  await prisma.trajectoryStep.createMany({
    data: [
      { requestId: request1.id, countryId: chine.id, locationName: "Shenzhen, Chine", stepType: TrajectoryStepType.ORIGIN, sequence: 0, reachedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), timerDurationHours: 48 },
      { requestId: request1.id, countryId: null, locationName: "Transit aerien Dubai", stepType: TrajectoryStepType.ESCALE, sequence: 1, reachedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), timerDurationHours: 12 },
      { requestId: request1.id, countryId: coteIvoire.id, locationName: "Abidjan, Cote d'Ivoire", stepType: TrajectoryStepType.DESTINATION, sequence: 2, timerDurationHours: 24 },
    ],
  });

  await prisma.jcNotification.createMany({
    data: [
      { userId: clientId, requestId: request1.id, type: "REQUEST_CREATED", title: "Nouvelle demande", message: "Votre demande GI-240101-001 a ete creee.", deepLink: `/tracking/${request1.id}` },
      { userId: clientId, requestId: request1.id, type: "REQUEST_STATUS_UPDATED", title: "Expedition en cours", message: "Votre expedition est en transit.", deepLink: `/tracking/${request1.id}` },
    ],
  });

  const request2 = await upsertRequest("GI-240102-002", {
    requestNumber: "GI-240102-002",
    type: "SHIPMENT",
    userId: clientId,
    originCountryId: chine.id,
    destinationCountryId: coteIvoire.id,
    recipientName: "Amadou Diallo",
    recipientPhone: "221770000001",
    deliveryAddress: "A confirmer.",
    productDescription: "Materiel medical - desinfectants, masques chirurgicaux",
    transportMode: TransportMode.BATEAU,
    status: RequestStatus.EN_ATTENTE,
    latestStatusMessage: "Votre demande est en attente de devis.",
    statusEvents: {
      create: [
        { status: RequestStatus.EN_ATTENTE, title: "Demande recue", message: "Un conseiller va vous contacter sous peu.", createdByLabel: "Systeme" },
      ],
    },
  });

  await prisma.jcNotification.create({
    data: {
      userId: clientId, requestId: request2.id,
      type: "REQUEST_CREATED",
      title: "Demande de transit", message: "Votre demande GI-240102-002 a ete creee.",
      deepLink: `/tracking/${request2.id}`,
    },
  });

  console.log("[seed] Requests, trajectory, notifications created");
}

async function seedAdminAccessKey() {
  const existing = await prisma.adminAccessKey.findFirst({ where: { isActive: true } });
  if (existing) {
    console.log("[seed] Admin access key already exists");
    return;
  }
  const key = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
  await prisma.adminAccessKey.create({
    data: { key, name: "Initial admin key", isActive: true },
  });
  console.log(`[seed] Admin access key created: ${key}`);
}

const BLOG_POSTS = [
  {
    type: BlogPostType.BLOG,
    title: "Guide complet de l'import-export depuis la Chine vers l'Afrique",
    slug: "guide-import-export-chine-afrique",
    content: `# Guide complet de l'import-export depuis la Chine vers l'Afrique

L'importation de marchandises depuis la Chine vers l'Afrique est un levier économique majeur pour les entrepreneurs africains. Que vous soyez un importateur chevronné ou un débutant, ce guide vous accompagne pas à pas.

## Pourquoi importer depuis la Chine ?

La Chine est le premier partenaire commercial de l'Afrique avec des échanges dépassant les 250 milliards de dollars. Les raisons de ce succès sont multiples :
- Prix compétitifs sur une large gamme de produits
- Diversité des fournisseurs et des fabricants
- Infrastructures logistiques développées
- Expertise reconnue dans de nombreux secteurs

## Les étapes clés d'une importation réussie

### 1. Recherche de fournisseurs
Alibaba, Canton Fair, et les missions commerciales sont des sources fiables pour trouver des partenaires.

### 2. Négociation et contrat
Définissez clairement les Incoterms, les délais de livraison et les modalités de paiement.

### 3. Transport et logistique
Choisissez entre le fret maritime (économique pour les volumes importants) et le fret aérien (rapide pour les petites cargaisons).

### 4. Déclarations douanières
Chaque pays africain a ses propres exigences. Faites appel à un transitaire expérimenté.

### 5. Réception et distribution
Une fois la marchandise dédouanée, organisez la distribution locale.

## Les erreurs courantes à éviter

- Négliger les droits de douane et taxes locales
- Ne pas vérifier la conformité des produits aux normes locales
- Sous-estimer les délais de transport
- Ignorer les fluctuations des taux de change

Avec JC Import Express, simplifiez vos démarches d'import-export et suivez vos expéditions en temps réel.`,
    excerpt: "Découvrez les étapes essentielles pour importer depuis la Chine vers l'Afrique : recherche de fournisseurs, transport, douane et distribution.",
    tags: "import,chine,afrique,guide,logistique",
    metaTitle: "Guide Import-Export Chine-Afrique | JC Import Express",
    metaDesc: "Guide complet pour importer depuis la Chine vers l'Afrique : fournisseurs, transport maritime et aérien, douane, et conseils pratiques.",
  },
  {
    type: BlogPostType.ADVICE,
    title: "Fret maritime vs fret aérien : lequel choisir pour votre expédition ?",
    slug: "fret-maritime-vs-fret-aerien",
    content: `# Fret maritime vs fret aérien : lequel choisir ?

Le choix du mode de transport est crucial dans toute opération d'import-export. Fret maritime ou fret aérien ? Chacun a ses avantages et ses inconvénients.

## Fret maritime

### Avantages
- **Coût réduit** : jusqu'à 10 fois moins cher que le fret aérien
- **Capacité** : adapté aux volumes importants et marchandises lourdes
- **Polyvalence** : conteneurs standardisés pour tous types de produits

### Inconvénients
- **Délais longs** : 25 à 40 jours depuis la Chine vers l'Afrique
- **Frais portuaires** : manutention, stockage, et taxes portuaires
- **Risques** : vol, intempéries, grèves portuaires

## Fret aérien

### Avantages
- **Rapidité** : 3 à 7 jours depuis la Chine vers l'Afrique
- **Sécurité** : moins de manutention, risques réduits
- **Simplicité** : procédures douanières souvent plus rapides

### Inconvénients
- **Coût élevé** : nettement plus cher au kilo
- **Limitations** : poids et dimensions restreints
- **Réglementation** : certaines marchandises interdites (liquides, batteries)

## Tableau comparatif

| Critère | Maritime | Aérien |
|---------|----------|--------|
| Délai Chine-Afrique | 25-40 jours | 3-7 jours |
| Coût indicatif/kg | 0.5-2 USD | 4-10 USD |
| Volume max | Illimité | ~500 kg/caisse |
| Idéal pour | Meubles, matériaux, vrac | Electronique, mode, urgences |

## Recommandation

Choisissez le fret maritime pour les marchandises volumineuses, lourdes, ou lorsque le coût est le facteur principal. Préférez le fret aérien pour les produits de valeur, périssables, ou urgents.

Chez JC Import Express, nous combinons les deux modes pour optimiser vos expéditions.`,
    excerpt: "Fret maritime ou aérien ? Comparez les coûts, délais et avantages de chaque mode de transport pour choisir la meilleure option.",
    tags: "fret,maritime,aerien,transport,conseil",
    metaTitle: "Fret Maritime vs Aérien : Guide Comparatif | JC Import Express",
    metaDesc: "Comparez les avantages et inconvénients du fret maritime et aérien pour vos expéditions depuis la Chine vers l'Afrique.",
  },
  {
    type: BlogPostType.BLOG,
    title: "Les formalités douanières pour l'importation en Côte d'Ivoire",
    slug: "formalites-douanieres-cote-d-ivoire",
    content: `# Les formalités douanières pour l'importation en Côte d'Ivoire

La Côte d'Ivoire est la première économie de l'UEMOA et une porte d'entrée majeure pour les marchandises en Afrique de l'Ouest. Voici tout ce qu'il faut savoir pour dédouaner vos marchandises.

## Documents requis

1. **Facture commerciale** : originale + 3 copies
2. **Connaissement (Bill of Lading)** ou **Lettre de transport aérien (AWB)**
3. **Liste de colisage** : détail des marchandises, poids, dimensions
4. **Certificat d'origine** : selon les accords commerciaux
5. **Certificat de conformité** : pour les produits réglementés
6. **Déclaration d'importation (DI)** : via le guichet unique du commerce extérieur

## Le processus de dédouanement

### Étape 1 : Pré-arrivée
Transmettez vos documents à votre transitaire au moins 48h avant l'arrivée du navire.

### Étape 2 : Dépôt de la déclaration
Le transitaire dépose la déclaration en détail via le système Sydam.

### Étape 3 : Vérification
Les services douaniers peuvent procéder à un contrôle documentaire ou physique.

### Étape 4 : Paiement des droits
Droits de douane (généralement 10-20%), TVA (18%), et autres taxes.

### Étape 5 : Enlèvement
Une fois le bon à enlever délivré, vous pouvez récupérer votre marchandise.

## Droits et taxes

| Type | Taux | Base |
|------|------|------|
| Droit de douane | 10-20% | Valeur CAF |
| TVA | 18% | Valeur CAF + droits |
| PCS | 1.5% | Valeur CAF |
| COSEC | 0.2% | Valeur CAF |

## Conseils pratiques

- **Faites appel à un transitaire agréé** : il connaît les procédures locales
- **Anticipez les contrôles** : certains produits nécessitent des autorisations spéciales
- **Prévoyez un budget douane** : les frais peuvent représenter 30-50% de la valeur de la marchandise

Besoin d'aide pour vos formalités douanières ? JC Import Express vous accompagne de l'achat à la livraison.`,
    excerpt: "Tout savoir sur les formalités douanières en Côte d'Ivoire : documents requis, processus de dédouanement, droits et taxes.",
    tags: "douane,cote-d-ivoire,import,formalites,afrique",
    metaTitle: "Formalités Douanières Côte d'Ivoire | Guide Import",
    metaDesc: "Guide complet des formalités douanières pour importer en Côte d'Ivoire : documents, procédures, droits et taxes à prévoir.",
  },
  {
    type: BlogPostType.ADVICE,
    title: "Comment suivre votre expédition en temps réel ?",
    slug: "suivi-expedition-temps-reel",
    content: `# Comment suivre votre expédition en temps réel ?

Le suivi en temps réel de vos expéditions est devenu un standard dans la logistique moderne. Voici comment JC Import Express vous permet de garder un œil sur vos marchandises à chaque étape.

## Pourquoi le suivi en temps réel est important ?

- **Tranquillité d'esprit** : vous savez où se trouve votre marchandise à tout moment
- **Anticipation** : préparez la réception et la distribution
- **Réactivité** : intervenez rapidement en cas de problème
- **Transparence** : aucune zone d'ombre dans le processus

## Notre système de tracking

### 1. Code de suivi unique
Chaque expédition reçoit un numéro de suivi unique (ex: GI-240101-001).

### 2. Étapes du trajet
Visualisez chaque étape du parcours :
- Départ de l'entrepôt fournisseur
- Arrivée au port/aéroport d'origine
- Transit / escales
- Arrivée au port/aéroport de destination
- Dédouanement
- Livraison finale

### 3. Notifications WhatsApp
Recevez des alertes instantanées à chaque étape clé directement sur WhatsApp.

### 4. Chronomètres d'étape
Chaque étape a un chronomètre qui vous indique le temps restant estimé.

## Comment accéder au suivi ?

1. **Depuis votre espace client** : connectez-vous à votre compte
2. **Lien de partage** : votre transitaire peut vous envoyer un lien direct
3. **Page publique** : entrez votre numéro de demande sur notre page d'accueil

## Fonctionnalités avancées

- **Carte interactive** : visualisez le parcours géographique
- **Timeline détaillée** : historique complet des événements
- **Partage** : envoyez le lien de suivi à vos partenaires

Avec JC Import Express, votre expédition n'a plus de secrets pour vous. Suivez-la en temps réel, où que vous soyez.`,
    excerpt: "Découvrez comment suivre vos expéditions en temps réel avec JC Import Express : tracking, notifications WhatsApp, carte interactive.",
    tags: "suivi,tracking,logistique,whatsapp,temps-reel",
    metaTitle: "Suivi Expédition Temps Réel | JC Import Express",
    metaDesc: "Suivez vos expéditions en temps réel avec notre système de tracking : notifications WhatsApp, carte interactive, et chronomètres d'étape.",
  },
  {
    type: BlogPostType.BLOG,
    title: "Top 10 des produits les plus importés d'Afrique en 2026",
    slug: "top-10-produits-importes-afrique-2026",
    content: `# Top 10 des produits les plus importés d'Afrique en 2026

Le marché africain est en pleine expansion. Voici les produits les plus importés qui dominent le commerce en 2026.

## 1. Équipements électroniques
Smartphones, ordinateurs, tablettes et accessoires tech représentent près de 15% des importations africaines.

## 2. Machines et équipements industriels
Matériel de construction, machines agricoles, équipements de transformation.

## 3. Véhicules et pièces détachées
Voitures d'occasion, motos, pièces de rechange et pneus.

## 4. Produits alimentaires transformés
Riz, sucre, huile de palme, lait en poudre, conserves.

## 5. Vêtements et textiles
Habits, chaussures, tissus et accessoires de mode.

## 6. Matériaux de construction
Ciment, fer à béton, tôles, carreaux, sanitaires.

## 7. Produits pharmaceutiques
Médicaments, matériel médical, équipements de laboratoire.

## 8. Meubles et ameublement
Meubles de maison et de bureau, literie, décoration.

## 9. Produits cosmétiques
Parfums, soins de la peau, produits capillaires, maquillage.

## 10. Jouets et articles de sport
Jeux éducatifs, équipements sportifs, vélos.

## Tendances 2026

- **Digitalisation** : 70% des importations passent désormais par des plateformes en ligne
- **Durabilité** : demande croissante pour des produits éco-responsables
- **Localisation** : les hubs comme la Chine, Dubaï et la Turquie restent dominants

Vous souhaitez importer l'un de ces produits ? JC Import Express vous aide à trouver les meilleurs fournisseurs et à gérer toute la logistique.`,
    excerpt: "Découvrez le classement 2026 des produits les plus importés en Afrique : électronique, machines, véhicules, alimentaire et plus.",
    tags: "import,top,produits,afrique,2026,tendances",
    metaTitle: "Top 10 Produits Importés en Afrique 2026 | JC Import Express",
    metaDesc: "Classement 2026 des produits les plus importés en Afrique : électronique, machines, véhicules, alimentaire et tendances du marché.",
  },
];

const SITE_CONTENT = [
  { section: "metadata", key: "homeTitle", value: "JC Import Express | Suivi de Colis International — Tracking en Temps Réel" },
  { section: "metadata", key: "homeDescription", value: "Suivez vos colis et marchandises en temps réel. Tracking international par avion, bateau et camion. Notification WhatsApp à chaque étape." },
  { section: "metadata", key: "blogTitle", value: "Blog | JC Import Express — Guide Import-Export Afrique" },
  { section: "metadata", key: "blogDescription", value: "Conseils, guides et astuces pour importer vos produits en Afrique. Fret maritime, fret aérien, douane, et tout ce qu'il faut savoir." },
  { section: "header", key: "brandName", value: "JC Import Express" },
  { section: "header", key: "phone", value: "+86 130 5916 2331 " },
  {
    section: "header", key: "navLinks", value: JSON.stringify([
      { label: "Accueil", href: "#hero" },
      { label: "Services", href: "#services" },
      { label: "À propos", href: "#about" },
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: "#contact" },
    ])
  },
  { section: "hero", key: "badge", value: "Réseau logistique international" },
  { section: "hero", key: "title", value: "Une logistique mondiale," },
  { section: "hero", key: "accent", value: "maîtrisée de bout en bout." },
  { section: "hero", key: "description", value: "Du fret international à la livraison du dernier kilomètre, nous connectons vos marchandises à plus de 150 pays avec visibilité, précision et fiabilité opérationnelle." },
  { section: "hero", key: "desktopImage", value: "/images/hero-logistics.png" },
  { section: "hero", key: "mobileImage", value: "/images/hero-mobile-logistics.png" },
  { section: "hero", key: "trackingPlaceholder", value: "Entrez votre numéro de suivi" },
  { section: "hero", key: "trackingButton", value: "Suivre mon colis" },
  {
    section: "hero", key: "stats", value: JSON.stringify([
      { value: "150+", label: "Pays desservis" },
      { value: "50K+", label: "Expéditions mensuelles" },
      { value: "99,8 %", label: "Livraisons à l’heure" },
      { value: "15+", label: "Années d’expertise" },
    ])
  },
  { section: "products", key: "eyebrow", value: "Nos Produits" },
  { section: "products", key: "title", value: "Solutions logistiques adaptées à" },
  { section: "products", key: "accent", value: "vos besoins" },
  { section: "products", key: "description", value: "Des tarifs transparents et compétitifs pour toutes vos expéditions, du petit colis au conteneur complet." },
  { section: "features", key: "eyebrow", value: "Ce que nous offrons" },
  { section: "features", key: "title", value: "Des solutions logistiques" },
  { section: "features", key: "accent", value: "complètes et fiables" },
  { section: "features", key: "description", value: "Des solutions de chaîne d’approvisionnement de bout en bout, conçues autour de votre activité, de vos itinéraires et de vos exigences opérationnelles." },
  {
    section: "features", key: "stats", value: JSON.stringify([
      { value: "150+", label: "Pays desservis", icon: "globe" },
      { value: "50K+", label: "Expéditions / mois", icon: "package" },
      { value: "99,8%", label: "Livraisons à l'heure", icon: "clock" },
      { value: "15+", label: "Années d'excellence", icon: "award" },
    ])
  },
  {
    section: "features", key: "services", value: JSON.stringify([
      { title: "Fret aérien", description: "Solutions de fret aérien urgent avec suivi et options prioritaires.", icon: "plane", features: ["Options express et prioritaires", "Cargaison à température contrôlée", "Suivi en temps réel"] },
      { title: "Fret maritime", description: "Expédition en conteneur complet ou groupage sur les grandes routes commerciales.", icon: "ship", features: ["Solutions FCL et LCL", "Port-à-port et porte-à-porte", "Dédouanement inclus"] },
      { title: "Transport terrestre", description: "Transport routier intermodal pour palettes, colis et marchandises professionnelles.", icon: "truck", features: ["Flotte suivie par GPS", "Services programmés", "Livraison porte-à-porte"] },
    ])
  },
  {
    section: "features", key: "trackingSteps", value: JSON.stringify([
      { label: "Commande confirmée", time: "15 janv. · 10:30", done: true },
      { label: "Colis ramassé", time: "15 janv. · 14:15", done: true },
      { label: "En transit", time: "16 janv. · 08:00", done: true },
      { label: "Dédouanement", time: "Estimé le 18 janv.", done: false },
      { label: "Livraison", time: "Estimé le 19 janv.", done: false },
    ])
  },
  { section: "features", key: "testimonialEyebrow", value: "Témoignages" },
  { section: "features", key: "testimonialTitle", value: "La confiance se mesure dans les résultats." },
  { section: "features", key: "testimonialDescription", value: "Des entreprises s’appuient sur notre réseau pour sécuriser leurs opérations logistiques." },
  { section: "benefits", key: "eyebrow", value: "À propos de JC Import Express" },
  { section: "benefits", key: "title", value: "Votre partenaire de confiance en" },
  { section: "benefits", key: "accent", value: "solutions logistiques mondiales." },
  { section: "benefits", key: "description", value: "Fondée en 2010, JC Import Express est devenue un partenaire logistique fiable pour les expéditions internationales." },
  {
    section: "benefits", key: "items", value: JSON.stringify([
      { title: "Notre mission", description: "Redéfinir la logistique avec innovation et fiabilité.", icon: "mission" },
      { title: "Notre vision", description: "Devenir le partenaire logistique le plus fiable pour vos imports.", icon: "vision" },
      { title: "Dédouanement intégré", description: "Notre équipe gère vos documents et formalités douanières.", icon: "customs" },
    ])
  },
  { section: "faq", key: "eyebrow", value: "FAQ" },
  { section: "faq", key: "title", value: "Questions fréquentes" },
  { section: "faq", key: "description", value: "Les réponses essentielles pour comprendre simplement nos services logistiques." },
  {
    section: "faq", key: "items", value: JSON.stringify([
      { question: "Comment puis-je suivre mon expédition ?", answer: "Entrez votre numéro de suivi sur la page d'accueil pour obtenir les mises à jour disponibles." },
      { question: "Quels types de cargaison traitez-vous ?", answer: "Nous traitons les colis, palettes, conteneurs, marchandises générales et dossiers de dédouanement." },
      { question: "Proposez-vous le dédouanement international ?", answer: "Oui, notre équipe accompagne la préparation documentaire et le suivi des formalités douanières." },
    ])
  },
  { section: "pricing", key: "eyebrow", value: "Contact" },
  { section: "pricing", key: "title", value: "Obtenez un devis" },
  { section: "pricing", key: "description", value: "Notre équipe conçoit une solution adaptée à votre expédition." },
  { section: "pricing", key: "panelTitle", value: "Échangez directement avec notre équipe logistique." },
  { section: "pricing", key: "panelDescription", value: "Nous analysons votre itinéraire, vos délais et vos contraintes afin de vous proposer une réponse exploitable." },
  { section: "pricing", key: "addressLabel", value: "Siège social" },
  { section: "pricing", key: "address", value: "Wyoming, États-Unis" },
  { section: "pricing", key: "phoneLabel", value: "Téléphone" },
  { section: "pricing", key: "phone", value: "+86 130 5916 2331 " },
  { section: "pricing", key: "emailLabel", value: "Email" },
  { section: "pricing", key: "email", value: "support@nexttracelogistics.com" },
  { section: "pricing", key: "availabilityTitle", value: "Disponibilité" },
  { section: "pricing", key: "availabilityBody", value: "Lundi au vendredi : 8h–20h HNE · Support de suivi : 24h/24, 7j/7" },
  { section: "pricing", key: "formEyebrow", value: "Demande personnalisée" },
  { section: "pricing", key: "formTitle", value: "Parlez-nous de votre expédition." },
  { section: "pricing", key: "formDescription", value: "Renseignez les informations essentielles pour préparer une proposition adaptée." },
  { section: "pricing", key: "privacy", value: "Vos informations sont utilisées uniquement pour traiter votre demande de devis." },
  { section: "blog", key: "eyebrow", value: "Actualités & Conseils" },
  { section: "blog", key: "title", value: "Dernières" },
  { section: "blog", key: "accent", value: "publications" },
  { section: "blog", key: "description", value: "Suivez nos actualités, guides et conseils pour optimiser vos expéditions internationales." },
  { section: "blog", key: "cta", value: "Voir tous les articles" },
  { section: "blog", key: "listEyebrow", value: "Blog" },
  { section: "blog", key: "listTitle", value: "Guide Import-Export Afrique" },
  { section: "blog", key: "listDescription", value: "Conseils pratiques, guides étape par étape et astuces pour importer vos produits en Afrique en toute sérénité." },
];

const PRODUCT_SEEDS = [
  {
    slug: "conteneur-maritime-20-pieds",
    name: "Conteneur Maritime 20 pieds",
    shortDescription: "Conteneur standard dry van pour fret maritime. Capacité de 33 m³, charge utile jusqu'à 28 tonnes.",
    fullDescription: "Parfait pour vos expéditions de taille moyenne, ce conteneur maritime de 20 pieds est une solution standard du transport international.\n\nIl convient aux marchandises sèches : meubles, vêtements, produits manufacturés, machines et biens de consommation.",
    imageUrl: "/images/shipping-containers.jpg",
    gallery: ["/images/shipping-containers.jpg", "/images/warehouse.jpg", "/images/ocean-freight.jpg"],
    priceXaf: 3_600_000,
    likes: 47,
    features: ["Capacité intérieure : 33 m³", "Charge utile max : 28 000 kg", "Acier Corten anti-corrosion", "Certifié CSC"],
    sortOrder: 1,
    testimonials: [
      { name: "Amadou Diallo", advice: "Conteneur reçu en parfait état, conforme à la description.", star: 5, showOnLanding: true, sortOrder: 1 },
      { name: "Fatima Ndiaye", advice: "Excellent rapport qualité-prix pour l'export vers l'Afrique de l'Ouest.", star: 5, showOnLanding: false, sortOrder: 2 },
    ],
  },
  {
    slug: "fret-aerien-express-100kg",
    name: "Fret Aérien Express (100 kg)",
    shortDescription: "Service de fret aérien prioritaire pour colis standard. Délai de 3 à 5 jours ouvrés.",
    fullDescription: "Notre service de fret aérien express est adapté aux envois urgents vers l'Afrique.\n\nIl couvre jusqu'à 100 kg de marchandises avec suivi en temps réel et manutention sécurisée.",
    imageUrl: "/images/air-freight.jpg",
    gallery: ["/images/air-freight.jpg", "/images/tracking-map.jpg", "/images/warehouse.jpg"],
    priceXaf: 900_000,
    likes: 62,
    features: ["Poids max : 100 kg", "Délai : 3 à 5 jours ouvrés", "Suivi 24h/24", "Dédouanement accéléré inclus"],
    sortOrder: 2,
    testimonials: [
      { name: "Sophie Leblanc", advice: "Livraison ultra-rapide, mon colis est arrivé à Douala en 4 jours.", star: 5, showOnLanding: true, sortOrder: 3 },
    ],
  },
  {
    slug: "service-dedouanement-complet",
    name: "Service Dédouanement Complet",
    shortDescription: "Accompagnement douanier complet pour vos marchandises : documents, conformité et suivi.",
    fullDescription: "Notre service de dédouanement complet vous accompagne de la préparation des documents à la libération des marchandises.\n\nIl couvre la classification tarifaire, les déclarations, les calculs de droits et les échanges avec les autorités.",
    imageUrl: "/images/tracking-map.jpg",
    gallery: ["/images/tracking-map.jpg", "/images/warehouse.jpg", "/images/shipping-containers.jpg"],
    priceXaf: 250_000,
    likes: 54,
    features: ["Classification tarifaire", "Préparation des documents", "Interface avec les autorités", "Assistance prioritaire"],
    sortOrder: 3,
    testimonials: [
      { name: "Hélène Zadi", advice: "Notre conteneur a été libéré rapidement grâce à leur expertise.", star: 5, showOnLanding: true, sortOrder: 4 },
    ],
  },
];

async function seedBlogPosts() {
  for (const post of BLOG_POSTS) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: { ...post, published: true, publishedAt: new Date() },
      create: { ...post, published: true, publishedAt: new Date() },
    });
  }
  console.log(`[seed] ${BLOG_POSTS.length} blog posts`);
}

async function seedSiteContent() {
  for (const item of SITE_CONTENT) {
    await prisma.siteContent.upsert({
      where: { section_key_locale: { section: item.section, key: item.key, locale: "fr" } },
      update: {
        value: item.value,
        draftContent: item.value,
        publishedContent: item.value,
        isPublished: true,
        publishedAt: new Date(),
      },
      create: {
        section: item.section,
        key: item.key,
        value: item.value,
        draftContent: item.value,
        publishedContent: item.value,
        isPublished: true,
        publishedAt: new Date(),
        locale: "fr",
      },
    });
  }
  console.log(`[seed] ${SITE_CONTENT.length} site content items`);
}

async function seedProductsAndTestimonials() {
  for (const productSeed of PRODUCT_SEEDS) {
    const { testimonials, ...product } = productSeed;
    const savedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product, isPublished: true, publishedAt: new Date() },
      create: { ...product, isPublished: true, publishedAt: new Date() },
    });

    for (const testimonial of testimonials) {
      await prisma.productTestimonial.upsert({
        where: { id: `${savedProduct.id}-${testimonial.sortOrder}` },
        update: { ...testimonial, productId: savedProduct.id, isPublished: true },
        create: {
          id: `${savedProduct.id}-${testimonial.sortOrder}`,
          ...testimonial,
          productId: savedProduct.id,
          isPublished: true,
        },
      });
    }
  }
  console.log(`[seed] ${PRODUCT_SEEDS.length} products`);
}

async function seedAppSettings() {
  await prisma.appSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", adminWhatsAppNumber: "2250700000000", evolutionInstanceId: "jc-import-express" },
  });
  console.log("[seed] App settings");
}

async function main() {
  console.log("[seed] Starting...");
  await seedCountries();
  await seedAdminUser();
  await seedAdminAccessKey();
  await seedAppSettings();
  await seedSiteContent();
  await seedProductsAndTestimonials();
  await seedBlogPosts();
  console.log("[seed] Done.");
}

main()
  .catch((e) => { console.error("[seed] Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
