# 01 — Frontend implementation spec

**Scope:** Core user views only. No backend/API integration. Use mock data and local state. Abstract UI into reusable components where it makes sense.

**References:** `docs/FRONTEND-LAYOUT.md`, `docs/AESTHETICS.md`, `docs/TECH-STACK.md`, `packages/types`.

---

## 1. Goals

- Implement all core user views described in FRONTEND-LAYOUT.
- Use design tokens, motion, and layout from AESTHETICS and TECH-STACK.
- Componentize shared UI (buttons, panels, layout shell, etc.) so the app stays consistent and maintainable.
- Keep everything frontend-only: mock agents, in-memory or `useState`-based state, no API calls.

---

## 2. Core views

| View                     | When                     | Purpose                                                                                                        |
| ------------------------ | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Zoo**                  | No agent selected        | Walking stylized agents with nametags; hover = description, click = Agent view. Persistent header.             |
| **Left sidebar**         | Always                   | List of “connected” agents (mock). Click name → Agent view. Selection highlight.                               |
| **Agent view**           | Agent selected           | Replaces Zoo in main area. Large center sprite; triangle of circles: Brain (top), Soul (left), Skills (right). |
| **Right sidebar (Soul)** | Agent view + Soul active | Editable system prompt (personality). Toggle via Soul button.                                                  |
| **Skills tree**          | From Agent view → Skills | Separate view; “zoom out” from agent. Tree/graph UI; Back to Agent.                                            |

Flow: **Sidebar** → click agent → **Agent view**. From Agent view: **Soul** → right sidebar; **Skills** → Skills tree. **Brain** = no-op for now.

---

## 3. Routing and layout

- **Router:** Add React Router. Routes are view-only (no data fetching).
- **Layout:** Single app shell: persistent **header**, **left sidebar**, **main** (Zoo | Agent view | Skills tree), optional **right sidebar** when Soul is open.

Suggested routes:

| Route               | Main content            |
| ------------------- | ----------------------- |
| `/`                 | Zoo (no agent selected) |
| `/agent/:id`        | Agent view              |
| `/agent/:id/skills` | Skills tree             |

Left sidebar and header are outside the route-specific main content. Right sidebar is toggled by Soul in Agent view, not by route.

---

## 4. Component structure

Abstract these into components. Use `packages/webapp/src/` and group by domain where helpful.

### 4.1 Layout

- **`AppShell`** — Root layout: header + left sidebar + main + optional right sidebar. Handles responsive structure (e.g. flex/grid). Renders `<Outlet />` for main content.
- **`Header`** — Persistent “AgentZoo” title; optional global actions. Uses `--bg-panel`, `--border`, `font-display`, design tokens.
- **`LeftSidebar`** — Agent list container. Uses `--bg-panel`, `--border`, `--radius-panel`, `--padding-panel`. Renders `AgentList` + empty state when no agents.
- **`RightSidebar`** — Soul panel container. Same styling as left. Renders `SoulEditor` (system prompt textarea). Visible only when Soul is active in Agent view.

### 4.2 Shared / UI primitives

- **`Button`** — Supports variants: `primary` (accent-orange), `secondary` (sage or outline), `ghost`, `destructive` (muted apricot). Props: `variant`, `children`, `onClick`, `disabled`, `aria-label`, optional `icon`. Rounded-rect, soft shadow, `springBouncy` on tap, tooltip when icon-only. Use Radix Tooltip or `title` + `aria-label` for icon-only.
- **`IconButton`** — Icon-only `Button` with mandatory `aria-label` and tooltip.
- **`Panel`** — Container with `--bg-panel`, `--border`, `--radius-panel`, `--padding-panel`. Used by sidebars and cards.
- **`Tooltip`** — Use Radix Tooltip (or minimal equivalent) for icon-only buttons and hover hints. Style to match tokens.

### 4.3 Agent-related

- **`AgentList`** — List of agents. Each item clickable; navigates to `/agent/:id` or updates selection state. Selected item: apricot left border or light apricot bg.
- **`AgentListItem`** — Single agent row: name only (no avatar required). Reusable in sidebar; optionally reuse in Zoo (e.g. for a compact list elsewhere).
- **`AgentSprite`** — Stylized character representation. Accepts `agent`, `size` (`small` | `medium` | `large`). Used in Zoo and Agent view. MVP: simple SVG or div-based placeholder; can swap for real sprites later.
- **`AgentNametag`** — Nametag for Zoo agents. Optional short `description` for hover.

### 4.4 Views (page-level)

- **`ZooView`** — Main area at `/`. “Big empty” area (Warm Linen); walking agents with `AgentSprite` + `AgentNametag`. Hover = description (tooltip/popover); click = navigate to Agent view. Optional `fadeInUp` for layout.
- **`AgentView`** — Main area at `/agent/:id`. Center: large `AgentSprite`. Triangle of circle buttons: Brain (top), Soul (left), Skills (right). Brain no-op; Soul toggles right sidebar; Skills navigates to `/agent/:id/skills`. Tooltips: “Brain”, “Soul”, “Skills”.
- **`SoulEditor`** — Textarea for system prompt. Placeholder e.g. “You are a teacher…”. Lives in `RightSidebar`; state local to Agent view or a small context for now.
- **`SkillsTreeView`** — Main area at `/agent/:id/skills`. Tree/graph UI (nodes, links). “Back to Agent” button. MVP: structure only; no real skill logic.

### 4.5 Zoo-specific

- **`ZooStage`** — Canvas or div-based “stage” for the zoo. Contains multiple **`ZooAgent`** components.
- **`ZooAgent`** — Single agent in the zoo: `AgentSprite` + `AgentNametag`, hover description, click → Agent view. Simple walk/idle animation (CSS or Framer Motion). Hit detection for click/hover.

### 4.6 Skills tree

- **`SkillsTree`** — Tree/graph container. **`SkillNode`** — Single node. **`SkillEdge`** — Connection between nodes. MVP: static layout (e.g. vertical tree or simple graph); no backend.

---

## 5. State and data (frontend-only)

- **Mock agents:** Define a small list of `Agent[]` (e.g. in `src/data/mockAgents.ts` or similar). Use `Agent` from `@agent-zoo/types`. Include `id`, `name`, `personality`, `skills`, `contextRefs` so all views can render.
- **Selection / UI state:**
  - “Selected agent id” — derived from route `/agent/:id` or local state when navigating from Zoo.
  - “Soul sidebar open” — `useState` in `AgentView` or a tiny context scoped to agent layout. No persistence.
  - “Current view” — Zoo vs Agent vs Skills tree is route-driven.
- **No API calls.** No loading or error states for network. Optional: simple “no agents” empty state when mock list is empty.

---

## 6. Styling and motion

- **Tokens:** Use only theme tokens (`theme.css`, `tailwind.config`). No one-off hex or grays in components. Colors: `--bg-app`, `--bg-panel`, `--accent-orange`, `--accent-green`, `--text-primary`, `--text-muted`, `--border`, `--accent-orange-muted` (destructive).
- **Motion:** `springBouncy` for buttons and small UI feedback; `springSmooth` for sidebars and panels; `fadeInUp` for list reveals and view transitions. Reuse `src/theme/motion.ts`.
- **Buttons:** Rounded-rect, soft shadow, darken on hover. Focus ring (accent-orange). Icon-only always with tooltip + `aria-label`.

---

## 7. File and folder structure

Keep flat or lightly grouped under `src/`. Example:

```
packages/webapp/src/
  App.tsx                 # Router setup, AppShell
  main.tsx
  theme.css
  theme/
    motion.ts
  data/
    mockAgents.ts         # Mock Agent[]
  components/
    ui/
      Button.tsx
      IconButton.tsx
      Panel.tsx
      Tooltip.tsx
    layout/
      AppShell.tsx
      Header.tsx
      LeftSidebar.tsx
      RightSidebar.tsx
    agent/
      AgentList.tsx
      AgentListItem.tsx
      AgentSprite.tsx
      AgentNametag.tsx
    zoo/
      ZooView.tsx
      ZooStage.tsx
      ZooAgent.tsx
    agent-view/
      AgentView.tsx
      SoulEditor.tsx
    skills/
      SkillsTreeView.tsx
      SkillsTree.tsx
      SkillNode.tsx
      SkillEdge.tsx
  routes/                 # Optional: thin wrappers if you prefer
    ZooRoute.tsx
    AgentRoute.tsx
    SkillsTreeRoute.tsx
```

You can merge `routes/` into `components/` if you prefer fewer folders. Types from `@agent-zoo/types` stay shared; no new backend-specific types.

---

## 8. Implementation order

1. **Setup** — Add React Router. Create `AppShell`, `Header`, `LeftSidebar`, `RightSidebar` (Soul closed by default). Add `mockAgents` and wire `AgentList` + `AgentListItem` in the left sidebar. Empty state when no agents.
2. **Shared UI** — `Button`, `IconButton`, `Panel`, `Tooltip`. Use them in layout and sidebars.
3. **Zoo** — `ZooStage`, `ZooAgent`, `AgentSprite`, `AgentNametag`. Implement `ZooView` with mock agents, hover, click → `/agent/:id`. Route `/` → Zoo.
4. **Agent view** — `AgentView` with large sprite and Brain / Soul / Skills buttons. Soul toggles `RightSidebar` with `SoulEditor`. Skills navigates to `/agent/:id/skills`. Route `/agent/:id` → Agent view.
5. **Skills tree** — `SkillsTreeView`, `SkillsTree`, `SkillNode`, `SkillEdge`. Static layout, “Back to Agent” navigation. Route `/agent/:id/skills` → Skills tree.
6. **Polish** — Transitions (`fadeInUp`, `springSmooth`), focus management, keyboard navigation where it adds value. Ensure all icon-only buttons have tooltips and `aria-label`.

---

## 9. Out of scope (for this spec)

- Backend, API, or MCP integration.
- Real agent connection or persistence.
- Auth or multi-user.
- Rich text for system prompt (plain textarea is enough for now).
- Full skill tree behavior (e.g. enable/disable skills, validation). Structure only.

---

## 10. Checklist

- [ ] React Router added; routes for `/`, `/agent/:id`, `/agent/:id/skills`.
- [ ] `AppShell`, `Header`, `LeftSidebar`, `RightSidebar` implemented and used.
- [ ] `Button`, `IconButton`, `Panel`, `Tooltip` implemented; used across layout and views.
- [ ] Mock `Agent[]`; `AgentList` / `AgentListItem` in left sidebar with selection state.
- [ ] `ZooView` with walking agents, nametags, hover, click → Agent view.
- [ ] `AgentView` with sprite, Brain / Soul / Skills; Soul toggles right sidebar with `SoulEditor`.
- [ ] `SkillsTreeView` with tree UI and “Back to Agent”.
- [ ] All design tokens and motion from AESTHETICS; no one-off styling.
- [ ] Icon-only buttons have tooltips and `aria-label`.
