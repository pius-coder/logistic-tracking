import type { Metadata } from "next";
import { LoginForm } from "@/aura/auth/components/forms";

export const metadata: Metadata = {
  title: "Connexion | JC Import Express",
  description: "Connectez-vous à votre compte JC Import Express pour gérer vos demandes d'import-export.",
};

export default function LoginPage() {
  return <LoginForm />;
}
