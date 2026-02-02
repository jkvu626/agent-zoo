# 06 — Real-time sync spec

> **STATUS: NOT COMPLETE — Not implemented**
>
> **Current state:**
>
> - HTTP API is fully functional
> - React Query polling/refetch works for updates
>
> **Missing (all items):**
>
> - No WebSocket server (`ws` library not installed)
> - No WebSocket route/handler in server
> - No event broadcasting for `agent:created`, `agent:updated`, `agent:deleted`
> - No `useAgentSync` hook in webapp
> - No real-time push updates
>
> **Alignment:** `docs/MCP-ARCHITECTURE.md` mentions WebSocket as "optional" — spec is more explicit. Spec is well-aligned with project vision.

**Scope:** Add WebSocket support on the backend and a frontend hook to receive live updates. When agents change (via API or MCP), connected clients (webapp, and optionally IDE) get pushed events so they can invalidate or refresh data without polling.

**References:** `research/next-steps.md`, `packages/server`, `packages/webapp`, `@agent-zoo/types`.

---

## 1. Goals

- Run a WebSocket server alongside the HTTP API.
- Broadcast events when agents are created, updated, or deleted.
- Provide a frontend hook that subscribes to the WebSocket and invalidates React Query cache (or updates state) on relevant events.
- Keep the existing HTTP API and store as the source of truth; WebSocket is a notification channel only.

---

## 2. Backend WebSocket server

- **Location:** e.g. `packages/server/src/websocket.ts` or integrated in main server setup.
- **Library:** Use `ws` (WebSocketServer) attached to the same HTTP server instance (Fastify or Node HTTP).
- **Behavior:**
  - Accept connections and keep a set of connected clients.
  - **Broadcast:** Helper that sends a JSON message to all open clients: e.g. `{ event: string, data: unknown }`.
  - **Events to emit:**
    - `agent:created` — when an agent is created (payload: agent or `{ id }`).
    - `agent:updated` — when an agent is updated (payload: agent or `{ id }`).
    - `agent:deleted` — when an agent is deleted (payload: `{ id }`).
- **Integration with store:** If the store is event-emitting, subscribe to its events and call broadcast. If not, hook into the route handlers (or a thin service layer) after successful create/update/delete and broadcast from there.
- **No persistence of messages:** WebSocket is fire-and-forget; new clients get state by fetching over HTTP or React Query, not from replay.

---

## 3. Frontend WebSocket hook

- **Location:** e.g. `packages/webapp/src/hooks/useAgentSync.ts`.
- **Behavior:**
  - Connect to the same origin WebSocket URL (e.g. `ws://localhost:PORT` or derived from `window.location`).
  - On open: optionally nothing, or a simple ping/heartbeat if required later.
  - On message: parse JSON, read `event` and `data`. Use `useQueryClient()` from React Query and call:
    - `agent:created` / `agent:updated` / `agent:deleted` → `queryClient.invalidateQueries(['agents'])` (and optionally `['agent', data.id]` for single-agent queries).
  - On close/error: optional reconnect with backoff (can be simple or omitted for MVP).
  - Cleanup: close WebSocket on unmount.
- **Usage:** Render the hook once in the app root (e.g. inside `QueryClientProvider`) so a single connection is shared. No need to pass query client if the hook uses `useQueryClient()` internally.

---

## 4. Connection and security

- WebSocket URL should be configurable (env or build-time) so it works in dev and behind a reverse proxy.
- For this spec, same-origin or explicit WS host is enough; TLS and wss can be documented as recommended for production.
- Do not send secrets or full agent data in events if unnecessary; IDs and event types are enough for invalidation.

---

## 5. Out of scope (for this spec)

- Full duplex agent control (e.g. sending commands over WebSocket); API and MCP remain the way to mutate.
- Persistence or replay of events.
- Presence or multi-user features.
- Testing WebSocket (can be a follow-up).

---

## 6. Checklist

- [ ] WebSocket server runs with the HTTP server and broadcasts to all connected clients.
- [ ] Events emitted: `agent:created`, `agent:updated`, `agent:deleted`.
- [ ] Store or route layer triggers broadcast after successful mutations.
- [ ] Frontend hook connects to WebSocket and invalidates React Query cache for agents on each event.
- [ ] Hook is used once at app root; connection is closed on unmount.
- [ ] WebSocket URL configurable for environment.
