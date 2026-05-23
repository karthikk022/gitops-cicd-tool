# KubeFlux — GitOps Continuous Delivery Dashboard

A full-stack GitOps management platform for visualizing, monitoring, and controlling Kubernetes deployments across clusters. Built with React, tRPC, and MySQL.

## Features

- **Dashboard** — Real-time overview of applications with health/sync status
- **Application Management** — Track desired vs live commits, resource counts, image tags
- **Resource Topology** — Interactive visual graph of deployed applications
- **Repository Config** — Manage Git repos (YAML, Helm, Kustomize) per cluster/namespace
- **Deployment History** — Full audit trail with commits, authors, durations
- **Sync Operations** — Trigger manual syncs, view sync history with commit diffs
- **Rollback Management** — One-click rollback to previous deployments
- **Cluster Management** — Multi-cluster support with health tracking
- **Role-Based Access** — User/admin roles with OAuth authentication

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts |
| **Backend** | tRPC 11, Hono, Drizzle ORM, MySQL |
| **Infrastructure** | Docker, GitHub Actions |
| **Auth** | OAuth + JWT (jose) |

## Quick Start

```bash
git clone https://github.com/karthikk022/gitops-cicd-tool.git
cd gitops-cicd-tool
npm install
cp .env.example .env
npm run db:push
npm run dev
```

## Project Structure

```
api/              # tRPC routers (app, repo, deployment, sync, cluster, notification)
src/              # React frontend (pages, components, providers)
contracts/        # Shared types & validation
db/               # Schema, migrations, seed data
Dockerfile        # Multi-stage production build
```

## Database

Tables: users, clusters, repositories, applications, deployments, sync_history, notifications

## License

MIT