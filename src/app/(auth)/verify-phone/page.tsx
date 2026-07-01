import { Suspense } from "react";
import { VerifyPhoneForm } from "@/aura/auth/components/forms";

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={null}>
      <VerifyPhoneForm />
    </Suspense>
  );
}
