# Next Steps to MVP: IDE Agent + Backend Integration

## Executive Summary

AgentZoo is in a solid MVP state with a complete frontend and functional backend. The critical remaining work centers on **connecting the frontend to the real backend API** (replacing mock data) and **enhancing MCP integration** so IDE agents like Cursor can fully interact with the system.

---

## Current State Assessment

### What's Working

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend UI | Complete | Zoo view, Agent view, Skills tree, Soul editor all polished |
| Backend API | Complete | Full CRUD on `/api/agents`, current agent management |
| MCP Server | Partial | Read-only resources work; no tools for write operations |
| JSON Store | Complete | File-based persistence at `~/.agent-zoo/agents.json` |
| Type Safety | Excellent | Shared `@agent-zoo/types` ensures consistency |

### What's Missing for True MVP

1. **Frontend uses mock data** - not connected to backend API
2. **MCP is read-only** - IDE can't switch agents or update config
3. **No real-time sync** - changes don't propagate between webapp/IDE
4. **No input validation** - API accepts any payload
5. **Zero test coverage** - no automated testing

---

## Phase 1: Frontend-Backend Integration (Priority: Critical)

### 1.1 Create API Client Layer

**Location:** `packages/webapp/src/api/`

```typescript
// packages/webapp/src/api/client.ts
const API_BASE = '/api';

export const agentApi = {
  getAll: () => fetch(`${API_BASE}/agents`).then(r => r.json()),
  getById: (id: string) => fetch(`${API_BASE}/agents/${id}`).then(r => r.json()),
  create: (agent: CreateAgentInput) =>
    fetch(`${API_BASE}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent)
    }).then(r => r.json()),
  update: (id: string, updates: UpdateAgentInput) =>
    fetch(`${API_BASE}/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).then(r => r.json()),
  delete: (id: string) =>
    fetch(`${API_BASE}/agents/${id}`, { method: 'DELETE' }),
  getCurrent: () => fetch(`${API_BASE}/current`).then(r => r.json()),
  setCurrent: (id: string) =>
    fetch(`${API_BASE}/current`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentAgentId: id })
    }).then(r => r.json()),
};
```

### 1.2 Add React Query for Data Fetching

**Why:** React Query provides caching, loading states, error handling, and automatic refetching.

```bash
pnpm --filter @agent-zoo/webapp add @tanstack/react-query
```

**Hooks to create:**
- `useAgents()` - fetch all agents
- `useAgent(id)` - fetch single agent
- `useCurrentAgent()` - fetch current agent
- `useCreateAgent()` - mutation for creating
- `useUpdateAgent()` - mutation for updating
- `useDeleteAgent()` - mutation for deleting
- `useSetCurrentAgent()` - mutation for switching current

### 1.3 Replace Mock Data Usage

**Files to update:**

| File | Current State | Change Needed |
|------|---------------|---------------|
| `AgentList.tsx` | Imports `mockAgents` | Use `useAgents()` hook |
| `ZooStage.tsx` | Imports `mockAgents` | Use `useAgents()` hook |
| `AgentView.tsx` | Uses `mockAgents.find()` | Use `useAgent(id)` hook |
| `SkillsTree.tsx` | Uses local toggle state | Persist to API via `useUpdateAgent()` |
| `SoulEditor.tsx` | Local state only | Save to API on submit |

### 1.4 Add Loading & Error States

Each data-dependent component needs:
- Loading skeleton/spinner
- Error message with retry button
- Empty state (no agents yet)

**Example pattern:**
```tsx
function AgentList() {
  const { data: agents, isLoading, error } = useAgents();

  if (isLoading) return <AgentListSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!agents?.length) return <EmptyState />;

  return agents.map(agent => <AgentListItem key={agent.id} agent={agent} />);
}
```

### 1.5 Sync Soul Editor to Backend

Currently the Soul Editor doesn't persist. Fix:

```tsx
function SoulEditor({ agentId }: { agentId: string }) {
  const { data: agent } = useAgent(agentId);
  const updateAgent = useUpdateAgent();
  const [personality, setPersonality] = useState(agent?.personality ?? '');

  const handleSave = () => {
    updateAgent.mutate({ id: agentId, personality });
  };

  return (
    <div>
      <textarea value={personality} onChange={e => setPersonality(e.target.value)} />
      <Button onClick={handleSave} disabled={updateAgent.isPending}>
        {updateAgent.isPending ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}
```

---

## Phase 2: MCP Tool Implementation (Priority: High)

### 2.1 Current MCP Limitations

The MCP server currently only exposes **resources** (read-only):
- `agent-zoo://agents` - list all agents
- `agent-zoo://agents/current` - get current agent config
- `agent-zoo://agents/{id}` - get specific agent

**Problem:** IDE agents (Cursor) cannot:
- Switch the current agent
- Update agent personality
- Toggle skills

### 2.2 Required MCP Tools

Add to `packages/server/src/mcp.ts`:

```typescript
// Tool: Set current agent
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'agent_zoo_set_current') {
    const { agentId } = request.params.arguments as { agentId: string };
    await store.setCurrentId(agentId);
    return { content: [{ type: 'text', text: `Current agent set to ${agentId}` }] };
  }

  if (request.params.name === 'agent_zoo_update_personality') {
    const { agentId, personality } = request.params.arguments as {
      agentId: string;
      personality: string
    };
    await store.update(agentId, { personality });
    return { content: [{ type: 'text', text: 'Personality updated' }] };
  }

  if (request.params.name === 'agent_zoo_toggle_skill') {
    const { agentId, skillId, enabled } = request.params.arguments as {
      agentId: string;
      skillId: string;
      enabled: boolean;
    };
    const agent = await store.getById(agentId);
    if (!agent) throw new Error('Agent not found');
    await store.update(agentId, {
      skills: { ...agent.skills, [skillId]: enabled }
    });
    return { content: [{ type: 'text', text: `Skill ${skillId} ${enabled ? 'enabled' : 'disabled'}` }] };
  }
});
```

### 2.3 Register Tool Schemas

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'agent_zoo_set_current',
      description: 'Set the current active agent',
      inputSchema: {
        type: 'object',
        properties: {
          agentId: { type: 'string', description: 'ID of agent to activate' }
        },
        required: ['agentId']
      }
    },
    {
      name: 'agent_zoo_update_personality',
      description: 'Update an agent\'s system prompt/personality',
      inputSchema: {
        type: 'object',
        properties: {
          agentId: { type: 'string' },
          personality: { type: 'string' }
        },
        required: ['agentId', 'personality']
      }
    },
    {
      name: 'agent_zoo_toggle_skill',
      description: 'Enable or disable a skill for an agent',
      inputSchema: {
        type: 'object',
        properties: {
          agentId: { type: 'string' },
          skillId: { type: 'string' },
          enabled: { type: 'boolean' }
        },
        required: ['agentId', 'skillId', 'enabled']
      }
    }
  ]
}));
```

---

## Phase 3: Backend Hardening (Priority: Medium)

### 3.1 Input Validation with Zod

Zod is already installed but unused. Add schemas:

```typescript
// packages/server/src/schemas.ts
import { z } from 'zod';

export const CreateAgentSchema = z.object({
  name: z.string().min(1).max(100),
  personality: z.string().max(10000),
  skills: z.record(z.boolean()).default({}),
  contextRefs: z.array(z.string()).default([]),
});

export const UpdateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  personality: z.string().max(10000).optional(),
  skills: z.record(z.boolean()).optional(),
  contextRefs: z.array(z.string()).optional(),
});

export const SetCurrentSchema = z.object({
  currentAgentId: z.string().uuid(),
});
```

Apply in routes:
```typescript
app.post('/api/agents', async (req, reply) => {
  const result = CreateAgentSchema.safeParse(req.body);
  if (!result.success) {
    return reply.status(400).send({ error: 'Invalid input', details: result.error.issues });
  }
  // ... proceed with validated data
});
```

### 3.2 Structured Error Responses

```typescript
// packages/server/src/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

// Error handler plugin
app.setErrorHandler((error, request, reply) => {
  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send({
      error: error.message,
      code: error.code
    });
  }
  // Log unexpected errors
  console.error(error);
  return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
});
```

### 3.3 Add Request Logging

```typescript
// packages/server/src/index.ts
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

app.addHook('onRequest', async (request) => {
  logger.info({ method: request.method, url: request.url }, 'incoming request');
});

app.addHook('onResponse', async (request, reply) => {
  logger.info({
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode
  }, 'request completed');
});
```

---

## Phase 4: Testing Infrastructure (Priority: Medium)

### 4.1 Testing Stack

```bash
pnpm add -D -w vitest @testing-library/react @testing-library/jest-dom jsdom
```

### 4.2 Server Unit Tests

```typescript
// packages/server/src/__tests__/store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { JsonFileStore } from '../store';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('JsonFileStore', () => {
  let store: JsonFileStore;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agent-zoo-test-'));
    store = new JsonFileStore(join(tempDir, 'agents.json'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  it('should start with empty agents list', async () => {
    const agents = await store.getAll();
    expect(agents).toEqual([]);
  });

  it('should create and retrieve an agent', async () => {
    const agent = await store.create({
      name: 'Test Agent',
      personality: 'Helpful',
      skills: {},
      contextRefs: []
    });

    expect(agent.id).toBeDefined();
    expect(agent.name).toBe('Test Agent');

    const retrieved = await store.getById(agent.id);
    expect(retrieved).toEqual(agent);
  });
});
```

### 4.3 API Integration Tests

```typescript
// packages/server/src/__tests__/routes.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../index'; // Export app builder

describe('API Routes', () => {
  let app;

  beforeAll(async () => {
    app = await build({ testing: true });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/agents returns empty array initially', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/agents'
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it('POST /api/agents creates agent', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/agents',
      payload: { name: 'Test', personality: 'Helpful', skills: {}, contextRefs: [] }
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toHaveProperty('id');
  });
});
```

### 4.4 Frontend Component Tests

```typescript
// packages/webapp/src/components/__tests__/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../ui/Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies primary variant styles by default', () => {
    render(<Button>Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-accent-orange');
  });
});
```

---

## Phase 5: Real-time Sync (Priority: Low for MVP)

### 5.1 WebSocket Integration

For real-time updates between webapp and IDE, add WebSocket support:

```typescript
// packages/server/src/websocket.ts
import { WebSocketServer } from 'ws';

export function setupWebSocket(server: FastifyInstance, store: AgentStore) {
  const wss = new WebSocketServer({ server: server.server });

  // Broadcast to all connected clients
  const broadcast = (event: string, data: unknown) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event, data }));
      }
    });
  };

  // Hook into store modifications
  store.on('agentUpdated', (agent) => broadcast('agent:updated', agent));
  store.on('agentCreated', (agent) => broadcast('agent:created', agent));
  store.on('agentDeleted', (id) => broadcast('agent:deleted', { id }));
  store.on('currentChanged', (id) => broadcast('current:changed', { id }));

  return wss;
}
```

### 5.2 Frontend WebSocket Hook

```typescript
// packages/webapp/src/hooks/useAgentSync.ts
export function useAgentSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3912');

    ws.onmessage = (event) => {
      const { event: eventType, data } = JSON.parse(event.data);

      switch (eventType) {
        case 'agent:updated':
          queryClient.invalidateQueries(['agents']);
          break;
        case 'agent:created':
          queryClient.invalidateQueries(['agents']);
          break;
        // ... handle other events
      }
    };

    return () => ws.close();
  }, [queryClient]);
}
```

---

## Implementation Priority Order

### Must-Have for MVP Launch

1. **API Client + React Query setup** (4 hours)
2. **Replace mock data in AgentList, ZooStage, AgentView** (3 hours)
3. **Persist Soul Editor changes** (2 hours)
4. **Persist Skills Tree toggles** (2 hours)
5. **MCP tools: set_current, update_personality** (3 hours)

### Should-Have (Post-MVP Polish)

6. **Input validation with Zod** (2 hours)
7. **Structured error responses** (2 hours)
8. **Loading/error states in UI** (3 hours)
9. **Basic test coverage** (6 hours)

### Nice-to-Have (Future Iterations)

10. **WebSocket real-time sync**
11. **Request logging with Pino**
12. **MCP tool: toggle_skill**

---

## Success Criteria

MVP is complete when:

- [ ] Webapp fetches agents from backend API (not mock data)
- [ ] Creating an agent in webapp persists to store
- [ ] Editing personality in Soul Editor saves to backend
- [ ] Toggling skills saves to backend
- [ ] Cursor can read current agent config via MCP
- [ ] Cursor can switch current agent via MCP tool
- [ ] Changes made in webapp are visible to Cursor (after refresh)
- [ ] Changes made via MCP are visible in webapp (after refresh)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API integration breaks existing UI | Keep mock data as fallback; feature flag for API mode |
| MCP tools break IDE integration | Test thoroughly with Cursor before release |
| Store corruption from concurrent writes | Add file locking or transaction support |
| Performance issues with many agents | Implement pagination in API |

---

## Estimated Timeline

| Phase | Effort | Dependency |
|-------|--------|------------|
| Phase 1: Frontend-Backend Integration | 12-16 hours | None |
| Phase 2: MCP Tools | 4-6 hours | Can run parallel to Phase 1 |
| Phase 3: Backend Hardening | 6-8 hours | After Phase 1 |
| Phase 4: Testing | 8-12 hours | After Phase 1 & 2 |
| Phase 5: Real-time Sync | 8-12 hours | After Phase 1-4 |

**Critical Path:** Phase 1 + Phase 2 = 16-22 hours to functional MVP

---

## Appendix: Cursor MCP Configuration

After implementing MCP tools, users configure Cursor like this:

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "agent-zoo": {
      "command": "node",
      "args": ["path/to/agent-zoo/packages/server/dist/index.js"],
      "env": {
        "AGENT_ZOO_STORE_PATH": "~/.agent-zoo/agents.json"
      }
    }
  }
}
```

Then in Cursor, the agent can:
- Read current agent: `@agent-zoo://agents/current`
- Switch agent: Call `agent_zoo_set_current` tool
- Update personality: Call `agent_zoo_update_personality` tool
