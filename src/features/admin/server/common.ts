import "server-only";

import { defineCommonFn } from "@/aura/server/operation";
import { AuraError } from "@/aura/core/errors";

export const requireAdmin = () =>
  defineCommonFn("requireAdmin").run(({ ctx }) => {
    if (!ctx.user?.isAdmin) {
      throw new AuraError("FORBIDDEN", "Acces reserve a l'administration.");
    }
  });
