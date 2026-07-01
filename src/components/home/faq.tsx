"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "./landing-data";

function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof FAQS)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col border-b border-black/10 pb-5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 pt-5 text-left font-display text-base font-semibold tracking-[-0.02em] min-[810px]:text-lg"
        aria-expanded={isOpen}
      >
        <span className="leading-[1.3]">{item.question}</span>
        <ChevronDown
          className={`shrink-0 text-black/40 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          strokeWidth={2}
          size={20}
        />
      </button>
      {isOpen ? (
        <p className="mt-4 max-w-[580px] font-display text-sm leading-[1.5] tracking-[-0.01em] text-[#0a192f]/65 min-[810px]:text-base">
          {item.answer}
        </p>
      ) : null}
    </div>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="flex w-full flex-col items-center gap-10 px-5 pt-[100px] min-[810px]:gap-16 min-[810px]:px-10 min-[810px]:pt-[140px] min-[1200px]:pt-[180px]"
    >
      <div className="flex w-full max-w-[600px] flex-col items-center gap-5 text-center">
        <span className="font-display text-sm font-semibold tracking-[-0.02em] text-[#006fff]">
          FAQ
        </span>
        <h2 className="font-display text-[38px] font-bold leading-none tracking-[-0.05em] min-[810px]:text-5xl min-[1200px]:text-[60px]">
          Questions fréquentes
        </h2>
        <p className="font-display text-base leading-[1.4] tracking-[-0.01em] text-[#0a192f]/65 min-[810px]:text-lg min-[1200px]:text-xl">
          Tout ce que vous devez savoir sur nos services logistiques
        </p>
      </div>

      <div className="w-full max-w-[600px]">
        {FAQS.map((item, index) => (
          <FaqItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
          />
        ))}
      </div>
    </section>
  );
}
