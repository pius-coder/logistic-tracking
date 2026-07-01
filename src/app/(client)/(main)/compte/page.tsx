import { Suspense } from "react";
import { CompteShell } from "@/components/compte/CompteShell";
import { CompteSkeleton } from "@/components/compte/CompteSkeleton";

export default function ComptePage() {
  return (
    <Suspense fallback={<CompteSkeleton />}>
      <CompteShell />
    </Suspense>
  );
}
