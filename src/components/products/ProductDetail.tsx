import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, MapPin } from "lucide-react";
import type { ProductTestimonialView, ProductView } from "@/features/catalog/types";

function formatXAF(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`${sizeClass} ${i < Math.round(rating) ? "text-yellow-500" : "text-gray-300"}`}
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function initialsFor(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ReviewCard({ review }: { review: ProductTestimonialView }) {
  return (
    <div className="group relative isolate flex flex-col gap-4 overflow-hidden rounded-[26px] border border-black/[0.07] bg-[#f7f6f2] p-6 ring-1 ring-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.42),0_1px_2px_rgba(15,23,42,0.05),0_18px_45px_-30px_rgba(15,23,42,0.30),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(15,23,42,0.04)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-black/[0.10] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.55),0_2px_4px_rgba(15,23,42,0.06),0_28px_60px_-34px_rgba(15,23,42,0.40),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.05)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-px rounded-[25px] shadow-[inset_1px_0_0_rgba(255,255,255,0.62),inset_-1px_0_0_rgba(15,23,42,0.025),inset_0_1px_0_rgba(255,255,255,0.82),inset_0_-1px_0_rgba(15,23,42,0.04)]" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#152841] bg-[#0a192f] font-display text-[10px] font-bold uppercase tracking-[0.05em] text-white/85 ring-1 ring-white/30 shadow-[0_1px_2px_rgba(15,23,42,0.20),0_8px_18px_-10px_rgba(10,25,47,0.55),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(0,0,0,0.22)]">
            {initialsFor(review.name)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-[13px] font-bold leading-[18px] tracking-[-0.02em] text-[#0a192f]">{review.name}</span>
            <span className="font-display text-[11px] leading-[15px] tracking-[-0.01em] text-[#0a192f]/45">Avis vérifié</span>
          </div>
        </div>
        <StarRating rating={review.star} size="sm" />
      </div>
      <p className="relative z-10 font-display text-[13px] leading-[1.65] tracking-[-0.01em] text-[#0a192f]/70">{review.advice}</p>
    </div>
  );
}

interface ProductDetailProps {
  product: ProductView;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const avgRating = product.averageRating;
  const gallery = product.gallery.length > 0 ? product.gallery : [product.imageUrl];

  return (
    <div className="flex w-full flex-col items-center bg-[#f5f4f0]">
      {/* Hero / Image section */}
      <section className="relative isolate flex min-h-[70vh] w-full overflow-hidden bg-[#06101f] min-[1200px]:min-h-[80vh]">
        <div className="absolute inset-0 -z-20">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,10,23,0.88)_0%,rgba(5,17,37,0.67)_33%,rgba(7,26,54,0.28)_61%,rgba(3,10,20,0.08)_78%,rgba(3,8,16,0.30)_100%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[90px] -z-10 h-[520px] w-[1050px] -translate-x-1/2 rounded-full bg-[#2e6fb4]/[0.13] blur-[130px]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(2,8,18,0.18)_72%,rgba(2,7,15,0.46)_100%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-white/[0.08]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-36 bg-[linear-gradient(180deg,transparent_0%,rgba(3,9,18,0.18)_55%,rgba(3,9,18,0.42)_100%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-start justify-end px-5 pb-16 pt-[132px] min-[810px]:px-10 min-[810px]:pb-20 min-[1200px]:pb-24 min-[1200px]:pt-[105px]">
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.11] bg-white/[0.055] px-4 py-2 font-display text-[11px] font-medium tracking-[-0.01em] text-white/62 shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-colors hover:bg-white/[0.08]"
          >
            <ChevronLeft className="size-3.5" strokeWidth={2} />
            Retour aux produits
          </Link>

          <div className="mt-6 flex flex-col gap-4 min-[810px]:max-w-[720px]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.11] bg-white/[0.055] px-3.5 py-1.5 font-display text-[11px] font-medium text-white/50 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Heart className="size-3 text-red-400" strokeWidth={1.5} />
                {product.likes} likes
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.11] bg-white/[0.055] px-3.5 py-1.5 font-display text-[11px] font-medium text-white/50 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]">
                <StarRating rating={avgRating} size="sm" />
                <span>{avgRating.toFixed(1)} ({product.testimonialCount} avis)</span>
              </div>
            </div>

            <h1 className="font-display text-[44px] font-bold leading-[0.95] tracking-[-0.062em] text-white min-[390px]:text-[48px] min-[430px]:text-[53px] min-[810px]:text-[72px] min-[1200px]:text-[82px]">
              {product.name}
            </h1>

            <p className="max-w-[660px] font-display text-[16px] leading-[1.65] tracking-[-0.015em] text-white/64 min-[810px]:text-[18px] min-[1200px]:text-[19px]">
              {product.shortDescription}
            </p>

            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col gap-1">
                <span className="font-display text-[38px] font-bold tracking-[-0.05em] text-white min-[810px]:text-[48px]">
                  {formatXAF(product.priceXaf)} FCFA
                </span>
              </div>
              <a
                href="tel:+14122273484"
                className="group inline-flex items-center gap-2.5 rounded-[18px] border border-white/90 bg-[#f7f5ef] px-7 py-3.5 font-display text-[14px] font-bold tracking-[-0.015em] text-[#071423] ring-1 ring-black/20 shadow-[0_1px_2px_rgba(0,0,0,0.24),0_14px_28px_-17px_rgba(0,0,0,0.80),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(7,20,35,0.08)] transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_2px_4px_rgba(0,0,0,0.25),0_20px_34px_-18px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(255,255,255,1)]"
              >
                Commander maintenant
                <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Full Description + Features */}
      <section className="relative flex w-full flex-col items-center overflow-hidden bg-[#f5f4f0] px-5 py-[100px] min-[810px]:px-10 min-[810px]:py-[140px] min-[1200px]:py-[180px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-black/[0.055]" />
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-white/60 blur-[130px]" />

        <div className="relative z-10 flex w-full max-w-[1200px] flex-col gap-16 min-[810px]:gap-20 min-[1200px]:gap-24">
          <div className="grid grid-cols-1 gap-10 min-[810px]:grid-cols-2 min-[810px]:gap-16">
            {/* Full Description */}
            <div className="flex flex-col gap-6">
              <span className="font-display text-sm font-semibold tracking-[-0.02em] text-yellow-400">
                Description détaillée
              </span>
              <div className="flex flex-col gap-5">
                {product.fullDescription.split("\n\n").map((paragraph, i) => (
                  <p
                    key={i}
                    className="font-display text-[15px] leading-[1.75] tracking-[-0.01em] text-[#0a192f]/65 min-[810px]:text-[16px]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-col gap-6">
              <span className="font-display text-sm font-semibold tracking-[-0.02em] text-yellow-400">
                Caractéristiques
              </span>
              <div className="overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,247,245,0.98)_52%,rgba(239,239,236,0.98)_100%)] p-[30px] ring-1 ring-black/[0.07] shadow-[0_0_0_1px_rgba(255,255,255,0.48),0_1px_2px_rgba(15,23,42,0.06),0_14px_38px_-24px_rgba(15,23,42,0.34),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.05)] min-[810px]:p-10">
                <div aria-hidden="true" className="pointer-events-none absolute inset-[1px] rounded-[29px] shadow-[inset_1px_0_0_rgba(255,255,255,0.7),inset_-1px_0_0_rgba(15,23,42,0.025),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(15,23,42,0.045)]" />
                <ul className="relative z-10 flex flex-col gap-4">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-[3px] flex size-[18px] shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-white/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                        <ChevronRight className="size-3 text-[#0a192f]/45" strokeWidth={2.25} />
                      </span>
                      <span className="font-display text-[14px] leading-[20px] tracking-[-0.01em] text-[#0a192f]/68">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <span className="font-display text-sm font-semibold tracking-[-0.02em] text-yellow-400">Galerie</span>
              <h3 className="font-display text-[28px] font-bold leading-[1.05] tracking-[-0.05em] text-[#0a192f] min-[810px]:text-[36px]">
                Images du produit
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 min-[810px]:grid-cols-3 min-[1200px]:grid-cols-4">
              {gallery.map((img, i) => (
                <div
                  key={i}
                  className="group relative aspect-[4/3] overflow-hidden rounded-[22px] border border-white/80 ring-1 ring-black/[0.07] shadow-[0_0_0_1px_rgba(255,255,255,0.48),0_1px_2px_rgba(15,23,42,0.06),0_14px_38px_-24px_rgba(15,23,42,0.34),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.05)]"
                >
                  <Image
                    src={img}
                    alt={`${product.name} - Image ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(10,25,47,0.12)_100%)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="relative flex w-full flex-col items-center overflow-hidden bg-[#f5f5f1] px-5 py-[100px] min-[810px]:px-10 min-[810px]:py-[140px] min-[1200px]:py-[180px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-black/[0.06]" />
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-white/50 blur-[120px]" />

        <div className="relative z-[3] flex w-full max-w-[1200px] flex-col gap-12 min-[810px]:gap-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="font-display text-sm font-semibold tracking-[-0.02em] text-yellow-400">
              Avis clients
            </span>
            <h2 className="font-display text-[32px] font-bold leading-[1.02] tracking-[-0.055em] text-[#0a192f] min-[810px]:text-[44px] min-[1200px]:text-[52px]">
              Ce que disent nos clients
            </h2>
            <div className="flex items-center gap-3">
              <StarRating rating={avgRating} size="md" />
              <span className="font-display text-[15px] font-medium tracking-[-0.01em] text-[#0a192f]/55">
                {avgRating.toFixed(1)} / 5 — {product.testimonialCount} avis vérifiés
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 min-[810px]:grid-cols-2 min-[1200px]:grid-cols-3">
            {product.testimonials.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative flex w-full flex-col items-center overflow-hidden bg-[#f5f4f0] px-5 py-[100px] min-[810px]:px-10 min-[810px]:py-[140px] min-[1200px]:py-[180px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-black/[0.055]" />
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-white/60 blur-[130px]" />

        <div className="relative z-10 flex w-full max-w-[1100px] flex-col items-center">
          <div className="relative isolate flex w-full flex-col items-center gap-10 overflow-hidden rounded-[36px] border border-white/[0.10] bg-[#081728] p-[30px] text-center ring-1 ring-black/40 shadow-[0_0_0_1px_rgba(255,255,255,0.045),0_2px_5px_rgba(2,8,18,0.28),0_35px_85px_-40px_rgba(3,10,22,0.80),inset_0_1px_0_rgba(255,255,255,0.11),inset_0_-1px_0_rgba(0,0,0,0.34)] min-[810px]:flex-row min-[810px]:justify-between min-[810px]:gap-14 min-[810px]:p-12 min-[810px]:text-left min-[1200px]:p-14">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.11),transparent_31%),radial-gradient(circle_at_8%_105%,rgba(49,91,139,0.22),transparent_38%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035)_0%,transparent_34%,rgba(0,0,0,0.12)_100%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-px rounded-[35px] shadow-[inset_1px_0_0_rgba(255,255,255,0.035),inset_-1px_0_0_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.22)]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-0 h-px bg-white/15" />

            <div className="relative z-10 flex max-w-[690px] flex-col items-center gap-5 min-[810px]:flex-1 min-[810px]:items-start">
              <h3 className="max-w-[620px] font-display text-[31px] font-bold leading-[1.03] tracking-[-0.052em] text-white min-[810px]:text-[40px] min-[1200px]:text-[44px]">
                Intéressé par ce produit ?
              </h3>
              <p className="max-w-[620px] font-display text-[14px] leading-[1.7] tracking-[-0.01em] text-white/58 min-[810px]:text-[15px]">
                Contactez notre équipe commerciale pour un devis personnalisé et des conseils adaptés à votre projet d&apos;expédition.
              </p>
              <div className="mt-1 flex flex-col items-center gap-3 min-[810px]:items-start">
                <span className="flex items-center gap-2.5 font-display text-[13px] text-white/52">
                  <MapPin className="size-4 text-[#c69a43]" strokeWidth={1.7} />
                  Shenzhen, China
                </span>
                <div className="flex flex-col items-center gap-2 min-[810px]:flex-row min-[810px]:gap-5">
                  <a href="tel:+14122273484" className="font-display text-[13px] text-white/50 transition-colors duration-200 hover:text-white">+86 130 5916 2331 </a>
                  <span aria-hidden="true" className="hidden size-1 rounded-full bg-white/20 min-[810px]:block" />
                  <a href="mailto:support@nexttracelogistics.com" className="font-display text-[13px] text-white/50 transition-colors duration-200 hover:text-white">support@nexttracelogistics.com</a>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex w-full shrink-0 flex-col items-center gap-3 min-[810px]:w-auto min-[810px]:items-end">
              <a
                href="tel:+14122273484"
                className="group inline-flex w-full items-center justify-center gap-3 rounded-[18px] border border-white/90 bg-[#f8f7f3] px-8 py-4 font-display text-[14px] font-bold tracking-[-0.015em] text-[#0a192f] ring-1 ring-black/20 shadow-[0_1px_2px_rgba(0,0,0,0.22),0_15px_32px_-18px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.08)] transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_2px_4px_rgba(0,0,0,0.24),0_22px_38px_-19px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.09)] min-[810px]:w-auto"
              >
                Obtenir un devis
                <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.2} />
              </a>
              <span className="font-display text-[11px] leading-[16px] tracking-[-0.005em] text-white/34">Lun–Ven, 8h–20h HNE · Assistance 24h/24</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
