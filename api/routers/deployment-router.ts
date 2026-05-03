import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { deployments, applications } from "@db/schema";

export const deploymentRouter = createRouter({
  list: publicQuery
    .input(z.object({ appId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(deployments)
        .where(eq(deployments.appId, input.appId))
        .orderBy(desc(deployments.createdAt));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [deploy] = await db.select().from(deployments).where(eq(deployments.id, input.id));
      return deploy || null;
    }),

  rollback: publicQuery
    .input(z.object({ appId: z.number(), deploymentId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [app] = await db.select().from(applications).where(eq(applications.id, input.appId));
      const [targetDeploy] = await db.select().from(deployments).where(eq(deployments.id, input.deploymentId));
      if (!app || !targetDeploy) throw new Error("Application or deployment not found");

      await db.insert(deployments).values({
        appId: input.appId,
        commit: targetDeploy.commit,
        message: `Rollback to ${targetDeploy.commit?.slice(0, 7)}: ${targetDeploy.message}`,
        author: "admin",
        type: "rollback",
        status: "in_progress",
      });

      await db.update(applications).set({
        syncStatus: "syncing",
        desiredCommit: targetDeploy.commit,
      }).where(eq(applications.id, input.appId));

      return { success: true, message: "Rollback initiated" };
    }),
});
