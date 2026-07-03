"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  Newspaper,
  Package,
  Settings,
  ShipWheel,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard/admin", label: "Pilotage", icon: LayoutDashboard },
  { href: "/dashboard/admin/requests", label: "Tracking colis", icon: ShipWheel },
  { href: "/dashboard/admin/clients", label: "Clients", icon: Users },
  { href: "/dashboard/admin/products", label: "Produits", icon: Package },
  { href: "/dashboard/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/dashboard/admin/cms", label: "Contenu", icon: FileText },
  { href: "/dashboard/admin/parametres", label: "Paramètres", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background/95 p-4 backdrop-blur md:flex md:flex-col">
      <Link href="/dashboard/admin" className="mb-6 block">
        <span className="block text-sm font-semibold tracking-tight">JC Admin</span>
        <span className="mt-1 block text-[11px] text-muted-foreground">Tracking & contenu</span>
      </Link>
      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active && "bg-muted text-foreground shadow-sm",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-md border bg-muted/30 p-3">
        <p className="text-xs font-medium">Flux recommandé</p>
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
          Client, colis, trajet, publication, puis suivi des étapes.
        </p>
      </div>
    </aside>
  );
}
