import { BASE_URL } from "@/lib/metadata";

interface OrganizationJsonLdProps {
  contactPhone?: string;
}

/**
 * JSON-LD Organization pour la home et le site entier. Sert à Google
 * Knowledge Graph, aux moteurs IA (Perplexity, ChatGPT), et au rich snippet
 * nom/logo dans les SERPs.
 */
export function OrganizationJsonLd({ contactPhone }: OrganizationJsonLdProps = {}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}#organization`,
    name: "JC Import Express",
    url: BASE_URL,
    logo: `${BASE_URL}/icon.svg`,
    description:
      "Plateforme d'import-export vers l'Afrique : catalogue produits, devis 24h, suivi WhatsApp en temps réel.",
    areaServed: { "@type": "Place", name: "Africa" },
    ...(contactPhone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            telephone: contactPhone,
            contactType: "customer service",
            availableLanguage: ["French"],
          },
        }
      : {}),
    sameAs: [] as string[],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}#website`,
    url: BASE_URL,
    name: "JC Import Express",
    publisher: { "@id": `${BASE_URL}#organization` },
    inLanguage: "fr-FR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/catalogue?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  image?: string;
  slug: string;
  priceUsd: number;
  originCountry?: string | null;
  category?: string | null;
}

export function ProductJsonLd({
  name,
  description,
  image,
  slug,
  priceUsd,
  originCountry,
  category,
}: ProductJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image ? (image.startsWith("http") ? image : `${BASE_URL}${image}`) : undefined,
    url: `${BASE_URL}/produits/${slug}`,
    category: category ?? undefined,
    brand: { "@type": "Brand", name: "JC Import Express" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: priceUsd,
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}/produits/${slug}`,
      seller: { "@id": `${BASE_URL}#organization` },
      ...(originCountry
        ? {
            itemCondition: "https://schema.org/NewCondition",
            areaServed: { "@type": "Place", name: "Africa" },
          }
        : {}),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface ArticleJsonLdProps {
  title: string;
  description: string;
  slug: string;
  image?: string;
  author?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  image,
  author = "JC Import Express",
  publishedAt,
  updatedAt,
}: ArticleJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image ? (image.startsWith("http") ? image : `${BASE_URL}${image}`) : undefined,
    url: `${BASE_URL}/blog/${slug}`,
    author: { "@type": "Person", name: author },
    publisher: { "@id": `${BASE_URL}#organization` },
    datePublished: publishedAt ?? undefined,
    dateModified: updatedAt ?? publishedAt ?? undefined,
    inLanguage: "fr-FR",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
