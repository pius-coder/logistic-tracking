export const ASSETS = {
  appIcon: "/images/shipping-containers.jpg",
  heroFront: "/images/hero-logistics.png",
  heroBackground: "/images/hero-mobile-logistics.png",
  cardPhoto: "/images/warehouse.jpg",
  cardWebsite: "/images/tracking-map.jpg",
  figma: "/images/air-freight.jpg",
  photos: "/images/ocean-freight.jpg",
  notes: "/images/land-transport.jpg",
  mail: "/images/warehouse.jpg",
  xcode: "/images/tracking-map.jpg",
  avatar: "/images/shipping-containers.jpg",
  cooldock: "/images/warehouse.jpg",
  footerTexture: "/images/hero-mobile-logistics.png",
};

export const USE_CASES = [
  {
    title: "Notre mission",
    description:
      "Redéfinir la logistique avec innovation et fiabilité. Chaque expédition est une promesse que nous tenons.",
    icon: "mission",
  },
  {
    title: "Notre vision",
    description:
      "Devenir le partenaire logistique le plus fiable au monde, reconnu pour notre excellence opérationnelle.",
    icon: "vision",
  },
  {
    title: "Sécurité avant tout",
    description:
      "Opérations certifiées ISO 9001 et 14001. Nos installations sont surveillées 24h/24 et chaque envoi est assuré.",
    icon: "safety",
  },
  {
    title: "Rapide et agile",
    description:
      "Suivi en temps réel et routage adaptatif. Notre réseau optimisé garantit des délais parmi les meilleurs du secteur.",
    icon: "speed",
  },
  {
    title: "Expertise mondiale",
    description:
      "Plus de 15 ans d'expérience, 5 000+ professionnels de la logistique, et un réseau couvrant plus de 150 pays.",
    icon: "global",
  },
  {
    title: "Dédouanement intégré",
    description:
      "Notre équipe de courtiers en douane gère le dédouanement dans plus de 150 pays pour une conformité totale.",
    icon: "customs",
  },
] as const;

export const FAQS = [
  {
    question: "Comment puis-je suivre mon expédition ?",
    answer:
      "Entrez votre numéro de suivi dans le champ de recherche sur notre page d'accueil pour obtenir des mises à jour en temps réel sur la position de votre colis, l'heure de livraison estimée et l'historique complet du parcours avec carte interactive.",
  },
  {
    question: "Quels types de cargaison traitez-vous ?",
    answer:
      "Nous traitons tous les types de marchandises : fret standard et général, marchandises dangereuses (DG), cargaisons surdimensionnées et hors-gabarit, produits pharmaceutiques à température contrôlée, œuvres d'art et antiquités, animaux vivants, et équipements militaires.",
  },
  {
    question: "Proposez-vous le dédouanement international ?",
    answer:
      "Oui, notre équipe de courtiers en douane expérimentés gère le dédouanement dans plus de 150 pays. Nous assurons une conformité réglementaire complète, la classification tarifaire, et la gestion des documents nécessaires.",
  },
  {
    question: "Quels sont vos délais de livraison ?",
    answer:
      "Nos délais varient selon le service choisi : messagerie express le jour même, fret aérien 3 à 5 jours ouvrés, fret maritime de 2 à 6 semaines selon la destination, transport terrestre de 1 à 7 jours selon la distance. Contactez-nous pour un devis personnalisé.",
  },
  {
    question: "Comment assurez-vous la sécurité des marchandises ?",
    answer:
      "Nous sommes certifiés ISO 9001 (qualité) et ISO 14001 (environnement). Nos entrepôts sont surveillés 24h/24 par vidéosurveillance, notre flotte est suivie par GPS en temps réel, et chaque expédition est couverte par une assurance cargo complète.",
  },
  {
    question: "Puis-je obtenir une solution logistique sur mesure ?",
    answer:
      "Absolument. Notre équipe conçoit des solutions personnalisées adaptées à vos besoins spécifiques. Que vous ayez besoin d'une chaîne d'approvisionnement complète ou d'un service ponctuel, nous vous proposons un devis gratuit sans engagement.",
  },
  {
    question: "Quels sont vos horaires d'ouverture ?",
    answer:
      "Notre bureau est ouvert du lundi au vendredi de 8h à 20h (HNE). Notre service de suivi et notre assistance client sont disponibles 24h/24, 7j/7 pour répondre à vos besoins urgents.",
  },
] as const;

export const XAF_TO_USD_RATE = 600;

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  gallery: string[];
  priceXAF: number;
  likes: number;
  reviews: Review[];
  features: string[];
}

const GALLERY = [
  "/images/shipping-containers.jpg",
  "/images/warehouse.jpg",
  "/images/air-freight.jpg",
  "/images/ocean-freight.jpg",
  "/images/land-transport.jpg",
  "/images/tracking-map.jpg",
];

export const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "conteneur-maritime-20-pieds",
    name: "Conteneur Maritime 20 pieds",
    shortDescription:
      "Conteneur standard dry van pour fret maritime. Capacité de 33 m³, charge utile jusqu'à 28 tonnes.",
    fullDescription:
      "Parfait pour vos expéditions de taille moyenne, ce conteneur maritime de 20 pieds est la solution standard la plus utilisée dans le transport international. Construit en acier Corten haute résistance, il offre une étanchéité parfaite et une résistance optimale aux conditions maritimes les plus extrêmes.\n\nCe conteneur dry van convient à tous types de marchandises sèches : meubles, vêtements, produits manufacturés, machines, quincaillerie et biens de consommation. Sa conception standardisée permet une manutention rapide dans tous les ports du monde.\n\nIdéal pour l'import-export entre l'Afrique, l'Europe, l'Asie et les Amériques, il s'intègre parfaitement dans les chaînes logistiques intermodales (bateau, train, camion).",
    image: "/images/shipping-containers.jpg",
    gallery: GALLERY,
    priceXAF: 3_600_000,
    likes: 47,
    features: [
      "Capacité intérieure : 33 m³",
      "Charge utile max : 28 000 kg",
      "Tare : 2 200 kg",
      "Dimensions int. : 5,90 x 2,35 x 2,39 m",
      "Acier Corten anti-corrosion",
      "Portes à double vantail 270°",
      "Certifié CSC (Convention for Safe Containers)",
    ],
    reviews: [
      { id: "r1", author: "Amadou Diallo", avatar: "AD", rating: 5, comment: "Conteneur reçu en parfait état, conforme à la description. Livraison dans les délais comme toujours avec JC Import Express.", date: "15 juin 2025" },
      { id: "r2", author: "Fatima Ndiaye", avatar: "FN", rating: 5, comment: "Excellent rapport qualité-prix pour l'export vers l'Afrique de l'Ouest. Je recommande vivement.", date: "2 mai 2025" },
      { id: "r3", author: "Jean-Pierre Kouamé", avatar: "JK", rating: 4, comment: "Très bon conteneur, solide et bien isolé. Un petit bémol sur le délai de livraison mais le suivi était parfait.", date: "18 avril 2025" },
      { id: "r4", author: "Mariam Traoré", avatar: "MT", rating: 5, comment: "Nous utilisons JC Import Express pour tous nos conteneurs depuis 3 ans. Jamais déçus.", date: "10 mars 2025" },
      { id: "r5", author: "Ibrahim Sow", avatar: "IS", rating: 4, comment: "Bon conteneur pour le prix. Correspond exactement à ce qui était annoncé.", date: "22 janvier 2025" },
    ],
  },
  {
    id: "2",
    slug: "conteneur-maritime-40-pieds",
    name: "Conteneur Maritime 40 pieds",
    shortDescription:
      "Conteneur dry van haute capacité. Volume de 67 m³, charge utile jusqu'à 28 tonnes.",
    fullDescription:
      "Le conteneur 40 pieds est la solution idéale pour les expéditions en gros volume. Avec le double de capacité du 20 pieds, il vous permet d'optimiser vos coûts de transport maritime en mutualisant vos marchandises.\n\nSa conception robuste en acier Corten garantit une protection optimale de vos marchandises pendant les longues traversées. Les doubles portes à ouverture 270° facilitent le chargement et le déchargement, même dans les espaces restreints.\n\nRecommandé pour l'export de meubles, machines industrielles, vêtements en vrac, matériaux de construction et produits alimentaires secs vers l'Afrique.",
    image: "/images/warehouse.jpg",
    gallery: GALLERY,
    priceXAF: 5_400_000,
    likes: 38,
    features: [
      "Capacité intérieure : 67,6 m³",
      "Charge utile max : 28 000 kg",
      "Tare : 3 800 kg",
      "Dimensions int. : 12,03 x 2,35 x 2,39 m",
      "Double portes arrière 270°",
      "Plancher en contreplaqué marine",
      "Certification CSC et TIR",
    ],
    reviews: [
      { id: "r6", author: "Abdoulaye Sarr", avatar: "AS", rating: 5, comment: "Parfait pour nos expéditions de meubles vers Dakar. Le rapport volume/prix est imbattable.", date: "20 juin 2025" },
      { id: "r7", author: "Clarisse Boni", avatar: "CB", rating: 5, comment: "Conteneur impeccable, livraison rapide. Très satisfaite de mon achat.", date: "5 mai 2025" },
      { id: "r8", author: "Mamadou Touré", avatar: "MT", rating: 4, comment: "Très bon conteneur. Utilisé pour l'export de marchandises vers Abidjan. Solide et fiable.", date: "12 mars 2025" },
    ],
  },
  {
    id: "3",
    slug: "fret-aerien-express-100kg",
    name: "Fret Aérien Express (100 kg)",
    shortDescription:
      "Service de fret aérien prioritaire pour colis standard. Délai de 3 à 5 jours ouvrés vers toutes les capitales africaines.",
    fullDescription:
      "Notre service de fret aérien express est la solution la plus rapide pour vos envois urgents vers l'Afrique. Avec un délai de 3 à 5 jours ouvrés, vos marchandises arrivent rapidement à destination.\n\nCe forfait couvre jusqu'à 100 kg de marchandises et inclut le suivi en temps réel, la manutention sécurisée et l'assurance de base. Le fret aérien est idéal pour les produits de haute valeur, les échantillons urgents, les documents importants et les petits colis à livraison rapide.\n\nNous opérons depuis tous les grands hubs européens (Paris CDG, Amsterdam Schiphol, Francfort, Londres Heathrow, Bruxelles) vers les principales capitales africaines.",
    image: "/images/air-freight.jpg",
    gallery: GALLERY,
    priceXAF: 900_000,
    likes: 62,
    features: [
      "Poids max : 100 kg",
      "Délai : 3 à 5 jours ouvrés",
      "Suivi en temps réel 24h/24",
      "Assurance transport incluse",
      "Manutention sécurisée",
      "Tracking par SMS et WhatsApp",
      "Dédouanement accéléré inclus",
    ],
    reviews: [
      { id: "r9", author: "Sophie Leblanc", avatar: "SL", rating: 5, comment: "Livraison ultra-rapide ! Mon colis est arrivé à Douala en 4 jours exactement. Suivi WhatsApp très pratique.", date: "28 juin 2025" },
      { id: "r10", author: "Kofi Annan", avatar: "KA", rating: 5, comment: "Service express fiable. Je l'utilise pour tous mes envois urgents vers Accra. Jamais de retard.", date: "15 juin 2025" },
      { id: "r11", author: "Aminata Diallo", avatar: "AD", rating: 4, comment: "Très bon service, un peu cher mais la rapidité est au rendez-vous. Idéal pour les urgences.", date: "1 juin 2025" },
    ],
  },
  {
    id: "4",
    slug: "colis-express-maritime-10kg",
    name: "Colis Express Maritime (10 kg)",
    shortDescription:
      "Solution économique pour petits colis par voie maritime. Délai de 14 à 21 jours.",
    fullDescription:
      "Notre service Colis Express Maritime est la solution la plus économique pour envoyer vos petits colis vers l'Afrique. Parfait pour les particuliers et les petites entreprises, ce service vous permet d'expédier jusqu'à 10 kg de marchandises à un prix imbattable.\n\nLe délai de livraison est de 14 à 21 jours, ce qui en fait la solution idéale pour les envois non urgents. Le suivi est disponible en temps réel et vous recevez des notifications à chaque étape du parcours.\n\nCe service est particulièrement adapté pour : vêtements, chaussures, documents, petits appareils électroniques, livres, cosmétiques et cadeaux.",
    image: "/images/ocean-freight.jpg",
    gallery: GALLERY,
    priceXAF: 150_000,
    likes: 85,
    features: [
      "Poids max : 10 kg",
      "Dimensions max : 60x40x40 cm",
      "Délai : 14 à 21 jours",
      "Suivi en ligne 24h/24",
      "Notification WhatsApp",
      "Assurance de base incluse",
      "Livraison porte-à-porte",
    ],
    reviews: [
      { id: "r12", author: "Marie-Claire Koffi", avatar: "MK", rating: 5, comment: "Excellente solution pour envoyer des vêtements à ma famille à Abidjan. Prix très abordable.", date: "25 juin 2025" },
      { id: "r13", author: "Pierre Eben", avatar: "PE", rating: 5, comment: "J'utilise ce service tous les mois pour envoyer des colis à ma famille. Jamais un problème.", date: "10 juin 2025" },
      { id: "r14", author: "Grace Okonkwo", avatar: "GO", rating: 4, comment: "Bon rapport qualité-prix. Le délai est un peu long mais pour le prix c'est très correct.", date: "20 mai 2025" },
      { id: "r15", author: "Thomas Bah", avatar: "TB", rating: 5, comment: "Service fiable et économique. Colis arrivé en parfait état à Yaoundé.", date: "5 mai 2025" },
    ],
  },
  {
    id: "5",
    slug: "transport-terrestre-palette",
    name: "Transport Terrestre (palette)",
    shortDescription:
      "Transport routier de palette standard (120x80x100 cm). Livraison porte-à-porte en Afrique de l'Ouest.",
    fullDescription:
      "Notre service de transport terrestre vous permet d'expédier des palettes standardisées en toute sécurité vers l'Afrique de l'Ouest et centrale. Chaque palette est suivie par GPS et vous recevez des mises à jour en temps réel.\n\nCe service couvre le transport de palettes standard (120x80x100 cm) avec un poids maximum de 1 500 kg. La livraison porte-à-porte vous évite toute logistique complexe : nous venons chercher votre marchandise et la livrons directement à destination.\n\nIdéal pour les commerçants et les entreprises qui expédient régulièrement des marchandises variées : produits alimentaires, matériaux de construction, quincaillerie, textiles et biens de consommation.",
    image: "/images/land-transport.jpg",
    gallery: GALLERY,
    priceXAF: 420_000,
    likes: 31,
    features: [
      "1 palette standard (120x80x100 cm)",
      "Poids max : 1 500 kg",
      "Livraison porte-à-porte",
      "Suivi GPS en direct",
      "Assurance transport incluse",
      "Couverture : Afrique Ouest et Centrale",
      "Délai : 5 à 10 jours ouvrés",
    ],
    reviews: [
      { id: "r16", author: "David Nkongo", avatar: "DN", rating: 5, comment: "Service porte-à-porte impeccable. Palette livrée à Douala sans aucun dommage.", date: "18 juin 2025" },
      { id: "r17", author: "Aïcha Koné", avatar: "AK", rating: 4, comment: "Très bon service de transport terrestre. Le suivi GPS est un vrai plus pour rassurer les clients.", date: "3 juin 2025" },
    ],
  },
  {
    id: "6",
    slug: "service-dedouanement-complet",
    name: "Service Dédouanement Complet",
    shortDescription:
      "Accompagnement douanier complet pour vos marchandises. Classification, documents et conformité réglementaire.",
    fullDescription:
      "Notre service de dédouanement complet vous accompagne à chaque étape du processus douanier, de la préparation des documents à la libération de vos marchandises. Nos courtiers en douane expérimentés maîtrisent les réglementations de plus de 150 pays.\n\nNous gérons l'intégralité des formalités douanières : classification tarifaire, calcul des droits et taxes, préparation des documents (facture commerciale, liste de colisage, certificat d'origine, connaissement), et interface avec les autorités douanières.\n\nCe service vous garantit une conformité réglementaire totale et évite les retards coûteux liés aux blocages douaniers. Particulièrement recommandé pour les marchandises sensibles et les réglementations complexes.",
    image: "/images/tracking-map.jpg",
    gallery: GALLERY,
    priceXAF: 250_000,
    likes: 54,
    features: [
      "Classification tarifaire complète",
      "Préparation des documents douaniers",
      "Interface avec les autorités",
      "Calcul des droits et taxes",
      "Suivi en temps réel du dossier",
      "Couverture : 150+ pays",
      "Assistance téléphonique prioritaire",
    ],
    reviews: [
      { id: "r18", author: "Hélène Zadi", avatar: "HZ", rating: 5, comment: "Service de dédouanement exceptionnel. Notre conteneur a été libéré en 48h grâce à leur expertise.", date: "30 juin 2025" },
      { id: "r19", author: "Paul Amani", avatar: "PA", rating: 5, comment: "Je confie tout mon dédouanement à JC Import Express. Leur connaissance des réglementations africaines est inégalée.", date: "15 juin 2025" },
      { id: "r20", author: "Rachel Tano", avatar: "RT", rating: 4, comment: "Très professionnel. Ils nous ont évité des pénalités importantes grâce à leur expertise en classification tarifaire.", date: "1 juin 2025" },
      { id: "r21", author: "Serge Kacou", avatar: "SK", rating: 5, comment: "Service indispensable pour qui veut éviter les mauvaises surprises aux douanes. Excellent rapport qualité-prix.", date: "15 mai 2025" },
    ],
  },
];

export const FOOTER_GROUPS = [
  {
    title: "Navigation",
    links: [
      ["Accueil", "#hero"],
      ["Services", "#services"],
      ["Suivi", "#tracking"],
      ["Contact", "#contact"],
    ],
  },
  {
    title: "Nos services",
    links: [
      ["Fret aérien", "#services"],
      ["Fret maritime", "#services"],
      ["Transport terrestre", "#services"],
      ["Messagerie express", "#services"],
      ["Entreposage", "#services"],
    ],
  },
  {
    title: "Contact",
    links: [
      ["Wyoming, États-Unis", "#"],
      ["+1 (412) 227-3484", "tel:+14122273484"],
      ["support@nexttracelogistics.com", "mailto:support@nexttracelogistics.com"],
      ["Lun–Ven : 8h–20h HNE", "#"],
    ],
  },
] as const;
