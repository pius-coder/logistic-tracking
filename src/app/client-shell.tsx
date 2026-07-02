"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors closeButton />
    </>
  );
}
