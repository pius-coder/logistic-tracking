import { redirect } from "next/navigation";
import { callAuraServer } from "@/aura/server/call";

export default async function LogoutPage() {
  await callAuraServer({ operationName: "auth.logout", source: "rsc" });
  redirect("/login");
}
