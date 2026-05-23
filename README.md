# KubeFlux — GitOps Continuous Delivery Dashboard

A full-stack GitOps management platform for visualizing, monitoring, and controlling Kubernetes deployments across clusters. Built with React, tRPC, and MySQL.

| Area          | Stack                                              |
|---------------|-------------------------------------------------------------|
| **Frontend**      | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts |
| **Backend**       | tRPC 11, Hono, Drizzle ORM, MySQL                  |
| *Infrastructure** | Docker, GitHub Actions CI                     |
| **Auth**          | OAuth with JWT (jose)                              |

## Features

- **Dashboard** — Real-time overview of all applications with health and sync status
- **Application Management** — Track desired vs live commits, resource counts, image tags
- **Resource Topology** — Interactive visual graph of deployed applications across clusters
- **Repository Config** — Manage Git repos (YAML, Helm, Kustomize) per cluster/namespace
- **Deployment History** — Full audit trail with commit messages, authors, durations
- **Sync Operations** — Trigger manual syncs, view sync history with commit diffs
- **Rollback Management** — One-click rollback to previous deployments
- **Alerting** — Real-time notifications for deployments, syncs, and system events
- **Cluster Management** — Multi-cluster support with health tracking
- **Role-Based Access** — User/admin roles with OAuth authentication

## Quick Start

### Prerequisites

- Node.js 20+
- MySQL 8+
- npm

### Setup

```bash
git clone https://github.com/karthikk022/gitops-cicd-tool.git
cd gitops-cicd-tool
npm install
cp .env.example .env
# Edit .env with your MySQL connection string
nom run db:push
npm run dev
```

### Docker

```bash
docker build -t kubeflux .
docker run -p 3000:3000 --env-file .env kubeflux
```

## Project Structure

```
api/                    # Backend API (tRPC routers)
  routers/              # app, repo, deployment, sync, cluster, notification
  auth-router.ts        # OAuth authentication
  middleware.ts         # tRPC middleware & context
  router.ts             # Root tRPC router
src/                    # Frontend (React + Vite)
  pages/                # Dashboard, Topology, Repositories, History, etc.
  components/           # Reusable UI components
  providers/            # tRPC, auth providers
  hooks/                # Custom React hooks
contracts/              # Shared types & validation
db/                     # Database schema & migrations
  schema.ts             # Tables: users, clusters, repos, apps, deployments, syncs, notifications
  seed.ts               # Seed data
  migrations/           # Drizzle Kit migrations
DOckerfile              # Multi-stage production build
`

## Database Schema

| Table          | Purpose                                       |
|----------------|----------------------------------------------------|
| `users`         | User accounts & roles                             |
| `clusters`      | Kubernetes cluster connections                  |
| `repositories`  | Git repos (YAML/Helm/Kustomize)               |
| `applications`  | Deployed apps with health/sync status         |
| `deployments`    | Full deployment audit trail                  |
| `sync_history`   | Sync operation logs                        |
| `notifications`  | System alerts & events                      |

## Tech Stack

| Category          | Technologies                                       |
|-----------------|----------------------------------------------------------------|
| **UI**            | React 19, React Router 7, Tailwind CSS, shadcn/ui |
| **Charts**         | Recharts                                         |
| **Icons**         | Lucide React                                      |
| **API***           | tRPC 11 (server + client + react-query)             |
| **Server**         | Hono + @hono/node-server                        |
| **ORM**            | Drizzle ORM + Drizzle Render                     |
| **Database**     | MySQL 8 (mysql2)                               |
| **Auth**           | OAuth + JWT (jose)                                |
| **Validation**    | Zod                                          |
| **Build**         | Vite + esbuild                                    |
| **Container**    | Docker (node:20-alpine)                          |
| **Testing**       | Vitest                                         |


## License

MIT
