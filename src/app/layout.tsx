import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/StructuredData";
import { BASE_URL } from "@/lib/metadata";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter-loaded",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-instrument-loaded",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "JC Import Express | Suivi de Colis International — Tracking en Temps Réel",
    template: "%s | JC Import Express",
  },
  description:
    "Suivez vos colis et marchandises en temps réel. Tracking international par avion, bateau et camion. Notification WhatsApp à chaque étape.",
  applicationName: "JC Import Express",
  referrer: "origin-when-cross-origin",
  keywords: [
    "suivi colis international",
    "tracking marchandise",
    "logistique Afrique",
    "transport international",
    "suivi expédition",
    "JC Import Express",
  ],
  authors: [{ name: "JC Import Express" }],
  creator: "JC Import Express",
  publisher: "JC Import Express",
  robots: {
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
    type: "website",
    locale: "fr_FR",
    url: BASE_URL,
    siteName: "JC Import Express",
  },
  twitter: {
    card: "summary_large_image",
    site: "@jcimportexpress",
    creator: "@jcimportexpress",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="fr" data-scroll-behavior="smooth" className={cn("h-full antialiased", "font-sans", inter.variable, instrumentSerif.variable)}>
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-title" content="JC Import Express" />
        <OrganizationJsonLd
          contactPhone={process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER}
        />
        <WebsiteJsonLd />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
{children}
        </Providers>
      </body>
    </html>
  );
}
