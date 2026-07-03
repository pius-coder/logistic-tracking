import {
  ArrowRight,
  PackageSearch,
  ShieldCheck,
} from "lucide-react";
import type { HeroContent } from "./types";

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section
      id="hero"
      className="
        relative isolate flex min-h-[920px] w-full
        overflow-hidden bg-[#06101f]
        min-[810px]:min-h-[900px]
        min-[1200px]:h-[100svh]
        min-[1200px]:min-h-[850px]
        min-[1200px]:max-h-[980px]
      "
    >
      {/* Image de fond */}
      <picture className="absolute inset-0 -z-30 block">
        <source
          media="(min-width: 810px)"
          srcSet={content.desktopImage}
        />

        <img
          src={content.mobileImage}
          alt=""
          draggable={false}
          className="
            size-full select-none object-cover
            object-[center_bottom]
            min-[810px]:object-[center_bottom]
          "
        />
      </picture>

      {/* Assombrissement principal */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-20
          bg-[linear-gradient(180deg,rgba(3,10,23,0.88)_0%,rgba(5,17,37,0.67)_33%,rgba(7,26,54,0.28)_61%,rgba(3,10,20,0.08)_78%,rgba(3,8,16,0.30)_100%)]
        "
      />

      {/* Lumière centrale */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute left-1/2 top-[90px]
          -z-10 h-[520px] w-[1050px]
          -translate-x-1/2 rounded-full
          bg-[#2e6fb4]/[0.13] blur-[130px]
        "
      />

      {/* Vignette latérale */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-10
          bg-[radial-gradient(circle_at_center,transparent_25%,rgba(2,8,18,0.18)_72%,rgba(2,7,15,0.46)_100%)]
        "
      />

      {/* Hairline supérieure */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-x-0 top-0 z-20
          h-px bg-white/[0.08]
        "
      />

      {/* Transition basse */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-x-0 bottom-0 z-[2]
          h-36
          bg-[linear-gradient(180deg,transparent_0%,rgba(3,9,18,0.18)_55%,rgba(3,9,18,0.42)_100%)]
        "
      />

      <div
        className="
          relative z-10 mx-auto flex w-full max-w-[1200px]
          flex-col items-center
          px-5 pb-16 pt-[132px]
          min-[810px]:px-10
          min-[810px]:pb-20
          min-[810px]:pt-[120px]
          min-[1200px]:justify-center
          min-[1200px]:pb-24
          min-[1200px]:pt-[105px]
        "
      >
        <div
          className="
            flex w-full max-w-[780px]
            flex-col items-center text-center
          "
        >
          {/* Badge */}
          <div
            className="
              inline-flex items-center gap-2.5
              rounded-full border border-white/[0.11]
              bg-white/[0.055] px-4 py-2.5
              font-display text-[10px] font-bold
              uppercase tracking-[0.18em]
              text-white/62
              shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]
              backdrop-blur-xl
            "
          >
            <span
              className="
                size-1.5 rounded-full bg-[#d0a65c]
                shadow-[0_0_0_4px_rgba(208,166,92,0.10)]
              "
            />

            {content.badge}
          </div>

          {/* Titre */}
          <h1
            className="
              mt-7 max-w-[780px]
              font-display text-[44px] font-bold
              leading-[0.95] tracking-[-0.062em]
              text-white
              min-[390px]:text-[48px]
              min-[430px]:text-[53px]
              min-[810px]:text-[72px]
              min-[1200px]:text-[82px]
            "
          >
            {content.title}
            <span
              className="
                mt-1 block font-instrument
                font-normal italic tracking-[-0.052em]
                text-white/66
              "
            >
              {content.accent}
            </span>
          </h1>

          {/* Description */}
          <p
            className="
              mt-7 max-w-[660px]
              font-display text-[16px]
              leading-[1.65] tracking-[-0.015em]
              text-white/64
              min-[810px]:text-[18px]
              min-[1200px]:text-[19px]
            "
          >
            {content.description}
          </p>

          {/* Formulaire de tracking */}
          <form
            action="/voyage"
            method="get"
            className="
              relative mt-9 w-full max-w-[650px]
              overflow-hidden rounded-[26px]
              border border-white/[0.12]
              bg-[#091827]/75 p-2
              ring-1 ring-black/25
              shadow-[0_2px_5px_rgba(0,0,0,0.28),0_28px_75px_-38px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.09)]
              backdrop-blur-2xl
            "
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute inset-px
                rounded-[25px]
                shadow-[inset_1px_0_0_rgba(255,255,255,0.025),inset_-1px_0_0_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.055)]
              "
            />

            <div
              className="
                relative z-10 flex flex-col gap-2
                min-[560px]:flex-row
              "
            >
              <label
                className="
                  group flex min-h-[58px] min-w-0 flex-1
                  items-center gap-3.5 rounded-[18px]
                  border border-white/[0.09]
                  bg-white/[0.07] px-4
                  shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.055)]
                  transition-[border-color,background-color,box-shadow]
                  duration-200
                  hover:bg-white/[0.085]
                  focus-within:border-white/[0.20]
                  focus-within:bg-white/[0.10]
                  focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.07)]
                "
              >
                <PackageSearch
                  className="
                    size-5 shrink-0 text-white/42
                    transition-colors duration-200
                    group-focus-within:text-white/72
                  "
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

                <span className="sr-only">
                  Numéro de suivi de l&apos;expédition
                </span>

                <input
                  type="text"
                  name="tracking"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={content.trackingPlaceholder}
                  className="
                    min-w-0 flex-1 bg-transparent
                    font-display text-[14px] font-medium
                    tracking-[-0.01em] text-white
                    outline-none
                    placeholder:font-normal
                    placeholder:text-white/32
                    min-[810px]:text-[15px]
                  "
                />
              </label>

              <button
                type="submit"
                className="
                  group flex min-h-[58px] shrink-0
                  items-center justify-center gap-2.5
                  rounded-[18px]
                  border border-white/90
                  bg-[#f7f5ef] px-7
                  font-display text-[14px] font-bold
                  tracking-[-0.015em] text-[#071423]
                  ring-1 ring-black/20
                  shadow-[0_1px_2px_rgba(0,0,0,0.24),0_14px_28px_-17px_rgba(0,0,0,0.80),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(7,20,35,0.08)]
                  transition-[transform,background-color,box-shadow]
                  duration-200 ease-out
                  hover:-translate-y-0.5
                  hover:bg-white
                  hover:shadow-[0_2px_4px_rgba(0,0,0,0.25),0_20px_34px_-18px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(255,255,255,1)]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white/70
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#091827]
                  active:translate-y-0
                "
              >
                {content.trackingButton}

                <ArrowRight
                  className="
                    size-4 transition-transform duration-200
                    group-hover:translate-x-0.5
                  "
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            </div>
          </form>

          {/* Réassurance */}
          <div
            className="
              mt-4 flex items-center justify-center gap-2
              font-display text-[11px]
              tracking-[-0.005em] text-white/34
            "
          >
            <ShieldCheck
              className="size-[14px] text-[#d0a65c]/75"
              strokeWidth={1.7}
              aria-hidden="true"
            />

            Suivi sécurisé, actualisé à chaque étape du transport
          </div>

          {/* Statistiques */}
          <div
            className="
              mt-10 grid w-full max-w-[760px]
              grid-cols-2 overflow-hidden
              rounded-[26px]
              border border-white/[0.09]
              bg-[#071525]/55
              ring-1 ring-black/20
              shadow-[0_1px_2px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.055)]
              backdrop-blur-xl
              min-[810px]:grid-cols-4
            "
          >
            {content.stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`
                  relative flex min-h-[94px]
                  flex-col items-center justify-center
                  px-3 py-5 text-center
                  min-[810px]:min-h-[104px]
                  ${
                    index % 2 === 0
                      ? "border-r border-white/[0.075]"
                      : ""
                  }
                  ${
                    index < 2
                      ? "border-b border-white/[0.075] min-[810px]:border-b-0"
                      : ""
                  }
                  ${
                    index > 0
                      ? "min-[810px]:border-l min-[810px]:border-white/[0.075]"
                      : ""
                  }
                `}
              >
                <span
                  className="
                    font-display text-[23px] font-bold
                    leading-none tracking-[-0.045em]
                    text-white
                    min-[810px]:text-[28px]
                  "
                >
                  {stat.value}
                </span>

                <span
                  className="
                    mt-2 font-display text-[10px]
                    font-semibold uppercase
                    leading-[1.4] tracking-[0.10em]
                    text-white/32
                    min-[810px]:text-[11px]
                  "
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
