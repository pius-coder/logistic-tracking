export interface CountrySEO {
  slug: string;
  name: string;
  iso2: string;
  continent: string;
}

const AFRICAN_COUNTRIES: CountrySEO[] = [
  { slug: "afrique-du-sud", name: "Afrique du Sud", iso2: "ZA", continent: "Africa" },
  { slug: "algerie", name: "Algérie", iso2: "DZ", continent: "Africa" },
  { slug: "angola", name: "Angola", iso2: "AO", continent: "Africa" },
  { slug: "benin", name: "Bénin", iso2: "BJ", continent: "Africa" },
  { slug: "botswana", name: "Botswana", iso2: "BW", continent: "Africa" },
  { slug: "burkina-faso", name: "Burkina Faso", iso2: "BF", continent: "Africa" },
  { slug: "burundi", name: "Burundi", iso2: "BI", continent: "Africa" },
  { slug: "cameroun", name: "Cameroun", iso2: "CM", continent: "Africa" },
  { slug: "cap-vert", name: "Cap-Vert", iso2: "CV", continent: "Africa" },
  { slug: "centrafrique", name: "République centrafricaine", iso2: "CF", continent: "Africa" },
  { slug: "comores", name: "Comores", iso2: "KM", continent: "Africa" },
  { slug: "congo", name: "Congo", iso2: "CG", continent: "Africa" },
  { slug: "cote-d-ivoire", name: "Côte d'Ivoire", iso2: "CI", continent: "Africa" },
  { slug: "djibouti", name: "Djibouti", iso2: "DJ", continent: "Africa" },
  { slug: "egypte", name: "Égypte", iso2: "EG", continent: "Africa" },
  { slug: "erythree", name: "Érythrée", iso2: "ER", continent: "Africa" },
  { slug: "ethiopie", name: "Éthiopie", iso2: "ET", continent: "Africa" },
  { slug: "gabon", name: "Gabon", iso2: "GA", continent: "Africa" },
  { slug: "gambie", name: "Gambie", iso2: "GM", continent: "Africa" },
  { slug: "ghana", name: "Ghana", iso2: "GH", continent: "Africa" },
  { slug: "guinee", name: "Guinée", iso2: "GN", continent: "Africa" },
  { slug: "guinee-bissau", name: "Guinée-Bissau", iso2: "GW", continent: "Africa" },
  { slug: "guinee-equatoriale", name: "Guinée équatoriale", iso2: "GQ", continent: "Africa" },
  { slug: "kenya", name: "Kenya", iso2: "KE", continent: "Africa" },
  { slug: "lesotho", name: "Lesotho", iso2: "LS", continent: "Africa" },
  { slug: "liberia", name: "Libéria", iso2: "LR", continent: "Africa" },
  { slug: "libye", name: "Libye", iso2: "LY", continent: "Africa" },
  { slug: "madagascar", name: "Madagascar", iso2: "MG", continent: "Africa" },
  { slug: "malawi", name: "Malawi", iso2: "MW", continent: "Africa" },
  { slug: "mali", name: "Mali", iso2: "ML", continent: "Africa" },
  { slug: "maroc", name: "Maroc", iso2: "MA", continent: "Africa" },
  { slug: "maurice", name: "Maurice", iso2: "MU", continent: "Africa" },
  { slug: "mauritanie", name: "Mauritanie", iso2: "MR", continent: "Africa" },
  { slug: "mozambique", name: "Mozambique", iso2: "MZ", continent: "Africa" },
  { slug: "namibie", name: "Namibie", iso2: "NA", continent: "Africa" },
  { slug: "niger", name: "Niger", iso2: "NE", continent: "Africa" },
  { slug: "nigeria", name: "Nigéria", iso2: "NG", continent: "Africa" },
  { slug: "ouganda", name: "Ouganda", iso2: "UG", continent: "Africa" },
  { slug: "rwanda", name: "Rwanda", iso2: "RW", continent: "Africa" },
  { slug: "sao-tome-et-principe", name: "Sao Tomé-et-Principe", iso2: "ST", continent: "Africa" },
  { slug: "senegal", name: "Sénégal", iso2: "SN", continent: "Africa" },
  { slug: "seychelles", name: "Seychelles", iso2: "SC", continent: "Africa" },
  { slug: "sierra-leone", name: "Sierra Leone", iso2: "SL", continent: "Africa" },
  { slug: "somalie", name: "Somalie", iso2: "SO", continent: "Africa" },
  { slug: "soudan", name: "Soudan", iso2: "SD", continent: "Africa" },
  { slug: "soudan-du-sud", name: "Soudan du Sud", iso2: "SS", continent: "Africa" },
  { slug: "swaziland", name: "Eswatini", iso2: "SZ", continent: "Africa" },
  { slug: "tanzanie", name: "Tanzanie", iso2: "TZ", continent: "Africa" },
  { slug: "tchad", name: "Tchad", iso2: "TD", continent: "Africa" },
  { slug: "togo", name: "Togo", iso2: "TG", continent: "Africa" },
  { slug: "tunisie", name: "Tunisie", iso2: "TN", continent: "Africa" },
  { slug: "zambie", name: "Zambie", iso2: "ZM", continent: "Africa" },
  { slug: "zimbabwe", name: "Zimbabwe", iso2: "ZW", continent: "Africa" },
];

const HUBS: CountrySEO[] = [
  { slug: "chine", name: "Chine", iso2: "CN", continent: "Asia" },
  { slug: "france", name: "France", iso2: "FR", continent: "Europe" },
  { slug: "allemagne", name: "Allemagne", iso2: "DE", continent: "Europe" },
  { slug: "dubai", name: "Dubaï", iso2: "AE", continent: "Asia" },
  { slug: "italie", name: "Italie", iso2: "IT", continent: "Europe" },
  { slug: "usa", name: "États-Unis", iso2: "US", continent: "America" },
];

function slugToName(slug: string, list: CountrySEO[]): string | undefined {
  return list.find((c) => c.slug === slug)?.name;
}

function findCountry(slug: string): CountrySEO | undefined {
  return AFRICAN_COUNTRIES.find((c) => c.slug === slug);
}

function findHub(slug: string): CountrySEO | undefined {
  return HUBS.find((h) => h.slug === slug);
}

export {
  AFRICAN_COUNTRIES,
  HUBS,
  slugToName,
  findCountry,
  findHub,
};
export type { CountrySEO as CountrySEOType };
