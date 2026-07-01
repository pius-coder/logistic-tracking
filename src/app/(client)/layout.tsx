import { AppLayout } from "@/components/layout/AppLayout";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <AppLayout>
{children}
      </AppLayout>
  );
}
