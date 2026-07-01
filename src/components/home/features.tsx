"use client";

import {
  Globe,
  Package,
  Clock,
  Award,
  Plane,
  Ship,
  Truck,
  Warehouse,
  Shield,
  PawPrint,
  Search,
  MapPin,
  ChevronRight,
  Star,
} from "lucide-react";

const STATS = [
  { value: "150+", label: "Pays desservis", icon: Globe },
  { value: "50K+", label: "Expéditions / mois", icon: Package },
  { value: "99,8%", label: "Livraisons à l'heure", icon: Clock },
  { value: "15+", label: "Années d'excellence", icon: Award },
] as const;

const SERVICES = [
  {
    title: "Fret aérien",
    description:
      "Solutions de fret aérien mondial urgent avec options le jour même, le lendemain et services programmés vers plus de 500 aéroports dans le monde.",
    icon: Plane,
    features: [
      "Options express et prioritaire",
      "Services d'affrètement disponibles",
      "Cargaison à température contrôlée",
      "Manutention de marchandises dangereuses",
    ],
  },
  {
    title: "Fret maritime",
    description:
      "Expédition en conteneur complet (FCL) et en groupage (LCL) avec des itinéraires optimisés sur toutes les grandes routes commerciales.",
    icon: Ship,
    features: [
      "Solutions FCL et LCL",
      "Services de conteneur réfrigéré",
      "Port-à-port et porte-à-porte",
      "Dédouanement inclus",
    ],
  },
  {
    title: "Transport terrestre",
    description:
      "Services complets de transport routier et ferroviaire, y compris le camion complet, les chargements partiels et le transport intermodal.",
    icon: Truck,
    features: [
      "Services FTL et LTL",
      "Transport transfrontalier",
      "Flotte suivie par GPS",
      "Programmé et à la demande",
    ],
  },
  {
    title: "Messagerie express",
    description:
      "Livraison ultra-rapide de colis et de documents avec des délais garantis. Options le jour même et le lendemain pour les envois urgents.",
    icon: Package,
    features: [
      "Livraison le jour même",
      "Colis et documents express",
      "Notifications en temps réel",
      "Signature à la livraison",
    ],
  },
  {
    title: "Entreposage et distribution",
    description:
      "Installations de stockage de pointe avec gestion des stocks, préparation de commandes et services de distribution dans les principaux hubs.",
    icon: Warehouse,
    features: [
      "Stockage climatisé",
      "Gestion des stocks",
      "Préparation, emballage et expédition",
      "Traitement des retours",
    ],
  },
  {
    title: "Cargaison spécialisée",
    description:
      "Manutention experte pour les marchandises surdimensionnées, fragiles, de grande valeur et dangereuses avec des équipes logistiques dédiées.",
    icon: Shield,
    features: [
      "Cargaison lourde et projet",
      "Œuvres d'art et antiquités",
      "Transport pharmaceutique",
      "Logistique militaire et défense",
    ],
  },
  {
    title: "Transport d'animaux",
    description:
      "Transport sûr, humain et sans stress pour les animaux de compagnie, le bétail, les espèces exotiques et les animaux de laboratoire dans le monde entier.",
    icon: PawPrint,
    features: [
      "Animaux domestiques et internationaux",
      "Transport de bétail et d'équidés",
      "Certifié IATA LAR",
      "Supervision vétérinaire",
    ],
  },
] as const;

const TESTIMONIALS = [
  {
    quote:
      "JC Import Express a transformé notre chaîne d'approvisionnement. Le suivi en temps réel et la communication proactive ont réduit nos problèmes de livraison de plus de 60 %.",
    name: "Sarah Mitchell",
    title: "VP Supply Chain, TechFlow Inc.",
  },
  {
    quote:
      "Du dédouanement à la livraison du dernier kilomètre, JC Import Express gère tout de manière transparente. Notre colonne vertébrale logistique depuis 5 ans.",
    name: "James Okonkwo",
    title: "CEO, AfriTrade Exports",
  },
  {
    quote:
      "Le transport pharmaceutique à température contrôlée est le meilleur de sa catégorie. Zéro perte sur plus de 3 000 expéditions. Une fiabilité remarquable.",
    name: "Elena Vasquez",
    title: "Directrice Logistique, MedPharma Global",
  },
] as const;

function ServiceCard({
  title,
  description,
  icon: Icon,
  features,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  features: readonly string[];
}) {
  return (
    <div
      className="flex w-full flex-col gap-8 overflow-clip rounded-[30px] bg-[#f7f7f7] p-[30px] min-[810px]:p-10"
      style={{ willChange: "transform" }}
    >
      <div className="flex size-14 items-center justify-center rounded-[20px] bg-white">
        <Icon className="size-7 text-black" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-display text-[24px] font-bold leading-[26px] tracking-[-1.2px] text-black min-[810px]:text-[28px]">
          {title}
        </h3>
        <p className="font-display text-[14px] leading-[19.6px] tracking-[-0.14px] text-black/60 min-[810px]:text-base">
          {description}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <ChevronRight className="size-4 shrink-0 text-black/40" strokeWidth={2} />
            <span className="font-display text-[13px] leading-[18px] tracking-[-0.13px] text-black/70">
              {f}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Features() {
  return (
    <section
      id="services"
      className="relative flex w-full flex-col items-center justify-start overflow-clip"
    >
      <div className="relative z-[3] flex w-full max-w-[430px] flex-col items-center justify-center gap-16 overflow-clip px-5 min-[810px]:max-w-none min-[810px]:px-10 min-[810px]:gap-20 min-[1200px]:max-w-[1200px]">
        {/* Section titre */}
        <div className="flex w-full max-w-[390px] flex-col items-center gap-5 text-center min-[810px]:max-w-[600px] min-[1200px]:max-w-[800px]">
          <span className="font-display text-sm font-semibold tracking-[-0.02em] text-[#006fff]">
            Ce que nous offrons
          </span>
          <h2 className="font-display text-[38px] font-bold leading-[38px] tracking-[-1.9px] text-black min-[810px]:text-5xl min-[810px]:leading-[48px] min-[1200px]:text-[60px] min-[1200px]:leading-[60px]">
            Des solutions logistiques <br className="hidden min-[810px]:block" />
            <span className="text-[#006fff]">complètes et fiables</span>
          </h2>
          <p className="font-display text-[16px] leading-[22.4px] tracking-[-0.16px] text-black/60 min-[810px]:text-lg min-[810px]:leading-[25.2px] min-[1200px]:text-xl">
            Des solutions de chaîne d&apos;approvisionnement de bout en bout adaptées à votre
            entreprise. Chaque mode, chaque itinéraire, chaque fois.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid w-full max-w-[390px] grid-cols-2 gap-3 min-[810px]:max-w-none min-[810px]:grid-cols-4 min-[810px]:gap-5">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-3 rounded-[20px] bg-[#f7f7f7] p-6 text-center min-[810px]:p-8"
              >
                <Icon className="size-6 text-[#006fff]" strokeWidth={1.5} />
                <span className="font-display text-[32px] font-bold leading-[32px] tracking-[-1.6px] text-black min-[810px]:text-[38px]">
                  {stat.value}
                </span>
                <span className="font-display text-[13px] leading-[18px] tracking-[-0.13px] text-black/60">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Services grille */}
        <div className="grid w-full max-w-[390px] grid-cols-1 gap-5 min-[810px]:max-w-none min-[810px]:grid-cols-2 min-[810px]:gap-5 min-[1200px]:grid-cols-3">
          {SERVICES.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>

        {/* Section Tracking */}
        <div className="flex w-full max-w-[390px] flex-col items-center gap-10 overflow-clip rounded-[30px] bg-[#f7f7f7] p-[30px] min-[810px]:max-w-none min-[810px]:flex-row min-[810px]:p-10 min-[1200px]:p-16">
          <div className="flex w-full flex-col gap-6 min-[810px]:w-1/2">
            <span className="font-display text-sm font-semibold tracking-[-0.02em] text-[#006fff]">
              Visibilité en temps réel
            </span>
            <h3 className="font-display text-[28px] font-bold leading-[30px] tracking-[-1.4px] text-black min-[810px]:text-[32px]">
              Suivez votre expédition partout, à tout moment.
            </h3>
            <p className="font-display text-[14px] leading-[19.6px] tracking-[-0.14px] text-black/60">
              Entrez votre identifiant de suivi ci-dessous pour obtenir des mises à jour
              instantanées sur la position de votre envoi, l&apos;heure de livraison
              estimée et l&apos;historique complet du parcours.
            </p>
            <div className="flex w-full flex-col gap-3">
              <div className="flex items-center gap-3 rounded-[16px] border border-black/10 bg-white px-4 py-3">
                <Search className="size-5 shrink-0 text-black/40" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="e.g., AT-8842-X9"
                  className="w-full bg-transparent font-display text-[14px] leading-[19.6px] text-black outline-none placeholder:text-black/30"
                />
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#006fff] px-6 py-3 font-display text-[14px] font-semibold text-white transition-opacity hover:opacity-90">
                <MapPin className="size-4" strokeWidth={2} />
                Suivre mon colis
              </button>
            </div>
            {/* Timeline statique pour l'exemple */}
            <div className="mt-2 flex flex-col gap-4">
              {[
                { label: "Commande confirmée", time: "15 janv. 10:30", done: true },
                { label: "Colis ramassé", time: "15 janv. 14:15", done: true },
                { label: "En transit — I-80", time: "16 janv. 08:00", done: true },
                { label: "Dédouanement", time: "Estimé 18 janv.", done: false },
                { label: "Livraison", time: "Estimé 19 janv.", done: false },
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div
                    className={`size-3 shrink-0 rounded-full ${step.done ? "bg-[#006fff]" : "bg-black/20"}`}
                  />
                  <span className="font-display text-[13px] leading-[18px] text-black/70">
                    {step.label}
                  </span>
                  <span className="ml-auto font-display text-[11px] leading-[15px] text-black/40">
                    {step.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden aspect-[4/3] w-full overflow-clip rounded-[20px] bg-[#e8e8e8] min-[810px]:block min-[810px]:w-1/2">
            <img
              src="/images/tracking-map.jpg"
              alt="Carte de suivi"
              className="block size-full object-cover"
            />
          </div>
        </div>

        {/* Témoignages */}
        <div className="flex w-full max-w-[390px] flex-col items-center gap-10 min-[810px]:max-w-none">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="font-display text-sm font-semibold tracking-[-0.02em] text-[#006fff]">
              Témoignages
            </span>
            <h3 className="font-display text-[28px] font-bold leading-[30px] tracking-[-1.4px] text-black min-[810px]:text-[32px]">
              Ce que disent nos clients
            </h3>
            <p className="font-display text-[14px] leading-[19.6px] tracking-[-0.14px] text-black/60">
              Plus de 500 entreprises nous font confiance. Plus de 30 avis vérifiés.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-5 min-[810px]:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-6 rounded-[24px] bg-[#f7f7f7] p-8"
              >
                <div className="flex gap-[1px]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-[#006fff] text-[#006fff]"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <p className="font-display text-[14px] leading-[19.6px] tracking-[-0.14px] text-black/70 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-auto flex flex-col">
                  <span className="font-display text-[14px] font-bold leading-[16px] tracking-[-0.7px] text-black">
                    {t.name}
                  </span>
                  <span className="font-display text-[12px] leading-[16.8px] tracking-[-0.12px] text-black/50">
                    {t.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="flex w-full max-w-[390px] flex-col items-center gap-8 overflow-clip rounded-[30px] bg-[#006fff] p-[30px] text-center min-[810px]:max-w-none min-[810px]:flex-row min-[810px]:gap-12 min-[810px]:p-12 min-[810px]:text-left">
          <div className="flex flex-col items-center gap-4 min-[810px]:items-start min-[810px]:flex-1">
            <h3 className="font-display text-[28px] font-bold leading-[30px] tracking-[-1.4px] text-white min-[810px]:text-[32px]">
              Prêt à faire avancer votre entreprise ?
            </h3>
            <p className="font-display text-[14px] leading-[19.6px] text-white/70">
              Que vous ayez besoin d&apos;une expédition ponctuelle ou d&apos;un partenaire
              logistique complet, notre équipe est prête à concevoir une solution
              adaptée à vos besoins.
            </p>
            <div className="flex flex-col items-center gap-2 text-white/60 min-[810px]:items-start">
              <span className="flex items-center gap-2 font-display text-[13px]">
                <MapPin className="size-4" strokeWidth={1.5} /> Wyoming, États-Unis
              </span>
              <a
                href="tel:+14122273484"
                className="flex items-center gap-2 font-display text-[13px] text-white/60 hover:text-white"
              >
                +1 (412) 227-3484
              </a>
              <a
                href="mailto:support@nexttracelogistics.com"
                className="flex items-center gap-2 font-display text-[13px] text-white/60 hover:text-white"
              >
                support@nexttracelogistics.com
              </a>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-3 min-[810px]:items-end">
            <a
              href="tel:+14122273484"
              className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-white px-8 py-4 font-display text-[14px] font-semibold text-[#006fff] transition-opacity hover:opacity-90"
            >
              Obtenir un devis
            </a>
            <span className="font-display text-[12px] leading-[16px] text-white/50">
              Lun–Ven : 8h–20h HNE · Support 24h/24
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
