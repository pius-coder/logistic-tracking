import { Skeleton } from "@/components/ui/skeleton";
import { User, Phone, Mail, CheckCircle2, Shield, Key, Building2 } from "lucide-react";

export function CompteSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div className="animate-fade-in-up">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="mt-1 h-9 w-48 rounded" />
      </div>

      <div className="overflow-hidden rounded-3xl border bg-card shadow-soft animate-fade-in-up delay-100">
        <div className="surface-primary px-6 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl bg-white/15" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 rounded bg-white/20" />
              <Skeleton className="h-4 w-24 rounded bg-white/15" />
            </div>
          </div>
        </div>
        <div className="divide-y divide-border/50">
          {[
            { icon: User },
            { icon: Phone },
            { icon: Mail },
            { icon: CheckCircle2 },
          ].map(({ icon: Icon }, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-4 sm:px-8">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="ml-auto h-4 w-32 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 animate-fade-in-up delay-200">
        {[Shield, Key].map((Icon, i) => (
          <div key={i} className="group flex items-center gap-3 h-auto py-4 rounded-2xl border bg-card shadow-softp-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-primary h-20p-2 animate-fade-in-up delay-300 flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
          <Building2 className="h-5 w-5 text-white/60" />
        </div>
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-28 rounded bg-white/20" />
          <Skeleton className="h-3 w-36 rounded bg-white/15" />
        </div>
      </div>
    </main>
  );
}
