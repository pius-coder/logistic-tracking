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
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().max(40).optional().or(z.literal("")),
    businessName: z.string().max(160).optional().or(z.literal("")),
    countryId: z.string().optional().nullable(),
    currencyCode: z.string().max(10).optional().or(z.literal("")),
    isAdmin: z.boolean().default(false),
  }))
  .entities(["AuraUser", "AuraPasswordCredential"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const existing = await ctx.db.auraUser.findFirst({
      where: {
        OR: [
          { username: input.username },
          ...(input.email ? [{ email: input.email }] : []),
        ],
      },
    });
    if (existing) {
      throw new Error("Ce client existe déjà.");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await ctx.db.auraUser.create({
      data: {
        username: input.username,
        displayName: input.displayName,
        email: input.email || null,
        phone: input.phone || null,
        businessName: input.businessName || null,
        countryId: input.countryId || null,
        currencyCode: input.currencyCode || null,
        isAdmin: input.isAdmin,
        passwordCredential: {
          create: { passwordHash },
        },
      },
    });

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
      businessName: user.businessName,
      isAdmin: user.isAdmin,
    };
  });
