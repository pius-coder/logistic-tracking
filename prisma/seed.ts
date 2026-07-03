import "dotenv/config";
import { PrismaClient, BlogPostType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("[seed] DATABASE_URL is required");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type Continent =
  "Africa" | "Asia" | "Europe" | "America" | "Oceania" | "Antarctica";

type CountrySeed = {
  name: string;
  slug: string;
  iso2: string;
  dialingCode: string | null;
  currencyCode: string | null;
  currencyName: string | null;
  currencySymbol: string | null;
  usdExchangeRate: number | null;
  continent: Continent | string | null;
  isFeatured?: boolean;
  isHub?: boolean;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const COUNTRIES_DATA: Omit<
  CountrySeed,
  "slug" | "isFeatured" | "isHub" | "usdExchangeRate"
>[] = [
  {
    name: "Afghanistan",
    iso2: "AF",
    dialingCode: "+93",
    currencyCode: "AFN",
    currencyName: "Afghan afghani",
    currencySymbol: "؋",
    continent: "Asia",
  },
  {
    name: "Afrique du Sud",
    iso2: "ZA",
    dialingCode: "+27",
    currencyCode: "ZAR",
    currencyName: "South African rand",
    currencySymbol: "R",
    continent: "Africa",
  },
  {
    name: "Albanie",
    iso2: "AL",
    dialingCode: "+355",
    currencyCode: "ALL",
    currencyName: "Albanian lek",
    currencySymbol: "L",
    continent: "Europe",
  },
  {
    name: "Algérie",
    iso2: "DZ",
    dialingCode: "+213",
    currencyCode: "DZD",
    currencyName: "Algerian dinar",
    currencySymbol: "د.ج",
    continent: "Africa",
  },
  {
    name: "Allemagne",
    iso2: "DE",
    dialingCode: "+49",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Andorre",
    iso2: "AD",
    dialingCode: "+376",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Angola",
    iso2: "AO",
    dialingCode: "+244",
    currencyCode: "AOA",
    currencyName: "Angolan kwanza",
    currencySymbol: "Kz",
    continent: "Africa",
  },
  {
    name: "Antigua-et-Barbuda",
    iso2: "AG",
    dialingCode: "+1-268",
    currencyCode: "XCD",
    currencyName: "Eastern Caribbean dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Arabie saoudite",
    iso2: "SA",
    dialingCode: "+966",
    currencyCode: "SAR",
    currencyName: "Saudi riyal",
    currencySymbol: "﷼",
    continent: "Asia",
  },
  {
    name: "Argentine",
    iso2: "AR",
    dialingCode: "+54",
    currencyCode: "ARS",
    currencyName: "Argentine peso",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Arménie",
    iso2: "AM",
    dialingCode: "+374",
    currencyCode: "AMD",
    currencyName: "Armenian dram",
    currencySymbol: "֏",
    continent: "Asia",
  },
  {
    name: "Australie",
    iso2: "AU",
    dialingCode: "+61",
    currencyCode: "AUD",
    currencyName: "Australian dollar",
    currencySymbol: "$",
    continent: "Oceania",
  },
  {
    name: "Autriche",
    iso2: "AT",
    dialingCode: "+43",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Azerbaïdjan",
    iso2: "AZ",
    dialingCode: "+994",
    currencyCode: "AZN",
    currencyName: "Azerbaijani manat",
    currencySymbol: "₼",
    continent: "Asia",
  },
  {
    name: "Bahamas",
    iso2: "BS",
    dialingCode: "+1-242",
    currencyCode: "BSD",
    currencyName: "Bahamian dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Bahreïn",
    iso2: "BH",
    dialingCode: "+973",
    currencyCode: "BHD",
    currencyName: "Bahraini dinar",
    currencySymbol: ".د.ب",
    continent: "Asia",
  },
  {
    name: "Bangladesh",
    iso2: "BD",
    dialingCode: "+880",
    currencyCode: "BDT",
    currencyName: "Bangladeshi taka",
    currencySymbol: "৳",
    continent: "Asia",
  },
  {
    name: "Barbade",
    iso2: "BB",
    dialingCode: "+1-246",
    currencyCode: "BBD",
    currencyName: "Barbadian dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Belgique",
    iso2: "BE",
    dialingCode: "+32",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Belize",
    iso2: "BZ",
    dialingCode: "+501",
    currencyCode: "BZD",
    currencyName: "Belize dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Bénin",
    iso2: "BJ",
    dialingCode: "+229",
    currencyCode: "XOF",
    currencyName: "West African CFA franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Bhoutan",
    iso2: "BT",
    dialingCode: "+975",
    currencyCode: "BTN",
    currencyName: "Bhutanese ngultrum",
    currencySymbol: "Nu.",
    continent: "Asia",
  },
  {
    name: "Biélorussie",
    iso2: "BY",
    dialingCode: "+375",
    currencyCode: "BYN",
    currencyName: "Belarusian ruble",
    currencySymbol: "Br",
    continent: "Europe",
  },
  {
    name: "Birmanie (Myanmar)",
    iso2: "MM",
    dialingCode: "+95",
    currencyCode: "MMK",
    currencyName: "Burmese kyat",
    currencySymbol: "Ks",
    continent: "Asia",
  },
  {
    name: "Bolivie",
    iso2: "BO",
    dialingCode: "+591",
    currencyCode: "BOB",
    currencyName: "Bolivian boliviano",
    currencySymbol: "Bs.",
    continent: "America",
  },
  {
    name: "Bosnie-Herzégovine",
    iso2: "BA",
    dialingCode: "+387",
    currencyCode: "BAM",
    currencyName: "Bosnia-Herzegovina convertible mark",
    currencySymbol: "KM",
    continent: "Europe",
  },
  {
    name: "Botswana",
    iso2: "BW",
    dialingCode: "+267",
    currencyCode: "BWP",
    currencyName: "Botswana pula",
    currencySymbol: "P",
    continent: "Africa",
  },
  {
    name: "Brésil",
    iso2: "BR",
    dialingCode: "+55",
    currencyCode: "BRL",
    currencyName: "Brazilian real",
    currencySymbol: "R$",
    continent: "America",
  },
  {
    name: "Brunei",
    iso2: "BN",
    dialingCode: "+673",
    currencyCode: "BND",
    currencyName: "Brunei dollar",
    currencySymbol: "$",
    continent: "Asia",
  },
  {
    name: "Bulgarie",
    iso2: "BG",
    dialingCode: "+359",
    currencyCode: "BGN",
    currencyName: "Bulgarian lev",
    currencySymbol: "лв",
    continent: "Europe",
  },
  {
    name: "Burkina Faso",
    iso2: "BF",
    dialingCode: "+226",
    currencyCode: "XOF",
    currencyName: "West African CFA franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Burundi",
    iso2: "BI",
    dialingCode: "+257",
    currencyCode: "BIF",
    currencyName: "Burundian franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Cambodge",
    iso2: "KH",
    dialingCode: "+855",
    currencyCode: "KHR",
    currencyName: "Cambodian riel",
    currencySymbol: "៛",
    continent: "Asia",
  },
  {
    name: "Cameroun",
    iso2: "CM",
    dialingCode: "+237",
    currencyCode: "XAF",
    currencyName: "Central African CFA franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Canada",
    iso2: "CA",
    dialingCode: "+1",
    currencyCode: "CAD",
    currencyName: "Canadian dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Cap-Vert",
    iso2: "CV",
    dialingCode: "+238",
    currencyCode: "CVE",
    currencyName: "Cape Verdean escudo",
    currencySymbol: "$",
    continent: "Africa",
  },
  {
    name: "Chili",
    iso2: "CL",
    dialingCode: "+56",
    currencyCode: "CLP",
    currencyName: "Chilean peso",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Chine",
    iso2: "CN",
    dialingCode: "+86",
    currencyCode: "CNY",
    currencyName: "Chinese yuan",
    currencySymbol: "¥",
    continent: "Asia",
  },
  {
    name: "Chypre",
    iso2: "CY",
    dialingCode: "+357",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Colombie",
    iso2: "CO",
    dialingCode: "+57",
    currencyCode: "COP",
    currencyName: "Colombian peso",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Comores",
    iso2: "KM",
    dialingCode: "+269",
    currencyCode: "KMF",
    currencyName: "Comorian franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Congo (RDC)",
    iso2: "CD",
    dialingCode: "+243",
    currencyCode: "CDF",
    currencyName: "Congolese franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Congo (République)",
    iso2: "CG",
    dialingCode: "+242",
    currencyCode: "XAF",
    currencyName: "Central African CFA franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Corée du Nord",
    iso2: "KP",
    dialingCode: "+850",
    currencyCode: "KPW",
    currencyName: "North Korean won",
    currencySymbol: "₩",
    continent: "Asia",
  },
  {
    name: "Corée du Sud",
    iso2: "KR",
    dialingCode: "+82",
    currencyCode: "KRW",
    currencyName: "South Korean won",
    currencySymbol: "₩",
    continent: "Asia",
  },
  {
    name: "Costa Rica",
    iso2: "CR",
    dialingCode: "+506",
    currencyCode: "CRC",
    currencyName: "Costa Rican colón",
    currencySymbol: "₡",
    continent: "America",
  },
  {
    name: "Côte d'Ivoire",
    iso2: "CI",
    dialingCode: "+225",
    currencyCode: "XOF",
    currencyName: "West African CFA franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Croatie",
    iso2: "HR",
    dialingCode: "+385",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Cuba",
    iso2: "CU",
    dialingCode: "+53",
    currencyCode: "CUP",
    currencyName: "Cuban peso",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Danemark",
    iso2: "DK",
    dialingCode: "+45",
    currencyCode: "DKK",
    currencyName: "Danish krone",
    currencySymbol: "kr",
    continent: "Europe",
  },
  {
    name: "Djibouti",
    iso2: "DJ",
    dialingCode: "+253",
    currencyCode: "DJF",
    currencyName: "Djiboutian franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Égypte",
    iso2: "EG",
    dialingCode: "+20",
    currencyCode: "EGP",
    currencyName: "Egyptian pound",
    currencySymbol: "£",
    continent: "Africa",
  },
  {
    name: "Émirats arabes unis",
    iso2: "AE",
    dialingCode: "+971",
    currencyCode: "AED",
    currencyName: "UAE dirham",
    currencySymbol: "د.إ",
    continent: "Asia",
  },
  {
    name: "Équateur",
    iso2: "EC",
    dialingCode: "+593",
    currencyCode: "USD",
    currencyName: "United States dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Érythrée",
    iso2: "ER",
    dialingCode: "+291",
    currencyCode: "ERN",
    currencyName: "Eritrean nakfa",
    currencySymbol: "Nfk",
    continent: "Africa",
  },
  {
    name: "Espagne",
    iso2: "ES",
    dialingCode: "+34",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Estonie",
    iso2: "EE",
    dialingCode: "+372",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Eswatini",
    iso2: "SZ",
    dialingCode: "+268",
    currencyCode: "SZL",
    currencyName: "Swazi lilangeni",
    currencySymbol: "L",
    continent: "Africa",
  },
  {
    name: "États-Unis",
    iso2: "US",
    dialingCode: "+1",
    currencyCode: "USD",
    currencyName: "United States dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Éthiopie",
    iso2: "ET",
    dialingCode: "+251",
    currencyCode: "ETB",
    currencyName: "Ethiopian birr",
    currencySymbol: "Br",
    continent: "Africa",
  },
  {
    name: "Fidji",
    iso2: "FJ",
    dialingCode: "+679",
    currencyCode: "FJD",
    currencyName: "Fijian dollar",
    currencySymbol: "$",
    continent: "Oceania",
  },
  {
    name: "Finlande",
    iso2: "FI",
    dialingCode: "+358",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "France",
    iso2: "FR",
    dialingCode: "+33",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Gabon",
    iso2: "GA",
    dialingCode: "+241",
    currencyCode: "XAF",
    currencyName: "Central African CFA franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Gambie",
    iso2: "GM",
    dialingCode: "+220",
    currencyCode: "GMD",
    currencyName: "Gambian dalasi",
    currencySymbol: "D",
    continent: "Africa",
  },
  {
    name: "Géorgie",
    iso2: "GE",
    dialingCode: "+995",
    currencyCode: "GEL",
    currencyName: "Georgian lari",
    currencySymbol: "₾",
    continent: "Asia",
  },
  {
    name: "Ghana",
    iso2: "GH",
    dialingCode: "+233",
    currencyCode: "GHS",
    currencyName: "Ghanaian cedi",
    currencySymbol: "₵",
    continent: "Africa",
  },
  {
    name: "Grèce",
    iso2: "GR",
    dialingCode: "+30",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Grenade",
    iso2: "GD",
    dialingCode: "+1-473",
    currencyCode: "XCD",
    currencyName: "Eastern Caribbean dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Guatemala",
    iso2: "GT",
    dialingCode: "+502",
    currencyCode: "GTQ",
    currencyName: "Guatemalan quetzal",
    currencySymbol: "Q",
    continent: "America",
  },
  {
    name: "Guinée",
    iso2: "GN",
    dialingCode: "+224",
    currencyCode: "GNF",
    currencyName: "Guinean franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Guinée équatoriale",
    iso2: "GQ",
    dialingCode: "+240",
    currencyCode: "XAF",
    currencyName: "Central African CFA franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Guinée-Bissau",
    iso2: "GW",
    dialingCode: "+245",
    currencyCode: "XOF",
    currencyName: "West African CFA franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Guyana",
    iso2: "GY",
    dialingCode: "+592",
    currencyCode: "GYD",
    currencyName: "Guyanese dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Haïti",
    iso2: "HT",
    dialingCode: "+509",
    currencyCode: "HTG",
    currencyName: "Haitian gourde",
    currencySymbol: "G",
    continent: "America",
  },
  {
    name: "Honduras",
    iso2: "HN",
    dialingCode: "+504",
    currencyCode: "HNL",
    currencyName: "Honduran lempira",
    currencySymbol: "L",
    continent: "America",
  },
  {
    name: "Hongrie",
    iso2: "HU",
    dialingCode: "+36",
    currencyCode: "HUF",
    currencyName: "Hungarian forint",
    currencySymbol: "Ft",
    continent: "Europe",
  },
  {
    name: "Inde",
    iso2: "IN",
    dialingCode: "+91",
    currencyCode: "INR",
    currencyName: "Indian rupee",
    currencySymbol: "₹",
    continent: "Asia",
  },
  {
    name: "Indonésie",
    iso2: "ID",
    dialingCode: "+62",
    currencyCode: "IDR",
    currencyName: "Indonesian rupiah",
    currencySymbol: "Rp",
    continent: "Asia",
  },
  {
    name: "Irak",
    iso2: "IQ",
    dialingCode: "+964",
    currencyCode: "IQD",
    currencyName: "Iraqi dinar",
    currencySymbol: "ع.د",
    continent: "Asia",
  },
  {
    name: "Iran",
    iso2: "IR",
    dialingCode: "+98",
    currencyCode: "IRR",
    currencyName: "Iranian rial",
    currencySymbol: "﷼",
    continent: "Asia",
  },
  {
    name: "Irlande",
    iso2: "IE",
    dialingCode: "+353",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Islande",
    iso2: "IS",
    dialingCode: "+354",
    currencyCode: "ISK",
    currencyName: "Icelandic króna",
    currencySymbol: "kr",
    continent: "Europe",
  },
  {
    name: "Israël",
    iso2: "IL",
    dialingCode: "+972",
    currencyCode: "ILS",
    currencyName: "Israeli new shekel",
    currencySymbol: "₪",
    continent: "Asia",
  },
  {
    name: "Italie",
    iso2: "IT",
    dialingCode: "+39",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Jamaïque",
    iso2: "JM",
    dialingCode: "+1-876",
    currencyCode: "JMD",
    currencyName: "Jamaican dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Japon",
    iso2: "JP",
    dialingCode: "+81",
    currencyCode: "JPY",
    currencyName: "Japanese yen",
    currencySymbol: "¥",
    continent: "Asia",
  },
  {
    name: "Jordanie",
    iso2: "JO",
    dialingCode: "+962",
    currencyCode: "JOD",
    currencyName: "Jordanian dinar",
    currencySymbol: "د.ا",
    continent: "Asia",
  },
  {
    name: "Kazakhstan",
    iso2: "KZ",
    dialingCode: "+7",
    currencyCode: "KZT",
    currencyName: "Kazakhstani tenge",
    currencySymbol: "₸",
    continent: "Asia",
  },
  {
    name: "Kenya",
    iso2: "KE",
    dialingCode: "+254",
    currencyCode: "KES",
    currencyName: "Kenyan shilling",
    currencySymbol: "Sh",
    continent: "Africa",
  },
  {
    name: "Kirghizistan",
    iso2: "KG",
    dialingCode: "+996",
    currencyCode: "KGS",
    currencyName: "Kyrgyzstani som",
    currencySymbol: "с",
    continent: "Asia",
  },
  {
    name: "Kiribati",
    iso2: "KI",
    dialingCode: "+686",
    currencyCode: "AUD",
    currencyName: "Australian dollar",
    currencySymbol: "$",
    continent: "Oceania",
  },
  {
    name: "Koweït",
    iso2: "KW",
    dialingCode: "+965",
    currencyCode: "KWD",
    currencyName: "Kuwaiti dinar",
    currencySymbol: "د.ك",
    continent: "Asia",
  },
  {
    name: "Laos",
    iso2: "LA",
    dialingCode: "+856",
    currencyCode: "LAK",
    currencyName: "Lao kip",
    currencySymbol: "₭",
    continent: "Asia",
  },
  {
    name: "Lesotho",
    iso2: "LS",
    dialingCode: "+266",
    currencyCode: "LSL",
    currencyName: "Lesotho loti",
    currencySymbol: "L",
    continent: "Africa",
  },
  {
    name: "Lettonie",
    iso2: "LV",
    dialingCode: "+371",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Liban",
    iso2: "LB",
    dialingCode: "+961",
    currencyCode: "LBP",
    currencyName: "Lebanese pound",
    currencySymbol: "ل.ل",
    continent: "Asia",
  },
  {
    name: "Libéria",
    iso2: "LR",
    dialingCode: "+231",
    currencyCode: "LRD",
    currencyName: "Liberian dollar",
    currencySymbol: "$",
    continent: "Africa",
  },
  {
    name: "Libye",
    iso2: "LY",
    dialingCode: "+218",
    currencyCode: "LYD",
    currencyName: "Libyan dinar",
    currencySymbol: "ل.د",
    continent: "Africa",
  },
  {
    name: "Liechtenstein",
    iso2: "LI",
    dialingCode: "+423",
    currencyCode: "CHF",
    currencyName: "Swiss franc",
    currencySymbol: "Fr",
    continent: "Europe",
  },
  {
    name: "Lituanie",
    iso2: "LT",
    dialingCode: "+370",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Luxembourg",
    iso2: "LU",
    dialingCode: "+352",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Macédoine du Nord",
    iso2: "MK",
    dialingCode: "+389",
    currencyCode: "MKD",
    currencyName: "Macedonian denar",
    currencySymbol: "ден",
    continent: "Europe",
  },
  {
    name: "Madagascar",
    iso2: "MG",
    dialingCode: "+261",
    currencyCode: "MGA",
    currencyName: "Malagasy ariary",
    currencySymbol: "Ar",
    continent: "Africa",
  },
  {
    name: "Malaisie",
    iso2: "MY",
    dialingCode: "+60",
    currencyCode: "MYR",
    currencyName: "Malaysian ringgit",
    currencySymbol: "RM",
    continent: "Asia",
  },
  {
    name: "Malawi",
    iso2: "MW",
    dialingCode: "+265",
    currencyCode: "MWK",
    currencyName: "Malawian kwacha",
    currencySymbol: "MK",
    continent: "Africa",
  },
  {
    name: "Maldives",
    iso2: "MV",
    dialingCode: "+960",
    currencyCode: "MVR",
    currencyName: "Maldivian rufiyaa",
    currencySymbol: ".ރ",
    continent: "Asia",
  },
  {
    name: "Mali",
    iso2: "ML",
    dialingCode: "+223",
    currencyCode: "XOF",
    currencyName: "West African CFA franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Malte",
    iso2: "MT",
    dialingCode: "+356",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Maroc",
    iso2: "MA",
    dialingCode: "+212",
    currencyCode: "MAD",
    currencyName: "Moroccan dirham",
    currencySymbol: "د.م.",
    continent: "Africa",
  },
  {
    name: "Marshall (Îles)",
    iso2: "MH",
    dialingCode: "+692",
    currencyCode: "USD",
    currencyName: "United States dollar",
    currencySymbol: "$",
    continent: "Oceania",
  },
  {
    name: "Maurice",
    iso2: "MU",
    dialingCode: "+230",
    currencyCode: "MUR",
    currencyName: "Mauritian rupee",
    currencySymbol: "₨",
    continent: "Africa",
  },
  {
    name: "Mauritanie",
    iso2: "MR",
    dialingCode: "+222",
    currencyCode: "MRU",
    currencyName: "Mauritanian ouguiya",
    currencySymbol: "UM",
    continent: "Africa",
  },
  {
    name: "Mexique",
    iso2: "MX",
    dialingCode: "+52",
    currencyCode: "MXN",
    currencyName: "Mexican peso",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Micronésie",
    iso2: "FM",
    dialingCode: "+691",
    currencyCode: "USD",
    currencyName: "United States dollar",
    currencySymbol: "$",
    continent: "Oceania",
  },
  {
    name: "Moldavie",
    iso2: "MD",
    dialingCode: "+373",
    currencyCode: "MDL",
    currencyName: "Moldovan leu",
    currencySymbol: "L",
    continent: "Europe",
  },
  {
    name: "Monaco",
    iso2: "MC",
    dialingCode: "+377",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Mongolie",
    iso2: "MN",
    dialingCode: "+976",
    currencyCode: "MNT",
    currencyName: "Mongolian tögrög",
    currencySymbol: "₮",
    continent: "Asia",
  },
  {
    name: "Monténégro",
    iso2: "ME",
    dialingCode: "+382",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Mozambique",
    iso2: "MZ",
    dialingCode: "+258",
    currencyCode: "MZN",
    currencyName: "Mozambican metical",
    currencySymbol: "MT",
    continent: "Africa",
  },
  {
    name: "Namibie",
    iso2: "NA",
    dialingCode: "+264",
    currencyCode: "NAD",
    currencyName: "Namibian dollar",
    currencySymbol: "$",
    continent: "Africa",
  },
  {
    name: "Nauru",
    iso2: "NR",
    dialingCode: "+674",
    currencyCode: "AUD",
    currencyName: "Australian dollar",
    currencySymbol: "$",
    continent: "Oceania",
  },
  {
    name: "Népal",
    iso2: "NP",
    dialingCode: "+977",
    currencyCode: "NPR",
    currencyName: "Nepalese rupee",
    currencySymbol: "₨",
    continent: "Asia",
  },
  {
    name: "Nicaragua",
    iso2: "NI",
    dialingCode: "+505",
    currencyCode: "NIO",
    currencyName: "Nicaraguan córdoba",
    currencySymbol: "C$",
    continent: "America",
  },
  {
    name: "Niger",
    iso2: "NE",
    dialingCode: "+227",
    currencyCode: "XOF",
    currencyName: "West African CFA franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Nigeria",
    iso2: "NG",
    dialingCode: "+234",
    currencyCode: "NGN",
    currencyName: "Nigerian naira",
    currencySymbol: "₦",
    continent: "Africa",
  },
  {
    name: "Norvège",
    iso2: "NO",
    dialingCode: "+47",
    currencyCode: "NOK",
    currencyName: "Norwegian krone",
    currencySymbol: "kr",
    continent: "Europe",
  },
  {
    name: "Nouvelle-Zélande",
    iso2: "NZ",
    dialingCode: "+64",
    currencyCode: "NZD",
    currencyName: "New Zealand dollar",
    currencySymbol: "$",
    continent: "Oceania",
  },
  {
    name: "Oman",
    iso2: "OM",
    dialingCode: "+968",
    currencyCode: "OMR",
    currencyName: "Omani rial",
    currencySymbol: "ر.ع.",
    continent: "Asia",
  },
  {
    name: "Ouganda",
    iso2: "UG",
    dialingCode: "+256",
    currencyCode: "UGX",
    currencyName: "Ugandan shilling",
    currencySymbol: "Sh",
    continent: "Africa",
  },
  {
    name: "Ouzbékistan",
    iso2: "UZ",
    dialingCode: "+998",
    currencyCode: "UZS",
    currencyName: "Uzbekistani som",
    currencySymbol: "с",
    continent: "Asia",
  },
  {
    name: "Pakistan",
    iso2: "PK",
    dialingCode: "+92",
    currencyCode: "PKR",
    currencyName: "Pakistani rupee",
    currencySymbol: "₨",
    continent: "Asia",
  },
  {
    name: "Palaos",
    iso2: "PW",
    dialingCode: "+680",
    currencyCode: "USD",
    currencyName: "United States dollar",
    currencySymbol: "$",
    continent: "Oceania",
  },
  {
    name: "Palestine",
    iso2: "PS",
    dialingCode: "+970",
    currencyCode: "ILS",
    currencyName: "Israeli new shekel",
    currencySymbol: "₪",
    continent: "Asia",
  },
  {
    name: "Panama",
    iso2: "PA",
    dialingCode: "+507",
    currencyCode: "PAB",
    currencyName: "Panamanian balboa",
    currencySymbol: "B/.",
    continent: "America",
  },
  {
    name: "Papouasie-Nouvelle-Guinée",
    iso2: "PG",
    dialingCode: "+675",
    currencyCode: "PGK",
    currencyName: "Papua New Guinean kina",
    currencySymbol: "K",
    continent: "Oceania",
  },
  {
    name: "Paraguay",
    iso2: "PY",
    dialingCode: "+595",
    currencyCode: "PYG",
    currencyName: "Paraguayan guaraní",
    currencySymbol: "₲",
    continent: "America",
  },
  {
    name: "Pays-Bas",
    iso2: "NL",
    dialingCode: "+31",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Pérou",
    iso2: "PE",
    dialingCode: "+51",
    currencyCode: "PEN",
    currencyName: "Peruvian sol",
    currencySymbol: "S/.",
    continent: "America",
  },
  {
    name: "Philippines",
    iso2: "PH",
    dialingCode: "+63",
    currencyCode: "PHP",
    currencyName: "Philippine peso",
    currencySymbol: "₱",
    continent: "Asia",
  },
  {
    name: "Pologne",
    iso2: "PL",
    dialingCode: "+48",
    currencyCode: "PLN",
    currencyName: "Polish złoty",
    currencySymbol: "zł",
    continent: "Europe",
  },
  {
    name: "Portugal",
    iso2: "PT",
    dialingCode: "+351",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Qatar",
    iso2: "QA",
    dialingCode: "+974",
    currencyCode: "QAR",
    currencyName: "Qatari riyal",
    currencySymbol: "ر.ق",
    continent: "Asia",
  },
  {
    name: "République centrafricaine",
    iso2: "CF",
    dialingCode: "+236",
    currencyCode: "XAF",
    currencyName: "Central African CFA franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "République dominicaine",
    iso2: "DO",
    dialingCode: "+1-809",
    currencyCode: "DOP",
    currencyName: "Dominican peso",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "République tchèque",
    iso2: "CZ",
    dialingCode: "+420",
    currencyCode: "CZK",
    currencyName: "Czech koruna",
    currencySymbol: "Kč",
    continent: "Europe",
  },
  {
    name: "Roumanie",
    iso2: "RO",
    dialingCode: "+40",
    currencyCode: "RON",
    currencyName: "Romanian leu",
    currencySymbol: "lei",
    continent: "Europe",
  },
  {
    name: "Royaume-Uni",
    iso2: "GB",
    dialingCode: "+44",
    currencyCode: "GBP",
    currencyName: "British pound",
    currencySymbol: "£",
    continent: "Europe",
  },
  {
    name: "Russie",
    iso2: "RU",
    dialingCode: "+7",
    currencyCode: "RUB",
    currencyName: "Russian ruble",
    currencySymbol: "₽",
    continent: "Europe",
  },
  {
    name: "Rwanda",
    iso2: "RW",
    dialingCode: "+250",
    currencyCode: "RWF",
    currencyName: "Rwandan franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Saint-Christophe-et-Niévès",
    iso2: "KN",
    dialingCode: "+1-869",
    currencyCode: "XCD",
    currencyName: "Eastern Caribbean dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Saint-Marin",
    iso2: "SM",
    dialingCode: "+378",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Saint-Vincent-et-les-Grenadines",
    iso2: "VC",
    dialingCode: "+1-784",
    currencyCode: "XCD",
    currencyName: "Eastern Caribbean dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Sainte-Lucie",
    iso2: "LC",
    dialingCode: "+1-758",
    currencyCode: "XCD",
    currencyName: "Eastern Caribbean dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Salomon (Îles)",
    iso2: "SB",
    dialingCode: "+677",
    currencyCode: "SBD",
    currencyName: "Solomon Islands dollar",
    currencySymbol: "$",
    continent: "Oceania",
  },
  {
    name: "Salvador",
    iso2: "SV",
    dialingCode: "+503",
    currencyCode: "USD",
    currencyName: "United States dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Samoa",
    iso2: "WS",
    dialingCode: "+685",
    currencyCode: "WST",
    currencyName: "Samoan tālā",
    currencySymbol: "T",
    continent: "Oceania",
  },
  {
    name: "Sao Tomé-et-Principe",
    iso2: "ST",
    dialingCode: "+239",
    currencyCode: "STN",
    currencyName: "São Tomé and Príncipe dobra",
    currencySymbol: "Db",
    continent: "Africa",
  },
  {
    name: "Sénégal",
    iso2: "SN",
    dialingCode: "+221",
    currencyCode: "XOF",
    currencyName: "West African CFA franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Serbie",
    iso2: "RS",
    dialingCode: "+381",
    currencyCode: "RSD",
    currencyName: "Serbian dinar",
    currencySymbol: "дин.",
    continent: "Europe",
  },
  {
    name: "Seychelles",
    iso2: "SC",
    dialingCode: "+248",
    currencyCode: "SCR",
    currencyName: "Seychellois rupee",
    currencySymbol: "₨",
    continent: "Africa",
  },
  {
    name: "Sierra Leone",
    iso2: "SL",
    dialingCode: "+232",
    currencyCode: "SLL",
    currencyName: "Sierra Leonean leone",
    currencySymbol: "Le",
    continent: "Africa",
  },
  {
    name: "Singapour",
    iso2: "SG",
    dialingCode: "+65",
    currencyCode: "SGD",
    currencyName: "Singapore dollar",
    currencySymbol: "$",
    continent: "Asia",
  },
  {
    name: "Slovaquie",
    iso2: "SK",
    dialingCode: "+421",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Slovénie",
    iso2: "SI",
    dialingCode: "+386",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Somalie",
    iso2: "SO",
    dialingCode: "+252",
    currencyCode: "SOS",
    currencyName: "Somali shilling",
    currencySymbol: "Sh",
    continent: "Africa",
  },
  {
    name: "Soudan",
    iso2: "SD",
    dialingCode: "+249",
    currencyCode: "SDG",
    currencyName: "Sudanese pound",
    currencySymbol: "ج.س.",
    continent: "Africa",
  },
  {
    name: "Soudan du Sud",
    iso2: "SS",
    dialingCode: "+211",
    currencyCode: "SSP",
    currencyName: "South Sudanese pound",
    currencySymbol: "£",
    continent: "Africa",
  },
  {
    name: "Sri Lanka",
    iso2: "LK",
    dialingCode: "+94",
    currencyCode: "LKR",
    currencyName: "Sri Lankan rupee",
    currencySymbol: "₨",
    continent: "Asia",
  },
  {
    name: "Suède",
    iso2: "SE",
    dialingCode: "+46",
    currencyCode: "SEK",
    currencyName: "Swedish krona",
    currencySymbol: "kr",
    continent: "Europe",
  },
  {
    name: "Suisse",
    iso2: "CH",
    dialingCode: "+41",
    currencyCode: "CHF",
    currencyName: "Swiss franc",
    currencySymbol: "Fr",
    continent: "Europe",
  },
  {
    name: "Suriname",
    iso2: "SR",
    dialingCode: "+597",
    currencyCode: "SRD",
    currencyName: "Surinamese dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Syrie",
    iso2: "SY",
    dialingCode: "+963",
    currencyCode: "SYP",
    currencyName: "Syrian pound",
    currencySymbol: "£",
    continent: "Asia",
  },
  {
    name: "Tadjikistan",
    iso2: "TJ",
    dialingCode: "+992",
    currencyCode: "TJS",
    currencyName: "Tajikistani somoni",
    currencySymbol: "ЅМ",
    continent: "Asia",
  },
  {
    name: "Tanzanie",
    iso2: "TZ",
    dialingCode: "+255",
    currencyCode: "TZS",
    currencyName: "Tanzanian shilling",
    currencySymbol: "Sh",
    continent: "Africa",
  },
  {
    name: "Tchad",
    iso2: "TD",
    dialingCode: "+235",
    currencyCode: "XAF",
    currencyName: "Central African CFA franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Thaïlande",
    iso2: "TH",
    dialingCode: "+66",
    currencyCode: "THB",
    currencyName: "Thai baht",
    currencySymbol: "฿",
    continent: "Asia",
  },
  {
    name: "Timor oriental",
    iso2: "TL",
    dialingCode: "+670",
    currencyCode: "USD",
    currencyName: "United States dollar",
    currencySymbol: "$",
    continent: "Asia",
  },
  {
    name: "Togo",
    iso2: "TG",
    dialingCode: "+228",
    currencyCode: "XOF",
    currencyName: "West African CFA franc",
    currencySymbol: "Fr",
    continent: "Africa",
  },
  {
    name: "Tonga",
    iso2: "TO",
    dialingCode: "+676",
    currencyCode: "TOP",
    currencyName: "Tongan paʻanga",
    currencySymbol: "T$",
    continent: "Oceania",
  },
  {
    name: "Trinité-et-Tobago",
    iso2: "TT",
    dialingCode: "+1-868",
    currencyCode: "TTD",
    currencyName: "Trinidad and Tobago dollar",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Tunisie",
    iso2: "TN",
    dialingCode: "+216",
    currencyCode: "TND",
    currencyName: "Tunisian dinar",
    currencySymbol: "د.ت",
    continent: "Africa",
  },
  {
    name: "Turkménistan",
    iso2: "TM",
    dialingCode: "+993",
    currencyCode: "TMT",
    currencyName: "Turkmenistani manat",
    currencySymbol: "m",
    continent: "Asia",
  },
  {
    name: "Turquie",
    iso2: "TR",
    dialingCode: "+90",
    currencyCode: "TRY",
    currencyName: "Turkish lira",
    currencySymbol: "₺",
    continent: "Europe",
  },
  {
    name: "Tuvalu",
    iso2: "TV",
    dialingCode: "+688",
    currencyCode: "AUD",
    currencyName: "Australian dollar",
    currencySymbol: "$",
    continent: "Oceania",
  },
  {
    name: "Ukraine",
    iso2: "UA",
    dialingCode: "+380",
    currencyCode: "UAH",
    currencyName: "Ukrainian hryvnia",
    currencySymbol: "₴",
    continent: "Europe",
  },
  {
    name: "Uruguay",
    iso2: "UY",
    dialingCode: "+598",
    currencyCode: "UYU",
    currencyName: "Uruguayan peso",
    currencySymbol: "$",
    continent: "America",
  },
  {
    name: "Vanuatu",
    iso2: "VU",
    dialingCode: "+678",
    currencyCode: "VUV",
    currencyName: "Vanuatu vatu",
    currencySymbol: "Vt",
    continent: "Oceania",
  },
  {
    name: "Vatican",
    iso2: "VA",
    dialingCode: "+379",
    currencyCode: "EUR",
    currencyName: "Euro",
    currencySymbol: "€",
    continent: "Europe",
  },
  {
    name: "Venezuela",
    iso2: "VE",
    dialingCode: "+58",
    currencyCode: "VES",
    currencyName: "Venezuelan bolívar",
    currencySymbol: "Bs.",
    continent: "America",
  },
  {
    name: "Vietnam",
    iso2: "VN",
    dialingCode: "+84",
    currencyCode: "VND",
    currencyName: "Vietnamese đồng",
    currencySymbol: "₫",
    continent: "Asia",
  },
  {
    name: "Yémen",
    iso2: "YE",
    dialingCode: "+967",
    currencyCode: "YER",
    currencyName: "Yemeni rial",
    currencySymbol: "﷼",
    continent: "Asia",
  },
  {
    name: "Zambie",
    iso2: "ZM",
    dialingCode: "+260",
    currencyCode: "ZMW",
    currencyName: "Zambian kwacha",
    currencySymbol: "ZK",
    continent: "Africa",
  },
  {
    name: "Zimbabwe",
    iso2: "ZW",
    dialingCode: "+263",
    currencyCode: "ZWL",
    currencyName: "Zimbabwean dollar",
    currencySymbol: "$",
    continent: "Africa",
  },
];

const FEATURED_COUNTRIES = new Set(["CI", "SN", "ML", "NG"]);
const HUB_COUNTRIES = new Set(["CN", "AE", "FR", "DE", "IT", "US"]);

function getSeedCountriesData(): CountrySeed[] {
  return COUNTRIES_DATA.map((c) => ({
    ...c,
    slug: slugify(c.name),
    usdExchangeRate: null,
    isFeatured: FEATURED_COUNTRIES.has(c.iso2) || undefined,
    isHub: HUB_COUNTRIES.has(c.iso2) || undefined,
  })).sort((a, b) => a.name.localeCompare(b.name));
}

const seedCountriesData = getSeedCountriesData();

function sanitizeCountry(c: CountrySeed) {
  return {
    ...c,
    dialingCode: c.dialingCode ?? "",
    currencyCode: c.currencyCode ?? "",
    currencyName: c.currencyName ?? "",
    currencySymbol: c.currencySymbol ?? "",
    usdExchangeRate: c.usdExchangeRate ?? 1,
    continent: c.continent ?? "Africa",
  };
}

async function seedCountries() {
  for (const country of seedCountriesData) {
    const data = sanitizeCountry(country);
    await prisma.country.upsert({
      where: { slug: country.slug },
      update: data,
      create: data,
    });
  }
  console.log(`[seed] ${seedCountriesData.length} countries`);
}

async function seedAdminUser() {
  const coteIvoire = await prisma.country.findUnique({
    where: { slug: "cote-divoire" },
  });
  const adminUsername = "admin";
  const adminEmail = "admin@jc-import-express.internal";
  const adminPassword =
    process.env.JC_IMPORT_EXPRESS_ADMIN_PASSWORD || "Admin@12345";

  const existing = await prisma.auraUser.findUnique({
    where: { username: adminUsername },
  });

  if (existing) {
    await prisma.auraUser.update({
      where: { id: existing.id },
      data: {
        isAdmin: true,
        displayName: "Admin JC Import Express",
        businessName: "JC Import Express",
        countryId: coteIvoire?.id,
        currencyCode: "XOF",
        email: adminEmail,
      },
    });
    console.log("[seed] Admin user updated");
    return;
  }

  const user = await prisma.auraUser.create({
    data: {
      username: adminUsername,
      email: adminEmail,
      displayName: "Admin JC Import Express",
      businessName: "JC Import Express",
      isAdmin: true,
      countryId: coteIvoire?.id,
      currencyCode: "XOF",
      passwordCredential: {
        create: { passwordHash: hashSync(adminPassword, 12) },
      },
    },
  });
  console.log(`[seed] Admin user created: ${user.id}`);
}

async function seedAdminAccessKey() {
  const existing = await prisma.adminAccessKey.findFirst({
    where: { isActive: true },
  });
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
    excerpt:
      "Découvrez les étapes essentielles pour importer depuis la Chine vers l'Afrique : recherche de fournisseurs, transport, douane et distribution.",
    tags: "import,chine,afrique,guide,logistique",
    metaTitle: "Guide Import-Export Chine-Afrique | JC Import Express",
    metaDesc:
      "Guide complet pour importer depuis la Chine vers l'Afrique : fournisseurs, transport maritime et aérien, douane, et conseils pratiques.",
  },
  {
    type: BlogPostType.ADVICE,
    title:
      "Fret maritime vs fret aérien : lequel choisir pour votre expédition ?",
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
    excerpt:
      "Fret maritime ou aérien ? Comparez les coûts, délais et avantages de chaque mode de transport pour choisir la meilleure option.",
    tags: "fret,maritime,aerien,transport,conseil",
    metaTitle: "Fret Maritime vs Aérien : Guide Comparatif | JC Import Express",
    metaDesc:
      "Comparez les avantages et inconvénients du fret maritime et aérien pour vos expéditions depuis la Chine vers l'Afrique.",
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
    excerpt:
      "Tout savoir sur les formalités douanières en Côte d'Ivoire : documents requis, processus de dédouanement, droits et taxes.",
    tags: "douane,cote-d-ivoire,import,formalites,afrique",
    metaTitle: "Formalités Douanières Côte d'Ivoire | Guide Import",
    metaDesc:
      "Guide complet des formalités douanières pour importer en Côte d'Ivoire : documents, procédures, droits et taxes à prévoir.",
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
    excerpt:
      "Découvrez comment suivre vos expéditions en temps réel avec JC Import Express : tracking, notifications WhatsApp, carte interactive.",
    tags: "suivi,tracking,logistique,whatsapp,temps-reel",
    metaTitle: "Suivi Expédition Temps Réel | JC Import Express",
    metaDesc:
      "Suivez vos expéditions en temps réel avec notre système de tracking : notifications WhatsApp, carte interactive, et chronomètres d'étape.",
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
    excerpt:
      "Découvrez le classement 2026 des produits les plus importés en Afrique : électronique, machines, véhicules, alimentaire et plus.",
    tags: "import,top,produits,afrique,2026,tendances",
    metaTitle: "Top 10 Produits Importés en Afrique 2026 | JC Import Express",
    metaDesc:
      "Classement 2026 des produits les plus importés en Afrique : électronique, machines, véhicules, alimentaire et tendances du marché.",
  },
];

const SITE_CONTENT = [
  {
    section: "metadata",
    key: "homeTitle",
    value:
      "JC Import Express | Suivi de Colis International — Tracking en Temps Réel",
  },
  {
    section: "metadata",
    key: "homeDescription",
    value:
      "Suivez vos colis et marchandises en temps réel. Tracking international par avion, bateau et camion. Notification WhatsApp à chaque étape.",
  },
  {
    section: "metadata",
    key: "blogTitle",
    value: "Blog | JC Import Express — Guide Import-Export Afrique",
  },
  {
    section: "metadata",
    key: "blogDescription",
    value:
      "Conseils, guides et astuces pour importer vos produits en Afrique. Fret maritime, fret aérien, douane, et tout ce qu'il faut savoir.",
  },
  { section: "header", key: "brandName", value: "JC Import Express" },
  { section: "header", key: "phone", value: "+86 130 5916 2331 " },
  {
    section: "header",
    key: "navLinks",
    value: JSON.stringify([
      { label: "Accueil", href: "#hero" },
      { label: "Services", href: "#services" },
      { label: "À propos", href: "#about" },
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: "#contact" },
    ]),
  },
  { section: "hero", key: "badge", value: "Réseau logistique international" },
  { section: "hero", key: "title", value: "Une logistique mondiale," },
  { section: "hero", key: "accent", value: "maîtrisée de bout en bout." },
  {
    section: "hero",
    key: "description",
    value:
      "Du fret international à la livraison du dernier kilomètre, nous connectons vos marchandises à plus de 150 pays avec visibilité, précision et fiabilité opérationnelle.",
  },
  { section: "hero", key: "desktopImage", value: "/images/hero-logistics.png" },
  {
    section: "hero",
    key: "mobileImage",
    value: "/images/hero-mobile-logistics.png",
  },
  {
    section: "hero",
    key: "trackingPlaceholder",
    value: "Entrez votre numéro de suivi",
  },
  { section: "hero", key: "trackingButton", value: "Suivre mon colis" },
  {
    section: "hero",
    key: "stats",
    value: JSON.stringify([
      { value: "150+", label: "Pays desservis" },
      { value: "50K+", label: "Expéditions mensuelles" },
      { value: "75,2 %", label: "Livraisons à l’heure" },
      { value: "7+", label: "Années d’expertise" },
    ]),
  },
  { section: "products", key: "eyebrow", value: "Nos Produits" },
  {
    section: "products",
    key: "title",
    value: "Solutions logistiques adaptées à",
  },
  { section: "products", key: "accent", value: "vos besoins" },
  {
    section: "products",
    key: "description",
    value:
      "Des tarifs transparents et compétitifs pour toutes vos expéditions, du petit colis au conteneur complet.",
  },
  { section: "features", key: "eyebrow", value: "Ce que nous offrons" },
  { section: "features", key: "title", value: "Des solutions logistiques" },
  { section: "features", key: "accent", value: "complètes et fiables" },
  {
    section: "features",
    key: "description",
    value:
      "Des solutions de chaîne d’approvisionnement de bout en bout, conçues autour de votre activité, de vos itinéraires et de vos exigences opérationnelles.",
  },
  {
    section: "features",
    key: "stats",
    value: JSON.stringify([
      { value: "150+", label: "Pays desservis", icon: "globe" },
      { value: "50K+", label: "Expéditions / mois", icon: "package" },
      { value: "75,2%", label: "Livraisons à l'heure", icon: "clock" },
      { value: "7+", label: "Années d'excellence", icon: "award" },
    ]),
  },
  {
    section: "features",
    key: "services",
    value: JSON.stringify([
      {
        title: "Fret aérien",
        description:
          "Solutions de fret aérien urgent avec suivi et options prioritaires.",
        icon: "plane",
        features: [
          "Options express et prioritaires",
          "Cargaison à température contrôlée",
          "Suivi en temps réel",
        ],
      },
      {
        title: "Fret maritime",
        description:
          "Expédition en conteneur complet ou groupage sur les grandes routes commerciales.",
        icon: "ship",
        features: [
          "Solutions FCL et LCL",
          "Port-à-port et porte-à-porte",
          "Dédouanement inclus",
        ],
      },
      {
        title: "Transport terrestre",
        description:
          "Transport routier intermodal pour palettes, colis et marchandises professionnelles.",
        icon: "truck",
        features: [
          "Flotte suivie par GPS",
          "Services programmés",
          "Livraison porte-à-porte",
        ],
      },
    ]),
  },
  {
    section: "features",
    key: "trackingSteps",
    value: JSON.stringify([
      { label: "Commande confirmée", time: "15 janv. · 10:30", done: true },
      { label: "En transit", time: "16 janv. · 08:00", done: true },
      { label: "Dédouanement", time: "Estimé le 18 janv.", done: false },
      { label: "Livraison", time: "Estimé le 19 janv.", done: false },
    ]),
  },
  { section: "features", key: "testimonialEyebrow", value: "Témoignages" },
  {
    section: "features",
    key: "testimonialTitle",
    value: "La confiance se mesure dans les résultats.",
  },
  {
    section: "features",
    key: "testimonialDescription",
    value:
      "Des entreprises s’appuient sur notre réseau pour sécuriser leurs opérations logistiques.",
  },
  {
    section: "benefits",
    key: "eyebrow",
    value: "À propos de JC Import Express",
  },
  {
    section: "benefits",
    key: "title",
    value: "Votre partenaire de confiance en",
  },
  {
    section: "benefits",
    key: "accent",
    value: "solutions logistiques mondiales.",
  },
  {
    section: "benefits",
    key: "description",
    value:
      "Fondée en 2010, JC Import Express est devenue un partenaire logistique fiable pour les expéditions internationales.",
  },
  {
    section: "benefits",
    key: "items",
    value: JSON.stringify([
      {
        title: "Notre mission",
        description: "Redéfinir la logistique avec innovation et fiabilité.",
        icon: "mission",
      },
      {
        title: "Notre vision",
        description:
          "Devenir le partenaire logistique le plus fiable pour vos imports.",
        icon: "vision",
      },
      {
        title: "Dédouanement intégré",
        description:
          "Notre équipe gère vos documents et formalités douanières.",
        icon: "customs",
      },
    ]),
  },
  { section: "faq", key: "eyebrow", value: "FAQ" },
  { section: "faq", key: "title", value: "Questions fréquentes" },
  {
    section: "faq",
    key: "description",
    value:
      "Les réponses essentielles pour comprendre simplement nos services logistiques.",
  },
  {
    section: "faq",
    key: "items",
    value: JSON.stringify([
      {
        question: "Comment puis-je suivre mon expédition ?",
        answer:
          "Entrez votre numéro de suivi sur la page d'accueil pour obtenir les mises à jour disponibles.",
      },
      {
        question: "Quels types de cargaison traitez-vous ?",
        answer:
          "Nous traitons les colis, palettes, conteneurs, marchandises générales et dossiers de dédouanement.",
      },
      {
        question: "Proposez-vous le dédouanement international ?",
        answer:
          "Oui, notre équipe accompagne la préparation documentaire et le suivi des formalités douanières.",
      },
    ]),
  },
  { section: "pricing", key: "eyebrow", value: "Contact" },
  { section: "pricing", key: "title", value: "Obtenez un devis" },
  {
    section: "pricing",
    key: "description",
    value: "Notre équipe conçoit une solution adaptée à votre expédition.",
  },
  {
    section: "pricing",
    key: "panelTitle",
    value: "Échangez directement avec notre équipe logistique.",
  },
  {
    section: "pricing",
    key: "panelDescription",
    value:
      "Nous analysons votre itinéraire, vos délais et vos contraintes afin de vous proposer une réponse exploitable.",
  },
  { section: "pricing", key: "addressLabel", value: "Siège social" },
  { section: "pricing", key: "address", value: "Shanghai, China" },
  { section: "pricing", key: "phoneLabel", value: "Téléphone" },
  { section: "pricing", key: "phone", value: "+86 130 5916 2331 " },
  { section: "pricing", key: "emailLabel", value: "Email" },
  { section: "pricing", key: "email", value: "support@nexttracelogistics.com" },
  { section: "pricing", key: "availabilityTitle", value: "Disponibilité" },
  {
    section: "pricing",
    key: "availabilityBody",
    value: "Lundi au vendredi : 8h–20h HNE · Support de suivi : 24h/24, 7j/7",
  },
  { section: "pricing", key: "formEyebrow", value: "Demande personnalisée" },
  {
    section: "pricing",
    key: "formTitle",
    value: "Parlez-nous de votre expédition.",
  },
  {
    section: "pricing",
    key: "formDescription",
    value:
      "Renseignez les informations essentielles pour préparer une proposition adaptée.",
  },
  {
    section: "pricing",
    key: "privacy",
    value:
      "Vos informations sont utilisées uniquement pour traiter votre demande de devis.",
  },
  { section: "blog", key: "eyebrow", value: "Actualités & Conseils" },
  { section: "blog", key: "title", value: "Dernières" },
  { section: "blog", key: "accent", value: "publications" },
  {
    section: "blog",
    key: "description",
    value:
      "Suivez nos actualités, guides et conseils pour optimiser vos expéditions internationales.",
  },
  { section: "blog", key: "cta", value: "Voir tous les articles" },
  { section: "blog", key: "listEyebrow", value: "Blog" },
  { section: "blog", key: "listTitle", value: "Guide Import-Export Afrique" },
  {
    section: "blog",
    key: "listDescription",
    value:
      "Conseils pratiques, guides étape par étape et astuces pour importer vos produits en Afrique en toute sérénité.",
  },
];

const PRODUCT_SEEDS = [
  {
    slug: "conteneur-maritime-20-pieds",
    name: "Conteneur Maritime 20 pieds",
    shortDescription:
      "Conteneur standard dry van pour fret maritime. Capacité de 33 m³, charge utile jusqu'à 28 tonnes.",
    fullDescription:
      "Parfait pour vos expéditions de taille moyenne, ce conteneur maritime de 20 pieds est une solution standard du transport international.\n\nIl convient aux marchandises sèches : meubles, vêtements, produits manufacturés, machines et biens de consommation.",
    imageUrl: "/images/shipping-containers.jpg",
    gallery: [
      "/images/shipping-containers.jpg",
      "/images/warehouse.jpg",
      "/images/ocean-freight.jpg",
    ],
    priceXaf: 3_600_000,
    likes: 47,
    features: [
      "Capacité intérieure : 33 m³",
      "Charge utile max : 28 000 kg",
      "Acier Corten anti-corrosion",
      "Certifié CSC",
    ],
    sortOrder: 1,
    testimonials: [
      {
        name: "Amadou Diallo",
        advice: "Conteneur reçu en parfait état, conforme à la description.",
        star: 5,
        showOnLanding: true,
        sortOrder: 1,
      },
      {
        name: "Fatima Ndiaye",
        advice:
          "Excellent rapport qualité-prix pour l'export vers l'Afrique de l'Ouest.",
        star: 5,
        showOnLanding: false,
        sortOrder: 2,
      },
    ],
  },
  {
    slug: "fret-aerien-express-100kg",
    name: "Fret Aérien Express (100 kg)",
    shortDescription:
      "Service de fret aérien prioritaire pour colis standard. Délai de 3 à 5 jours ouvrés.",
    fullDescription:
      "Notre service de fret aérien express est adapté aux envois urgents vers l'Afrique.\n\nIl couvre jusqu'à 100 kg de marchandises avec suivi en temps réel et manutention sécurisée.",
    imageUrl: "/images/air-freight.jpg",
    gallery: [
      "/images/air-freight.jpg",
      "/images/tracking-map.jpg",
      "/images/warehouse.jpg",
    ],
    priceXaf: 900_000,
    likes: 62,
    features: [
      "Poids max : 100 kg",
      "Délai : 3 à 5 jours ouvrés",
      "Suivi 24h/24",
      "Dédouanement accéléré inclus",
    ],
    sortOrder: 2,
    testimonials: [
      {
        name: "Sophie Leblanc",
        advice:
          "Livraison ultra-rapide, mon colis est arrivé à Douala en 4 jours.",
        star: 5,
        showOnLanding: true,
        sortOrder: 3,
      },
    ],
  },
  {
    slug: "service-dedouanement-complet",
    name: "Service Dédouanement Complet",
    shortDescription:
      "Accompagnement douanier complet pour vos marchandises : documents, conformité et suivi.",
    fullDescription:
      "Notre service de dédouanement complet vous accompagne de la préparation des documents à la libération des marchandises.\n\nIl couvre la classification tarifaire, les déclarations, les calculs de droits et les échanges avec les autorités.",
    imageUrl: "/images/tracking-map.jpg",
    gallery: [
      "/images/tracking-map.jpg",
      "/images/warehouse.jpg",
      "/images/shipping-containers.jpg",
    ],
    priceXaf: 250_000,
    likes: 54,
    features: [
      "Classification tarifaire",
      "Préparation des documents",
      "Interface avec les autorités",
      "Assistance prioritaire",
    ],
    sortOrder: 3,
    testimonials: [
      {
        name: "Hélène Zadi",
        advice:
          "Notre conteneur a été libéré rapidement grâce à leur expertise.",
        star: 5,
        showOnLanding: true,
        sortOrder: 4,
      },
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
      where: {
        section_key_locale: {
          section: item.section,
          key: item.key,
          locale: "fr",
        },
      },
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
        update: {
          ...testimonial,
          productId: savedProduct.id,
          isPublished: true,
        },
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
    create: {
      id: "default",
      adminWhatsAppNumber: "2250700000000",
      evolutionInstanceId: "jc-import-express",
    },
  });
  console.log("[seed] App settings");
}

async function main() {
  console.log("[seed] Starting main...");
  await seedCountries();
  console.log("[seed] ✔ Countries seeded");
  await seedAdminUser();
  console.log("[seed] ✔ Admin user");
  await seedAdminAccessKey();
  console.log("[seed] ✔ Admin access key");
  await seedAppSettings();
  console.log("[seed] ✔ App settings");
  await seedSiteContent();
  console.log("[seed] ✔ Site content");
  await seedProductsAndTestimonials();
  console.log("[seed] ✔ Products & testimonials");
  await seedBlogPosts();
  console.log("[seed] ✔ Blog posts");
  console.log("[seed] Done.");
}

main()
  .catch((e) => {
    console.error("[seed] Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
