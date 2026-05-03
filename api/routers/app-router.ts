import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { applications, deployments, syncHistory } from "@db/schema";

export const applicationRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        clusterName: z.string().optional(),
        health: z.string().optional(),
        syncStatus: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.clusterName) {
        conditions.push(eq(applications.clusterName, input.clusterName));
      }
      if (input?.health) {
        conditions.push(eq(applications.health, input.health as "healthy" | "degraded" | "missing" | "unknown" | "progressing"));
      }
      if (input?.syncStatus) {
        conditions.push(eq(applications.syncStatus, input.syncStatus as "synced" | "outOfSync" | "syncing" | "failed"));
      }

      if (conditions.length > 0) {
        return db.select().from(applications).where(and(...conditions)).orderBy(desc(applications.updatedAt));
      }
      return db.select().from(applications).orderBy(desc(applications.updatedAt));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [app] = await db.select().from(applications).where(eq(applications.id, input.id));
      if (!app) return null;

      const [latestDeployment] = await db
        .select()
        .from(deployments)
        .where(eq(deployments.appId, input.id))
        .orderBy(desc(deployments.createdAt))
        .limit(1);

      const recentSyncs = await db
        .select()
        .from(syncHistory)
        .where(eq(syncHistory.appId, input.id))
        .orderBy(desc(syncHistory.createdAt))
        .limit(5);

      return { ...app, latestDeployment, recentSyncs };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const allApps = await db.select().from(applications);
    const total = allApps.length;
    const healthy = allApps.filter(a => a.health === "healthy").length;
    const outOfSync = allApps.filter(a => a.syncStatus === "outOfSync").length;
    const syncing = allApps.filter(a => a.syncStatus === "syncing").length;
    const degraded = allApps.filter(a => a.health === "degraded").length;
    return { total, healthy, outOfSync, syncing, degraded };
  }),

  sync: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [app] = await db.select().from(applications).where(eq(applications.id, input.id));
      if (!app) throw new Error("Application not found");

      await db.update(applications).set({ syncStatus: "syncing" }).where(eq(applications.id, input.id));

      await db.insert(syncHistory).values({
        appId: input.id,
        trigger: "manual",
        status: "started",
        oldCommit: app.liveCommit,
        newCommit: app.desiredCommit,
        message: `Manual sync initiated for ${app.name}`,
      });

      await db.insert(deployments).values({
        appId: input.id,
        commit: app.desiredCommit || "unknown",
        message: "Manual sync deployment",
        author: "admin",
        type: "manual",
        status: "in_progress",
      });

      return { success: true, message: "Sync initiated" };
    }),

  rollback: publicQuery
    .input(z.object({ id: z.number(), deploymentId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [app] = await db.select().from(applications).where(eq(applications.id, input.id));
      const [targetDeploy] = await db.select().from(deployments).where(eq(deployments.id, input.deploymentId));
      if (!app || !targetDeploy) throw new Error("Application or deployment not found");

      await db.update(applications).set({
        syncStatus: "syncing",
        desiredCommit: targetDeploy.commit,
      }).where(eq(applications.id, input.id));

      await db.insert(syncHistory).values({
        appId: input.id,
        trigger: "manual",
        status: "started",
        oldCommit: app.liveCommit,
        newCommit: targetDeploy.commit,
        message: `Rollback to deployment ${input.deploymentId}`,
      });

      await db.insert(deployments).values({
        appId: input.id,
        commit: targetDeploy.commit,
        message: `Rollback to ${targetDeploy.commit?.slice(0, 7)}`,
        author: "admin",
        type: "rollback",
        status: "in_progress",
      });

      return { success: true, message: "Rollback initiated" };
    }),
});
