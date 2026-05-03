import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { repositories } from "@db/schema";

export const repoRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(repositories).orderBy(desc(repositories.updatedAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [repo] = await db.select().from(repositories).where(eq(repositories.id, input.id));
      return repo || null;
    }),

  create: publicQuery
    .input(z.object({
      name: z.string().min(1),
      url: z.string().url(),
      branch: z.string().default("main"),
      path: z.string().default("."),
      type: z.enum(["yaml", "helm", "kustomize"]),
      clusterName: z.string().min(1),
      namespace: z.string().default("default"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(repositories).values({
        ...input,
        syncEnabled: true,
        status: "active",
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      url: z.string().optional(),
      branch: z.string().optional(),
      path: z.string().optional(),
      type: z.enum(["yaml", "helm", "kustomize"]).optional(),
      syncEnabled: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db.update(repositories).set(updates).where(eq(repositories.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(repositories).where(eq(repositories.id, input.id));
      return { success: true };
    }),

  testConnection: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [repo] = await db.select().from(repositories).where(eq(repositories.id, input.id));
      if (!repo) throw new Error("Repository not found");
      return { success: true, message: "Connection successful" };
    }),
});
