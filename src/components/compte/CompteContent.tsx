"use client";

import Link from "next/link";
import { useAuraQuery } from "@/aura/client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shield, Key, LogOut, ArrowUpRight, User, Mail, AtSign, CheckCircle2, Building2 } from "lucide-react";
import type { CompteData } from "./CompteTypes";

export function CompteContent({ initialData }: { initialData: CompteData }) {
  const { data } = useAuraQuery<CompteData>("auth.me", {
    initialData,
    staleTime: 15_000,
  });

  const value: CompteData = data ?? initialData;
  const user = value.user;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div className="animate-fade-in-up">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Mon compte</p>
        <h1 className="mt-1 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          {user.displayName || "Mon profil"}
        </h1>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-card shadow-soft animate-fade-in-up delay-100">
        <div className="surface-primary px-6 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white text-xl font-black">
              {(user.displayName || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-white">{user.displayName || "Utilisateur"}</p>
              <p className="text-sm text-white/60">{user.onboardingCompleted ? "Compte actif" : "Onboarding en cours"}</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-border/50">
          {[
            { icon: User, label: "Nom", value: user.displayName || "—" },
            { icon: AtSign, label: "Identifiant", value: user.username || "—" },
            { icon: Mail, label: "Email", value: user.email || "—" },
            { icon: CheckCircle2, label: "Statut", value: user.onboardingCompleted ? "Actif" : "Onboarding en cours" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-6 py-4 sm:px-8">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="ml-auto text-sm font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 animate-fade-in-up delay-200">
        <Link href="/account/security" className={cn(
          buttonVariants({ variant: "outline" }),
          "group justify-start gap-3 h-auto py-4 rounded-2xl border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-medium"
        )}>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Sécurité du compte</p>
            <p className="text-xs text-muted-foreground">Mot de passe et 2FA</p>
          </div>
          <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
        <Link href="/account/sessions" className={cn(
          buttonVariants({ variant: "outline" }),
          "group justify-start gap-3 h-auto py-4 rounded-2xl border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-medium"
        )}>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-primary/10">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Sessions actives</p>
            <p className="text-xs text-muted-foreground">Gérer vos appareils</p>
          </div>
          <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {user.isAdmin && (
        <Link href="/dashboard/admin" className={cn(
          buttonVariants(),
          "group justify-start gap-3 h-auto py-4 rounded-2xl animate-fade-in-up delay-300"
        )}>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Administration</p>
            <p className="text-xs text-white/70">Gérer le back-office</p>
          </div>
          <ArrowUpRight className="ml-auto h-4 w-4 text-white/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      )}
    </main>
  );
}
