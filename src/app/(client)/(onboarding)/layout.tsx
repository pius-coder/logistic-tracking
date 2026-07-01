import { callAuraServer } from "@/aura/server";
import { CompteData } from "@/components/compte/CompteTypes";
import { redirect } from "next/navigation";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const u = await callAuraServer<CompteData>({
        operationName: "auth.me",
        source: "rsc",
    });
    if (u.user.onboardingCompleted) redirect('/')

    return children
}