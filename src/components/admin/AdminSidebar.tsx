"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Package,
  Globe, FileText, Settings, ChevronLeft, Newspaper,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const COLLAPSED_KEY = "admin-sidebar-collapsed";

const ADMIN_NAV_ITEMS = [
  { href: "/dashboard/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/admin/clients", label: "Clients", icon: Users },
  { href: "/dashboard/admin/requests", label: "Expéditions", icon: Package },
  { href: "/dashboard/admin/pays", label: "Pays", icon: Globe },
  { href: "/dashboard/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/dashboard/admin/cms", label: "CMS", icon: FileText },
  { href: "/dashboard/admin/parametres", label: "Paramètres", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  });

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 hidden h-screen flex-col border-r bg-background transition-all duration-300 md:flex",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        {!collapsed && (
          <Link href="/dashboard/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
            <span className="inline-flex h-2 w-2 rounded-md bg-green-500" />
            JC Import Express
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-7 w-7", collapsed && "mx-auto")}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Retour client" : undefined}
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Retour client</span>}
        </Link>
      </div>
    </aside>
  );
}
