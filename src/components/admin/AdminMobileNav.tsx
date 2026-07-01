"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Package,
  Globe, FileText, Settings, MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const ADMIN_MOBILE_ITEMS = [
  { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/admin/clients", label: "Clients", icon: Users },
  { href: "/dashboard/admin/requests", label: "Expéditions", icon: Package },
  { href: "/dashboard/admin/blog", label: "Blog", icon: FileText },
  { href: "/dashboard/admin/pays", label: "Pays", icon: Globe },
];

const ADMIN_MORE_ITEMS = [
  { href: "/dashboard/admin/cms", label: "CMS", icon: FileText },
  { href: "/dashboard/admin/parametres", label: "Paramètres", icon: Settings },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur-sm md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-1 py-0.5">
          {ADMIN_MOBILE_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0 px-2 py-0.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive && "text-foreground")} />
                <span>{label}</span>
              </Link>
            );
          })}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="flex flex-col items-center gap-0 px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
              <span>Plus</span>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[60vh]">
              <SheetHeader>
                <SheetTitle>Navigation admin</SheetTitle>
              </SheetHeader>
              <div className="mt-4 grid gap-2">
                {ADMIN_MORE_ITEMS.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}
