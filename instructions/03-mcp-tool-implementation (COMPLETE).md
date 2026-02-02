# 03 — MCP tool implementation spec

> **STATUS: COMPLETE**
>
> MCP tools are implemented and functional (`agent_zoo_inject`, `agent_zoo_list_agents`, `agent_zoo_get_agent`, and brain entry tools).
>
> _Note: This spec originally used `systemPrompt` but the implementation uses `systemPrompt`. Spec updated to match._

**Scope:** Add MCP tools so IDE agents (e.g. Cursor) can **inject** customized agents into fresh chats. Users build agents in the webapp (systemPrompt + skills), then use MCP tools to apply that agent configuration to their current IDE session.

**References:** `research/next-steps.md`, `packages/server/src/mcp.ts`, MCP protocol docs, `@agent-zoo/types`.

---

## 1. Vision: Agent Injection

AgentZoo is an **agent customizer**. The workflow:

1. **Webapp**: User creates/customizes agents — writes a system prompt (`systemPrompt`), enables/disables skills, organizes skill categories.
2. **IDE**: User starts a fresh chat and "injects" the agent — the MCP tool returns the compiled system prompt and skill configuration.
3. **Chat**: The IDE uses the injected config to shape the agent's behavior for that session.

The primary MCP use case is **reading** the compiled agent configuration for injection, not editing agents from the IDE (editing happens in the webapp).

---

## 2. How Injection Works

When a user "injects" an agent, the IDE receives:

1. **System prompt** — The agent's `systemPrompt` field (the core instruction set).
2. **Enabled skills** — List of skills the agent has turned on, with their descriptions.
3. **Compiled prompt** (optional convenience) — A single string combining systemPrompt + skill instructions, ready to paste or use as a system message.

### Skill → Prompt Mapping

Each `Skill` has:

- `name` — Display name (e.g. "TypeScript Expert")
- `description` — The actual instruction/capability text (e.g. "You are an expert in TypeScript. Prefer strict types, use interfaces over type aliases...")
- `enabled` — Whether this skill is active

When compiling the prompt:

```
[Agent Personality]
{agent.systemPrompt}

[Active Skills]
- {skill.name}: {skill.description}
- {skill.name}: {skill.description}
...
```

The skill `description` field is the injectable prompt fragment. Skills with `enabled: false` are excluded.

---

## 3. Required MCP Tools

Implement in `packages/server/src/mcp.ts`.

### 3.1 Tool Summary

| Tool name               | Purpose                                      | Primary use                                 |
| ----------------------- | -------------------------------------------- | ------------------------------------------- |
| `agent_zoo_inject`      | Get an agent's compiled prompt for injection | **Main tool** — called when starting a chat |
| `agent_zoo_list_agents` | List available agents (id, name)             | Discover agents to switch to                |
| `agent_zoo_get_agent`   | Get full agent config (not compiled)         | Inspect raw agent data                      |

### 3.2 Tool Schemas & Handlers

#### `agent_zoo_inject` (Primary Tool)

Returns the compiled system prompt for the current (or specified) agent, ready for injection.

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "Agent ID to inject."
    },
    "format": {
      "type": "string",
      "enum": ["compiled", "structured"],
      "description": "Output format. 'compiled' = single string prompt. 'structured' = JSON with systemPrompt + skills separate. Defaults to 'compiled'."
    }
  },
  "required": ["agentId"]
}
```

**Response (format: "compiled"):**

```json
{
  "agentId": "agent-1",
  "agentName": "Code Wizard",
  "prompt": "You are a concise coding assistant...\n\n[Active Skills]\n- TypeScript Expert: Prefer strict types..."
}
```

**Response (format: "structured"):**

```json
{
  "agentId": "agent-1",
  "agentName": "Code Wizard",
  "systemPrompt": "You are a concise coding assistant...",
  "skills": [
    {
      "id": "ts-expert",
      "name": "TypeScript Expert",
      "description": "Prefer strict types..."
    },
    {
      "id": "test-driven",
      "name": "Test-Driven",
      "description": "Write tests first..."
    }
  ]
}
```

**Handler logic:**

1. Resolve agent (use `agentId` param).
2. If no agent found, return error.
3. Filter skills to only `enabled: true`.
4. If `format === "compiled"`: build the combined prompt string.
5. Return the response.

---

#### `agent_zoo_list_agents`

Lists all available agents for selection.

**Input schema:**

```json
{
  "type": "object",
  "properties": {},
  "required": []
}
```

**Response:**

```json
{
  "agents": [
    { "id": "agent-1", "name": "Code Wizard" },
    { "id": "agent-2", "name": "Documentation Pro" }
  ]
}
```

---

#### `agent_zoo_get_agent`

Returns the full raw agent configuration (for inspection, not injection).

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "Agent ID to retrieve."
    }
  },
  "required": ["agentId"]
}
```

**Response:** Full `Agent` object as JSON.

---

## 4. Typical IDE Workflows

### Workflow A: Inject agent into fresh chat

```
User: [starts new chat, wants to use their customized agent]
IDE:  → calls agent_zoo_list_agents()
      ← sees available agents
      → calls agent_zoo_inject({ agentId: "agent-1" })
      ← receives compiled prompt
      → uses prompt as system message or context
```

### Workflow B: Switch agent mid-session

```
User: "Switch to my Documentation Pro agent"
IDE:  → calls agent_zoo_list_agents()
      ← sees available agents
      → calls agent_zoo_inject({ agentId: "agent-2" })
      ← receives new prompt
```

### Workflow C: Inspect agent before using

```
User: "What skills does my Documentation Pro agent have?"
IDE:  → calls agent_zoo_inject({ agentId: "agent-2", format: "structured" })
      ← receives systemPrompt + skills list
      → displays to user
```

---

## 5. Compiled Prompt Format

The `agent_zoo_inject` tool (with `format: "compiled"`) produces a single string. Recommended structure:

```
You are now {agent.name}. Use agentId={agent.id} for all agent_zoo tool usage.

{systemPrompt}

---

## Active Skills

### {skill.name}
{skill.description}

### {skill.name}
{skill.description}

...
```

If no skills are enabled, omit the "Active Skills" section entirely.

If the systemPrompt is empty, start with the skills section (or return an error/warning).

---

## 6. Implementation Notes

- Import `ListToolsRequestSchema` and `CallToolRequestSchema` from MCP SDK.
- Add `tools: {}` to server capabilities.
- Tool names use `agent_zoo_` prefix (snake_case) to avoid collisions.
- All tools use the same store instance as HTTP routes.
- Return errors as structured responses, not thrown exceptions (MCP tools should gracefully report issues).

### Error Responses

```json
{
  "error": true,
  "code": "AGENT_NOT_FOUND",
  "message": "Agent with ID 'xyz' not found."
}
```

Common error codes:

- `AGENT_NOT_FOUND` — Requested agent doesn't exist
- `INVALID_FORMAT` — Unknown format parameter value

---

## 7. Out of Scope

- **Agent editing from IDE** — Users edit agents in the webapp. The IDE is for injection/consumption.
- Backend input validation (see `04-backend-hardening.md`).
- Real-time sync / WebSocket push.
- Cursor-specific UI or keybindings.
- Skill creation/deletion via MCP (webapp only).

---

## 8. Future Considerations

These are **not** in scope but may inform design:

- **Context refs injection** — `contextRefs` field could include file paths or URLs to attach to the chat.
- **Skill dependencies** — Skills that require other skills to be enabled.
- **Agent templates** — Pre-built agents users can clone and customize.
- **Per-workspace defaults** — Workspace-scoped agent suggestions or presets.

---

## 9. Checklist

- [ ] `ListTools` returns all four tools with correct schemas.
- [ ] `agent_zoo_inject` returns compiled prompt for requested agent.
- [ ] `agent_zoo_inject` requires `agentId` to inject a specific agent.
- [ ] `agent_zoo_inject` supports `format: "structured"` for raw data.
- [ ] `agent_zoo_list_agents` returns all agents (id, name).
- [ ] `agent_zoo_get_agent` returns full agent config.
- [ ] All tools handle missing/invalid agent gracefully with error responses.
- [ ] Compiled prompt correctly combines systemPrompt + enabled skills only.
