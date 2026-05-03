import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { syncHistory } from "@db/schema";

export const syncRouter = createRouter({
  list: publicQuery
    .input(z.object({ appId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.appId) {
        return db
          .select()
          .from(syncHistory)
          .where(eq(syncHistory.appId, input.appId))
          .orderBy(desc(syncHistory.createdAt));
      }
      return db.select().from(syncHistory).orderBy(desc(syncHistory.createdAt));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [entry] = await db.select().from(syncHistory).where(eq(syncHistory.id, input.id));
      return entry || null;
    }),
});
