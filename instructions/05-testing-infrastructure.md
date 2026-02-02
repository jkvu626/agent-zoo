# 05 — Testing infrastructure spec

> **STATUS: NOT COMPLETE — Nothing implemented**
>
> **Missing (all items):**
> - No Vitest installed or configured
> - No `@testing-library/react`, `jest-dom`, or `jsdom`
> - No test files anywhere (`*.test.ts`, `*.spec.ts`, `__tests__/`)
> - No `test` scripts in any `package.json`
> - Zero store unit tests
> - Zero API integration tests
> - Zero component tests
>
> **Alignment:** Spec is well-aligned with project. Note that `docs/TECH-STACK.md` does not mention testing — could be updated to include Vitest as the chosen test runner.

**Scope:** Add Vitest and Testing Library. Introduce server unit tests (e.g. store), API integration tests (HTTP routes), and frontend component tests. Establish patterns and minimal coverage to expand later.

**References:** `research/next-steps.md`, `packages/server`, `packages/webapp`, `@agent-zoo/types`.

---

## 1. Goals

- Install and configure Vitest for the monorepo (and per-package if needed).
- Add React Testing Library and jsdom for webapp component tests.
- Add server unit tests for the store (or equivalent core logic).
- Add API integration tests for main routes (GET/POST/PUT/DELETE agents, current).
- Add at least one representative frontend component test (e.g. Button or AgentListItem).
- All tests runnable via pnpm/package scripts.

---

## 2. Testing stack

- **Vitest** — test runner (workspace or per-package).
- **@testing-library/react** — render components, query by role/label, fire events.
- **@testing-library/jest-dom** — matchers like `toBeInTheDocument`, `toHaveClass`.
- **jsdom** — DOM environment for React tests.

Install as dev dependencies (workspace root or in `packages/webapp` and `packages/server` as appropriate). Add `test` (and optionally `test:ui`) scripts to the relevant `package.json` files.

---

## 3. Server unit tests

- **Target:** Store implementation (e.g. `JsonFileStore` in `packages/server`).
- **Location:** e.g. `packages/server/src/__tests__/store.test.ts`.
- **Setup:** Use a temporary directory (e.g. `mkdtemp`) and a fresh store instance per test; clean up in `afterEach`.
- **Cases (minimum):**
  - Initial state: `getAll()` returns empty array.
  - Create and retrieve: create one agent, then get by id and assert shape (id, name, personality, skills, contextRefs).
  - Update and delete if applicable (optional but recommended).
- Use `describe` / `it` / `expect`; no external server or network.

---

## 4. API integration tests

- **Target:** HTTP API (e.g. Fastify app).
- **Location:** e.g. `packages/server/src/__tests__/routes.test.ts`.
- **Setup:** Build the app in a test mode (e.g. in-memory or temp-file store), use `inject` or similar to send requests without listening on a port. Tear down (e.g. `app.close()`) in `afterAll`.
- **Cases (minimum):**
  - GET /api/agents — returns 200 and empty array when no agents.
  - POST /api/agents — returns 201 and body with `id` and expected fields when payload is valid.
  - GET /api/agents/:id — returns 200 with agent when it exists; 404 when not.
  - PUT /api/agents/:id — updates and returns 200 with updated agent.
  - DELETE /api/agents/:id — returns 204 or 200 and agent is no longer returned by GET.
  - GET /api/current and PUT /api/current — current agent behavior (optional but recommended).
- Use valid and invalid payloads where validation is implemented; expect 400 for invalid.

---

## 5. Frontend component tests

- **Target:** At least one shared UI component (e.g. `Button`) and optionally one domain component (e.g. `AgentListItem`).
- **Location:** e.g. `packages/webapp/src/components/ui/__tests__/Button.test.tsx`.
- **Setup:** Render with Testing Library; optional wrapper for theme or router if needed.
- **Cases (minimum for Button):**
  - Renders children text.
  - Applies expected variant (e.g. primary) via class or attribute.
  - Respects `disabled` and does not call onClick when disabled (if applicable).
- Prefer queries by role (`getByRole('button')`) and accessible labels. Use `jest-dom` matchers.

---

## 6. Configuration and scripts

- **Vitest config:** Either in root `vitest.config.ts` (with project references) or in each package. Ensure server tests run in Node and webapp tests with jsdom.
- **Paths and aliases:** Match tsconfig so `@agent-zoo/types` and internal imports resolve.
- **Scripts:** e.g. `pnpm test` at root runs all tests; `pnpm --filter @agent-zoo/server test` and `pnpm --filter @agent-zoo/webapp test` run per-package.

---

## 7. Out of scope (for this spec)

- E2E or Playwright/Cypress.
- Coverage thresholds or CI wiring (can be added later).
- Snapshot tests (optional; not required for this spec).
- Testing MCP tools (can be a follow-up).

---

## 8. Checklist

- [ ] Vitest, Testing Library, jest-dom, jsdom installed and configured.
- [ ] Store unit tests: create, get, and at least one of update/delete; temp dir cleanup.
- [ ] API integration tests: GET/POST agents, GET/PUT by id, and current-agent behavior where applicable.
- [ ] At least one Button (or equivalent) component test with render and variant/disabled checks.
- [ ] All tests pass via pnpm test (and per-package scripts).
