import {
  ChevronDown,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";

import { SectionHeading } from "./ui";

const LABEL_CLASS =
  "font-display text-[12px] font-semibold leading-4 tracking-[-0.01em] text-[#0a192f]/62";

const FIELD_CLASS =
  "h-[52px] w-full rounded-[14px] border border-black/[0.09] bg-[#faf9f6] px-4 font-display text-[14px] font-medium tracking-[-0.012em] text-[#0a192f] outline-none ring-0 shadow-[0_1px_2px_rgba(15,23,42,0.035),inset_0_1px_0_rgba(255,255,255,0.95)] transition-[border-color,background-color,box-shadow] duration-200 placeholder:font-normal placeholder:text-[#0a192f]/28 hover:border-black/[0.14] focus:border-[#0a192f]/25 focus:bg-white focus:ring-4 focus:ring-[#0a192f]/10";

export function Pricing() {
  return (
    <section
      id="contact"
      className="
        relative flex w-full flex-col items-center
        overflow-hidden bg-[#f5f4f0]
        px-5 py-[100px]
        min-[810px]:px-10 min-[810px]:py-[140px]
        min-[1200px]:py-[180px]
      "
    >
      {/* Hairline supérieure */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-black/[0.055]"
      />

      {/* Éclairage neutre et discret */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute left-1/2 top-0
          h-[520px] w-[900px] -translate-x-1/2
          rounded-full bg-white/60 blur-[130px]
        "
      />

      <div className="relative z-10 flex w-full max-w-[1100px] flex-col items-center gap-12 min-[810px]:gap-16">
        <div className="w-full max-w-[720px]">
          <SectionHeading
            title="Obtenez un devis"
            description="Que vous ayez besoin d'une expédition ponctuelle ou d'un partenaire logistique complet, notre équipe conçoit une solution adaptée à vos opérations."
          />
        </div>

        {/* Cadre général */}
        <div
          className="
            relative isolate w-full overflow-hidden
            rounded-[38px] border border-black/[0.075]
            bg-[#e9e8e3] p-2
            ring-1 ring-white/90
            shadow-[0_0_0_1px_rgba(255,255,255,0.38),0_2px_4px_rgba(15,23,42,0.045),0_30px_80px_-48px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.9)]
            min-[810px]:p-2.5
          "
        >
          {/* Reflet du cadre */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-px rounded-[37px]
              shadow-[inset_1px_0_0_rgba(255,255,255,0.55),inset_-1px_0_0_rgba(15,23,42,0.025),inset_0_1px_0_rgba(255,255,255,0.75)]
            "
          />

          <div
            className="
              relative z-10 grid overflow-hidden
              rounded-[30px] border border-black/[0.075]
              bg-[#fbfaf7]
              shadow-[0_1px_2px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,1)]
              min-[810px]:grid-cols-[0.88fr_1.12fr]
            "
          >
            {/* Panneau contact */}
            <aside
              className="
                relative isolate flex flex-col overflow-hidden
                bg-[#091827] p-7 text-white
                min-[810px]:p-9
                min-[1200px]:p-11
              "
              aria-label="Coordonnées de contact"
            >
              {/* Matière sombre */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none absolute inset-0
                  bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.095),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.025)_0%,transparent_45%,rgba(0,0,0,0.13)_100%)]
                "
              />

              <div
                aria-hidden="true"
                className="
                  pointer-events-none absolute inset-px rounded-[29px]
                  shadow-[inset_1px_0_0_rgba(255,255,255,0.035),inset_0_1px_0_rgba(255,255,255,0.07),inset_-1px_0_0_rgba(0,0,0,0.15)]
                "
              />

              <div className="relative z-10 flex h-full flex-col">
                <div>
                  
                  <h3
                    className="
                      mt-6 max-w-[390px]
                      font-display text-[28px] font-bold
                      leading-[1.05] tracking-[-0.047em]
                      text-white
                      min-[810px]:text-[32px]
                    "
                  >
                    Échangez directement avec notre équipe logistique.
                  </h3>

                  <p
                    className="
                      mt-4 max-w-[390px]
                      font-display text-[14px] leading-[1.7]
                      tracking-[-0.01em] text-white/55
                    "
                  >
                    Nous analysons votre itinéraire, vos délais et vos
                    contraintes afin de vous proposer une réponse claire et
                    exploitable.
                  </p>
                </div>

                <address className="mt-9 flex flex-col not-italic">
                  {/* Localisation */}
                  <div className="flex items-center gap-4 border-b border-white/[0.08] py-5 first:pt-0">
                    <div
                      className="
                        flex size-11 shrink-0 items-center justify-center
                        rounded-[14px] border border-white/[0.09]
                        bg-white/[0.055] text-[#d0aa61]
                        shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.07)]
                      "
                    >
                      <MapPin
                        className="size-[19px]"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-display text-[11px] font-semibold uppercase tracking-[0.11em] text-white/34">
                        Siège social
                      </span>

                      <span className="font-display text-[14px] font-medium tracking-[-0.01em] text-white/82">
                        Wyoming, États-Unis
                      </span>
                    </div>
                  </div>

                  {/* Téléphone */}
                  <a
                    href="tel:+14122273484"
                    className="
                      group flex items-center gap-4
                      border-b border-white/[0.08] py-5
                      outline-none
                      focus-visible:rounded-[14px]
                      focus-visible:ring-2 focus-visible:ring-white/25
                    "
                  >
                    <div
                      className="
                        flex size-11 shrink-0 items-center justify-center
                        rounded-[14px] border border-white/[0.09]
                        bg-white/[0.055] text-[#d0aa61]
                        shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.07)]
                        transition-[background-color,border-color]
                        group-hover:border-white/[0.15]
                        group-hover:bg-white/[0.08]
                      "
                    >
                      <Phone
                        className="size-[19px]"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-display text-[11px] font-semibold uppercase tracking-[0.11em] text-white/34">
                        Téléphone
                      </span>

                      <span className="font-display text-[14px] font-medium tracking-[-0.01em] text-white/82 transition-colors group-hover:text-white">
                        +1 (412) 227-3484
                      </span>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:support@nexttracelogistics.com"
                    className="
                      group flex items-center gap-4 py-5
                      outline-none
                      focus-visible:rounded-[14px]
                      focus-visible:ring-2 focus-visible:ring-white/25
                    "
                  >
                    <div
                      className="
                        flex size-11 shrink-0 items-center justify-center
                        rounded-[14px] border border-white/[0.09]
                        bg-white/[0.055] text-[#d0aa61]
                        shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.07)]
                        transition-[background-color,border-color]
                        group-hover:border-white/[0.15]
                        group-hover:bg-white/[0.08]
                      "
                    >
                      <Mail
                        className="size-[19px]"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="flex min-w-0 flex-col gap-1 overflow-hidden">
                      <span className="font-display text-[11px] font-semibold uppercase tracking-[0.11em] text-white/34">
                        Email
                      </span>

                      <span className="truncate font-display text-[14px] font-medium tracking-[-0.01em] text-white/82 transition-colors group-hover:text-white">
                        support@nexttracelogistics.com
                      </span>
                    </div>
                  </a>
                </address>

                {/* Disponibilité */}
                <div
                  className="
                    relative mt-auto overflow-hidden rounded-[20px]
                    border border-white/[0.09]
                    bg-white/[0.05] p-4
                    shadow-[0_1px_2px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.065)]
                  "
                >
                  <div className="flex items-start gap-3">
                    <Clock3
                      className="mt-0.5 size-[17px] shrink-0 text-[#d0aa61]"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />

                    <div className="flex flex-col gap-1.5">
                      <span className="font-display text-[12px] font-semibold text-white/72">
                        Disponibilité
                      </span>

                      <p className="font-display text-[12px] leading-[1.55] text-white/42">
                        Lundi au vendredi : 8h–20h HNE
                        <br />
                        Support de suivi : 24h/24, 7j/7
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Formulaire */}
            <form
              className="
                flex w-full flex-col
                bg-[#fbfaf7] p-7
                min-[810px]:p-9
                min-[1200px]:p-11
              "
            >
              <div className="border-b border-black/[0.065] pb-7">
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.15em] text-[#0a192f]/38">
                  Demande personnalisée
                </span>

                <h3
                  className="
                    mt-3 font-display
                    text-[24px] font-bold leading-[1.1]
                    tracking-[-0.04em] text-[#0a192f]
                    min-[810px]:text-[28px]
                  "
                >
                  Parlez-nous de votre expédition.
                </h3>

                <p
                  className="
                    mt-3 max-w-[520px]
                    font-display text-[13px] leading-[1.65]
                    tracking-[-0.008em] text-[#0a192f]/52
                  "
                >
                  Renseignez les informations essentielles. Notre équipe
                  pourra ainsi préparer une proposition adaptée à votre besoin.
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-5">
                {/* Prénom / Nom */}
                <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="quote-first-name" className={LABEL_CLASS}>
                      Prénom
                    </label>

                    <input
                      id="quote-first-name"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      placeholder="John"
                      required
                      className={FIELD_CLASS}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="quote-last-name" className={LABEL_CLASS}>
                      Nom
                    </label>

                    <input
                      id="quote-last-name"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Smith"
                      required
                      className={FIELD_CLASS}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="quote-email" className={LABEL_CLASS}>
                    Adresse email
                  </label>

                  <input
                    id="quote-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="john@company.com"
                    required
                    className={FIELD_CLASS}
                  />
                </div>

                {/* Téléphone */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="quote-phone" className={LABEL_CLASS}>
                    Téléphone
                    <span className="ml-1 font-normal text-[#0a192f]/32">
                      — facultatif
                    </span>
                  </label>

                  <input
                    id="quote-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+1 (555) 000-0000"
                    className={FIELD_CLASS}
                  />
                </div>

                {/* Service */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="quote-service" className={LABEL_CLASS}>
                    Service souhaité
                  </label>

                  <div className="relative">
                    <select
                      id="quote-service"
                      name="service"
                      required
                      defaultValue=""
                      className={`${FIELD_CLASS} appearance-none pr-12`}
                    >
                      <option value="" disabled>
                        Sélectionnez un service
                      </option>
                      <option value="air-freight">Fret aérien</option>
                      <option value="sea-freight">Fret maritime</option>
                      <option value="ground-transport">
                        Transport terrestre
                      </option>
                      <option value="express-delivery">
                        Messagerie express
                      </option>
                      <option value="warehousing">Entreposage</option>
                      <option value="specialized-cargo">
                        Cargaison spécialisée
                      </option>
                      <option value="animal-transport">
                        Transport d&apos;animaux
                      </option>
                    </select>

                    <ChevronDown
                      className="
                        pointer-events-none absolute right-4 top-1/2
                        size-[17px] -translate-y-1/2
                        text-[#0a192f]/35
                      "
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="quote-message" className={LABEL_CLASS}>
                    Détails de l&apos;expédition
                  </label>

                  <textarea
                    id="quote-message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Origine, destination, type de marchandise, poids, dimensions et délai souhaité..."
                    className="
                      min-h-[136px] w-full resize-y
                      rounded-[14px] border border-black/[0.09]
                      bg-[#faf9f6] px-4 py-3.5
                      font-display text-[14px] font-medium
                      leading-[1.6] tracking-[-0.012em]
                      text-[#0a192f] outline-none
                      shadow-[0_1px_2px_rgba(15,23,42,0.035),inset_0_1px_0_rgba(255,255,255,0.95)]
                      transition-[border-color,background-color,box-shadow]
                      duration-200
                      placeholder:font-normal
                      placeholder:text-[#0a192f]/28
                      hover:border-black/[0.14]
                      focus:border-[#0a192f]/25
                      focus:bg-white
                      focus:ring-4
                      focus:ring-[#0a192f]/10
                    "
                  />
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-4 border-t border-black/[0.065] pt-6">
                <button
                  type="submit"
                  className="
                    group flex min-h-[54px] w-full
                    items-center justify-center gap-2.5
                    rounded-[16px]
                    border border-[#061321]
                    bg-[#091827] px-6
                    font-display text-[14px] font-semibold
                    tracking-[-0.015em] text-white
                    ring-1 ring-white/10
                    shadow-[0_1px_2px_rgba(0,0,0,0.22),0_14px_28px_-17px_rgba(9,24,39,0.65),inset_0_1px_0_rgba(255,255,255,0.13),inset_0_-1px_0_rgba(0,0,0,0.3)]
                    transition-[transform,background-color,box-shadow]
                    duration-200 ease-out
                    hover:-translate-y-0.5
                    hover:bg-[#102940]
                    hover:shadow-[0_2px_4px_rgba(0,0,0,0.23),0_20px_34px_-18px_rgba(9,24,39,0.75),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.32)]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#0a192f]/30
                    focus-visible:ring-offset-2
                    active:translate-y-0
                  "
                >
                  <Send
                    className="
                      size-[17px]
                      transition-transform duration-200
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />

                  Envoyer la demande
                </button>

                <div className="flex items-start justify-center gap-2">
                  <ShieldCheck
                    className="mt-px size-[14px] shrink-0 text-[#0a192f]/32"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />

                  <p
                    id="quote-privacy"
                    className="
                      max-w-[440px] text-center
                      font-display text-[11px] leading-[1.5]
                      text-[#0a192f]/38
                    "
                  >
                    Vos informations sont utilisées uniquement pour traiter
                    votre demande de devis.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}