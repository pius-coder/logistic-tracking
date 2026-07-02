import "server-only";

import { AuraError } from "@/aura/core/errors";
import { defineOperationFn } from "../operation";
import { verifyPassword } from "./password";
import {
  createSession,
  revokeAllUserSessions,
  revokeCurrentSession,
} from "./session";
import { authLoginInputSchema } from "@/aura/shared/auth-schemas";
import type {
  AuthSessionListResult,
  AuthSessionResult,
  AuthUserSafe,
} from "@/aura/shared/auth-types";

function userSafe(user: {
  id: string;
  username: string;
  displayName: string | null;
  businessName: string | null;
  email: string | null;
  isAdmin: boolean;
  countryId: string | null;
  currencyCode: string | null;
  onboardingCompleted: boolean;
}): AuthUserSafe {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    businessName: user.businessName,
    email: user.email,
    isAdmin: user.isAdmin,
    countryId: user.countryId,
    currencyCode: user.currencyCode,
    onboardingCompleted: user.onboardingCompleted,
  };
}

export const authLogin = defineOperationFn("auth.login")
  .mutate()
  .input(authLoginInputSchema)
  .entities(["AuraUser", "AuraPasswordCredential", "AuraSession"])
  .public()
  .handler<AuthSessionResult>(async ({ ctx, input }) => {
    const user = await ctx.db.auraUser.findUnique({
      where: { username: input.username },
      include: { passwordCredential: true },
    });

    const isValidPassword = await verifyPassword(
      input.password,
      user?.passwordCredential?.passwordHash,
    );

    if (!user || user.disabledAt || user.deletedAt || !isValidPassword) {
      throw new AuraError("UNAUTHORIZED", "Identifiants invalides.");
    }

    await createSession(ctx, user.id);

    ctx.bump.success("Connexion réussie", "Bienvenue.");
    await ctx.audit.record("auth.login", {
      operation: "auth.login",
      userId: user.id,
    });

    return {
      user: userSafe({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        businessName: user.businessName,
        email: user.email,
        isAdmin: user.isAdmin,
        countryId: user.countryId,
        currencyCode: user.currencyCode,
        onboardingCompleted: user.onboardingCompleted,
      }),
    };
  });

export const authLogout = defineOperationFn("auth.logout")
  .mutate()
  .entities(["AuraSession"])
  .auth()
  .handler<{ ok: true }>(async ({ ctx }) => {
    await revokeCurrentSession(ctx);
    ctx.bump.success("Déconnecté", "Votre session est terminée.");
    await ctx.audit.record("auth.logout", { operation: "auth.logout" });
    return { ok: true };
  });

export const authMe = defineOperationFn("auth.me")
  .query()
  .entities(["AuraUser"])
  .auth()
  .handler<AuthSessionResult>(async ({ ctx }) => {
    return {
      user: userSafe({
        id: ctx.user.id,
        username: ctx.user.username,
        displayName: ctx.user.displayName,
        businessName: ctx.user.businessName,
        email: ctx.user.email,
        isAdmin: ctx.user.isAdmin,
        countryId: ctx.user.countryId,
        currencyCode: ctx.user.currencyCode,
        onboardingCompleted: ctx.user.onboardingCompleted,
      }),
    };
  });

export const authListSessions = defineOperationFn("auth.listSessions")
  .query()
  .entities(["AuraSession"])
  .auth()
  .handler<AuthSessionListResult>(async ({ ctx }) => {
    const sessions = await ctx.db.auraSession.findMany({
      where: {
        userId: ctx.user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastUsedAt: "desc" },
    });

    return {
      sessions: sessions.map((session) => ({
        id: session.id,
        expiresAt: session.expiresAt.toISOString(),
        lastUsedAt: session.lastUsedAt.toISOString(),
        createdAt: session.createdAt.toISOString(),
        current: session.id === ctx.session.id,
      })),
    };
  });

export const authRevokeAllSessions = defineOperationFn("auth.revokeAllSessions")
  .mutate()
  .entities(["AuraSession"])
  .auth()
  .handler<{ ok: true }>(async ({ ctx }) => {
    await revokeAllUserSessions(ctx.db, ctx.user.id);
    ctx.auth.clearSessionCookie();
    ctx.bump.success("Sessions révoquées", "Toutes vos sessions ont été fermées.");
    await ctx.audit.record("auth.revokeAllSessions", {
      operation: "auth.revokeAllSessions",
      userId: ctx.user.id,
    });
    return { ok: true };
  });

export const authOperations = [
  authLogin,
  authLogout,
  authMe,
  authListSessions,
  authRevokeAllSessions,
] as const;
