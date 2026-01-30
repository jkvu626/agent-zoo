# 03 — MCP tool implementation spec

**Scope:** Add MCP tools so IDE agents (e.g. Cursor) can set the current agent, update personality, and toggle skills. Register tool schemas and implement handlers in the MCP server.

**References:** `research/next-steps.md`, `packages/server/src/mcp.ts`, MCP protocol docs, `@agent-zoo/types`.

---

## 1. Goals

- Extend the MCP server from read-only resources to **tools** (write operations).
- Enable the IDE to: set current agent, update agent personality, toggle a skill for an agent.
- Register tool names and input schemas so the IDE can discover and call them.
- Keep behavior consistent with the existing JSON store and API.

---

## 2. Current MCP limitations

The server currently exposes only **resources** (read-only):

- `agent-zoo://agents` — list all agents
- `agent-zoo://agents/current` — get current agent config
- `agent-zoo://agents/{id}` — get specific agent

**Gap:** IDE cannot switch current agent, update personality, or toggle skills via MCP.

---

## 3. Required MCP tools

Implement in `packages/server/src/mcp.ts` (or equivalent MCP entrypoint).

### 3.1 List tools (schema registration)

Respond to the MCP **ListTools** request with:

| Tool name                      | Description                                 | Required arguments                                          |
| ------------------------------ | ------------------------------------------- | ----------------------------------------------------------- |
| `agent_zoo_set_current`        | Set the current active agent                | `agentId` (string)                                          |
| `agent_zoo_update_personality` | Update an agent's system prompt/personality | `agentId` (string), `personality` (string)                  |
| `agent_zoo_toggle_skill`       | Enable or disable a skill for an agent      | `agentId` (string), `skillId` (string), `enabled` (boolean) |

Input schemas must be valid JSON Schema (e.g. `type: 'object'`, `properties`, `required`).

### 3.2 Tool handlers (CallTool)

- **`agent_zoo_set_current`**
  - Arguments: `agentId`.
  - Call store `setCurrentId(agentId)`.
  - Return a short text confirmation (e.g. "Current agent set to …").

- **`agent_zoo_update_personality`**
  - Arguments: `agentId`, `personality`.
  - Call store `update(agentId, { personality })`.
  - Return a short text confirmation.

- **`agent_zoo_toggle_skill`**
  - Arguments: `agentId`, `skillId`, `enabled`.
  - Get agent, merge `skills: { ...agent.skills, [skillId]: enabled }`, call store `update(agentId, { skills })`.
  - Return a short text confirmation (e.g. "Skill … enabled/disabled").
  - If agent not found, return or throw an appropriate error.

Use the same store instance as the rest of the server (e.g. JSON file store). Errors (e.g. agent not found) must be reported in the tool result or via MCP error handling, not silently ignored.

---

## 4. Implementation notes

- Use the existing MCP request handlers: `ListToolsRequestSchema` (or equivalent) for listing, `CallToolRequestSchema` for execution.
- Tool names should be stable; prefer snake*case and a prefix (e.g. `agent_zoo*`) to avoid clashes.
- No new backend routes are required; tools call into the same store used by the HTTP API.

---

## 5. Out of scope (for this spec)

- New MCP resources (read-only resources remain as-is).
- Backend input validation (see backend-hardening spec).
- Real-time sync or WebSocket.
- Cursor-specific UI or configuration (only MCP contract is specified).

---

## 6. Checklist

- [ ] ListTools returns the three tools with correct names and input schemas.
- [ ] `agent_zoo_set_current` updates current agent and returns confirmation.
- [ ] `agent_zoo_update_personality` updates agent personality and returns confirmation.
- [ ] `agent_zoo_toggle_skill` updates agent skills and returns confirmation.
- [ ] Missing or invalid arguments handled with clear error messages.
- [ ] Agent-not-found (and similar) cases handled and reported to the IDE.
