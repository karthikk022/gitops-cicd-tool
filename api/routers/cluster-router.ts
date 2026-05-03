import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { clusters } from "@db/schema";

export const clusterRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(clusters);
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [cluster] = await db.select().from(clusters).where(eq(clusters.id, input.id));
      return cluster || null;
    }),
});
