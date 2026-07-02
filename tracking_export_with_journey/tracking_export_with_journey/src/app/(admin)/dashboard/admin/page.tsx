import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminDashboardShell } from "@/components/admin-dashboard/AdminDashboardShell";
import { AdminCardSkeleton } from "@/components/admin/AdminCardSkeleton";

export const metadata: Metadata = {
  title: "Administration | JC Import Express",
  robots: "noindex, nofollow",
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  FileText,
  Settings,
  Newspaper,
} from "lucide-react";

const ADMIN_CARDS = [
  { href: "/dashboard/admin/requests", label: "Suivis", description: "Gérer le suivi des colis clients", detail: "Consulter, mettre à jour le statut, éditer la trajectoire", icon: Package },
  { href: "/dashboard/admin/clients", label: "Clients", description: "Gestion des comptes clients", detail: "Voir les utilisateurs, bloquer, promouvoir admin", icon: Users },
  { href: "/dashboard/admin/blog", label: "Blog", description: "Articles de blog", detail: "Créer, modifier, publier des articles", icon: Newspaper },
  { href: "/dashboard/admin/cms", label: "CMS", description: "Contenu du site", detail: "Éditer le texte de la page d'accueil", icon: FileText },
  { href: "/dashboard/admin/parametres", label: "Paramètres", description: "Configuration système", detail: "WhatsApp, Evolution API", icon: Settings },
];

export default function AdminDashboardPage() {
  return (
    <>
      <Suspense fallback={<AdminCardSkeleton />}>
        <AdminDashboardShell />
      </Suspense>
      
      <div className="mx-auto w-full max-w-6xl px-4 pb-8">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Navigation rapide</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ADMIN_CARDS.map(({ href, label, description, detail, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card className="transition-colors hover:bg-muted/50 h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">{label}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{detail}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
