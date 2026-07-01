import { Suspense } from "react";
import { VerifyLoginForm } from "@/aura/auth/components/forms";

export default function VerifyLoginPage() {
  return (
    <Suspense fallback={null}>
      <VerifyLoginForm />
    </Suspense>
  );
}
