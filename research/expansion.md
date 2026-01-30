# Expansion Research: Scaling AgentZoo to Production

## Overview

This document explores options for deploying AgentZoo beyond local development, focusing on **Render** and **Vercel** as primary hosting platforms. We'll analyze the trade-offs, prerequisites, and migration steps needed before shipping.

---

## Current Architecture Constraints

### What We Have Now

```
┌─────────────────┐     ┌─────────────────────────────────────┐
│  Cursor (IDE)   │────▶│  Node.js Process (Port 3912)        │
│  via MCP/stdio  │     │  ┌─────────────────────────────────┐│
└─────────────────┘     │  │  Fastify HTTP API               ││
                        │  │  └── /api/agents                ││
┌─────────────────┐     │  │  └── /api/current               ││
│  React Webapp   │────▶│  ├─────────────────────────────────┤│
│  (Port 5173)    │     │  │  MCP Server (stdio)             ││
└─────────────────┘     │  └─────────────────────────────────┘│
                        │                 │                    │
                        │                 ▼                    │
                        │  ┌─────────────────────────────────┐│
                        │  │  ~/.agent-zoo/agents.json       ││
                        │  │  (File-based store)             ││
                        │  └─────────────────────────────────┘│
                        └─────────────────────────────────────┘
```

### Deployment Challenges

| Constraint | Issue for Cloud Deployment |
|------------|---------------------------|
| **File-based storage** | Cloud containers are ephemeral; files don't persist across restarts |
| **MCP over stdio** | Only works when IDE spawns the server locally |
| **Single process** | Both HTTP and MCP in one process; can't scale horizontally |
| **No authentication** | Anyone with URL access can modify agents |
| **CORS: all origins** | Security risk in production |

---

## Platform Comparison

### Vercel

**Best for:** Static sites, serverless functions, edge deployment

| Aspect | Details |
|--------|---------|
| **Pricing** | Hobby: Free (limited). Pro: $20/month/member |
| **Strengths** | Excellent DX, automatic deployments, edge network, great for React |
| **Weaknesses** | Serverless-only (no long-running processes), no WebSocket support on Hobby tier, cold starts |
| **Database** | Vercel Postgres, Vercel KV (Redis), or bring your own |
| **Fit for AgentZoo** | Frontend: Excellent. Backend: Poor (serverless doesn't suit our model) |

**Vercel Deployment Model:**
- Frontend: Static build → CDN
- API: Serverless functions (each route = separate function)
- No persistent connections (WebSocket requires Pro + specific setup)

### Render

**Best for:** Full-stack apps, long-running services, databases

| Aspect | Details |
|--------|---------|
| **Pricing** | Free tier: 750 hours/month with sleep. Starter: $7/month always-on |
| **Strengths** | Traditional server model, persistent disk, managed Postgres, WebSocket support |
| **Weaknesses** | Slower deploys than Vercel, less edge presence |
| **Database** | Managed PostgreSQL included |
| **Fit for AgentZoo** | Backend: Excellent. Frontend: Good (static site hosting available) |

**Render Deployment Model:**
- Web Service: Long-running Node.js process
- Static Site: Frontend build → CDN
- Managed database: PostgreSQL or Redis
- Persistent disk: Optional for file storage

### Railway

**Alternative worth considering:**

| Aspect | Details |
|--------|---------|
| **Pricing** | Usage-based: $5/month minimum + resources |
| **Strengths** | GitHub integration, databases included, simple UI |
| **Fit** | Similar to Render, good for full-stack |

### Fly.io

**Another alternative:**

| Aspect | Details |
|--------|---------|
| **Pricing** | Pay-as-you-go, generous free tier |
| **Strengths** | Edge deployment, great for low-latency global apps |
| **Fit** | More complex setup, but powerful |

---

## Recommended Approach: Hybrid Deployment

Given AgentZoo's architecture, the optimal strategy is:

```
┌──────────────────────────────────────────────────────────────────┐
│                        PRODUCTION SETUP                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐        ┌────────────────────┐           │
│  │  Vercel            │        │  Render            │           │
│  │  ┌──────────────┐  │        │  ┌──────────────┐  │           │
│  │  │ React Webapp │  │───────▶│  │ Fastify API  │  │           │
│  │  │ (Static)     │  │  HTTP  │  │ (Web Service)│  │           │
│  │  └──────────────┘  │        │  └──────┬───────┘  │           │
│  └────────────────────┘        │         │          │           │
│                                │         ▼          │           │
│                                │  ┌──────────────┐  │           │
│                                │  │ PostgreSQL   │  │           │
│                                │  │ (Managed)    │  │           │
│                                │  └──────────────┘  │           │
│                                └────────────────────┘           │
│                                                                  │
│  LOCAL (User's machine)                                         │
│  ┌─────────────────────────────────────────────────┐            │
│  │  Cursor IDE                                      │            │
│  │  └── MCP connection to local AgentZoo instance  │            │
│  │      (for real-time IDE integration)            │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Why This Setup?

1. **Vercel for frontend**: Fastest, best DX, automatic preview deployments
2. **Render for backend**: Supports long-running processes, managed database
3. **Local MCP for IDE**: MCP protocol requires local process (can't run in cloud for IDE integration)

---

## Prerequisites Before Shipping

### 1. Database Migration (Critical)

**Current:** File-based JSON store
**Target:** PostgreSQL with Prisma ORM

```bash
# Add Prisma to server package
pnpm --filter @agent-zoo/server add prisma @prisma/client
pnpm --filter @agent-zoo/server add -D prisma
```

**Schema:**
```prisma
// packages/server/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Agent {
  id          String   @id @default(uuid())
  name        String
  personality String   @db.Text
  skills      Json     @default("{}")
  contextRefs Json     @default("[]")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([name])
}

model Settings {
  id             String  @id @default("default")
  currentAgentId String?
}
```

**New Store Implementation:**
```typescript
// packages/server/src/stores/prisma-store.ts
import { PrismaClient } from '@prisma/client';
import type { AgentStore, Agent } from '@agent-zoo/types';

export class PrismaStore implements AgentStore {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAll(): Promise<Agent[]> {
    return this.prisma.agent.findMany();
  }

  async getById(id: string): Promise<Agent | null> {
    return this.prisma.agent.findUnique({ where: { id } });
  }

  async create(data: Omit<Agent, 'id'>): Promise<Agent> {
    return this.prisma.agent.create({ data });
  }

  async update(id: string, data: Partial<Agent>): Promise<Agent> {
    return this.prisma.agent.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.agent.delete({ where: { id } });
  }

  async getCurrentId(): Promise<string | null> {
    const settings = await this.prisma.settings.findUnique({
      where: { id: 'default' }
    });
    return settings?.currentAgentId ?? null;
  }

  async setCurrentId(id: string): Promise<void> {
    await this.prisma.settings.upsert({
      where: { id: 'default' },
      update: { currentAgentId: id },
      create: { id: 'default', currentAgentId: id }
    });
  }
}
```

### 2. Authentication (Critical for Multi-User)

**Options:**

| Solution | Complexity | Best For |
|----------|------------|----------|
| **Clerk** | Low | Fast integration, social logins |
| **Auth.js (NextAuth)** | Medium | If migrating to Next.js |
| **Supabase Auth** | Low | If using Supabase for DB |
| **Custom JWT** | High | Full control, no vendor lock-in |

**Recommended: Clerk**

```bash
pnpm --filter @agent-zoo/server add @clerk/fastify
pnpm --filter @agent-zoo/webapp add @clerk/clerk-react
```

**Server middleware:**
```typescript
import { clerkPlugin, getAuth } from '@clerk/fastify';

app.register(clerkPlugin);

app.addHook('preHandler', async (request, reply) => {
  const { userId } = getAuth(request);
  if (!userId && !request.url.startsWith('/public')) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  request.userId = userId;
});
```

**Per-user data isolation:**
```typescript
// All queries filter by userId
async getAll(userId: string): Promise<Agent[]> {
  return this.prisma.agent.findMany({ where: { userId } });
}
```

### 3. Environment Configuration (Critical)

**Required environment variables:**

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/agent_zoo

# Authentication (if using Clerk)
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Server
PORT=3912
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://agent-zoo.vercel.app

# Feature Flags
ENABLE_MCP=false  # Disable MCP in cloud (only for local use)
```

### 4. API Security Hardening (Required)

```typescript
// Rate limiting
import rateLimit from '@fastify/rate-limit';
app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// CORS restriction
app.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || false,
  credentials: true
});

// Helmet for security headers
import helmet from '@fastify/helmet';
app.register(helmet);
```

### 5. Build Pipeline (Required)

**GitHub Actions workflow:**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: packages/webapp

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Render
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## Detailed Platform Setup

### Vercel (Frontend)

**1. Project Configuration:**
```json
// packages/webapp/vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://agent-zoo-api.onrender.com/api/:path*" }
  ]
}
```

**2. Environment Variables (Vercel Dashboard):**
- `VITE_API_URL`: `https://agent-zoo-api.onrender.com`

**3. Deploy:**
```bash
cd packages/webapp
vercel --prod
```

### Render (Backend)

**1. Create `render.yaml`:**
```yaml
# render.yaml
services:
  - type: web
    name: agent-zoo-api
    env: node
    plan: starter
    buildCommand: pnpm install && pnpm build
    startCommand: node packages/server/dist/index.js
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: agent-zoo-db
          property: connectionString
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3912

databases:
  - name: agent-zoo-db
    plan: starter
    databaseName: agent_zoo
```

**2. Connect GitHub repo in Render dashboard**

**3. Run migrations on first deploy:**
```bash
pnpm prisma migrate deploy
```

---

## Migration Checklist

### Phase 1: Database Migration (Local)

- [ ] Add Prisma to server package
- [ ] Create schema.prisma with Agent and Settings models
- [ ] Generate Prisma client
- [ ] Implement PrismaStore class
- [ ] Add store factory that chooses JSON vs Prisma based on env
- [ ] Test locally with SQLite first
- [ ] Write migration script for existing JSON data

### Phase 2: Authentication

- [ ] Choose auth provider (recommend Clerk)
- [ ] Add auth middleware to server
- [ ] Add userId column to Agent model
- [ ] Update all store methods to filter by userId
- [ ] Add Clerk provider to webapp
- [ ] Wrap routes in auth checks
- [ ] Test auth flow locally

### Phase 3: Security Hardening

- [ ] Add rate limiting
- [ ] Restrict CORS origins
- [ ] Add Helmet security headers
- [ ] Enable HTTPS enforcement
- [ ] Add input validation (Zod schemas)
- [ ] Audit for injection vulnerabilities

### Phase 4: Infrastructure Setup

- [ ] Create Render account and project
- [ ] Create Vercel account and project
- [ ] Set up PostgreSQL on Render
- [ ] Configure environment variables
- [ ] Set up GitHub Actions for CI/CD
- [ ] Configure custom domain (optional)

### Phase 5: Deployment

- [ ] Deploy backend to Render
- [ ] Run database migrations
- [ ] Deploy frontend to Vercel
- [ ] Test full flow in production
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Document deployment process

---

## Cost Projections

### Minimum Viable (Single Developer)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Hobby | $0 |
| Render Web Service | Free | $0 |
| Render PostgreSQL | Free | $0 |
| **Total** | | **$0** |

**Limitations:** Free tiers sleep after inactivity, limited resources

### Starter Production

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Pro | $20 |
| Render Web Service | Starter | $7 |
| Render PostgreSQL | Starter | $7 |
| Clerk (optional) | Free tier | $0 |
| **Total** | | **$34/month** |

### Growth (50+ Users)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Pro | $20 |
| Render Web Service | Standard | $25 |
| Render PostgreSQL | Standard | $25 |
| Clerk | Pro | $25 |
| Sentry | Team | $26 |
| **Total** | | **$121/month** |

---

## Alternative Architectures

### Option A: All-in-One Supabase

Use Supabase for everything (database, auth, storage, realtime):

**Pros:**
- Single platform, simpler setup
- Built-in auth and realtime
- Generous free tier

**Cons:**
- Vendor lock-in
- Less control over API layer
- Would need to rewrite backend as Edge Functions

### Option B: Self-Hosted (VPS)

Deploy to a single VPS (DigitalOcean, Linode, Hetzner):

**Pros:**
- Full control
- Cheapest for sustained load ($5-10/month)
- Can run MCP server for cloud-based IDE integration

**Cons:**
- More DevOps work (Docker, nginx, SSL, etc.)
- Manual scaling
- You handle uptime

### Option C: Serverless-First (Rewrite)

Redesign for serverless (Vercel Functions + Vercel Postgres):

**Pros:**
- Scale to zero
- Edge deployment
- Simpler infrastructure

**Cons:**
- Significant rewrite needed
- Cold starts affect latency
- WebSocket support limited

---

## MCP in Production: The Elephant in the Room

### The Problem

MCP (Model Context Protocol) is designed for **local IDE integration via stdio**. It spawns the server as a child process of the IDE. This model **doesn't work in the cloud**.

### Solutions

**Option 1: Keep MCP Local Only**

Users run a local AgentZoo server for IDE integration:
```json
// .cursor/mcp.json
{
  "mcpServers": {
    "agent-zoo": {
      "command": "npx",
      "args": ["agent-zoo-cli"],
      "env": {
        "AGENT_ZOO_API": "https://agent-zoo-api.onrender.com"
      }
    }
  }
}
```

The local CLI syncs with the cloud API. Best of both worlds.

**Option 2: MCP over HTTP (Future)**

If MCP adds HTTP transport support, could expose MCP endpoints via REST. Not currently supported.

**Option 3: Build Cursor Extension**

Instead of MCP, build a proper Cursor extension that calls the cloud API directly. More work, better UX.

---

## Recommendation

### For MVP Launch

1. **Stay local** - Don't deploy to cloud yet
2. **Implement database abstraction** - Prepare for PostgreSQL
3. **Add authentication layer** - Even for single-user, good practice
4. **Focus on feature completion** - API integration, MCP tools

### For First Public Release

1. **Deploy frontend to Vercel** - Static hosting, preview deploys
2. **Deploy backend to Render** - Web service + PostgreSQL
3. **Ship a local CLI** - `npx agent-zoo` for MCP/IDE integration
4. **Hybrid model**: Cloud for data, local for IDE integration

### Long-Term

1. **Evaluate Cursor extension** - Better than MCP for cloud
2. **Consider Supabase** - Simplify stack if growing
3. **Add multi-tenancy** - For team features

---

## Appendix: Quick Start Commands

### Local Development

```bash
# Start everything
pnpm dev

# Backend only (http://localhost:3912)
pnpm dev:server

# Frontend only (http://localhost:5173)
pnpm dev:webapp
```

### Database Setup (When Ready)

```bash
# Initialize Prisma
cd packages/server
pnpm prisma init

# Create migration
pnpm prisma migrate dev --name init

# Generate client
pnpm prisma generate

# Open Prisma Studio
pnpm prisma studio
```

### Vercel Deployment

```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd packages/webapp
vercel --prod
```

### Render Deployment

```bash
# Create render.yaml in project root (see above)
# Push to GitHub
# Connect repo in Render dashboard
# Deploy triggers automatically on push to main
```
