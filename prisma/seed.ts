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
  await seedBlogPosts();
  console.log("[seed] Done.");
}

main()
  .catch((e) => { console.error("[seed] Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
