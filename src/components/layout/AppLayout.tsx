"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuraQuery } from "@/aura/client/hooks";
import { cn } from "@/lib/utils";
import {
  Headset,
  Home,
  Newspaper,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type CurrentUser = {
  id: string;
  isAdmin: boolean;
  onboardingCompleted: boolean;
};

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const BASE_NAV_ITEMS: NavigationItem[] = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/blog", label: "Blog", icon: Newspaper },
];

const CHROMELESS_PATHS = new Set([
  "/login",
  "/register",
  "/onboarding",
  "/verify-phone",
  "/logout",
  "/reset-password",
  "/reset-password/verify",
]);

const CHROMELESS_PREFIXES = ["/tracking/"];

function isChromelessRoute(pathname: string): boolean {
  return (
    CHROMELESS_PATHS.has(pathname) ||
    CHROMELESS_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getNavigationItems(user?: CurrentUser): NavigationItem[] {
  return [
    ...BASE_NAV_ITEMS,
    ...(user?.isAdmin
      ? [
          {
            href: "/dashboard/admin",
            label: "Admin",
            icon: ShieldCheck,
          },
        ]
      : []),
  ];
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isChromelessRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <AppChrome pathname={pathname}>
      {children}
    </AppChrome>
  );
}

function AppChrome({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  const { data: authData } = useAuraQuery("auth.me", {
    retry: false,
  });

  const user = (
    authData as { user?: CurrentUser } | undefined
  )?.user;

  const navigationItems = getNavigationItems(user);

  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col bg-background",
        user && "pb-16 min-[810px]:pb-0"
      )}
    >
      {pathname !== "/" && (
        <SupasteStyleHeader
          pathname={pathname}
          items={navigationItems}
        />
      )}

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      {user && (
        <MobileBottomNav
          pathname={pathname}
          items={navigationItems}
        />
      )}

      <SupportButton hasBottomNavigation={Boolean(user)} />
    </div>
  );
}

  function SupasteStyleHeader({
  pathname,
  items,
}: {
  pathname: string;
  items: NavigationItem[];
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1200px)");

    const handleDesktopChange = (
      event: MediaQueryListEvent
    ) => {
      if (event.matches) {
        setMobileMenuOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleDesktopChange);

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleDesktopChange
      );
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);

  return (
    <div
      className={cn(
        "fixed left-1/2 top-0 z-50 h-auto -translate-x-1/2 will-change-transform",
        mobileMenuOpen
          ? "w-[min(350px,100vw)] min-[1200px]:w-auto"
          : [
              "w-[min(350px,100vw)]",
              "min-[810px]:w-[810px]",
              "min-[1200px]:w-auto",
            ]
      )}
    >
      <nav
        aria-label="Navigation principale"
        className={cn(
          "relative flex w-full rounded-b-[18px] bg-black",
          "transition-[width,height] duration-300",
          mobileMenuOpen
            ? [
                "max-h-dvh flex-col items-start justify-start",
                "gap-[30px] overflow-y-auto px-[10px] py-[5px]",
              ]
            : [
                "h-[50px] flex-row items-center justify-center",
                "gap-[30px] overflow-visible px-[10px] py-[5px]",
              ],
          [
            "min-[1200px]:h-min",
            "min-[1200px]:max-h-none",
            "min-[1200px]:w-min",
            "min-[1200px]:flex-row",
            "min-[1200px]:items-center",
            "min-[1200px]:justify-center",
            "min-[1200px]:gap-[30px]",
            "min-[1200px]:overflow-visible",
            "min-[1200px]:p-[10px]",
          ]
        )}
      >
        <div
          className={cn(
            "relative flex h-min max-w-[1200px] items-center justify-center overflow-visible",
            mobileMenuOpen
              ? "w-full flex-col gap-[20px]"
              : "w-full flex-row gap-[20px]",
            [
              "min-[1200px]:w-min",
              "min-[1200px]:flex-none",
              "min-[1200px]:flex-row",
              "min-[1200px]:gap-[40px]",
            ]
          )}
        >
          <div
            className={cn(
              "relative flex h-min w-full flex-row items-center justify-between overflow-visible",
              "min-[1200px]:w-min min-[1200px]:flex-none min-[1200px]:justify-start min-[1200px]:gap-[10px]"
            )}
          >
            <Link
              href="/"
              aria-label="JC Import Express — Accueil"
              className="relative flex h-min w-min flex-none items-center justify-center gap-[10px] overflow-clip no-underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BrandMark />

              <span className="relative h-auto w-auto flex-none whitespace-pre font-display text-base font-semibold leading-[1.2] tracking-[-0.02em] text-white">
                JC Import Express
              </span>
            </Link>

            <button
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="JC Import Express-primary-links"
              aria-label={
                mobileMenuOpen
                  ? "Fermer le menu"
                  : "Ouvrir le menu"
              }
              className={cn(
                "relative h-10 w-10 flex-none cursor-pointer overflow-hidden rounded-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                "min-[1200px]:hidden"
              )}
              onClick={() =>
                setMobileMenuOpen((open) => !open)
              }
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-[10px] bg-[#757575]",
                  "transition-[top,transform,opacity] duration-300",
                  mobileMenuOpen
                    ? "top-[19px] rotate-45"
                    : "top-[12px] rotate-0"
                )}
              />

              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-1/2 top-[19px] h-0.5 w-5 -translate-x-1/2 rounded-[10px] bg-[#757575]",
                  "transition-opacity duration-200",
                  mobileMenuOpen
                    ? "opacity-0"
                    : "opacity-100"
                )}
              />

              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-[10px] bg-[#757575]",
                  "transition-[top,transform,opacity] duration-300",
                  mobileMenuOpen
                    ? "top-[19px] -rotate-45"
                    : "top-[26px] rotate-0"
                )}
              />
            </button>
          </div>

          <div
            id="JC Import Express-primary-links"
            className={cn(
              "relative max-w-[1200px] overflow-visible",
              mobileMenuOpen
                ? [
                    "flex w-full flex-col items-start gap-[30px]",
                    "p-[30px]",
                  ]
                : "hidden",
              [
                "min-[1200px]:flex",
                "min-[1200px]:h-min",
                "min-[1200px]:w-min",
                "min-[1200px]:flex-none",
                "min-[1200px]:flex-row",
                "min-[1200px]:items-center",
                "min-[1200px]:justify-end",
                "min-[1200px]:gap-[20px]",
                "min-[1200px]:p-0",
              ]
            )}
          >
            {items.map(({ href, label }) => {
              const active = isRouteActive(pathname, href);

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative block w-full font-display font-medium tracking-[-0.02em] text-white no-underline",
                    "text-2xl leading-[1.2]",
                    "transition-opacity duration-200",
                    "min-[1200px]:w-auto min-[1200px]:whitespace-pre min-[1200px]:text-sm",
                    active
                      ? "opacity-100"
                      : "opacity-60 hover:opacity-100"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <CornerDecoration side="right" />
        <CornerDecoration side="left" />
      </nav>
    </div>
  );
}

function BrandMark() {
  return (
    <span className="relative block size-[30px] flex-none overflow-visible rounded-[8px] bg-white/15">
      <span className="absolute inset-0 flex items-center justify-center rounded-[inherit]">
        <span className="size-[10px] rounded-[2px] bg-white" />
      </span>
    </span>
  );
}

function CornerDecoration({
  side,
}: {
  side: "left" | "right";
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute top-0 block size-5 overflow-visible",
        side === "right"
          ? "-right-5"
          : "-left-5"
      )}
    >
      <svg
        viewBox="0 0 20 20"
        className={cn(
          "absolute left-0 top-0 block size-5 shrink-0 [image-rendering:pixelated]",
          side === "left" && "rotate-90"
        )}
      >
        <path
          d="M 0 0 L 20 0 C 8.954 0 0 8.954 0 20 Z"
          fill="rgb(0, 0, 0)"
        />
      </svg>
    </span>
  );
}

function MobileBottomNav({
  pathname,
  items,
}: {
  pathname: string;
  items: NavigationItem[];
}) {
  return (
    <nav
      aria-label="Navigation mobile principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/80 backdrop-blur-lg min-[810px]:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isRouteActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5",
                "text-[10px] font-semibold transition-all",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground opacity-70 hover:bg-muted hover:opacity-100"
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  "size-4",
                  active && "scale-110"
                )}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import {
  ArrowUpRight,
  Mail,
  MapPin,
  PackageSearch,
  Phone,
} from "lucide-react";

const FOOTER_MENU = [
  { href: "/", label: "Accueil" },
  { href: "/tracking", label: "Suivi de colis" },
  { href: "/catalogue", label: "Nos services" },
  { href: "/blog", label: "Actualités" },
] as const;

const FOOTER_LEGAL = [
  { href: "/confidentialite", label: "Politique de confidentialité" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/conditions-general", label: "Conditions générales" },
] as const;

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        group inline-flex w-fit items-center gap-1.5
        font-display text-[14px] font-medium
        leading-[1.5] tracking-[-0.012em]
        text-white/54
        outline-none
        transition-colors duration-200
        hover:text-white
        focus-visible:rounded-md
        focus-visible:ring-2
        focus-visible:ring-white/30
        focus-visible:ring-offset-4
        focus-visible:ring-offset-[#07111f]
      "
    >
      <span>{children}</span>

      <ArrowUpRight
        className="
          size-3.5 translate-y-px opacity-0
          transition-[transform,opacity] duration-200
          group-hover:translate-x-0.5
          group-hover:-translate-y-0.5
          group-hover:opacity-70
        "
        strokeWidth={1.8}
        aria-hidden="true"
      />
    </Link>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly {
    href: string;
    label: string;
  }[];
}) {
  return (
    <nav aria-label={title} className="flex flex-col">
      <h3
        className="
          font-display text-[11px] font-bold
          uppercase tracking-[0.16em]
          text-white/32
        "
      >
        {title}
      </h3>

      <ul className="mt-5 flex flex-col gap-3.5">
        {links.map((link) => (
          <li key={link.href}>
            <FooterLink href={link.href}>{link.label}</FooterLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="
        relative isolate w-full overflow-hidden
        bg-[#07111f] text-white
      "
    >
      {/* Matière de fond */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.085),transparent_31%),radial-gradient(circle_at_92%_20%,rgba(184,139,44,0.08),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.018)_0%,transparent_38%,rgba(0,0,0,0.16)_100%)]
        "
      />

      {/* Hairline supérieure */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-x-0 top-0 h-px
          bg-white/[0.09]
        "
      />

      <div
        className="
          relative z-10 mx-auto w-full max-w-[1200px]
          px-5 pt-6
          min-[810px]:px-10
        "
      >
        {/* CTA supérieur */}
        <div
          className="
            relative isolate overflow-hidden
            rounded-[30px]
            border border-white/[0.09]
            bg-white/[0.045]
            p-6
            ring-1 ring-black/20
            shadow-[0_1px_2px_rgba(0,0,0,0.2),0_24px_65px_-42px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.07)]
            backdrop-blur-xl
            min-[810px]:flex
            min-[810px]:items-center
            min-[810px]:justify-between
            min-[810px]:gap-10
            min-[810px]:p-8
          "
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-px
              rounded-[29px]
              shadow-[inset_1px_0_0_rgba(255,255,255,0.025),inset_-1px_0_0_rgba(0,0,0,0.13),inset_0_1px_0_rgba(255,255,255,0.05)]
            "
          />

          <div className="relative z-10 max-w-[650px]">
            <span
              className="
                inline-flex items-center gap-2
                font-display text-[10px] font-bold
                uppercase tracking-[0.18em]
                text-white/42
              "
            >
              <span
                className="
                  size-1.5 rounded-full bg-[#c49a4a]
                  shadow-[0_0_0_4px_rgba(196,154,74,0.09)]
                "
              />
              Logistique internationale
            </span>

            <h2
              className="
                mt-4 max-w-[600px]
                font-display text-[28px] font-bold
                leading-[1.04] tracking-[-0.048em]
                text-white
                min-[810px]:text-[36px]
              "
            >
              Une visibilité complète sur chaque expédition.
            </h2>

            <p
              className="
                mt-3 max-w-[580px]
                font-display text-[14px] leading-[1.65]
                tracking-[-0.01em] text-white/48
              "
            >
              Suivez vos colis depuis la Chine, l&apos;Europe et les
              États-Unis avec des mises à jour fiables à chaque étape.
            </p>
          </div>

          <div
            className="
              relative z-10 mt-6 flex shrink-0
              flex-col gap-3
              min-[520px]:flex-row
              min-[810px]:mt-0
            "
          >
            <Link
              href="/tracking"
              className="
                group inline-flex min-h-[52px]
                items-center justify-center gap-2.5
                rounded-[16px]
                border border-white/90
                bg-[#f7f5ef] px-6
                font-display text-[13px] font-bold
                tracking-[-0.012em] text-[#07111f]
                ring-1 ring-black/20
                shadow-[0_1px_2px_rgba(0,0,0,0.24),0_14px_28px_-18px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(7,17,31,0.08)]
                transition-[transform,background-color,box-shadow]
                duration-200
                hover:-translate-y-0.5
                hover:bg-white
                hover:shadow-[0_2px_4px_rgba(0,0,0,0.25),0_20px_36px_-19px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(255,255,255,1)]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white/60
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[#07111f]
              "
            >
              <PackageSearch
                className="size-[17px]"
                strokeWidth={1.9}
                aria-hidden="true"
              />
              Suivre un colis
            </Link>

            <Link
              href="/#contact"
              className="
                group inline-flex min-h-[52px]
                items-center justify-center gap-2
                rounded-[16px]
                border border-white/[0.11]
                bg-white/[0.055] px-6
                font-display text-[13px] font-semibold
                tracking-[-0.012em] text-white/78
                shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.07)]
                transition-[background-color,border-color,color]
                duration-200
                hover:border-white/[0.18]
                hover:bg-white/[0.08]
                hover:text-white
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white/30
              "
            >
              Obtenir un devis

              <ArrowUpRight
                className="
                  size-4 transition-transform duration-200
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* Corps du footer */}
        <div
          className="
            grid grid-cols-1 gap-12
            border-b border-white/[0.075]
            py-16
            min-[640px]:grid-cols-2
            min-[810px]:grid-cols-[1.65fr_0.75fr_1fr_1.15fr]
            min-[810px]:gap-10
            min-[810px]:py-20
          "
        >
          {/* Identité */}
          <div className="flex max-w-[420px] flex-col">
            <Link
              href="/"
              aria-label="JC Import Express — Accueil"
              className="
                group inline-flex w-fit items-center gap-3
                rounded-lg outline-none
                focus-visible:ring-2
                focus-visible:ring-white/30
                focus-visible:ring-offset-4
                focus-visible:ring-offset-[#07111f]
              "
            >
              <div
                className="
                  relative flex size-10 items-center justify-center
                  overflow-hidden rounded-[13px]
                  border border-white/[0.11]
                  bg-white/[0.06]
                  shadow-[0_1px_2px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]
                "
              >
                <span
                  aria-hidden="true"
                  className="
                    font-display text-[12px] font-bold
                    tracking-[-0.04em] text-[#d3ac63]
                  "
                >
                  JC
                </span>
              </div>

              <div className="flex flex-col">
                <span
                  className="
                    font-display text-[15px] font-bold
                    leading-[1.2] tracking-[-0.025em]
                    text-white
                  "
                >
                  JC Import Express
                </span>

                <span
                  className="
                    mt-1 font-display text-[10px]
                    font-semibold uppercase
                    tracking-[0.14em]
                    text-white/30
                  "
                >
                  Transport international
                </span>
              </div>
            </Link>

            <div className="mt-8">
              <p
                className="
                  font-display text-[28px] font-bold
                  leading-[1.02] tracking-[-0.052em]
                  text-white
                  min-[810px]:text-[32px]
                "
              >
                Traçabilité totale.
              </p>

              <p
                className="
                  mt-1 font-instrument text-[28px]
                  italic leading-[1.02]
                  tracking-[-0.045em]
                  text-white/48
                  min-[810px]:text-[32px]
                "
              >
                Livraison maîtrisée.
              </p>
            </div>

            <p
              className="
                mt-6 max-w-[380px]
                font-display text-[13px] leading-[1.7]
                tracking-[-0.008em] text-white/40
              "
            >
              Une infrastructure logistique pensée pour les entreprises qui
              exigent visibilité, fiabilité et maîtrise des délais.
            </p>
          </div>

          <FooterColumn title="Menu" links={FOOTER_MENU} />

          <FooterColumn title="Informations" links={FOOTER_LEGAL} />

          {/* Contact */}
          <div className="flex flex-col">
            <h3
              className="
                font-display text-[11px] font-bold
                uppercase tracking-[0.16em]
                text-white/32
              "
            >
              Contact
            </h3>

            <div className="mt-5 flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-[#c49a4a]"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />

                <div className="flex flex-col gap-1">
                  <span className="font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-white/25">
                    Siège social
                  </span>

                  <span className="font-display text-[14px] leading-[1.5] text-white/56">
                    Wyoming, États-Unis
                  </span>
                </div>
              </div>

              <a
                href="tel:+14122273484"
                className="
                  group flex items-start gap-3
                  rounded-lg outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white/30
                "
              >
                <Phone
                  className="
                    mt-0.5 size-4 shrink-0
                    text-[#c49a4a]
                  "
                  strokeWidth={1.6}
                  aria-hidden="true"
                />

                <div className="flex flex-col gap-1">
                  <span className="font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-white/25">
                    Téléphone
                  </span>

                  <span className="font-display text-[14px] leading-[1.5] text-white/56 transition-colors group-hover:text-white">
                    +1 (412) 227-3484
                  </span>
                </div>
              </a>

              <a
                href="mailto:support@jcimportexpress.com"
                className="
                  group flex min-w-0 items-start gap-3
                  rounded-lg outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white/30
                "
              >
                <Mail
                  className="
                    mt-0.5 size-4 shrink-0
                    text-[#c49a4a]
                  "
                  strokeWidth={1.6}
                  aria-hidden="true"
                />

                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-white/25">
                    Email
                  </span>

                  <span className="break-all font-display text-[14px] leading-[1.5] text-white/56 transition-colors group-hover:text-white">
                    support@jcimportexpress.com
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Barre légale */}
        <div
          className="
            flex flex-col gap-5 py-7
            min-[810px]:flex-row
            min-[810px]:items-center
            min-[810px]:justify-between
          "
        >
          <p
            className="
              font-display text-[11px] leading-[1.6]
              tracking-[-0.005em] text-white/28
            "
          >
            © {currentYear} JC Import Express. Tous droits réservés.
          </p>

          <div
            className="
              flex flex-wrap items-center gap-x-5 gap-y-2
              font-display text-[11px] text-white/28
            "
          >
            <span>Transport mondial</span>

            <span
              aria-hidden="true"
              className="size-1 rounded-full bg-white/15"
            />

            <span>Suivi 24h/24</span>

            <span
              aria-hidden="true"
              className="size-1 rounded-full bg-white/15"
            />

            <span>Support professionnel</span>
          </div>
        </div>
      </div>

      {/* Mot-symbole inférieur */}
      <div
        aria-hidden="true"
        className="
          relative z-10 mx-auto flex w-full
          max-w-[1500px] justify-center
          overflow-hidden px-3
          select-none
        "
      >
        <p
          className="
            translate-y-[17%] whitespace-nowrap
            font-display text-[clamp(72px,14vw,210px)]
            font-bold leading-[0.78]
            tracking-[-0.075em]
            text-white/[0.035]
          "
        >
          JC Import Express
        </p>
      </div>
    </footer>
  );
}
function CornerDecorationFooter({ side }: { side: "left" | "right" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute top-0 block size-5 overflow-visible",
        side === "right" ? "-right-5" : "-left-5"
      )}
    >
      <svg
        viewBox="0 0 20 20"
        className={cn(
          "absolute left-0 top-0 block size-5 shrink-0 [image-rendering:pixelated]",
          side === "left" && "rotate-90"
        )}
      >
        <path
          d="M 0 0 L 20 0 C 8.954 0 0 8.954 0 20 Z"
          fill="rgb(0, 0, 0)"
        />
      </svg>
    </span>
  );
}

function SupportButton({
  hasBottomNavigation,
}: {
  hasBottomNavigation: boolean;
}) {
  const supportNumber = (
    process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER ??
    "2250700000000"
  ).replace(/\D/g, "");

  const message = encodeURIComponent(
    "Bonjour JC Import Express, j'ai besoin d'aide pour mon envoi."
  );

  return (
    <a
      href={`https://wa.me/${supportNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed right-6 z-50 flex size-10 items-center justify-center rounded-xl",
        "bg-green-500 text-white shadow-md transition-all",
        "hover:scale-105 hover:shadow-lg hover:shadow-green-500/25",
        "min-[810px]:bottom-6",
        hasBottomNavigation ? "bottom-20" : "bottom-6"
      )}
      aria-label="Contacter le support WhatsApp"
    >
      <Headset aria-hidden="true" className="size-5" />
    </a>
  );
}
