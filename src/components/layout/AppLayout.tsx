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
      <SupasteStyleHeader
        pathname={pathname}
        items={navigationItems}
      />

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

function Footer() {
  return (
    <footer className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-black">
      <div className="relative flex w-full max-w-[1200px] flex-row flex-nowrap gap-10 px-10 pt-[100px] pb-10">
        <div
          className="absolute top-0 z-[1] h-10 rounded-b-[18px] bg-black"
          style={{ left: "40px", right: "40px" }}
        >
          <CornerDecorationFooter side="right" />
          <CornerDecorationFooter side="left" />
        </div>

        <div className="flex flex-col gap-5" style={{ flex: "2 0 0px" }}>
          <div className="flex flex-row items-center gap-[10px] overflow-clip">
            <div className="size-[30px] shrink-0 rounded-[8px] bg-primary" />
            <div className="flex flex-col" style={{ whiteSpace: "pre" }}>
              <p
                className="font-display font-semibold text-white"
                style={{
                  fontSize: "16px",
                  lineHeight: "19.2px",
                  letterSpacing: "-0.32px",
                }}
              >
                JC Import Express
              </p>
            </div>
            <div className="flex flex-col" style={{ whiteSpace: "pre", opacity: 0.4 }}>
              <p
                className="font-display text-white"
                style={{
                  fontSize: "16px",
                  lineHeight: "19.2px",
                  letterSpacing: "-0.32px",
                }}
              >
                Transport international
              </p>
            </div>
          </div>

          <div className="flex flex-col" style={{ whiteSpace: "pre-wrap" }}>
            <p
              className="font-display text-white"
              style={{
                fontSize: "30px",
                fontWeight: 700,
                lineHeight: "30px",
                letterSpacing: "-1.5px",
              }}
            >
              Traçabilité totale.
            </p>
            <p
              className="font-instrument italic text-white"
              style={{
                fontSize: "30px",
                lineHeight: "30px",
                letterSpacing: "-1.5px",
              }}
            >
              Livraison garantie.
            </p>
          </div>

          <div
            className="flex flex-col"
            style={{
              whiteSpace: "pre-wrap",
              opacity: 0.6,
            }}
          >
            <p
              className="font-display text-white"
              style={{
                fontSize: "14px",
                lineHeight: "19.6px",
                letterSpacing: "-0.14px",
              }}
            >
              Solution de suivi logistique international.
              Tracking en temps réel pour vos expéditions
              depuis la Chine, l&apos;Europe et les USA.
            </p>
          </div>

          <Link
            href="/tracking"
            className="flex flex-row items-center justify-center gap-[6px] rounded-[8px] bg-white"
            style={{ padding: "8px 16px" }}
          >
            <div className="z-[2] flex size-3 flex-col items-center justify-center gap-[10px]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div className="z-[2] flex flex-col" style={{ whiteSpace: "pre" }}>
              <p
                className="font-display text-black"
                style={{ fontSize: "12px", fontWeight: 600, lineHeight: "16.8px" }}
              >
                Suivre un colis
              </p>
            </div>
          </Link>

          <div className="flex flex-row items-center gap-5">
            <div className="flex flex-1 flex-col" style={{ whiteSpace: "pre-wrap", opacity: 0.4 }}>
              <p
                style={{ fontSize: "12px", lineHeight: "19.2px", color: "rgb(255,255,255)" }}
              >
                &copy; {new Date().getFullYear()} JC Import Express.
                Tous droits réservés.
              </p>
            </div>
          </div>

          <div className="flex flex-row items-center justify-center gap-[10px] overflow-hidden">
            <div className="flex flex-col" style={{ whiteSpace: "pre" }}>
              <p
                className="font-display text-center text-white"
                style={{ fontSize: "12px", fontWeight: 500, lineHeight: "19.2px" }}
              >
                Propuls&eacute; par
              </p>
            </div>
            <div className="flex flex-col" style={{ whiteSpace: "pre" }}>
              <p
                className="font-display text-center text-white"
                style={{ fontSize: "12px", fontWeight: 500, lineHeight: "19.2px" }}
              >
                JC Import Express
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-5" style={{ flex: "1 0 0px" }}>
          <div className="flex flex-col" style={{ whiteSpace: "pre", opacity: 0.4 }}>
            <h6
              className="font-display text-white"
              style={{ fontSize: "16px", fontWeight: 600, lineHeight: "19.2px" }}
            >
              Menu
            </h6>
          </div>
          <div className="flex flex-col items-start gap-[15px] overflow-hidden">
            {[
              { href: "/", label: "Accueil" },
              { href: "/tracking", label: "Suivi" },
              { href: "/catalogue", label: "Services" },
              { href: "/blog", label: "Blog" },
            ].map(({ href, label }) => (
              <div key={label} className="flex flex-col shrink-0" style={{ whiteSpace: "pre" }}>
                <p
                  className="font-display text-white"
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    lineHeight: "16.8px",
                    letterSpacing: "-0.28px",
                  }}
                >
                  <Link
                    href={href}
                    className="font-display text-white"
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: "16.8px",
                      letterSpacing: "-0.28px",
                    }}
                  >
                    {label}
                  </Link>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start gap-5" style={{ flex: "1 0 0px" }}>
          <div className="flex flex-col" style={{ whiteSpace: "pre", opacity: 0.4 }}>
            <h6
              className="font-display text-white"
              style={{ fontSize: "16px", fontWeight: 600, lineHeight: "19.2px" }}
            >
              Navigation
            </h6>
          </div>
          <div className="flex flex-col items-start gap-[15px] overflow-hidden">
            {[
              { href: "/confidentialite", label: "Confidentialité" },
              { href: "/mentions-legales", label: "Mentions légales" },
              { href: "/conditions-general", label: "Conditions générales" },
            ].map(({ href, label }) => (
              <div key={label} className="flex flex-col w-full" style={{ whiteSpace: "pre-wrap" }}>
                <p style={{ fontSize: "14px", lineHeight: "22.4px", color: "rgb(123, 130, 142)" }}>
                  <Link
                    href={href}
                    className="text-white"
                    style={{ fontSize: "14px", lineHeight: "22.4px" }}
                  >
                    {label}
                  </Link>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start gap-5" style={{ flex: "1 0 0px" }}>
          <div className="flex flex-col" style={{ whiteSpace: "pre", opacity: 0.4 }}>
            <h6
              className="font-display text-white"
              style={{ fontSize: "16px", fontWeight: 600, lineHeight: "19.2px" }}
            >
              Contact
            </h6>
          </div>
          <div className="flex flex-col items-start gap-[15px] overflow-hidden">
            {[
              { href: "#", label: "Wyoming, États-Unis" },
              { href: "tel:+14122273484", label: "+1 (412) 227-3484" },
              { href: "mailto:support@jcimportexpress.com", label: "support@jcimportexpress.com" },
            ].map(({ href, label }) => (
              <div key={label} className="flex flex-col w-full" style={{ whiteSpace: "pre-wrap" }}>
                <p style={{ fontSize: "14px", lineHeight: "22.4px", color: "rgb(123, 130, 142)" }}>
                  <Link
                    href={href}
                    className="text-white"
                    style={{ fontSize: "14px", lineHeight: "22.4px" }}
                  >
                    {label}
                  </Link>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-[1200px] flex-col items-center justify-start gap-[10px]">
        <svg
          viewBox="0 0 1171 320"
          className="block shrink-0"
          style={{ width: "1200px", height: "327.922px", overflow: "hidden" }}
        >
          <foreignObject
            width="1171"
            height="320"
            style={{ overflow: "visible", transformOrigin: "center center" }}
          >
            <p
              className="font-display font-bold whitespace-pre"
              style={{
                fontSize: "319.909px",
                lineHeight: "319.909px",
                letterSpacing: "-10px",
                color: "rgb(18, 18, 18)",
                width: "1171px",
                height: "319.906px",
              }}
            >
              JC Import Express
            </p>
          </foreignObject>
        </svg>
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
