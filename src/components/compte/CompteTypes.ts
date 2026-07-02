import type { AuthUserSafe } from "@/aura/shared/auth-types";

export type CompteUser = AuthUserSafe;

export interface CompteData {
  user: CompteUser;
}

export interface CompteParams {}
