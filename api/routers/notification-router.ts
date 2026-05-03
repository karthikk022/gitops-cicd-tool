import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { notifications } from "@db/schema";

export const notificationRouter = createRouter({
  list: publicQuery
    .input(z.object({ unreadOnly: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.unreadOnly) {
        return db
          .select()
          .from(notifications)
          .where(eq(notifications.read, false))
          .orderBy(desc(notifications.createdAt));
      }
      return db.select().from(notifications).orderBy(desc(notifications.createdAt));
    }),

  markRead: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(notifications).set({ read: true }).where(eq(notifications.id, input.id));
      return { success: true };
    }),

  markAllRead: publicQuery.mutation(async () => {
    const db = getDb();
    await db.update(notifications).set({ read: true }).where(eq(notifications.read, false));
    return { success: true };
  }),

  unreadCount: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(eq(notifications.read, false));
    return result[0]?.count || 0;
  }),
});
