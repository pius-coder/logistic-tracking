import { phoneHref } from "@/lib/site-content";
import type { HeaderContent } from "./types";

export function SiteHeader({ content }: { content: HeaderContent }) {
  return (
    <header className="fixed left-1/2 top-0 z-50 w-[min(350px,calc(100vw-24px))] -translate-x-1/2 min-[810px]:w-[810px] min-[1200px]:w-auto">
      <div className="relative rounded-b-[18px] bg-white px-[10px] py-[5px] text-[#0a192f] min-[1200px]:p-[10px]">
        <div className="hidden items-center justify-between gap-10 min-[1200px]:flex">
          <a href="#hero" className="flex items-center gap-[10px] font-display text-base font-semibold tracking-[-0.02em] text-[#0a192f]">
            <span className="relative flex size-[30px] items-center justify-center rounded-[8px] bg-[#0a192f]/10">
              <span className="size-[10px] rounded-[2px] bg-[#0a192f]" />
            </span>
            <span>{content.brandName}</span>
          </a>
          <nav className="flex items-center gap-5" aria-label="Primary navigation">
            {content.navLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="font-display text-sm font-medium tracking-[-0.02em] text-[#0a192f]/60 transition-opacity hover:text-[#0a192f]"
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            href={phoneHref(content.phone)}
            className="rounded-xl bg-[#006fff] px-4 py-1.5 font-display text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            {content.phone}
          </a>
        </div>

        <details className="group min-[1200px]:hidden">
          <summary className="flex h-10 cursor-pointer list-none items-center justify-between">
            <a href="#hero" className="flex items-center gap-[10px] font-display text-base font-semibold tracking-[-0.02em] text-[#0a192f]">
              <span className="relative flex size-[30px] items-center justify-center rounded-[8px] bg-[#0a192f]/10">
                <span className="size-[10px] rounded-[2px] bg-[#0a192f]" />
              </span>
              <span>{content.brandName}</span>
            </a>
            <span className="relative block size-10 rounded-md">
              <span className="absolute left-1/2 top-[12px] h-0.5 w-5 -translate-x-1/2 rounded-full bg-[#757575] transition-transform group-open:top-[19px] group-open:rotate-45" />
              <span className="absolute left-1/2 top-[19px] h-0.5 w-5 -translate-x-1/2 rounded-full bg-[#757575] transition-opacity group-open:opacity-0" />
              <span className="absolute left-1/2 top-[26px] h-0.5 w-5 -translate-x-1/2 rounded-full bg-[#757575] transition-transform group-open:top-[19px] group-open:-rotate-45" />
            </span>
          </summary>
          <nav
            className="flex flex-col items-start gap-[30px] px-[30px] pb-[30px] pt-5"
            aria-label="Mobile navigation"
          >
            {content.navLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="w-full font-display text-2xl font-medium tracking-[-0.02em] text-[#0a192f]/70 hover:text-[#0a192f]"
              >
                {label}
              </a>
            ))}
            <a
              href={phoneHref(content.phone)}
              className="w-full rounded-2xl bg-[#006fff] px-5 py-4 text-center font-display text-base font-semibold text-white"
            >
              {content.phone}
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
