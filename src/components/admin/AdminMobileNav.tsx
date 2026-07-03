"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Settings, ShipWheel, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard/admin", label: "Pilotage", icon: LayoutDashboard },
  { href: "/dashboard/admin/requests", label: "Tracking", icon: ShipWheel },
  { href: "/dashboard/admin/clients", label: "Clients", icon: Users },
  { href: "/dashboard/admin/products", label: "Produits", icon: Package },
  { href: "/dashboard/admin/parametres", label: "Paramètres", icon: Settings },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background/95 px-1 py-2 backdrop-blur md:hidden">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md px-1 py-1 text-[10px] text-muted-foreground",
              active && "bg-muted text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
