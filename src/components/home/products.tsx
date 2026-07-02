import Link from "next/link";
import Image from "next/image";
import { PRODUCTS, XAF_TO_USD_RATE } from "./landing-data";

function formatXAF(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function Products() {
  return (
    <section
      id="products"
      className="
        relative flex w-full flex-col
        items-center overflow-hidden
        bg-[#f5f4f0]
        px-5 py-[100px]
        min-[810px]:px-10 min-[810px]:py-[140px]
        min-[1200px]:py-[180px]
      "
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-black/[0.055]"
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute left-1/2 top-0
          h-[520px] w-[900px] -translate-x-1/2
          rounded-full bg-white/60 blur-[130px]
        "
      />

      <div className="relative z-10 flex w-full max-w-[1200px] flex-col items-center gap-12 min-[810px]:gap-16">
        <header className="flex max-w-[650px] flex-col items-center gap-5 text-center">
          <span className="font-display text-sm font-semibold tracking-[-0.02em] text-yellow-400">
            Nos Produits
          </span>
          <h2 className="font-display text-[38px] font-bold leading-none tracking-[-0.05em] min-[810px]:text-5xl min-[1200px]:text-[60px]">
            Solutions logistiques adaptées à{" "}
            <span className="font-instrument font-normal italic">vos besoins</span>
          </h2>
          <p className="font-display text-base leading-[1.4] tracking-[-0.01em] text-[#0a192f]/65 min-[810px]:text-lg min-[1200px]:text-xl">
            Des tarifs transparents et compétitifs pour toutes vos expéditions,
            du petit colis au conteneur complet.
          </p>
        </header>

        <div className="grid w-full grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[1200px]:grid-cols-3">
          {PRODUCTS.map((product) => {
            const usdPrice = product.priceXAF / XAF_TO_USD_RATE;
            const avgRating = product.reviews.length
              ? product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length
              : 0;

            return (
              <Link
                key={product.id}
                href={`/produits/${product.slug}`}
                className="group relative isolate flex w-full flex-col overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,247,245,0.98)_52%,rgba(239,239,236,0.98)_100%)] ring-1 ring-black/[0.07] shadow-[0_0_0_1px_rgba(255,255,255,0.48),0_1px_2px_rgba(15,23,42,0.06),0_14px_38px_-24px_rgba(15,23,42,0.34),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.05)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.65),0_2px_4px_rgba(15,23,42,0.06),0_24px_55px_-28px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.06)]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[1px] rounded-[29px] shadow-[inset_1px_0_0_rgba(255,255,255,0.7),inset_-1px_0_0_rgba(15,23,42,0.025),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(15,23,42,0.045)]"
                />

                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(10,25,47,0.12)_100%)]"
                  />
                  <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 backdrop-blur-md">
                    <span className="text-[11px] font-semibold text-white">{product.likes}</span>
                    <span className="text-[11px] text-white/70">♥</span>
                  </div>
                </div>

                <div className="relative z-10 flex flex-1 flex-col gap-3 p-[30px] min-[810px]:p-10">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          viewBox="0 0 20 20"
                          className={`h-3.5 w-3.5 ${i < Math.round(avgRating) ? "text-yellow-500" : "text-gray-300"}`}
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-[#0a192f]/45">
                      ({product.reviews.length})
                    </span>
                  </div>

                  <h3 className="font-display text-[22px] font-bold leading-[1.05] tracking-[-0.04em] text-[#0a192f] min-[810px]:text-[24px]">
                    {product.name}
                  </h3>

                  <p className="font-display text-[14px] leading-[1.65] tracking-[-0.01em] text-[#0a192f]/60 min-[810px]:text-[15px]">
                    {product.shortDescription}
                  </p>

                  <div className="mt-auto flex flex-col gap-1 pt-4">
                    <span className="font-display text-[28px] font-bold tracking-[-0.05em] text-[#0a192f]">
                      {formatXAF(product.priceXAF)} FCFA
                    </span>
                    <span className="font-display text-[13px] font-medium tracking-[-0.01em] text-[#0a192f]/45">
                      ~ {formatUSD(usdPrice)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
