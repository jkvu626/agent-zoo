# AgentZoo

Personal agent hub with MCP and a cozy UI. One server (HTTP API + MCP), one webapp, shared types.

## Prerequisites

- **Node.js** 20+
- **pnpm**

## Setup

```bash
pnpm install
```

## Scripts

| Command           | Description                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| `pnpm dev`        | Build shared types, then run server (port 3912) and webapp (port 5173) in parallel |
| `pnpm dev:server` | Run API + MCP server only                                                          |
| `pnpm dev:webapp` | Run Vite dev server only (proxies `/api` to 3912)                                  |
| `pnpm build`      | Build all packages                                                                 |
| `pnpm start`      | Run server (after build)                                                           |

## Project structure

- **`packages/types`** — Shared TypeScript types (`Agent`, `StoreShape`)
- **`packages/server`** — Fastify HTTP API + MCP server (stdio), JSON file store
- **`packages/webapp`** — Vite + React + Tailwind, design tokens, Framer Motion

## Docs

- [TECH-STACK.md](docs/TECH-STACK.md) — Stack and tooling
- [FRONTEND-LAYOUT.md](docs/FRONTEND-LAYOUT.md) — UI structure and flow
- [AESTHETICS.md](docs/AESTHETICS.md) — Design tokens
- [MCP-ARCHITECTURE.md](docs/MCP-ARCHITECTURE.md) — Store, server, and MCP flow

## Cursor MCP

To use AgentZoo as an MCP server in Cursor, add to `.cursor/mcp.json` or Cursor settings:

```json
{
  "mcpServers": {
    "agent-zoo": {
      "command": "pnpm",
      "args": ["--filter", "@agent-zoo/server", "run", "dev"],
      "env": {
        "AGENT_ZOO_STORE_PATH": "%USERPROFILE%/.agent-zoo/agents.json"
      }
    }
  }
}
```

On macOS/Linux use `$HOME/.agent-zoo/agents.json` for `AGENT_ZOO_STORE_PATH`.

### Inject an agent via slash prompt

Once the MCP server is running, open a new chat in Cursor and type `/` to see MCP prompts.
Select one of the AgentZoo prompts:

- **Use Current Agent** — injects the currently selected agent
- **Use Agent: {name}** — injects a specific agent

These prompts insert a user message that tells the assistant to adopt the agent's
persona and active skills for the conversation.
