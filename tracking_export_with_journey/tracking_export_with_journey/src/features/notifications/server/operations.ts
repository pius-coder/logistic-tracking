import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { z } from "zod";

export const notificationsGetMyNotifications = defineOperationFn("notifications.getMyNotifications")
  .query()
  .entities(["JcNotification"])
  .auth()
  .handler(async ({ ctx }) => {
    const notifications = await ctx.db.jcNotification.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        createdAt: true,
        isRead: true,
        deepLink: true,
      },
    });
    return { notifications };
  });

export const notificationsMarkAsRead = defineOperationFn("notifications.markAsRead")
  .mutate()
  .input(z.object({ id: z.string().min(1) }))
  .entities(["JcNotification"])
  .auth()
  .handler(async ({ ctx, input }) => {
    await ctx.db.jcNotification.updateMany({
      where: { id: input.id, userId: ctx.user.id },
      data: { isRead: true },
    });
    return { success: true };
  });

export const notificationsMarkAllAsRead = defineOperationFn("notifications.markAllAsRead")
  .mutate()
  .entities(["JcNotification"])
  .auth()
  .handler(async ({ ctx }) => {
    await ctx.db.jcNotification.updateMany({
      where: { userId: ctx.user.id, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  });
