import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { applicationRouter } from "./routers/app-router";
import { repoRouter } from "./routers/repo-router";
import { deploymentRouter } from "./routers/deployment-router";
import { syncRouter } from "./routers/sync-router";
import { clusterRouter } from "./routers/cluster-router";
import { notificationRouter } from "./routers/notification-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  app: applicationRouter,
  repo: repoRouter,
  deployment: deploymentRouter,
  sync: syncRouter,
  cluster: clusterRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
