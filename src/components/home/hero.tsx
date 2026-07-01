import { Search } from "lucide-react";

export function Hero() {
  return (
    <section
      id="hero"
      className="
        relative
        isolate
        min-h-[980px]
        w-full
        overflow-hidden
        bg-[#07143f]

        min-[810px]:min-h-[940px]

        min-[1200px]:h-[100svh]
        min-[1200px]:min-h-[850px]
        min-[1200px]:max-h-[980px]
      "
    >
      <picture className="absolute inset-0 -z-30 block">
        <source
          media="(min-width: 810px)"
          srcSet="/images/hero-logistics.png"
        />
        <img
          src="/images/hero-mobile-logistics.png"
          alt=""
          draggable={false}
          className="
            h-full
            w-full
            select-none
            object-cover
            object-bottom

            min-[810px]:object-[center_bottom]
          "
        />
      </picture>

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-20

          bg-[linear-gradient(180deg,rgba(7,15,58,0.58)_0%,rgba(18,57,201,0.26)_28%,rgba(47,124,255,0.08)_55%,transparent_76%)]

          min-[810px]:bg-[linear-gradient(180deg,rgba(7,15,58,0.58)_0%,rgba(18,57,201,0.28)_30%,rgba(47,124,255,0.06)_58%,transparent_78%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-[170px]
          -z-10
          h-[430px]
          w-[115%]
          max-w-[1000px]
          -translate-x-1/2
          rounded-full
          bg-[#1e73ff]/15
          blur-[110px]

          min-[810px]:top-[130px]
          min-[1200px]:top-[100px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          z-[1]
          h-20
          bg-gradient-to-b
          from-transparent
          to-black/10
        "
      />

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          w-full
          max-w-[1200px]
          flex-col
          items-center

          px-5
          pt-[145px]

          min-[430px]:pt-[150px]

          min-[810px]:px-10
          min-[810px]:pt-[130px]

          min-[1200px]:pt-[115px]
        "
      >
        <div
          className="
            flex
            w-full
            max-w-[680px]
            flex-col
            items-center
            gap-5
            text-center
            text-white
          "
        >
          <div className="flex flex-col items-center">
            <h1
              className="
                font-display
                text-[40px]
                font-bold
                leading-[0.96]
                tracking-[-0.055em]

                min-[390px]:text-[43px]
                min-[430px]:text-[48px]

                min-[810px]:whitespace-nowrap
                min-[810px]:text-[68px]

                min-[1200px]:text-[76px]
              "
            >
              Logistique globale.
            </h1>

            <p
              className="
                font-instrument
                text-[38px]
                font-normal
                italic
                leading-[1]
                tracking-[-0.055em]

                min-[390px]:text-[40px]
                min-[430px]:text-[46px]

                min-[810px]:whitespace-nowrap
                min-[810px]:text-[66px]

                min-[1200px]:text-[74px]
              "
            >
              Confiance absolue.
            </p>
          </div>

          <p
            className="
              max-w-[610px]
              font-display
              text-base
              font-normal
              leading-[1.55]
              tracking-[-0.01em]
              text-white/85

              min-[810px]:text-lg
              min-[1200px]:text-xl
            "
          >
            Du fret aérien à la livraison du dernier kilomètre, nous
            concevons des solutions logistiques transparentes qui
            connectent les entreprises dans plus de 150 pays avec
            rapidité et fiabilité.
          </p>

          <div
            className="
              mt-2
              flex
              w-full
              max-w-[460px]
              items-center
              justify-center
              gap-0
              border-b
              border-white/30
              pb-2

              focus-within:border-white/60
            "
          >
            <Search
              aria-hidden="true"
              className="size-5 shrink-0 text-white/60"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Entrez votre numéro de suivi"
              className="
                w-full
                bg-transparent
                px-3
                py-2
                font-display
                text-base
                text-white
                placeholder-white/50
                outline-none
              "
            />
            <button
              type="button"
              className="
                shrink-0
                rounded-[10px]
                bg-white
                px-5
                py-2
                font-display
                text-sm
                font-semibold
                text-[#07143f]
                transition-transform
                duration-200

                hover:scale-[1.03]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white
                focus-visible:ring-offset-2
                focus-visible:ring-offset-transparent
              "
            >
              Suivre
            </button>
          </div>

          <div
            className="
              flex
              w-full
              max-w-[540px]
              flex-wrap
              items-center
              justify-center
              gap-x-5
              gap-y-1
              font-display
              text-xs
              leading-[1.6]
              text-white/70

              max-[430px]:max-w-[340px]
            "
          >
            <span>150+ pays desservis</span>
            <span>50 000+ expéditions / mois</span>
            <span>99,8 % livrés à l&apos;heure</span>
            <span>15+ ans d&apos;excellence</span>
          </div>
        </div>
      </div>
    </section>
  );
}
