import { getDb } from "../api/queries/connection";
import {
  clusters,
  repositories,
  applications,
  deployments,
  syncHistory,
  notifications,
} from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding KubeFlux database...");

  // Clear existing data
  await db.delete(notifications);
  await db.delete(syncHistory);
  await db.delete(deployments);
  await db.delete(applications);
  await db.delete(repositories);
  await db.delete(clusters);

  // Seed Clusters
  const clusterData = [
    {
      name: "prod-cluster",
      serverUrl: "https://k8s.prod.internal:6443",
      version: "v1.29.2",
      status: "active" as const,
      nodeCount: 6,
      region: "us-east-1",
      provider: "eks",
    },
    {
      name: "staging-cluster",
      serverUrl: "https://k8s.staging.internal:6443",
      version: "v1.29.1",
      status: "active" as const,
      nodeCount: 3,
      region: "us-west-2",
      provider: "gke",
    },
  ];
  await db.insert(clusters).values(clusterData);
  console.log("Seeded 2 clusters");

  // Seed Repositories
  const repoData = [
    {
      name: "app-configs",
      url: "https://github.com/org/app-configs.git",
      branch: "main",
      path: "apps/guestbook",
      type: "kustomize" as const,
      clusterName: "prod-cluster",
      namespace: "default",
      syncEnabled: true,
      lastCommit: "a1b2c3d4e5f6789012345678901234567890abcd",
      status: "active" as const,
    },
    {
      name: "helm-charts",
      url: "https://github.com/org/helm-charts.git",
      branch: "main",
      path: "charts/api-gateway",
      type: "helm" as const,
      clusterName: "prod-cluster",
      namespace: "ingress",
      syncEnabled: true,
      lastCommit: "b2c3d4e5f6789012345678901234567890abcdef",
      status: "active" as const,
    },
    {
      name: "infra-manifests",
      url: "https://github.com/org/infra-manifests.git",
      branch: "main",
      path: "monitoring",
      type: "yaml" as const,
      clusterName: "staging-cluster",
      namespace: "monitoring",
      syncEnabled: true,
      lastCommit: "c3d4e5f6789012345678901234567890abcdef12",
      status: "active" as const,
    },
  ];
  await db.insert(repositories).values(repoData);
  console.log("Seeded 3 repositories");

  // Seed Applications
  const appData = [
    {
      name: "kustomize-guestbook",
      repoId: 1,
      namespace: "default",
      clusterName: "prod-cluster",
      health: "healthy" as const,
      syncStatus: "synced" as const,
      desiredCommit: "a1b2c3d4e5f6789012345678901234567890abcd",
      liveCommit: "a1b2c3d4e5f6789012345678901234567890abcd",
      resourceCount: 4,
      imageTag: "guestbook:v1.2.3",
      url: "https://guestbook.prod.internal",
      status: "active" as const,
    },
    {
      name: "helm-api-gateway",
      repoId: 2,
      namespace: "ingress",
      clusterName: "prod-cluster",
      health: "healthy" as const,
      syncStatus: "synced" as const,
      desiredCommit: "b2c3d4e5f6789012345678901234567890abcdef",
      liveCommit: "b2c3d4e5f6789012345678901234567890abcdef",
      resourceCount: 3,
      imageTag: "nginx-gateway:v2.1.0",
      url: "https://api.prod.internal",
      status: "active" as const,
    },
    {
      name: "prometheus-monitoring",
      repoId: 3,
      namespace: "monitoring",
      clusterName: "staging-cluster",
      health: "degraded" as const,
      syncStatus: "outOfSync" as const,
      desiredCommit: "c3d4e5f6789012345678901234567890abcdef12",
      liveCommit: "d4e5f6789012345678901234567890abcdef1234",
      resourceCount: 6,
      imageTag: "prometheus:v2.47.0",
      url: "https://prometheus.staging.internal",
      status: "active" as const,
    },
    {
      name: "grafana-dashboards",
      repoId: 3,
      namespace: "monitoring",
      clusterName: "staging-cluster",
      health: "healthy" as const,
      syncStatus: "synced" as const,
      desiredCommit: "e5f6789012345678901234567890abcdef123456",
      liveCommit: "e5f6789012345678901234567890abcdef123456",
      resourceCount: 2,
      imageTag: "grafana:10.2.0",
      url: "https://grafana.staging.internal",
      status: "active" as const,
    },
    {
      name: "redis-cache",
      repoId: 1,
      namespace: "cache",
      clusterName: "prod-cluster",
      health: "healthy" as const,
      syncStatus: "syncing" as const,
      desiredCommit: "f6789012345678901234567890abcdef12345678",
      liveCommit: "a1b2c3d4e5f6789012345678901234567890abcd",
      resourceCount: 2,
      imageTag: "redis:7.2-alpine",
      url: "redis://cache.prod.internal:6379",
      status: "active" as const,
    },
    {
      name: "postgres-db",
      repoId: 1,
      namespace: "database",
      clusterName: "prod-cluster",
      health: "healthy" as const,
      syncStatus: "synced" as const,
      desiredCommit: "7890123456789012345678901234567890abcdef",
      liveCommit: "7890123456789012345678901234567890abcdef",
      resourceCount: 3,
      imageTag: "postgres:15.4",
      url: "postgresql://db.prod.internal:5432",
      status: "active" as const,
    },
  ];
  await db.insert(applications).values(appData);
  console.log("Seeded 6 applications");

  // Seed Deployments
  const deploymentData = [
    {
      appId: 1,
      commit: "a1b2c3d4e5f6789012345678901234567890abcd",
      message: "Update guestbook to v1.2.3 with dark mode support",
      author: "sarah.chen@company.com",
      type: "auto" as const,
      status: "success" as const,
      duration: 142,
      resources: JSON.stringify([
        { kind: "Deployment", name: "guestbook-frontend", namespace: "default", status: "ready" },
        { kind: "Service", name: "guestbook-svc", namespace: "default", status: "ready" },
        { kind: "ConfigMap", name: "guestbook-config", namespace: "default", status: "ready" },
        { kind: "Ingress", name: "guestbook-ingress", namespace: "default", status: "ready" },
      ]),
      logs: "[2026-04-28T10:15:32Z] Starting sync...\n[2026-04-28T10:15:33Z] Fetching manifests from git...\n[2026-04-28T10:15:35Z] Applying 4 resources...\n[2026-04-28T10:15:38Z] Deployment guestbook-frontend updated\n[2026-04-28T10:15:40Z] Service guestbook-svc unchanged\n[2026-04-28T10:15:42Z] ConfigMap guestbook-config updated\n[2026-04-28T10:15:44Z] Ingress guestbook-ingress updated\n[2026-04-28T10:17:54Z] Sync completed successfully (2m 22s)",
    },
    {
      appId: 1,
      commit: "90123456789012345678901234567890abcdef12",
      message: "Fix guestbook CSS alignment issue",
      author: "mike.rodriguez@company.com",
      type: "manual" as const,
      status: "success" as const,
      duration: 89,
      resources: JSON.stringify([
        { kind: "Deployment", name: "guestbook-frontend", namespace: "default", status: "ready" },
        { kind: "Service", name: "guestbook-svc", namespace: "default", status: "ready" },
      ]),
      logs: "[2026-04-27T14:22:10Z] Manual sync initiated by admin\n[2026-04-27T14:22:12Z] Applying manifests...\n[2026-04-27T14:22:15Z] Deployment updated\n[2026-04-27T14:23:39Z] Sync completed",
    },
    {
      appId: 2,
      commit: "b2c3d4e5f6789012345678901234567890abcdef",
      message: "Upgrade nginx-gateway to v2.1.0 with rate limiting",
      author: "alex.kumar@company.com",
      type: "auto" as const,
      status: "success" as const,
      duration: 203,
      resources: JSON.stringify([
        { kind: "Deployment", name: "api-gateway", namespace: "ingress", status: "ready" },
        { kind: "Service", name: "gateway-svc", namespace: "ingress", status: "ready" },
        { kind: "ConfigMap", name: "gateway-config", namespace: "ingress", status: "ready" },
      ]),
      logs: "[2026-04-28T08:30:00Z] Starting sync...\n[2026-04-28T08:30:05Z] Helm chart detected, running helm upgrade...\n[2026-04-28T08:30:45Z] Values merged successfully\n[2026-04-28T08:31:10Z] Release api-gateway upgraded\n[2026-04-28T08:33:23Z] Sync completed (3m 23s)",
    },
    {
      appId: 3,
      commit: "c3d4e5f6789012345678901234567890abcdef12",
      message: "Update Prometheus scrape configs for new services",
      author: "jessica.park@company.com",
      type: "auto" as const,
      status: "failed" as const,
      duration: 45,
      resources: JSON.stringify([]),
      logs: "[2026-04-28T09:00:00Z] Starting sync...\n[2026-04-28T09:00:02Z] Error: failed to apply ConfigMap prometheus-config\n[2026-04-28T09:00:05Z] Error: configmap \"prometheus-config\" is invalid\n[2026-04-28T09:00:45Z] Sync failed",
    },
    {
      appId: 3,
      commit: "d4e5f6789012345678901234567890abcdef1234",
      message: "Rollback: Revert to previous stable config",
      author: "admin@company.com",
      type: "rollback" as const,
      status: "success" as const,
      duration: 67,
      resources: JSON.stringify([
        { kind: "Deployment", name: "prometheus-server", namespace: "monitoring", status: "ready" },
        { kind: "Service", name: "prometheus-svc", namespace: "monitoring", status: "ready" },
      ]),
      logs: "[2026-04-28T09:15:00Z] Rollback initiated\n[2026-04-28T09:15:02Z] Reverting to commit d4e5f678...\n[2026-04-28T09:15:10Z] Previous manifests applied\n[2026-04-28T09:16:07Z] Rollback completed successfully",
    },
    {
      appId: 4,
      commit: "e5f6789012345678901234567890abcdef123456",
      message: "Add new Grafana dashboard for API latency",
      author: "david.lee@company.com",
      type: "manual" as const,
      status: "success" as const,
      duration: 34,
      resources: JSON.stringify([
        { kind: "Deployment", name: "grafana", namespace: "monitoring", status: "ready" },
        { kind: "ConfigMap", name: "grafana-dashboards", namespace: "monitoring", status: "ready" },
      ]),
      logs: "[2026-04-27T11:00:00Z] Manual sync started\n[2026-04-27T11:00:15Z] Dashboard ConfigMap updated\n[2026-04-27T11:00:34Z] Sync completed",
    },
    {
      appId: 5,
      commit: "f6789012345678901234567890abcdef12345678",
      message: "Update Redis to 7.2-alpine with persistence enabled",
      author: "sarah.chen@company.com",
      type: "auto" as const,
      status: "in_progress" as const,
      duration: null,
      resources: JSON.stringify([]),
      logs: "[2026-05-03T12:00:00Z] Sync started...\n[2026-05-03T12:00:02Z] StatefulSet redis-cache update initiated\n[2026-05-03T12:00:05Z] Rolling update in progress (1/2 pods updated)...",
    },
    {
      appId: 6,
      commit: "7890123456789012345678901234567890abcdef",
      message: "Update PostgreSQL to 15.4 with backup config",
      author: "alex.kumar@company.com",
      type: "auto" as const,
      status: "success" as const,
      duration: 312,
      resources: JSON.stringify([
        { kind: "StatefulSet", name: "postgres", namespace: "database", status: "ready" },
        { kind: "Service", name: "postgres-svc", namespace: "database", status: "ready" },
        { kind: "PersistentVolumeClaim", name: "postgres-data", namespace: "database", status: "ready" },
      ]),
      logs: "[2026-05-02T22:00:00Z] Starting sync...\n[2026-05-02T22:00:05Z] StatefulSet update detected, performing rolling update...\n[2026-05-02T22:02:10Z] Pod postgres-0 terminated, new pod starting...\n[2026-05-02T22:04:30Z] Pod postgres-0 ready\n[2026-05-02T22:05:12Z] Sync completed (5m 12s)",
    },
  ];
  await db.insert(deployments).values(deploymentData);
  console.log("Seeded 8 deployments");

  // Seed Sync History
  const syncData = [
    { appId: 1, trigger: "git_webhook" as const, status: "completed" as const, oldCommit: "90123456789012345678901234567890abcdef12", newCommit: "a1b2c3d4e5f6789012345678901234567890abcd", message: "Git push detected, auto-sync completed", details: JSON.stringify({ resourcesChanged: 2, resourcesUnchanged: 2 }) },
    { appId: 1, trigger: "manual" as const, status: "completed" as const, oldCommit: "abcdef1234567890123456789012345678901234", newCommit: "90123456789012345678901234567890abcdef12", message: "Manual sync triggered by admin", details: JSON.stringify({ resourcesChanged: 1, resourcesUnchanged: 3 }) },
    { appId: 2, trigger: "git_webhook" as const, status: "completed" as const, oldCommit: "c3d4e5f6789012345678901234567890abcdef12", newCommit: "b2c3d4e5f6789012345678901234567890abcdef", message: "Helm chart updated, auto-sync completed", details: JSON.stringify({ resourcesChanged: 3, resourcesUnchanged: 0 }) },
    { appId: 3, trigger: "git_webhook" as const, status: "failed" as const, oldCommit: "d4e5f6789012345678901234567890abcdef1234", newCommit: "c3d4e5f6789012345678901234567890abcdef12", message: "ConfigMap validation failed", details: JSON.stringify({ error: "invalid ConfigMap format" }) },
    { appId: 3, trigger: "manual" as const, status: "completed" as const, oldCommit: "c3d4e5f6789012345678901234567890abcdef12", newCommit: "d4e5f6789012345678901234567890abcdef1234", message: "Rollback to previous stable version", details: JSON.stringify({ resourcesChanged: 2, resourcesUnchanged: 4 }) },
    { appId: 4, trigger: "manual" as const, status: "completed" as const, oldCommit: "f6789012345678901234567890abcdef12345678", newCommit: "e5f6789012345678901234567890abcdef123456", message: "Manual sync: dashboard updates", details: JSON.stringify({ resourcesChanged: 1, resourcesUnchanged: 1 }) },
    { appId: 5, trigger: "git_webhook" as const, status: "started" as const, oldCommit: "a1b2c3d4e5f6789012345678901234567890abcd", newCommit: "f6789012345678901234567890abcdef12345678", message: "StatefulSet rolling update in progress", details: JSON.stringify({ podsUpdated: 1, totalPods: 2 }) },
    { appId: 6, trigger: "scheduled" as const, status: "completed" as const, oldCommit: "890123456789012345678901234567890abcdef1", newCommit: "7890123456789012345678901234567890abcdef", message: "Scheduled sync: PostgreSQL maintenance", details: JSON.stringify({ resourcesChanged: 1, resourcesUnchanged: 2 }) },
    { appId: 1, trigger: "git_webhook" as const, status: "completed" as const, oldCommit: "0123456789012345678901234567890abcdef123", newCommit: "abcdef1234567890123456789012345678901234", message: "Auto-sync: guestbook styling update", details: JSON.stringify({ resourcesChanged: 1, resourcesUnchanged: 3 }) },
    { appId: 2, trigger: "manual" as const, status: "completed" as const, oldCommit: "d4e5f6789012345678901234567890abcdef1234", newCommit: "c3d4e5f6789012345678901234567890abcdef12", message: "Manual sync: rate limiting config update", details: JSON.stringify({ resourcesChanged: 1, resourcesUnchanged: 2 }) },
  ];
  await db.insert(syncHistory).values(syncData);
  console.log("Seeded 10 sync history entries");

  // Seed Notifications
  const notificationData = [
    { type: "deployment" as const, severity: "success" as const, title: "Deployment Successful", message: "kustomize-guestbook deployed successfully (v1.2.3)", appId: 1 },
    { type: "sync" as const, severity: "error" as const, title: "Sync Failed", message: "prometheus-monitoring sync failed: invalid ConfigMap", appId: 3 },
    { type: "deployment" as const, severity: "success" as const, title: "Rollback Complete", message: "prometheus-monitoring rolled back to stable version", appId: 3 },
    { type: "alert" as const, severity: "warning" as const, title: "Out of Sync", message: "prometheus-monitoring is out of sync with Git", appId: 3 },
    { type: "deployment" as const, severity: "info" as const, title: "Sync in Progress", message: "redis-cache rolling update started", appId: 5 },
    { type: "system" as const, severity: "info" as const, title: "Cluster Health Check", message: "prod-cluster: all nodes healthy (6/6)", appId: null },
    { type: "deployment" as const, severity: "success" as const, title: "Helm Upgrade Complete", message: "helm-api-gateway upgraded to v2.1.0", appId: 2 },
    { type: "alert" as const, severity: "warning" as const, title: "High Memory Usage", message: "postgres-db pod memory usage at 82%", appId: 6 },
  ];
  await db.insert(notifications).values(notificationData);
  console.log("Seeded 8 notifications");

  console.log("Seeding complete!");
}

seed().catch(console.error);
