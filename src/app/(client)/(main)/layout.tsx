import { callAuraServer } from "@/aura/server";
import { redirect } from "next/navigation";
import type { CompteData } from "@/components/compte/CompteTypes";
import { WhatsAppChallengeBanner } from "@/components/whatsapp/WhatsAppChallengeBanner";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    try {
        const u = await callAuraServer<CompteData>({
            operationName: "auth.me",
            source: "rsc",
        });
        if (u.user.onboardingCompleted === false) {
            redirect("/onboarding");
        }
    } catch {
        // Not authenticated — proceed with public rendering
    }

    return (
        <>
            <WhatsAppChallengeBanner />
            {children}
        </>
    );
}