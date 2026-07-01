import Link from "next/link";
import { CurrentUserCard, LogoutButton } from "@/aura/auth/components/forms";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AccountSecurityPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Compte</p>
          <h1 className="text-3xl font-semibold tracking-tight">Sécurité</h1>
        </div>
        <div className="flex gap-2">
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/dashboard"
          >
            Dashboard
          </Link>
          <LogoutButton />
        </div>
      </header>
      <CurrentUserCard />
      {/* <Card>
        <CardHeader>
          <CardTitle>Contrôles v1</CardTitle>
          <CardDescription>
            Aura v1 fournit les sessions opaques, OTP, reset password, CSRF et
            audit logs.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Les changements sensibles futurs peuvent être ajoutés comme opérations
          `.auth().use(...)` avec `AuraOtpPurpose.SENSITIVE_ACTION`.
        </CardContent>
      </Card> */}
    </main>
  );
}
