import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { hashPassword } from "@/aura/server/auth/password";
import { z } from "zod";
import { requireAdmin } from "./common";

export const adminCreateUser = defineOperationFn("admin.createUser")
  .mutate()
  .input(z.object({
    username: z.string().min(3).max(50),
    displayName: z.string().min(1).max(100),
    password: z.string().min(8).max(100),
  }))
  .entities(["AuraUser", "AuraPasswordCredential"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const existing = await ctx.db.auraUser.findUnique({
      where: { username: input.username },
    });
    if (existing) {
      throw new Error("Ce nom d'utilisateur existe déjà.");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await ctx.db.auraUser.create({
      data: {
        username: input.username,
        displayName: input.displayName,
        passwordCredential: {
          create: { passwordHash },
        },
      },
    });

    return { id: user.id, username: user.username, displayName: user.displayName };
  });
