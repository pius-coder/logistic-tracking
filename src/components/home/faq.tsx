"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqContent } from "./types";

type FaqItemProps = {
  item: FaqContent["items"][number];
  isOpen: boolean;
  onToggle: () => void;
};

function FaqItem({ item, isOpen, onToggle }: FaqItemProps) {
  const contentId = useId();

  return (
    <div
      className={`
        relative overflow-hidden rounded-[22px]
        border transition-[border-color,background-color,box-shadow,transform]
        duration-300 ease-out

        ${
          isOpen
            ? "border-black/[0.12] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,1)]"
            : "border-black/[0.07] bg-white/70 shadow-[0_1px_2px_rgba(0,0,0,0.025),inset_0_1px_0_rgba(255,255,255,0.9)] hover:-translate-y-px hover:border-black/[0.12] hover:bg-white hover:shadow-[0_8px_24px_-18px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,1)]"
        }
      `}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="
          group flex w-full items-center justify-between
          gap-6 px-5 py-5 text-left
          outline-none
          focus-visible:ring-2 focus-visible:ring-inset
          focus-visible:ring-[#0a192f]/20
          min-[810px]:px-7 min-[810px]:py-6
        "
      >
        <span
          className={`
            font-display text-base font-semibold
            leading-[1.35] tracking-[-0.025em]
            transition-colors duration-300
            min-[810px]:text-[18px]

            ${isOpen ? "text-[#0a192f]" : "text-[#172033]"}
          `}
        >
          {item.question}
        </span>

        <span
          className={`
            flex size-9 shrink-0 items-center justify-center
            rounded-full border transition-all duration-300

            ${
              isOpen
                ? "border-[#0a192f] bg-[#0a192f] text-white shadow-[0_4px_12px_-5px_rgba(10,25,47,0.55)]"
                : "border-black/[0.08] bg-[#f7f7f5] text-[#0a192f]/50 group-hover:border-black/[0.14] group-hover:bg-white group-hover:text-[#0a192f]"
            }
          `}
        >
          <ChevronDown
            size={17}
            strokeWidth={2}
            aria-hidden="true"
            className={`transition-transform duration-300 ease-out ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      <div
        id={contentId}
        className={`
          grid transition-[grid-template-rows,opacity]
          duration-300 ease-out

          ${
            isOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }
        `}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-6 min-[810px]:px-7 min-[810px]:pb-7">
            <div className="mb-5 h-px w-full bg-black/[0.06]" />

            <p className="max-w-[540px] font-display text-[15px] leading-[1.7] tracking-[-0.01em] text-[#425066] min-[810px]:text-base">
              {item.answer}
            </p>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-x-5 top-0 h-px
          bg-white/90 min-[810px]:inset-x-7
        "
      />
    </div>
  );
}

export function Faq({ content }: { content: FaqContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="
        relative flex w-full flex-col items-center
        overflow-hidden bg-[#f5f5f1]
        px-5 py-[100px]
        min-[810px]:px-10 min-[810px]:py-[140px]
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

      <div className="relative flex w-full max-w-[720px] flex-col items-center">
        <div className="flex max-w-[640px] flex-col items-center text-center">
          <span
            className="
              mb-6 inline-flex items-center rounded-full
              border border-black/[0.08] bg-white
              px-4 py-2
              font-display text-[11px] font-bold uppercase
              tracking-[0.18em] text-[#0a192f]/60
              shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)]
            "
          >
            {content.eyebrow}
          </span>

          <h2
            className="
              max-w-[620px] font-display
              text-[40px] font-bold leading-[0.98]
              tracking-[-0.055em] text-[#0a192f]
              min-[810px]:text-[52px]
              min-[1200px]:text-[64px]
            "
          >
            {content.title}
          </h2>

          <p
            className="
              mt-6 max-w-[540px]
              font-display text-base leading-[1.6]
              tracking-[-0.015em] text-[#536174]
              min-[810px]:text-lg
            "
          >
            {content.description}
          </p>
        </div>

        <div
          className="
            mt-12 flex w-full flex-col gap-3
            rounded-[30px] border border-black/[0.07]
            bg-[#ecece7]/70 p-2.5
            shadow-[0_1px_2px_rgba(0,0,0,0.035),0_24px_70px_-48px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,0.8)]
            min-[810px]:mt-16 min-[810px]:gap-3.5 min-[810px]:p-3
          "
        >
          {content.items.map((item, index) => (
            <FaqItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex((currentIndex) =>
                  currentIndex === index ? null : index,
                )
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
