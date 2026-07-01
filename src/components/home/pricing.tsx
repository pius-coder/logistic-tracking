import { Phone, Mail, MapPin, Send } from "lucide-react";
import { SectionHeading } from "./ui";

export function Pricing() {
  return (
    <section
      id="contact"
      className="flex w-full flex-col items-center gap-10 px-5 pt-[100px] min-[810px]:gap-16 min-[810px]:px-10 min-[810px]:pt-[140px] min-[1200px]:pt-[180px]"
    >
      <SectionHeading
        title="Obtenez un devis"
        description="Que vous ayez besoin d'une expédition ponctuelle ou d'un partenaire logistique complet, notre équipe est prête à concevoir une solution adaptée à vos besoins."
      />

      <div className="flex w-full max-w-[900px] flex-col gap-8 min-[810px]:flex-row">
        <div className="flex w-full flex-col gap-6 rounded-[30px] bg-[#f7f7f7] p-8 min-[810px]:w-1/2">
          <h3 className="font-display text-[20px] font-bold leading-[22px] tracking-[-1px] text-black">
            Contactez-nous
          </h3>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-[12px] bg-white">
                <MapPin className="size-5 text-[#006fff]" strokeWidth={1.5} />
              </div>
              <div>
                <span className="font-display text-[13px] font-semibold leading-[18px] text-black/60">
                  Siège social
                </span>
                <p className="font-display text-[14px] leading-[19px] text-black">
                  Wyoming, États-Unis
                </p>
              </div>
            </div>
            <a
              href="tel:+14122273484"
              className="flex items-center gap-3 group"
            >
              <div className="flex size-10 items-center justify-center rounded-[12px] bg-white">
                <Phone className="size-5 text-[#006fff]" strokeWidth={1.5} />
              </div>
              <div>
                <span className="font-display text-[13px] font-semibold leading-[18px] text-black/60">
                  Téléphone
                </span>
                <p className="font-display text-[14px] leading-[19px] text-black group-hover:text-[#006fff]">
                  +1 (412) 227-3484
                </p>
              </div>
            </a>
            <a
              href="mailto:support@nexttracelogistics.com"
              className="flex items-center gap-3 group"
            >
              <div className="flex size-10 items-center justify-center rounded-[12px] bg-white">
                <Mail className="size-5 text-[#006fff]" strokeWidth={1.5} />
              </div>
              <div>
                <span className="font-display text-[13px] font-semibold leading-[18px] text-black/60">
                  Email
                </span>
                <p className="font-display text-[14px] leading-[19px] text-black group-hover:text-[#006fff]">
                  support@nexttracelogistics.com
                </p>
              </div>
            </a>
          </div>
          <div className="mt-2 rounded-[16px] bg-white p-4">
            <p className="font-display text-[12px] leading-[16px] text-black/50">
              Lundi au vendredi : 8h – 20h HNE
              <br />
              Support tracking : 24h/24, 7j/7
            </p>
          </div>
        </div>

        <form className="flex w-full flex-col gap-4 min-[810px]:w-1/2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-display text-[12px] font-semibold leading-[16px] text-black/60">
                Prénom
              </label>
              <input
                type="text"
                placeholder="John"
                className="w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 font-display text-[14px] text-black outline-none placeholder:text-black/30 focus:border-[#006fff]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-display text-[12px] font-semibold leading-[16px] text-black/60">
                Nom
              </label>
              <input
                type="text"
                placeholder="Smith"
                className="w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 font-display text-[14px] text-black outline-none placeholder:text-black/30 focus:border-[#006fff]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display text-[12px] font-semibold leading-[16px] text-black/60">
              Email
            </label>
            <input
              type="email"
              placeholder="john@company.com"
              className="w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 font-display text-[14px] text-black outline-none placeholder:text-black/30 focus:border-[#006fff]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display text-[12px] font-semibold leading-[16px] text-black/60">
              Téléphone
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 font-display text-[14px] text-black outline-none placeholder:text-black/30 focus:border-[#006fff]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display text-[12px] font-semibold leading-[16px] text-black/60">
              Service souhaité
            </label>
            <select className="w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 font-display text-[14px] text-black outline-none focus:border-[#006fff]">
              <option>Sélectionnez un service...</option>
              <option>Fret aérien</option>
              <option>Fret maritime</option>
              <option>Transport terrestre</option>
              <option>Messagerie express</option>
              <option>Entreposage</option>
              <option>Cargaison spécialisée</option>
              <option>Transport d&apos;animaux</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display text-[12px] font-semibold leading-[16px] text-black/60">
              Message
            </label>
            <textarea
              rows={3}
              placeholder="Décrivez vos besoins d'expédition..."
              className="w-full resize-none rounded-[12px] border border-black/10 bg-white px-4 py-3 font-display text-[14px] text-black outline-none placeholder:text-black/30 focus:border-[#006fff]"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-[14px] bg-[#006fff] px-6 py-3.5 font-display text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Send className="size-4" strokeWidth={2} />
            Envoyer la demande
          </button>
        </form>
      </div>
    </section>
  );
}
