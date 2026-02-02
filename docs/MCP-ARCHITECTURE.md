# AgentZoo MCP Architecture

How the webapp, IDE agent, and persistent config stay in sync.

---

## The Problem

- **Webapp**: User customizes agents (skills, personality, etc.) in a cozy UI.
- **IDE**: An agent (e.g. Cursor’s agent) needs to read that config and behave accordingly.
- **MCP**: Agents are _clients_ that talk to MCP _servers_. The server can’t “connect to an agent”; the agent connects to the server.

So we need: **one source of truth** (a store) that the webapp writes to and an **MCP server** the IDE agent connects to that reads (and optionally writes) that same store.

---

## High-Level Flow

```
┌─────────────────┐         ┌──────────────────────────────────┐         ┌─────────────────┐
│   AgentZoo      │  write  │   Shared store                    │  read   │   Cursor / IDE  │
│   Webapp        │ ──────► │   (e.g. agents.json on disk)      │ ◄────── │   Agent         │
│   (browser)     │         │                                  │         │   (MCP client)   │
└────────┬────────┘         └────────────────┬─────────────────┘         └────────┬────────┘
         │                                  │                                    │
         │         ┌────────────────────────┴────────────────────────┐          │
         │         │   AgentZoo Server (one process)                  │          │
         │  HTTP   │   - Serves MCP (resources + optional tools)      │   MCP    │
         └────────►│   - Serves API for webapp (read/write store)     │◄─────────┘
                   │   - Owns all read/write to the store             │
                   └─────────────────────────────────────────────────┘
```

- **Store**: Single source of truth (e.g. one JSON file or SQLite DB).
- **AgentZoo Server**: Only process that touches the store. It:
  - Exposes **MCP** so the IDE agent can read (and maybe update) config.
  - Exposes a small **HTTP/WebSocket API** so the webapp can read/write config.
- **Webapp**: Talks to the server over HTTP/WS; never touches the filesystem.
- **IDE agent**: Connects to the AgentZoo MCP server and reads resources (and calls tools if you add them).

---

## Component Details

### 1. Shared Store (MVP: single file)

**Location**: e.g. `~/.agent-zoo/agents.json` or `<workspace>/.agent-zoo/agents.json`.

**Shape**:

```json
{
  "agents": [
    {
      "id": "agent-1",
      "name": "Helper",
      "description": "A helpful coding assistant",
      "systemPrompt": "You are a concise coding assistant.",
      "skillCategories": [
        { "id": "cat-1", "name": "Coding", "color": "#f97316" }
      ],
      "skills": [
        {
          "id": "skill-a",
          "name": "TypeScript Expert",
          "description": "Prefer strict types, use interfaces...",
          "categoryId": "cat-1",
          "enabled": true
        }
      ],
      "contextRefs": [],
      "appearanceSeed": "helper"
    }
  ]
}
```

- `skills`: Array of skill objects with `enabled` flag (not a simple boolean map).

You can later add a DB; the server remains the only reader/writer.

---

### 2. AgentZoo Server (one process)

One long-running process that:

1. **Serves MCP** (stdio or SSE) so Cursor can attach.
2. **Serves HTTP** for the webapp (e.g. `http://localhost:3912`).

So Cursor runs the server as an MCP server; the webapp opens `http://localhost:3912` and uses REST or WebSocket to read/write.

**MCP resources** (read-only):

| URI                                       | Description                                                                                                                         |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `agent-zoo://agents`                      | List of all agents (id, name).                                                                                                      |
| `agent-zoo://agents/{id}`                 | Full config for one agent.                                                                                                          |
| `agent-zoo://agents/{id}/brain`           | Brain timeline entries for that agent. Query params: `type`, `tags` (comma-separated), `dateFrom`, `dateTo`, `pinned` (true/false). |
| `agent-zoo://agents/{id}/brain/{entryId}` | Single brain entry by ID.                                                                                                           |

The IDE agent fetches `agent-zoo://agents/{id}` (or uses the `agent_zoo_inject` tool) to know personality and which skills are on. Brain resources expose the agent’s timeline (decisions, milestones, notes, summaries).

**MCP tools**:

| Tool                            | Purpose                                                                                                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent_zoo_inject`              | Returns compiled prompt or structured data for injection. Args: `agentId` (required), `format` (`"compiled"` \| `"structured"`).                          |
| `agent_zoo_list_agents`         | Lists all agents (id, name). No args.                                                                                                                     |
| `agent_zoo_get_agent`           | Returns full agent config (not compiled). Args: `agentId` (required).                                                                                     |
| `agent_zoo_create_brain_entry`  | Create a brain timeline entry. Args: `agentId` (required), `type` (decision \| milestone \| note \| summary), `content`, `tags?`, `pinned?`, `metadata?`. |
| `agent_zoo_update_brain_entry`  | Update an existing brain entry. Args: `agentId` (required), `entryId` (required), `type?`, `content?`, `tags?`, `pinned?`, `metadata?`.                   |
| `agent_zoo_delete_brain_entry`  | Delete a brain entry. Args: `agentId` (required), `entryId` (required).                                                                                   |
| `agent_zoo_query_brain_entries` | Query brain entries with filters. Args: `agentId` (required), `type?`, `tags?`, `dateFrom?`, `dateTo?`, `pinned?`.                                        |

The primary use case is `agent_zoo_inject` — called when starting a fresh chat to get the compiled system prompt.

**MCP prompts**:

| Name                      | Description                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `agent_zoo_use_{agentId}` | “Use Agent: {name}” — inject that agent’s persona and skills (one prompt per agent). |

Prompts return a single user message containing the injection text (intro + systemPrompt + active skills). Use when the IDE supports prompt templates to adopt an agent in one action.

**HTTP API for webapp**:

| Method | Path              | Purpose                                       |
| ------ | ----------------- | --------------------------------------------- |
| GET    | `/api/agents`     | List agents.                                  |
| GET    | `/api/agents/:id` | Get one agent config.                         |
| PUT    | `/api/agents/:id` | Update one agent (personality, skills, etc.). |
| POST   | `/api/agents`     | Create agent.                                 |

Server loads/saves the store on each read/write (or use a simple in-memory cache with write-through).

---

### 3. Webapp

- **Static frontend** (e.g. Vite + React) served by the same server at `GET /` or by a separate static server that talks to `localhost:3912`.
- All mutations go through the HTTP API; no direct file access.
- Optional: WebSocket so the server can push “config changed” (e.g. if another client or the IDE updates something).

---

### 4. Cursor / IDE Setup

User adds the AgentZoo MCP server in Cursor (e.g. in `.cursor/mcp.json` or Cursor settings):

```json
{
  "mcpServers": {
    "agent-zoo": {
      "command": "npx",
      "args": ["-y", "agent-zoo-server"],
      "env": {
        "AGENT_ZOO_STORE_PATH": "%USERPROFILE%/.agent-zoo/agents.json"
      }
    }
  }
}
```

The server must:

- Speak MCP over stdio (or SSE if you prefer).
- Start the HTTP server in the same process so one run serves both MCP and webapp API.

When the user (or the agent) needs an agent’s config: use the **prompt** `agent_zoo_use_{agentId}` to inject persona in one step, or call **tool** `agent_zoo_inject` with `agentId` for compiled/structured output. For raw config, use `agent_zoo_get_agent` or the resource `agent-zoo://agents/{id}`. Brain tools and `agent-zoo://agents/{id}/brain` support reading/writing the agent’s timeline.

---

## How "Skills" Map Into Behavior

- **In the store**: `skills` is an array of `Skill` objects, each with `name`, `description`, `categoryId`, and `enabled` flag.
- **In the IDE**: Call `agent_zoo_inject` to get the compiled prompt. The tool:
  - Filters to only `enabled: true` skills.
  - Combines `systemPrompt` + skill descriptions into a single injectable prompt.
  - Returns either a compiled string or structured JSON (personality + skills list).

So "skills" in the UI are persisted skill definitions with toggles; `agent_zoo_inject` compiles them into a ready-to-use system prompt for the IDE.

---

## Summary

| Piece               | Responsibility                                                                          |
| ------------------- | --------------------------------------------------------------------------------------- |
| **Store**           | Single source of truth (file or DB).                                                    |
| **AgentZoo Server** | Only reader/writer of the store; exposes MCP (resources ± tools) + HTTP API for webapp. |
| **Webapp**          | UI that talks to the server over HTTP; no direct store access.                          |
| **IDE agent**       | MCP client that reads (and optionally updates) config via the AgentZoo server.          |

This keeps the architecture simple, avoids the “MCP server connecting to an agent” mistake, and gives you a clear path from “change in webapp” → “store updated” → “IDE agent reads updated config on next request.”
