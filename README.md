# KubeFlux — GitOps Continuous Delivery Dashboard

<div align="center">

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/react-19-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?style=flat&logo=trpc&logoColor=white)](https://trpc.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**A full-stack GitOps management platform for visualizing, monitoring, and controlling Kubernetes deployments across clusters.**

[Features](#features) • [Architecture](#architecture) • [Quick Start](#quick-start) • [Tech Stack](#tech-stack) • [Roadmap](#roadmap)

</div>

---

## Features

| Area | Capabilities |
|------|-------------|
| **Dashboard** | Real-time overview of all applications with health (healthy/degraded/missing) and sync (synced/outOfSync/failed) status |
| **Application Management** | Track desired vs live commits, resource counts, image tags, and deployment metadata |
| **Resource Topology** | Interactive visual graph showing deployed applications across clusters with zoom/pan/drag |
| **Repository Config** | Manage Git repositories (YAML, Helm, Kustomize) mapped to clusters and namespaces |
| **Deployment History** | Full audit trail with commit messages, authors, durations, and status tracking |
| **Sync Operations** | Trigger manual syncs, view sync history with commit diffs and operation details |
| **Rollback Management** | One-click rollback to any previous deployment |
| **Alerting** | Real-time notifications for deployments, syncs, and system events with severity levels |
| **Cluster Management** | Multi-cluster support with health tracking, node counts, and provider metadata |
| **Role-Based Access** | User/admin roles with OAuth authentication and JWT sessions |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Browser (React 19 + Vite)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Dashboard │  │ Topology  │  │  History │  │ Repositories │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│       │             │             │               │          │
│       └─────────────┴─────────────┴───────────────┘          │
│                         │ tRPC Client                        │
│                   @tanstack/react-query                      │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP (JSON over fetch)
┌─────────────────────────▼────────────────────────────────────┐
│                   KubeFlux API Server                         │
│              Hono + tRPC 11 + Superjson                       │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │App Router│  │Repo Router│  │Deploy    │  │  Sync Router │ │
│  │          │  │          │  │Router    │  │              │ │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────────┤ │
│  │Cluster   │  │Auth      │  │Notification              │ │
│  │Router    │  │Router    │  │Router                    │ │
│  └──────────┘  └──────────┘  └──────────────────────────┘ │
│                         │                                   │
│              ┌──────────┴──────────┐                        │
│              │   Drizzle ORM       │                        │
│              │   (MySQL 8)         │                        │
│              └──────────┬──────────┘                        │
└─────────────────────────┼──────────────────────────────────┘
                          │
                ┌─────────▼─────────┐
                │     MySQL 8       │
                │  (7 tables)       │
                └───────────────────┘
```

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **UI Framework** | React 19, React Router 7, TypeScript 5.9 |
| **Styling** | Tailwind CSS 3, tailwindcss-animate |
| **Components** | shadcn/ui (Radix UI primitives: dialog, dropdown, tabs, tooltip, etc.) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **API Layer** | tRPC 11 (server + client + react-query) |
| **Server** | Hono + @hono/node-server |
| **Serialization** | Superjson |
| **ORM** | Drizzle ORM + Drizzle Kit |
| **Database** | MySQL 8 (mysql2 driver) |
| **Authentication** | OAuth + JWT (jose) |
| **Validation** | Zod |
| **Object Storage** | AWS SDK S3 (presigned URLs) |
| **Build Tool** | Vite + esbuild |
| **Container** | Docker (multi-stage, node:20-alpine) |
| **Testing** | Vitest |

---

## Quick Start

### Prerequisites

- Node.js 20+
- MySQL 8+
- npm

### Local Development

```bash
# Clone and install
git clone https://github.com/karthikk022/gitops-cicd-tool.git
cd gitops-cicd-tool
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MySQL connection string (DATABASE_URL)

# Push database schema
npm run db:push

# Start development (frontend + backend)
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

### Docker Deployment

```bash
# Build the image
docker build -t kubeflux .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://user:pass@host:3306/kubeflux" \
  -e JWT_SECRET="your-secret" \
  kubeflux
```

### Database Setup

```bash
# Generate migrations after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly (dev)
npm run db:push

# Seed sample data
npm run db:seed
```

---

## Project Structure

```
├── api/                          # Backend (tRPC routers)
│   ├── routers/                  # Business logic routers
│   │   ├── app-router.ts         # Application CRUD, sync, rollback, stats
│   │   ├── repo-router.ts        # Repository management
│   │   ├── deployment-router.ts   # Deployment history
│   │   ├── sync-router.ts        # Sync operation logs
│   │   ├── cluster-router.ts     # Cluster management
│   │   └── notification-router.ts # Notifications & alerts
│   ├── auth-router.ts            # OAuth + JWT authentication
│   ├── middleware.ts             # tRPC context, auth middleware
│   ├── router.ts                 # Root tRPC router (merges all routers)
│   ├── boot.ts                   # Server entry point
│   └── context.ts                # Request context
├── src/                          # Frontend (React + Vite)
│   ├── pages/
│   │   ├── Dashboard.tsx         # Main dashboard with stats & app cards
│   │   ├── Topology.tsx          # Interactive resource topology graph
│   │   ├── Repositories.tsx      # Git repository management
│   │   ├── History.tsx           # Deployment history timeline
│   │   ├── Home.tsx              # Landing page
│   │   ├── AppDetail.tsx         # Single application details
│   │   ├── Rollback.tsx          # Rollback interface
│   │   ├── Settings.tsx          # User/cluster settings
│   │   ├── Login.tsx             # Authentication page
│   │   └── NotFound.tsx          # 404 page
│   ├── components/               # Reusable UI components
│   ├── providers/
│   │   └── trpc.tsx              # tRPC client provider
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility functions
│   ├── const.ts                  # Constants
│   ├── App.tsx                   # Root app with routing
│   └── main.tsx                  # Entry point
├── contracts/                    # Shared types & validation
│   ├── types.ts                  # Re-exports from DB schema
│   └── errors.ts                 # Error definitions
├── db/                           # Database
│   ├── schema.ts                 # All table definitions
│   ├── relations.ts              # Table relationships
│   ├── seed.ts                   # Sample data seeder
│   └── migrations/               # Drizzle Kit generated migrations
├── .env.example                  # Environment variable template
├── Dockerfile                    # Multi-stage production Docker build
├── drizzle.config.ts             # Drizzle Kit configuration
├── vite.config.ts                # Vite frontend config
├── vitest.config.ts              # Test configuration
└── package.json
```

---

## Database Schema

The application uses 7 MySQL tables managed by Drizzle ORM:

| Table | Description | Key Fields |
|-------|-------------|------------|
| `users` | User accounts with role-based access | id, name, email, role (user/admin), avatar |
| `clusters` | Kubernetes cluster connections | id, name, serverUrl, version, nodeCount, region, provider, status |
| `repositories` | Git repositories with deployment config | id, name, url, branch, path, type (yaml/helm/kustomize), cluster, namespace, syncEnabled |
| `applications` | Deployed applications with health tracking | id, name, repoId, cluster, health (healthy/degraded/missing/progressing), syncStatus, desiredCommit, liveCommit, resourceCount, imageTag |
| `deployments` | Full deployment audit trail | id, appId, commit, message, author, type (auto/manual/rollback), status, duration, resources, logs |
| `sync_history` | Sync operation logs | id, appId, trigger, status, oldCommit, newCommit, details |
| `notifications` | System alerts and events | id, type, severity, title, message, appId, read |

### Entity Relationships

```
users ──(author)── deployments
repositories ──── applications ──── deployments
clusters ──── applications
applications ──── sync_history
applications ──── notifications
```

---

## API Overview

Private tRPC API with type-safe client integration. The router tree:

```
ping                 →  Query   Health check
auth.login           →  Query   OAuth login
auth.logout          →  Mutation  Clear session
auth.me              →  Query   Current user info
app.list             →  Query   All applications
app.stats            →  Query   Aggregate stats (total, healthy, outOfSync, syncing)
app.sync             →  Mutation  Trigger application sync
app.rollback         →  Mutation  Rollback to previous deployment
repo.*               →  CRUD    Repository management
deployment.*         →  Query   Deployment history and details
sync.*               →  Query   Sync operation logs
cluster.*            →  CRUD    Cluster management
notification.*       →  Query   Notifications with filtering
```

All endpoints are fully type-safe — the client receives inferred types from the server router.

---

## UI Theme

KubeFlux features a cyberpunk terminal-inspired design:

- **Primary**: `#00ff41` (neon green) — status indicators, highlights
- **Background**: `#0a0f0a` (dark forest) — main background
- **Surface**: `#111810` (card background) — panels and cards
- **Text**: `#b8e6c1` (soft green) — body text
- **Accent**: `rgba(0,255,65,0.15)` — borders and hover states

Severity colors follow intuitive patterns:
- Healthy → green, Degraded → amber, Missing → red, Syncing → blue

---

## Roadmap

- [ ] Real Kubernetes API integration (watch events via informers, apply manifests)
- [ ] Git webhook receiver for automatic sync on push
- [ ] Slack / Discord / PagerDuty notification channels
- [ ] Grafana dashboard embedding for application metrics
- [ ] Multi-user team workspaces with permissions
- [ ] Terraform provider for GitOps bootstrapping
- [ ] Helm chart for KubeFlux self-deployment on Kubernetes
- [ ] Prometheus metrics exporter for KubeFlux itself

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

**Built with** React 19, TypeScript, tRPC 11, Hono, Drizzle ORM, MySQL 8, Tailwind CSS, shadcn/ui, and Docker.
