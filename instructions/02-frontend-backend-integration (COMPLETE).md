# 02 — Frontend–Backend integration spec (COMPLETE)

> **STATUS: COMPLETE**
>
> API client, React Query hooks, all HTTP endpoints, loading/error/empty states, Soul Editor persistence, and Skills tree persistence all implemented and working.

**Scope:** Connect the webapp to the real backend API. Replace mock data with API client and React Query. Add loading, error, and empty states. Persist Soul Editor and Skills tree changes to the backend.

**References:** `research/next-steps.md`, `packages/webapp`, `packages/server`, `@agent-zoo/types`.

---

## 1. Goals

- Create a typed API client for all agent and current-agent endpoints.
- Use React Query for data fetching, caching, and mutations.
- Replace every use of mock agents with API-backed hooks.
- Add loading skeletons, error messages with retry, and empty states.
- Persist Soul Editor (personality) and Skills tree toggles to the backend.

---

## 2. API client layer

**Location:** `packages/webapp/src/api/`

- **Base URL:** `/api` (same origin as webapp).
- **Client:** `client.ts` (or equivalent) exposing:
  - `getAll()` — GET `/api/agents`
  - `getById(id)` — GET `/api/agents/:id`
  - `create(agent)` — POST `/api/agents`
  - `update(id, updates)` — PUT `/api/agents/:id`
  - `delete(id)` — DELETE `/api/agents/:id`
  - `getCurrent()` — GET `/api/current`
  - `setCurrent(id)` — PUT `/api/current` with body `{ currentAgentId: id }`
- Use `Agent`, `CreateAgentInput`, `UpdateAgentInput` from `@agent-zoo/types` where applicable.
- Return parsed JSON; do not handle errors in the client (let React Query / UI handle them).

---

## 3. React Query setup

- Add dependency: `@tanstack/react-query`.
- Wrap the app (e.g. in `main.tsx` or `App.tsx`) with `QueryClientProvider`.
- Create hooks in `packages/webapp/src/api/` or `src/hooks/`:
  - `useAgents()` — query for all agents
  - `useAgent(id)` — query for single agent (enabled when `id` is present)
  - `useCurrentAgent()` — query for current agent
  - `useCreateAgent()` — mutation for creating agent
  - `useUpdateAgent()` — mutation for updating agent
  - `useDeleteAgent()` — mutation for deleting agent
  - `useSetCurrentAgent()` — mutation for switching current agent

---

## 4. Replace mock data usage

| File             | Current                  | Change                                                          |
| ---------------- | ------------------------ | --------------------------------------------------------------- |
| `AgentList.tsx`  | Imports `mockAgents`     | Use `useAgents()`                                               |
| `ZooStage.tsx`   | Imports `mockAgents`     | Use `useAgents()`                                               |
| `AgentView.tsx`  | Uses `mockAgents.find()` | Use `useAgent(id)`                                              |
| `SkillsTree.tsx` | Local toggle state only  | Persist via `useUpdateAgent()`                                  |
| `SoulEditor.tsx` | Local state only         | Load from `useAgent(id)`, save via `useUpdateAgent()` on submit |

Remove or deprecate `mockAgents` from data layer once all usages are replaced.

---

## 5. Loading, error, and empty states

- Every data-dependent list or view must handle:
  - **Loading:** Skeleton or spinner (no raw "Loading..." only where it’s acceptable).
  - **Error:** Message + retry (e.g. button that refetches).
  - **Empty:** Dedicated empty state (e.g. "No agents yet" in sidebar and Zoo).
- Reuse a small set of components (e.g. `AgentListSkeleton`, `ErrorMessage`, `EmptyState`) where it makes sense.

---

## 6. Soul Editor persistence

- Load initial personality from `useAgent(agentId)`.
- Local state for the textarea; on "Save" (or explicit submit), call `useUpdateAgent().mutate({ id: agentId, personality })`.
- Show saving state (e.g. disabled button, "Saving...") while mutation is pending.
- Optionally show success feedback (toast or inline) after save.

---

## 7. Skills tree persistence

- Skill toggles (enabled/disabled) must be persisted via `useUpdateAgent()`.
- On toggle, send updated `skills` object to the API so the backend store stays in sync.

---

## 8. Out of scope (for this spec)

- Backend API implementation or route changes (assume existing API).
- Input validation on the backend (see backend-hardening spec).
- Real-time sync (WebSocket); refresh or refetch is sufficient for this spec.
- Auth or multi-user.

---

## 9. Checklist

- [ ] API client module with all agent and current-agent methods.
- [ ] React Query added and `QueryClientProvider` wrapping the app.
- [ ] Hooks: `useAgents`, `useAgent`, `useCurrentAgent`, and mutations for create, update, delete, setCurrent.
- [ ] `AgentList`, `ZooStage`, `AgentView` use hooks instead of mock data.
- [ ] Loading, error, and empty states for agent list and agent view.
- [ ] Soul Editor loads from API and saves via `useUpdateAgent()`.
- [ ] Skills tree toggles persist via `useUpdateAgent()`.
- [ ] Mock agents no longer used in production code path.
