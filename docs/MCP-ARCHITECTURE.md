# AgentZoo MCP Architecture

How the webapp, IDE agent, and persistent config stay in sync.

---

## The Problem

- **Webapp**: User customizes agents (skills, personality, etc.) in a cozy UI.
- **IDE**: An agent (e.g. Cursor’s agent) needs to read that config and behave accordingly.
- **MCP**: Agents are *clients* that talk to MCP *servers*. The server can’t “connect to an agent”; the agent connects to the server.

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

**Shape (minimal for MVP)**:

```json
{
  "agents": [
    {
      "id": "agent-1",
      "name": "Helper",
      "personality": "You are a concise coding assistant.",
      "skills": {
        "skill-a": true,
        "skill-b": false
      },
      "contextRefs": []
    }
  ],
  "currentAgentId": "agent-1"
}
```

- `currentAgentId`: which agent the IDE should use in this workspace (or globally).

You can later add a DB; the server remains the only reader/writer.

---

### 2. AgentZoo Server (one process)

One long-running process that:

1. **Serves MCP** (stdio or SSE) so Cursor can attach.
2. **Serves HTTP** for the webapp (e.g. `http://localhost:3912`).

So Cursor runs the server as an MCP server; the webapp opens `http://localhost:3912` and uses REST or WebSocket to read/write.

**MCP resources** (read-only for MVP):

| URI | Description |
|-----|-------------|
| `agent-zoo://agents` | List of all agents (id, name). |
| `agent-zoo://agents/{id}` | Full config for one agent. |
| `agent-zoo://agents/current` | Config for the agent selected as “current”. |

The IDE agent (or Cursor’s integration) fetches `agent-zoo://agents/current` to know personality and which skills are on.

**MCP tools (optional for MVP)**:

| Tool | Purpose |
|------|---------|
| `agent_zoo_get_config` | Returns current agent config (convenience wrapper around resource). |
| `agent_zoo_set_current_agent` | Sets `currentAgentId` (so user or agent can switch agent from IDE). |

You can skip tools at first and only use resources.

**HTTP API for webapp**:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/agents` | List agents. |
| GET | `/api/agents/:id` | Get one agent config. |
| PUT | `/api/agents/:id` | Update one agent (personality, skills, etc.). |
| POST | `/api/agents` | Create agent. |
| GET | `/api/current` | Get current agent id. |
| PUT | `/api/current` | Set current agent id. |

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

When the user (or the agent) needs the current agent’s config, the agent fetches the resource `agent-zoo://agents/current` (or calls `agent_zoo_get_config`). Cursor or your integration then uses that config (e.g. to build the system prompt or enable/disable skills).

---

## How “Skills” Map Into Behavior

- **In the store**: `skills` is a map of skill id → boolean (on/off).
- **In the IDE**: The agent (or a Cursor rule) reads `agent-zoo://agents/current`, sees which skills are `true`, and:
  - Injects instructions into the system prompt, or
  - Enables/disables other MCP servers or tools by name.

So “skills” in the UI are just a persisted list of toggles; the MCP server only exposes them. The actual behavior (which prompt to add, which tools to call) is implemented in the agent/rules that consume this config.

---

## Summary

| Piece | Responsibility |
|-------|----------------|
| **Store** | Single source of truth (file or DB). |
| **AgentZoo Server** | Only reader/writer of the store; exposes MCP (resources ± tools) + HTTP API for webapp. |
| **Webapp** | UI that talks to the server over HTTP; no direct store access. |
| **IDE agent** | MCP client that reads (and optionally updates) config via the AgentZoo server. |

This keeps the architecture simple, avoids the “MCP server connecting to an agent” mistake, and gives you a clear path from “change in webapp” → “store updated” → “IDE agent reads updated config on next request.”
