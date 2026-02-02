# 04 — Backend hardening spec

> **STATUS: NOT COMPLETE**
>
> **Implemented:**
>
> - Zod dependency installed (but unused)
> - Basic error responses (ad-hoc, not centralized)
> - Fastify logger initialized (but not wired to requests)
>
> **Missing:**
>
> - No `schemas.ts` with Zod validation schemas
> - No `safeParse()` in routes — bodies are unvalidated
> - No `ApiError` class or centralized error handler
> - No `onRequest`/`onResponse` logging hooks
> - No `LOG_LEVEL` environment variable
> - Debug instrumentation code in `index.ts` should be removed
>
> **Alignment:** Spec is well-aligned with project goals. No changes needed to spec.

**Scope:** Add input validation (Zod), structured error responses, and request logging to the backend API. No new routes or features; improve robustness and observability of existing endpoints.

**References:** `research/next-steps.md`, `packages/server`, `@agent-zoo/types`.

---

## 1. Goals

- Validate all API request bodies and relevant params with Zod.
- Return consistent, structured error payloads (status + code + message).
- Add request/response logging (e.g. method, URL, status code) for debugging and ops.

---

## 2. Input validation with Zod

- Zod is already a dependency; add schemas in `packages/server/src/schemas.ts` (or equivalent).

**Schemas to define:**

- **CreateAgent:**
  - `name`: string, min 1, max 100
  - `personality`: string, max 10000
  - `skills`: record of boolean, default `{}`
  - `contextRefs`: array of string, default `[]`

- **UpdateAgent:**
  - Same fields as CreateAgent, all optional.

**Application:**

- **POST /api/agents:** Parse body with CreateAgent schema. On `safeParse` failure, respond with 400 and a structured error (e.g. `{ error: 'Invalid input', details: result.error.issues }`). On success, use validated data only.
- **PUT /api/agents/:id:** Parse body with UpdateAgent schema. Same 400-on-failure pattern.

Do not use unvalidated `req.body` for these fields after validation is in place.

---

## 3. Structured error responses

- Introduce a small error module (e.g. `packages/server/src/errors.ts`).
- **ApiError:** Class or factory with `statusCode`, `code` (string), and `message`. Used for known failure cases (e.g. validation, not found).
- **Error handler:** Central Fastify (or framework) error handler that:
  - For `ApiError`: reply with `statusCode` and body like `{ error: message, code: code }`.
  - For unknown errors: log and respond with 500 and a generic message/code (e.g. `INTERNAL_ERROR`).
- Use this handler for validation failures and for explicit "not found" or "bad request" cases in routes.

---

## 4. Request logging

- Add logging (e.g. `pino` or built-in logger) with configurable level (e.g. `LOG_LEVEL` env, default `info`).
- **onRequest:** Log method and URL (and optionally request id) at request start.
- **onResponse:** Log method, URL, and response status code when the request completes.

Log format should be machine-readable (e.g. JSON) and safe for production. Do not log full request/response bodies in this spec unless explicitly required for debugging.

---

## 5. File and module structure

- Keep schemas in a dedicated file (e.g. `schemas.ts`).
- Keep error class and error handler in a dedicated file or clearly separated in the app setup.
- Wire validation and error handler in the main app/route setup (e.g. `index.ts` or `app.ts`).

---

## 6. Out of scope (for this spec)

- New API endpoints or MCP tools.
- Authentication or rate limiting.
- File locking or transaction support for the store.
- Frontend changes.

---

## 7. Checklist

- [ ] CreateAgent and UpdateAgent Zod schemas defined and used in routes.
- [ ] POST /api/agents and PUT /api/agents/:id validate body and return 400 with details on failure.
- [ ] ApiError (or equivalent) and central error handler return consistent JSON error payloads.
- [ ] Request and response logging (method, URL, status) in place and configurable via log level.
