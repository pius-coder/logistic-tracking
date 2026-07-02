import {
  Target,
  Eye,
  Shield,
  Zap,
  Globe,
  FileCheck,
} from "lucide-react";
import { USE_CASES } from "./landing-data";

const VALUE_ICONS = {
  "Notre mission": Target,
  "Notre vision": Eye,
  "Sécurité avant tout": Shield,
  "Rapide et agile": Zap,
  "Expertise mondiale": Globe,
  "Dédouanement intégré": FileCheck,
} as const;

export function Benefits() {
  return (
    <section className="flex w-full flex-col items-center gap-[80px] px-5 pt-[100px] min-[810px]:gap-20 min-[810px]:px-10 min-[810px]:pt-[140px] min-[1200px]:pt-[180px]">
      <div className="flex w-full max-w-[600px] flex-col items-center gap-5 text-center">
        <span className="font-display text-sm font-semibold tracking-[-0.02em] text-yellow-400">
          À propos de JC Import Express
        </span>
        <h2 className="font-display text-[38px] font-bold leading-none tracking-[-0.05em] min-[810px]:text-5xl min-[1200px]:text-[60px]">
          Votre partenaire de confiance en{" "}
          <span className="font-instrument font-normal italic">solutions logistiques</span>{" "}
          mondiales.
        </h2>
        <p className="font-display text-base leading-[1.4] tracking-[-0.01em] text-[#0a192f]/65 min-[810px]:text-lg min-[1200px]:text-xl">
          Fondée en 2010, JC Import Express est devenue un leader mondial de la
          logistique. Notre réseau couvre plus de 150 pays, porté par une équipe de
          5 000+ professionnels dédiés à vos marchandises.
        </p>
      </div>

      <div className="grid w-full max-w-[1200px] grid-cols-1 gap-5 min-[810px]:grid-cols-2 min-[1200px]:grid-cols-3">
        {USE_CASES.map((item) => {
          const Icon = VALUE_ICONS[item.title as keyof typeof VALUE_ICONS];

          return (
        <div
  key={item.title}
  className="
    flex flex-col gap-5 p-10 rounded-[30px]

    bg-[#f6f6f6]

    /* BORDER TEXTURE MACOS */
    border border-white/40

    ring-1 ring-black/10

    shadow-[0_0_0_1px_rgba(255,255,255,0.9),0_0_0_2px_rgba(0,0,0,0.08),0_10px_30px_-12px_rgba(0,0,0,0.25),0_30px_60px_-25px_rgba(0,0,0,0.2)]

    /* subtle inner highlight like macOS window edge */
    before:content-['']
    before:absolute
    before:inset-0
    before:rounded-[30px]
    before:pointer-events-none
    before:shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.08),inset_1px_0_0_rgba(255,255,255,0.6),inset_-1px_0_0_rgba(0,0,0,0.05)]

    relative
  "
>
  <span
    className="
      flex size-16 items-center justify-center
      rounded-[30px]
      bg-white

      shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_10px_rgba(0,0,0,0.08)]
      ring-1 ring-black/5
    "
  >
    <Icon
      className="size-8 text-zinc-500"
      strokeWidth={1.7}
      aria-hidden="true"
    />
  </span>

  <h3 className="font-display text-lg font-bold leading-[1.1] tracking-[-0.03em] min-[810px]:text-xl min-[1200px]:text-2xl">
    {item.title}
  </h3>

  <p className="font-display text-sm leading-[1.4] tracking-[-0.01em] text-[#0a192f]/65">
    {item.description}
  </p>
</div>
          );
        })}
      </div>
    </section>
  );
}
