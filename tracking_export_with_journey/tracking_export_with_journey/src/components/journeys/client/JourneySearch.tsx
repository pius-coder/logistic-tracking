"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, PackageSearch } from "lucide-react";
import { useAuraQuery } from "@/aura/client";

export function JourneySearch() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data, isFetching, isFetched } = useAuraQuery<{
    publicToken: string;
    requestNumber: string;
  } | null>("journey.publicLookup", {
    params: { requestNumber: submitted },
    enabled: submitted.length >= 3,
  });

  useEffect(() => {
    if (data?.publicToken) router.replace(`/voyage/${data.publicToken}`);
  }, [data?.publicToken, router]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const normalized = input.trim().toUpperCase();
    if (normalized.length >= 3) setSubmitted(normalized);
  }

  const notFound = isFetched && !isFetching && submitted && data === null;

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#071522] px-5 py-16 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(54,126,102,0.24),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(69,114,159,0.18),transparent_30%)]" />
      <div className="relative z-10 w-full max-w-[580px] rounded-[32px] border border-white/[0.10] bg-white/[0.055] p-6 ring-1 ring-black/25 shadow-[0_30px_90px_-45px_rgba(0,0,0,0.90),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl min-[640px]:p-9">
        <span className="flex size-12 items-center justify-center rounded-[16px] border border-white/[0.10] bg-white/[0.06] text-[#8fc9ae] shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <PackageSearch className="size-[22px]" strokeWidth={1.7} />
        </span>
        <h1 className="mt-6 font-display text-[36px] font-bold leading-[0.98] tracking-[-0.055em] min-[640px]:text-[48px]">
          Suivez votre voyage.
        </h1>
        <p className="mt-4 max-w-[500px] font-display text-[14px] leading-[1.65] text-white/48">
          Entrez le numéro de suivi communiqué par JC Import Express pour consulter la carte, les escales et l’ETA.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 rounded-[22px] border border-white/[0.10] bg-[#091827]/75 p-2 shadow-[0_2px_5px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.07)]">
          <div className="flex flex-col gap-2 min-[520px]:flex-row">
            <label className="flex min-h-[56px] min-w-0 flex-1 items-center gap-3 rounded-[16px] border border-white/[0.09] bg-white/[0.07] px-4 focus-within:border-white/[0.18] focus-within:bg-white/[0.10]">
              <PackageSearch className="size-[18px] shrink-0 text-white/38" strokeWidth={1.7} />
              <span className="sr-only">Numéro de suivi</span>
              <input
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  if (submitted) setSubmitted("");
                }}
                placeholder="Ex. GI-260042"
                className="min-w-0 flex-1 bg-transparent font-display text-[14px] font-semibold uppercase tracking-[0.02em] text-white outline-none placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-white/28"
              />
            </label>
            <button
              type="submit"
              disabled={input.trim().length < 3 || isFetching}
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-[16px] border border-white/90 bg-[#f7f5ef] px-6 font-display text-[13px] font-bold text-[#071522] shadow-[0_1px_2px_rgba(0,0,0,0.22),0_14px_28px_-18px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,1)] transition-transform hover:-translate-y-0.5 disabled:opacity-45"
            >
              {isFetching ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              Rechercher
            </button>
          </div>
        </form>

        {notFound ? (
          <p className="mt-4 rounded-[14px] border border-[#d96d65]/18 bg-[#d96d65]/10 px-4 py-3 font-display text-[12px] text-[#ffc2bd]">
            Aucun voyage publié ne correspond à ce numéro.
          </p>
        ) : null}
      </div>
    </main>
  );
}
