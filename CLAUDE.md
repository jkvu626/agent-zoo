# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AgentZoo is a personal agent hub that lets users customize AI agent personas (personality, skills) through a cozy game-like UI. The webapp writes to a shared store; IDE agents (e.g., Cursor) read from it via MCP.

## Commands

```bash
pnpm install              # Install dependencies
pnpm dev                  # Build types, then run server (3912) + webapp (5173) in parallel
pnpm dev:server           # Server only (HTTP API + MCP on stdio)
pnpm dev:webapp           # Webapp only (proxies /api to localhost:3912)
pnpm build                # Build all packages
pnpm start                # Run server after build
```

## Architecture

**Monorepo with three packages:**

- `packages/types` — Shared TypeScript types (`Agent`, `StoreShape`, input types)
- `packages/server` — Fastify HTTP API + MCP server in one Node process
- `packages/webapp` — React + Vite + Tailwind + Framer Motion

**Data flow:**

```
Webapp (browser)  ──HTTP──▶  Server (port 3912)  ◀──MCP/stdio──  Cursor/IDE
                                    │
                                    ▼
                           ~/.agent-zoo/agents.json
```

The server is the single reader/writer of the store. Webapp uses HTTP; IDE agents use MCP resources.

**Key server files:**

- `store.ts` — `AgentStore` interface + `JsonFileStore` implementation (swap to DB later without changing routes)
- `routes.ts` — Fastify HTTP endpoints (`/api/agents`)
- `mcp.ts` — MCP resource server (`agent-zoo://agents`, `agent-zoo://agents/{id}`)

**MCP resources (read-only):**

| URI                       | Returns                       |
| ------------------------- | ----------------------------- |
| `agent-zoo://agents`      | List of all agents (id, name) |
| `agent-zoo://agents/{id}` | Full config of specific agent |

## Type Definitions

Core types in `packages/types/src/index.ts`:

```typescript
interface Skill {
  id: string;
  name: string;
  description: string; // Injectable prompt fragment
  categoryId: string;
  enabled: boolean;
}

interface SkillCategory {
  id: string;
  name: string;
  color: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string; // Core personality/instructions
  skillCategories: SkillCategory[];
  skills: Skill[]; // Full skill objects with enabled flag
  contextRefs: string[]; // Reference paths/URLs
  appearanceSeed?: string; // For procedural sprite generation
}
```

## Design System

Design tokens are defined in `packages/webapp/src/theme.css` as CSS variables and extended in `tailwind.config.ts`. Key tokens:

- Colors: `--bg-app`, `--bg-panel`, `--accent-orange`, `--text-primary`
- Fonts: `--font-display` (Fredoka), `--font-body` (Cabin)
- Motion: `springBouncy`, `springSmooth` in `src/theme/motion.ts`

## Environment Variables

| Variable               | Default                    | Description         |
| ---------------------- | -------------------------- | ------------------- |
| `AGENT_ZOO_STORE_PATH` | `~/.agent-zoo/agents.json` | Store file location |
| `PORT`                 | `3912`                     | Server HTTP port    |

## Docs

- `docs/MCP-ARCHITECTURE.md` — How webapp, server, and IDE stay in sync
- `docs/TECH-STACK.md` — Stack rationale and design token strategy
- `docs/AESTHETICS.md` — Color palette, typography, motion design
- `docs/FRONTEND-LAYOUT.md` — UI structure and component organization
