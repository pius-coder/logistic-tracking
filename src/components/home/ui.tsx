import type { ReactNode } from "react";

export function SectionHeading({
  title,
  description,
  children,
  eyebrow = "Contact",
}: {
  title: string;
  description: string;
  children?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex w-full max-w-[600px] flex-col items-center gap-5 text-center">
      <span className="font-display text-sm font-semibold tracking-[-0.02em] text-yellow-400">
        {eyebrow}
      </span>
      <h2 className="font-display text-[38px] font-bold leading-none tracking-[-0.05em] min-[810px]:text-5xl min-[1200px]:text-[60px]">
        {title}
      </h2>
      <p className="font-display text-base leading-[1.4] tracking-[-0.01em] text-[#0a192f]/65 min-[810px]:text-lg min-[1200px]:text-xl">
        {description}
      </p>
      {children}
    </div>
  );
}
