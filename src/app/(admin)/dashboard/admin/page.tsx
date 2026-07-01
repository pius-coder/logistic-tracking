import Link from "next/link";
import { Suspense } from "react";
import { AdminDashboardShell } from "@/components/admin-dashboard/AdminDashboardShell";
import { AdminCardSkeleton } from "@/components/admin/AdminCardSkeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  ShoppingBag,
  Tags,
  CreditCard,
  Star,
  Globe,
  FileText,
  Settings,
  Newspaper,
} from "lucide-react";

const ADMIN_CARDS = [
  { href: "/dashboard/admin/requests", label: "Demandes", description: "Gérer les demandes des clients", detail: "Consulter, mettre à jour le statut, éditer la trajectoire", icon: Package },
  { href: "/dashboard/admin/clients", label: "Clients", description: "Gestion des comptes clients", detail: "Voir les utilisateurs, bloquer, promouvoir admin", icon: Users },
  { href: "/dashboard/admin/produits", label: "Produits", description: "Catalogue et références", detail: "Ajouter, modifier, supprimer des produits", icon: ShoppingBag },
  { href: "/dashboard/admin/categories", label: "Catégories", description: "Familles de produits", detail: "Organiser le catalogue", icon: Tags },
  { href: "/dashboard/admin/paiements", label: "Paiements", description: "Suivi des transactions", detail: "Valider, rejeter, voir l'historique", icon: CreditCard },
  { href: "/dashboard/admin/avis", label: "Avis", description: "Modération des avis", detail: "Approuver ou rejeter les avis clients", icon: Star },
  { href: "/dashboard/admin/pays", label: "Pays", description: "Géographie et devises", detail: "Gérer les pays, taux de change", icon: Globe },
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
