import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  json,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Clusters — Kubernetes clusters managed by KubeFlux
export const clusters = mysqlTable("clusters", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  serverUrl: varchar("serverUrl", { length: 500 }).notNull(),
  version: varchar("version", { length: 50 }),
  status: mysqlEnum("status", ["active", "inactive", "unreachable"]).default("active").notNull(),
  nodeCount: int("nodeCount").default(0),
  region: varchar("region", { length: 100 }),
  provider: varchar("provider", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Cluster = typeof clusters.$inferSelect;
export type InsertCluster = typeof clusters.$inferInsert;

// Repositories — Git repositories holding application configurations
export const repositories = mysqlTable("repositories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  branch: varchar("branch", { length: 100 }).default("main").notNull(),
  path: varchar("path", { length: 255 }).default(".").notNull(),
  type: mysqlEnum("type", ["yaml", "helm", "kustomize"]).notNull(),
  clusterName: varchar("clusterName", { length: 255 }).notNull(),
  namespace: varchar("namespace", { length: 100 }).default("default").notNull(),
  syncEnabled: boolean("syncEnabled").default(true).notNull(),
  lastCommit: varchar("lastCommit", { length: 255 }),
  lastSyncAt: timestamp("lastSyncAt"),
  status: mysqlEnum("status", ["active", "error", "syncing"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Repository = typeof repositories.$inferSelect;
export type InsertRepository = typeof repositories.$inferInsert;

// Applications — Kubernetes applications managed by GitOps
export const applications = mysqlTable("applications", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  repoId: bigint("repoId", { mode: "number", unsigned: true }).notNull(),
  namespace: varchar("namespace", { length: 100 }).default("default").notNull(),
  clusterName: varchar("clusterName", { length: 255 }).notNull(),
  health: mysqlEnum("health", ["healthy", "degraded", "missing", "unknown", "progressing"]).default("unknown").notNull(),
  syncStatus: mysqlEnum("syncStatus", ["synced", "outOfSync", "syncing", "failed"]).default("outOfSync").notNull(),
  desiredCommit: varchar("desiredCommit", { length: 255 }),
  liveCommit: varchar("liveCommit", { length: 255 }),
  resourceCount: int("resourceCount").default(0),
  imageTag: varchar("imageTag", { length: 255 }),
  url: varchar("url", { length: 500 }),
  status: mysqlEnum("status", ["active", "paused", "deleted"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

// Deployments — Deployment history for each application
export const deployments = mysqlTable("deployments", {
  id: serial("id").primaryKey(),
  appId: bigint("appId", { mode: "number", unsigned: true }).notNull(),
  commit: varchar("commit", { length: 255 }).notNull(),
  message: text("message"),
  author: varchar("author", { length: 255 }),
  type: mysqlEnum("type", ["auto", "manual", "rollback"]).default("auto").notNull(),
  status: mysqlEnum("status", ["success", "failed", "in_progress", "pending"]).default("pending").notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  duration: int("duration"),
  resources: json("resources"),
  logs: text("logs"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = typeof deployments.$inferInsert;

// SyncHistory — Sync operation log
export const syncHistory = mysqlTable("sync_history", {
  id: serial("id").primaryKey(),
  appId: bigint("appId", { mode: "number", unsigned: true }).notNull(),
  trigger: mysqlEnum("trigger", ["git_webhook", "manual", "scheduled"]).default("manual").notNull(),
  status: mysqlEnum("status", ["started", "completed", "failed"]).default("started").notNull(),
  oldCommit: varchar("oldCommit", { length: 255 }),
  newCommit: varchar("newCommit", { length: 255 }),
  message: text("message"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SyncHistory = typeof syncHistory.$inferSelect;
export type InsertSyncHistory = typeof syncHistory.$inferInsert;

// Notifications — System notifications and alerts
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  type: mysqlEnum("type", ["deployment", "sync", "alert", "system"]).default("system").notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "error", "success"]).default("info").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  appId: bigint("appId", { mode: "number", unsigned: true }),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
