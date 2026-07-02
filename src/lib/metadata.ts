import type { Metadata } from "next";

const BASE_URL = process.env.AURA_APP_URL || "https://jc-import-express.online";
const DEFAULT_OG_IMAGE = "/opengraph-image.png";

/**
 * Mots-clés "seed" que l'on cherche à positionner. Chaque page peut
 * étendre via l'option `keywords`.
 */
const CORE_KEYWORDS = [
  "import export Afrique",
  "devis import 24h",
  "fret maritime",
  "fret aérien",
  "transit international Afrique",
  "logistique Afrique",
  "Chine Afrique import",
  "Dubaï Afrique import",
  "import Côte d'Ivoire",
  "import Sénégal",
  "import Cameroun",
  "suivi WhatsApp expédition",
  "JC Import Express",
];

export interface BuildMetadataOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: "website" | "article";
  locale?: string;
}

/**
 * Builder métadonnées cohérent : title, description, canonical, Open Graph,
 * Twitter Card, robots, keywords. Utilisé par toutes les pages publiques.
 */
export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const {
    title,
    description,
    path = "",
    image,
    keywords = [],
    noIndex = false,
    type = "website",
    locale = "fr_FR",
  } = options;

  const url = `${BASE_URL}${path}`;
  const imageUrl = image || `${BASE_URL}${DEFAULT_OG_IMAGE}`;

  return {
    title,
    description,
    keywords: [...new Set([...keywords, ...CORE_KEYWORDS])],
    authors: [{ name: "JC Import Express" }],
    creator: "JC Import Express",
    publisher: "JC Import Express",
    alternates: {
      canonical: url,
      languages: { "fr-FR": url },
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        },
    openGraph: {
      title,
      description,
      url,
      siteName: "JC Import Express",
      locale,
      type,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@jcimportexpress",
      creator: "@jcimportexpress",
      images: [imageUrl],
    },
    category: "Business",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}

export { BASE_URL };
