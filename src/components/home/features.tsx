"use client";

import Image from "next/image";
import type { ElementType } from "react";
import {
  Award,
  ChevronRight,
  Clock,
  Globe,
  MapPin,
  Package,
  PawPrint,
  Plane,
  Search,
  Shield,
  Ship,
  Star,
  Truck,
  Warehouse,
} from "lucide-react";
import type { FeaturesContent, LandingTestimonial } from "./types";

const ICONS: Record<string, ElementType> = {
  award: Award,
  clock: Clock,
  globe: Globe,
  package: Package,
  paw: PawPrint,
  plane: Plane,
  shield: Shield,
  ship: Ship,
  truck: Truck,
  warehouse: Warehouse,
};

function iconFor(key: string | undefined, fallback: ElementType): ElementType {
  return key ? ICONS[key] ?? fallback : fallback;
}

type ServiceCardProps = {
  title: string;
  description: string;
  icon: ElementType;
  features: readonly string[];
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="
        inline-flex items-center rounded-full
        border border-black/[0.08]
        bg-white/80 px-4 py-2
        font-display text-[11px] font-bold
        uppercase tracking-[0.16em]
        text-[#0a192f]/60
        shadow-[
          0_1px_2px_rgba(15,23,42,0.04),
          inset_0_1px_0_rgba(255,255,255,1),
          inset_0_-1px_0_rgba(15,23,42,0.03)
        ]
        backdrop-blur-xl
      "
    >
      {children}
    </span>
  );
}

function ServiceCard({
  title,
  description,
  icon: Icon,
  features,
}: ServiceCardProps) {
  return (
    <article
      className="
        group relative isolate flex w-full flex-col
        overflow-hidden rounded-[30px]
        border border-white/80
        bg-[
          linear-gradient(
            180deg,
            rgba(255,255,255,0.98)_0%,
            rgba(247,247,245,0.98)_52%,
            rgba(239,239,236,0.98)_100%
          )
        ]
        p-[30px]
        ring-1 ring-black/[0.07]
        shadow-[
          0_0_0_1px_rgba(255,255,255,0.48),
          0_1px_2px_rgba(15,23,42,0.06),
          0_14px_38px_-24px_rgba(15,23,42,0.34),
          inset_0_1px_0_rgba(255,255,255,1),
          inset_0_-1px_0_rgba(15,23,42,0.05)
        ]
        transition-[
          transform,
          box-shadow,
          border-color
        ]
        duration-300 ease-out
        hover:-translate-y-1
        hover:border-white
        hover:shadow-[
          0_0_0_1px_rgba(255,255,255,0.65),
          0_2px_4px_rgba(15,23,42,0.06),
          0_24px_55px_-28px_rgba(15,23,42,0.42),
          inset_0_1px_0_rgba(255,255,255,1),
          inset_0_-1px_0_rgba(15,23,42,0.06)
        ]
        min-[810px]:p-10
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-[1px]
          rounded-[29px]
          shadow-[
            inset_1px_0_0_rgba(255,255,255,0.7),
            inset_-1px_0_0_rgba(15,23,42,0.025),
            inset_0_1px_0_rgba(255,255,255,0.95),
            inset_0_-1px_0_rgba(15,23,42,0.045)
          ]
        "
      />

      <div className="relative z-10 flex h-full flex-col gap-8">
        <div
          className="
            flex size-14 items-center justify-center
            rounded-[18px]
            border border-black/[0.06]
            bg-white/90
            text-[#0a192f]
            ring-1 ring-white/90
            shadow-[
              0_1px_2px_rgba(15,23,42,0.06),
              0_10px_24px_-15px_rgba(15,23,42,0.32),
              inset_0_1px_0_rgba(255,255,255,1),
              inset_0_-1px_0_rgba(15,23,42,0.04)
            ]
            transition-transform duration-300
            group-hover:-translate-y-0.5
          "
        >
          <Icon className="size-7" strokeWidth={1.45} aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-4">
          <h3
            className="
              font-display text-[24px] font-bold
              leading-[1.05] tracking-[-0.045em]
              text-[#0a192f]
              min-[810px]:text-[28px]
            "
          >
            {title}
          </h3>

          <p
            className="
              font-display text-[14px]
              leading-[1.65] tracking-[-0.01em]
              text-[#0a192f]/60
              min-[810px]:text-[15px]
            "
          >
            {description}
          </p>
        </div>

        <div className="h-px w-full bg-black/[0.06]" />

        <ul className="mt-auto flex flex-col gap-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <span
                className="
                  mt-[2px] flex size-[18px] shrink-0
                  items-center justify-center rounded-full
                  border border-black/[0.06]
                  bg-white/80
                  shadow-[
                    0_1px_2px_rgba(15,23,42,0.04),
                    inset_0_1px_0_rgba(255,255,255,1)
                  ]
                "
              >
                <ChevronRight
                  className="size-3 text-[#0a192f]/45"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
              </span>

              <span
                className="
                  font-display text-[13px]
                  leading-[18px] tracking-[-0.01em]
                  text-[#0a192f]/68
                "
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function StatCard({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: ElementType;
}) {
  return (
    <div
      className="
        relative isolate flex flex-col items-center gap-3
        overflow-hidden rounded-[24px]
        border border-white/80
        bg-[
          linear-gradient(
            180deg,
            rgba(255,255,255,0.98)_0%,
            rgba(247,247,245,0.98)_55%,
            rgba(239,239,236,0.96)_100%
          )
        ]
        p-6 text-center
        ring-1 ring-black/[0.065]
        shadow-[
          0_0_0_1px_rgba(255,255,255,0.45),
          0_1px_2px_rgba(15,23,42,0.05),
          0_14px_32px_-24px_rgba(15,23,42,0.3),
          inset_0_1px_0_rgba(255,255,255,1),
          inset_0_-1px_0_rgba(15,23,42,0.045)
        ]
        min-[810px]:p-8
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-px rounded-[23px]
          shadow-[
            inset_1px_0_0_rgba(255,255,255,0.55),
            inset_-1px_0_0_rgba(15,23,42,0.02)
          ]
        "
      />

      <Icon
        className="relative z-10 size-6 text-[#0a192f]/65"
        strokeWidth={1.5}
        aria-hidden="true"
      />

      <span
        className="
          relative z-10 font-display
          text-[32px] font-bold leading-none
          tracking-[-0.055em] text-[#0a192f]
          min-[810px]:text-[38px]
        "
      >
        {value}
      </span>

      <span
        className="
          relative z-10 font-display
          text-[13px] leading-[18px]
          tracking-[-0.01em] text-[#0a192f]/55
        "
      >
        {label}
      </span>
    </div>
  );
}

function TrackingSection({ steps: allSteps }: { steps: FeaturesContent["trackingSteps"] }) {
  const steps = allSteps.filter((s) => s.label !== "Colis ramassé");
  return (
    <div
      className="
        relative isolate flex w-full max-w-[390px]
        flex-col items-center gap-10 overflow-hidden
        rounded-[34px]
        border border-white/80
        bg-[
          linear-gradient(
            180deg,
            rgba(251,251,249,0.99)_0%,
            rgba(244,244,241,0.99)_50%,
            rgba(235,235,231,0.98)_100%
          )
        ]
        p-[30px]
        ring-1 ring-black/[0.075]
        shadow-[
          0_0_0_1px_rgba(255,255,255,0.5),
          0_2px_4px_rgba(15,23,42,0.055),
          0_32px_80px_-45px_rgba(15,23,42,0.46),
          inset_0_1px_0_rgba(255,255,255,1),
          inset_0_-1px_0_rgba(15,23,42,0.055)
        ]
        min-[810px]:max-w-none
        min-[810px]:flex-row
        min-[810px]:p-10
        min-[1200px]:p-16
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-px
          rounded-[33px]
          shadow-[
            inset_1px_0_0_rgba(255,255,255,0.68),
            inset_-1px_0_0_rgba(15,23,42,0.028),
            inset_0_1px_0_rgba(255,255,255,0.96)
          ]
        "
      />

      <div className="relative z-10 flex w-full flex-col min-[810px]:w-1/2">
        <div className="flex flex-col items-start">
          <SectionLabel>Visibilité en temps réel</SectionLabel>

          <h3 className="mt-6 max-w-[520px] font-display text-[32px] font-bold leading-[1.02] tracking-[-0.052em] text-[#081728] min-[810px]:text-[38px] min-[1200px]:text-[42px]">
            Suivez chaque mouvement de votre expédition.
          </h3>

          <p className="mt-5 max-w-[510px] font-display text-[14px] leading-[1.72] tracking-[-0.012em] text-[#334155]/65 min-[810px]:text-[15px]">
            Consultez la position actuelle de votre colis, les étapes déjà franchies
            et l&apos;estimation de livraison depuis une interface unique.
          </p>
        </div>

        {/* Recherche */}
        <div className="mt-8 rounded-[24px] border border-black/[0.075] bg-[#eeede8]/80 p-2 ring-1 ring-white/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_35px_-28px_rgba(15,23,42,0.32),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="flex flex-col gap-2 min-[520px]:flex-row">
            <label className="group flex min-h-[54px] flex-1 items-center gap-3 rounded-[17px] border border-black/[0.075] bg-white px-4 ring-1 ring-white/90 shadow-[0_1px_2px_rgba(15,23,42,0.045),0_8px_18px_-16px_rgba(15,23,42,0.28),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.035)] transition-[border-color,box-shadow] duration-200 focus-within:border-[#0a192f]/25 focus-within:shadow-[0_1px_2px_rgba(15,23,42,0.05),0_0_0_3px_rgba(10,25,47,0.07),inset_0_1px_0_rgba(255,255,255,1)]">
              <Search
                className="size-[18px] shrink-0 text-[#0a192f]/35 transition-colors duration-200 group-focus-within:text-[#0a192f]/65"
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <span className="sr-only">Identifiant de suivi</span>

              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="Ex. AT-8842-X9"
                className="h-full min-w-0 flex-1 bg-transparent font-display text-[14px] font-medium tracking-[-0.01em] text-[#0a192f] outline-none placeholder:font-normal placeholder:text-[#0a192f]/28"
              />
            </label>

            <button
              type="button"
              className="group flex min-h-[54px] shrink-0 items-center justify-center gap-2.5 rounded-[17px] border border-[#061323] bg-[#081728] px-6 font-display text-[14px] font-semibold tracking-[-0.015em] text-white ring-1 ring-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.24),0_13px_25px_-16px_rgba(8,23,40,0.72),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.3)] transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#102640] hover:shadow-[0_2px_4px_rgba(0,0,0,0.24),0_18px_30px_-17px_rgba(8,23,40,0.8),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(0,0,0,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a192f]/30 focus-visible:ring-offset-2"
            >
              <MapPin
                className="size-[17px] transition-transform duration-200 group-hover:-translate-y-px"
                strokeWidth={1.9}
                aria-hidden="true"
              />
              Suivre
            </button>
          </div>
        </div>

        {/* Résumé du colis */}
        <div className="mt-5 overflow-hidden rounded-[26px] border border-black/[0.075] bg-[#f8f7f3] ring-1 ring-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.42),0_1px_2px_rgba(15,23,42,0.045),0_18px_42px_-30px_rgba(15,23,42,0.32),inset_0_1px_0_rgba(255,255,255,0.96),inset_0_-1px_0_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 border-b border-black/[0.065] px-5 py-5 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-[15px] border border-black/[0.06] bg-white text-[#0a192f] ring-1 ring-white shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_18px_-13px_rgba(15,23,42,0.3),inset_0_1px_0_rgba(255,255,255,1)]">
                <Package className="size-5" strokeWidth={1.6} aria-hidden="true" />
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="font-display text-[11px] font-semibold uppercase tracking-[0.13em] text-[#0a192f]/38">
                  Expédition
                </span>

                <span className="font-display text-[14px] font-bold tracking-[-0.018em] text-[#0a192f]">
                  AT-8842-X9
                </span>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#235944]/10 bg-[#e8f2ec] px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.08em] text-[#235944] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
              <span className="size-1.5 rounded-full bg-[#2f7658] shadow-[0_0_0_3px_rgba(47,118,88,0.10)]" />
              En transit
            </span>
          </div>

          {/* Timeline */}
          <div className="px-5 py-6">
            <div className="flex flex-col">
              {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                const isCurrent =
                  step.done &&
                  !steps[index + 1]?.done;

                return (
                  <div
                    key={step.label}
                    className={`relative flex gap-4 ${!isLast ? "pb-6" : ""
                      }`}
                  >
                    <div className="relative flex w-5 shrink-0 justify-center">
                      {!isLast ? (
                        <span
                          aria-hidden="true"
                          className={`absolute left-1/2 top-[17px] h-[calc(100%+7px)] w-px -translate-x-1/2 ${step.done
                              ? "bg-[#0a192f]/20"
                              : "bg-black/[0.085]"
                            }`}
                        />
                      ) : null}

                      <span
                        aria-hidden="true"
                        className={`relative z-10 mt-[3px] flex size-[13px] items-center justify-center rounded-full ${step.done
                            ? isCurrent
                              ? "bg-[#0a192f] shadow-[0_0_0_4px_rgba(10,25,47,0.09),0_2px_5px_rgba(10,25,47,0.22)]"
                              : "bg-[#0a192f] shadow-[0_0_0_3px_rgba(10,25,47,0.07)]"
                            : "border-2 border-black/[0.12] bg-[#f8f7f3]"
                          }`}
                      >
                        {step.done && !isCurrent ? (
                          <span className="size-[3px] rounded-full bg-white/80" />
                        ) : null}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-col gap-1">
                        <span
                          className={`font-display text-[13px] leading-[18px] tracking-[-0.012em] ${step.done
                              ? "font-semibold text-[#0a192f]"
                              : "font-medium text-[#0a192f]/45"
                            }`}
                        >
                          {step.label}
                        </span>

                        {isCurrent ? (
                          <span className="font-display text-[11px] leading-[15px] text-[#0a192f]/42">
                            Mise à jour il y a 12 minutes
                          </span>
                        ) : null}
                      </div>

                      <span
                        className={`shrink-0 pt-px text-right font-display text-[11px] leading-[15px] ${step.done
                            ? "text-[#0a192f]/38"
                            : "text-[#0a192f]/30"
                          }`}
                      >
                        {step.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
      <div
        className="
          relative z-10 hidden
          aspect-[4/3] w-full overflow-hidden
          rounded-[26px]
          border border-white/80
          bg-[#deded9]
          ring-1 ring-black/[0.08]
          shadow-[
            0_1px_2px_rgba(15,23,42,0.07),
            0_24px_55px_-32px_rgba(15,23,42,0.38),
            inset_0_1px_0_rgba(255,255,255,0.65)
          ]
          min-[810px]:block
          min-[810px]:w-1/2
        "
      >
        <Image
          src="/images/tracking-map.jpg"
          alt="Carte de suivi logistique en temps réel"
          fill
          className="
            object-cover
            saturate-[0.72] contrast-[0.96]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0
            bg-[
              linear-gradient(
                180deg,
                rgba(255,255,255,0.2)_0%,
                transparent_30%,
                rgba(10,25,47,0.08)_100%
              )
            ]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-px
            rounded-[25px]
            shadow-[
              inset_0_1px_0_rgba(255,255,255,0.72),
              inset_0_-1px_0_rgba(15,23,42,0.08)
            ]
          "
        />
      </div>
    </div>
  );
}

function TestimonialCard({
  advice,
  name,
  star,
}: {
  advice: string;
  name: string;
  star: number;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <article
      className="
        group relative isolate flex h-full flex-col overflow-hidden
        rounded-[30px] border border-black/[0.07]
        bg-[#f7f6f2] p-7
        ring-1 ring-white/80
        shadow-[0_0_0_1px_rgba(255,255,255,0.42),0_1px_2px_rgba(15,23,42,0.05),0_18px_45px_-30px_rgba(15,23,42,0.30),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(15,23,42,0.04)]
        transition-[transform,border-color,box-shadow]
        duration-300 ease-out
        hover:-translate-y-1
        hover:border-black/[0.10]
        hover:shadow-[0_0_0_1px_rgba(255,255,255,0.55),0_2px_4px_rgba(15,23,42,0.06),0_28px_60px_-34px_rgba(15,23,42,0.40),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.05)]
        min-[810px]:p-8
      "
    >
      {/* Reflet chaud très discret */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_88%_4%,rgba(184,139,44,0.10),transparent_34%)]
        "
      />

      {/* Texture interne de bordure */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-px rounded-[29px]
          shadow-[inset_1px_0_0_rgba(255,255,255,0.62),inset_-1px_0_0_rgba(15,23,42,0.025),inset_0_1px_0_rgba(255,255,255,0.82),inset_0_-1px_0_rgba(15,23,42,0.04)]
        "
      />

      {/* Ligne lumineuse supérieure */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-x-7 top-0 h-px
          bg-white/90
        "
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`size-[15px] ${index < star ? "fill-[#ad8127] text-[#ad8127]" : "text-[#0a192f]/20"}`}
                strokeWidth={index < star ? 0 : 1.5}
                aria-hidden="true"
              />
            ))}
          </div>

          <span
            aria-hidden="true"
            className="
              font-serif text-[46px] font-semibold leading-none
              tracking-[-0.08em] text-[#0a192f]/10
            "
          >
            “
          </span>
        </div>

        <blockquote
          className="
            mt-7 font-display text-[15px]
            font-medium leading-[1.7]
            tracking-[-0.015em] text-[#182538]/75
            min-[810px]:text-[16px]
          "
        >
          {advice}
        </blockquote>

        <div
          className="
            mt-8 h-px w-full
            bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.09)_14%,rgba(15,23,42,0.09)_86%,transparent)]
          "
        />

        <div className="mt-5 flex items-center gap-3.5">
          <div
            className="
              flex size-11 shrink-0 items-center justify-center
              rounded-full border border-[#152841]
              bg-[#0a192f]
              font-display text-[11px] font-bold
              uppercase tracking-[0.05em] text-white/85
              ring-1 ring-white/30
              shadow-[0_1px_2px_rgba(15,23,42,0.20),0_8px_18px_-10px_rgba(10,25,47,0.55),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(0,0,0,0.22)]
            "
          >
            {initials}
          </div>

          <div className="flex min-w-0 flex-col gap-0.5">
            <span
              className="
                truncate font-display text-[14px]
                font-bold leading-[18px]
                tracking-[-0.02em] text-[#0a192f]
              "
            >
              {name}
            </span>

            <span
              className="
                truncate font-display text-[12px]
                leading-[17px] tracking-[-0.01em]
                text-[#0a192f]/45
              "
            >
              Avis client vérifié
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function ContactCta() {
  return (
    <div
      className="
        relative isolate flex w-full max-w-[390px]
        flex-col items-center gap-10 overflow-hidden
        rounded-[36px] border border-white/[0.10]
        bg-[#081728] p-[30px] text-center
        ring-1 ring-black/40
        shadow-[0_0_0_1px_rgba(255,255,255,0.045),0_2px_5px_rgba(2,8,18,0.28),0_35px_85px_-40px_rgba(3,10,22,0.80),inset_0_1px_0_rgba(255,255,255,0.11),inset_0_-1px_0_rgba(0,0,0,0.34)]
        min-[810px]:max-w-none
        min-[810px]:flex-row
        min-[810px]:justify-between
        min-[810px]:gap-14
        min-[810px]:p-12
        min-[810px]:text-left
        min-[1200px]:p-14
      "
    >
      {/* Lumière principale */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.11),transparent_31%),radial-gradient(circle_at_8%_105%,rgba(49,91,139,0.22),transparent_38%)]
        "
      />

      {/* Très légère profondeur verticale */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(180deg,rgba(255,255,255,0.035)_0%,transparent_34%,rgba(0,0,0,0.12)_100%)]
        "
      />

      {/* Bord interne */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-px rounded-[35px]
          shadow-[inset_1px_0_0_rgba(255,255,255,0.035),inset_-1px_0_0_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.22)]
        "
      />

      {/* Reflet supérieur */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-x-10 top-0 h-px
          bg-white/15
        "
      />

      <div
        className="
          relative z-10 flex max-w-[690px]
          flex-col items-center gap-5
          min-[810px]:flex-1
          min-[810px]:items-start
        "
      >


        <h3
          className="
            max-w-[620px] font-display
            text-[31px] font-bold leading-[1.03]
            tracking-[-0.052em] text-white
            min-[810px]:text-[40px]
            min-[1200px]:text-[44px]
          "
        >
          Une logistique conçue autour de votre croissance.
        </h3>

        <p
          className="
            max-w-[620px] font-display
            text-[14px] leading-[1.7]
            tracking-[-0.01em] text-white/58
            min-[810px]:text-[15px]
          "
        >
          D&apos;une expédition stratégique à une infrastructure logistique
          complète, notre équipe construit une solution fiable, mesurable et
          adaptée à vos opérations.
        </p>

        <div
          className="
            mt-1 flex flex-col items-center gap-3
            min-[810px]:items-start
          "
        >
          <span
            className="
              flex items-center gap-2.5
              font-display text-[13px] text-white/52
            "
          >
            <MapPin
              className="size-4 text-[#c69a43]"
              strokeWidth={1.7}
              aria-hidden="true"
            />
            Shenzhen, China
          </span>

          <div
            className="
              flex flex-col items-center gap-2
              min-[810px]:flex-row
              min-[810px]:gap-5
            "
          >
            <a
              href="tel:+14122273484"
              className="
                font-display text-[13px] text-white/50
                transition-colors duration-200
                hover:text-white
              "
            >
              +86 130 5916 2331
            </a>

            <span
              aria-hidden="true"
              className="hidden size-1 rounded-full bg-white/20 min-[810px]:block"
            />

            <a
              href="mailto:support@nexttracelogistics.com"
              className="
                font-display text-[13px] text-white/50
                transition-colors duration-200
                hover:text-white
              "
            >
              support@nexttracelogistics.com
            </a>
          </div>
        </div>
      </div>

      <div
        className="
          relative z-10 flex w-full shrink-0
          flex-col items-center gap-3
          min-[810px]:w-auto
          min-[810px]:items-end
        "
      >
        <a
          href="tel:+14122273484"
          className="
            group inline-flex w-full items-center
            justify-center gap-3 rounded-[18px]
            border border-white/90
            bg-[#f8f7f3] px-8 py-4
            font-display text-[14px] font-bold
            tracking-[-0.015em] text-[#0a192f]
            ring-1 ring-black/20
            shadow-[0_1px_2px_rgba(0,0,0,0.22),0_15px_32px_-18px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.08)]
            transition-[transform,background-color,box-shadow]
            duration-200 ease-out
            hover:-translate-y-0.5
            hover:bg-white
            hover:shadow-[0_2px_4px_rgba(0,0,0,0.24),0_22px_38px_-19px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.09)]
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-white/70
            focus-visible:ring-offset-2
            focus-visible:ring-offset-[#081728]
            min-[810px]:w-auto
          "
        >
          Obtenir un devis

          <ChevronRight
            className="
              size-4 transition-transform duration-200
              group-hover:translate-x-0.5
            "
            strokeWidth={2.2}
            aria-hidden="true"
          />
        </a>

        <span
          className="
            font-display text-[11px]
            leading-[16px] tracking-[-0.005em]
            text-white/34
          "
        >
          Lun–Ven, 8h–20h HNE · Assistance 24h/24
        </span>
      </div>
    </div>
  );
}
export function Features({
  content,
  testimonials,
}: {
  content: FeaturesContent;
  testimonials: LandingTestimonial[];
}) {
  return (
    <section
      id="services"
      className="
        relative flex w-full flex-col
        items-center justify-start overflow-hidden
        bg-[#f5f5f1]
        py-[100px]
        min-[810px]:py-[140px]
        min-[1200px]:py-[180px]
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-x-0 top-0 h-px
          bg-black/[0.06]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          left-1/2 top-0 h-[700px] w-[900px]
          -translate-x-1/2
          rounded-full bg-white/50 blur-[120px]
        "
      />

      <div
        className="
          relative z-[3] flex w-full
          max-w-[430px] flex-col
          items-center justify-center gap-16
          px-5
          min-[810px]:max-w-none
          min-[810px]:gap-20
          min-[810px]:px-10
          min-[1200px]:max-w-[1200px]
        "
      >
        <header
          className="
            flex w-full max-w-[390px]
            flex-col items-center gap-6 text-center
            min-[810px]:max-w-[650px]
            min-[1200px]:max-w-[840px]
          "
        >
          <SectionLabel>{content.eyebrow}</SectionLabel>

          <h2
            className="
              font-display text-[40px] font-bold
              leading-[0.98] tracking-[-0.06em]
              text-[#0a192f]
              min-[810px]:text-[52px]
              min-[1200px]:text-[66px]
            "
          >
            {content.title}
            <span className="block text-[#0a192f]/48">
              {content.accent}
            </span>
          </h2>

          <p
            className="
              max-w-[700px] font-display
              text-[16px] leading-[1.6]
              tracking-[-0.015em] text-[#0a192f]/58
              min-[810px]:text-[18px]
              min-[1200px]:text-[20px]
            "
          >
            {content.description}
          </p>
        </header>

        <div
          className="
            grid w-full max-w-[390px]
            grid-cols-2 gap-3
            min-[810px]:max-w-none
            min-[810px]:grid-cols-4
            min-[810px]:gap-5
          "
        >
          {content.stats.map((stat) => (
            <StatCard key={stat.label} {...stat} icon={iconFor(stat.icon, Globe)} />
          ))}
        </div>

        <div
          className="
            grid w-full max-w-[390px]
            grid-cols-1 gap-5
            min-[810px]:max-w-none
            min-[810px]:grid-cols-2
            min-[1200px]:grid-cols-3
          "
        >
          {content.services.map((service) => (
            <ServiceCard
              key={service.title}
              {...service}
              icon={iconFor(service.icon, Package)}
            />
          ))}
        </div>

        <TrackingSection steps={content.trackingSteps} />

        <div
          className="
            flex w-full max-w-[390px]
            flex-col items-center gap-10
            min-[810px]:max-w-none
            min-[810px]:gap-14
          "
        >
          <div className="flex max-w-[620px] flex-col items-center gap-4 text-center">
            <SectionLabel>{content.testimonialEyebrow}</SectionLabel>

            <h3
              className="
                font-display text-[30px] font-bold
                leading-[1.05] tracking-[-0.05em]
                text-[#0a192f]
                min-[810px]:text-[40px]
              "
            >
              {content.testimonialTitle}
            </h3>

            <p
              className="
                max-w-[540px] font-display
                text-[14px] leading-[1.6]
                tracking-[-0.01em] text-[#0a192f]/55
                min-[810px]:text-[16px]
              "
            >
              {content.testimonialDescription}
            </p>
          </div>

          <div
            className="
              grid w-full grid-cols-1 gap-5
              min-[810px]:grid-cols-3
            "
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} {...testimonial} />
            ))}
          </div>
        </div>

        <ContactCta />
      </div>
    </section>
  );
}
