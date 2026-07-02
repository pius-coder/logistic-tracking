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
