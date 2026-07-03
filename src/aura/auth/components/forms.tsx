"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuraForm, useAuraMutation } from "@/aura/client";
import { authLoginInputSchema, type AuthLoginInput } from "@/aura/shared/auth-schemas";
import type { AuthSessionResult } from "@/aura/shared/auth-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer ? <CardFooter>{footer}</CardFooter> : null}
      </Card>
    </main>
  );
}

function FormError({ error }: { error: unknown }) {
  if (!error) return null;
  const message = error instanceof Error ? error.message : "Une erreur est survenue.";
  return (
    <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { form, handleSubmit, mutation } = useAuraForm<
    AuthLoginInput,
    AuthSessionResult
  >({
    operationName: "auth.login",
    schema: authLoginInputSchema,
    defaultValues: {
      username: "",
      password: "",
    },
    mutation: {
      onSuccess() {
        router.push(redirectTo);
      },
    },
  });

  return (
    <AuthShell
      title="Connexion"
      description="Connectez-vous avec votre nom d&apos;utilisateur et mot de passe."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel>Nom d&apos;utilisateur</FieldLabel>
            <Input autoComplete="username" {...form.register("username")} />
            <FieldError>{form.formState.errors.username?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>Mot de passe</FieldLabel>
            <Input type="password" autoComplete="current-password" {...form.register("password")} />
            <FieldError>{form.formState.errors.password?.message}</FieldError>
          </Field>
        </FieldGroup>
        <FormError error={mutation.error} />
        <Button className="w-full" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </AuthShell>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const logout = useAuraMutation<undefined, { ok: true }>("auth.logout", {
    onSuccess() {
      router.push("/login");
    },
  });

  return (
    <Button
      disabled={logout.isPending}
      onClick={() => logout.mutate(undefined)}
      type="button"
      variant="outline"
    >
      {logout.isPending ? "Déconnexion..." : "Se déconnecter"}
    </Button>
  );
}
