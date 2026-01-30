# AgentZoo Tech Stack

**Goals:** Personal tool now, scalable later. TypeScript-first. **Aesthetics and “looking good” are a core requirement**—treat the stack as the foundation for a distinctive, cozy, game-like UI.

---

## Recommended Stack (TL;DR)

| Layer | Choice | Why |
|-------|--------|-----|
| **Runtime** | Node.js 20+ | One language everywhere, MCP SDK in TS, huge ecosystem. |
| **Language** | TypeScript | End-to-end types, fewer runtime surprises, great DX. |
| **Frontend** | React 18 + Vite | Fast, familiar, best ecosystem for motion and polished UI. |
| **Styling** | Tailwind + design tokens (CSS variables) | Utility-first + one source of truth for colors/fonts so the whole app feels cohesive. |
| **Motion** | Framer Motion | Spring-based animations, layout animations, perfect for characters and “cozy” feel. |
| **UI primitives** | Radix UI | Accessible, unstyled—you own the look. No fighting a pre-styled kit. |
| **Backend API** | Fastify | Lightweight, fast, TypeScript-friendly. Sits next to MCP in one process. |
| **MCP** | `@modelcontextprotocol/sdk` | Official SDK; implement server in same Node process as HTTP. |
| **Store (MVP)** | JSON file | Simple, no setup. Abstract behind an interface so you can swap to SQLite/DB later. |

**Result:** One Node process runs the MCP server + Fastify. The React app (Vite dev or static build) talks to that process over HTTP. Same repo, shared types, scalable when you add auth/DB/hosting.

---

## Why This Stack Supports “Looking Good”

### 1. **You own the visuals**

- **Radix** gives you behavior (dialogs, dropdowns, tabs) without imposing a look. Every pixel is yours—critical for a custom “cozy RPG” aesthetic instead of generic SaaS.
- **Tailwind** with a **strict design token system** (see below) keeps colors, spacing, and typography consistent so the app feels designed, not patched together.

### 2. **Motion is first-class**

- **Framer Motion** is the standard for React animation: character movement, skill-tree reveals, panel transitions, button feedback. Spring physics and layout animations make the UI feel alive and intentional—key for your “stylized, customizable character” and game-like feel.
- No fighting the framework; animation is declarative and stays in React.

### 3. **Typography and color from day one**

- Define **CSS variables** (or Tailwind theme) for:
  - 2 fonts: one display (headers, character name), one body (readable text).
  - A small palette: background, surface, accent, text, muted. Warm/cozy or high-contrast—pick one and stick.
- Use them everywhere. No one-off `#abc` or random `font-family`; the stack doesn’t enforce this, but the doc and one shared theme file do.

### 4. **Scalable without rewrites**

- TypeScript + shared types between frontend and API.
- Store behind an interface (e.g. `AgentStore`) so you can go file → SQLite → Postgres without changing the rest of the app.
- One server (MCP + HTTP) can run locally now and be deployed later with minimal changes.

---

## Stack in More Detail

### Runtime & language

- **Node.js 20+** and **TypeScript** everywhere (frontend + server).
- **tsx** or **ts-node** for running the server in dev; compile to JS for production or use `tsx` in prod for simplicity.

### Frontend

- **React 18** + **Vite**: Fast HMR, simple config, easy to add React Router later for multiple views.
- **React Router** (when you need it): Home (agents walking), Agent detail, maybe settings. Start with a single page and add routes as the MVP grows.

**Alternatives considered:**

- **Vue 3 + TypeScript**: Great DX, single-file components. Slightly smaller ecosystem for “game-like” UI and motion than React.
- **SvelteKit**: Less boilerplate, very fast. Good for a personal project; ecosystem for animation/UI a bit smaller than React.
- **Next.js**: Overkill for a local-first tool unless you plan to host the app and need SSR/API routes. Your API lives in the AgentZoo server, so Vite + static build is enough.

**Recommendation:** React + Vite. Best fit for “aesthetics are enormous” (Framer Motion, Radix, design systems) and your existing lean toward React.

### Styling

- **Tailwind CSS** with a **custom theme** in `tailwind.config.ts`:
  - Colors from a small palette (e.g. `bg-hearth`, `text-ink`, `accent-amber`).
  - Typography: `font-display`, `font-body`, with sizes and weights defined in the theme.
  - Border radius, shadows, and spacing tuned to your “cozy” or “RPG” look (e.g. soft shadows, rounded corners).
- **CSS variables** in `:root` for anything you might want to switch (e.g. a future “theme” toggle). Tailwind can reference them via theme.
- **No default Tailwind grays** in the main UI; override with your palette so the app doesn’t look like every other Tailwind site.

**Alternatives:**

- **Panda CSS**: Token-based, good for design systems. Newer, smaller community.
- **Styled-components / Emotion**: Component-scoped CSS, full control. More boilerplate; Tailwind + tokens gets you 80% of the benefit with less code.
- **Plain CSS + CSS variables**: Totally viable; Tailwind just speeds up layout and consistency.

**Recommendation:** Tailwind + a strong, custom theme and CSS variables. Fast to iterate and keeps the whole UI consistent.

### Motion

- **Framer Motion** for:
  - Character movement and idle animations.
  - Panel open/close, sidebar, modals.
  - Skill tree reveal and hover states.
  - Page or view transitions.
- Use **spring** defaults for a bouncy, alive feel; use **tween** where you want precise timing.

**Alternatives:** CSS `@keyframes` + Transitions (limited for layout/orchestration). GSAP (powerful but more imperative). Framer Motion is the best fit for React and your goals.

### UI primitives (accessible building blocks)

- **Radix UI**: Dialogs, dropdowns, tabs, tooltips—all accessible and unstyled. You style everything to match your aesthetic.
- Use for: Agent sidebar, agent detail panel, skill tree controls, “Brain / Soul / Skills” navigation. Build your RPG-style chrome on top.

**Alternatives:** Ark (similar to Radix). Chakra / Mantine (pre-styled; faster to start but harder to make truly custom). For “looking good” as a priority, Radix + your own styling wins.

### Icons & assets

- **Icons:** Lucide React or Phosphor Icons—consistent, tree-shakeable. Use one set across the app.
- **Character / RPG art:** SVG or PNG. If you use sprites, consider a small helper or component for sprite sheets. The stack doesn’t dictate this; just keep assets in `public/` or import SVGs as components so they’re easy to swap for custom illustrations later.

### Backend (same process as MCP)

- **Fastify**: HTTP API for the webapp (CRUD agents, get/set current agent). Plugin ecosystem, TypeScript support, low overhead.
- **MCP server**: Implement with `@modelcontextprotocol/sdk`, in the same Node process. Listen on stdio (or SSE) for Cursor; Cursor starts the process and talks MCP over stdio.
- **Store**: MVP = read/write a single JSON file (e.g. `agents.json`). Abstract behind an `AgentStore` interface; later swap to SQLite or a real DB without changing routes or MCP resources.

### Monorepo vs single repo

- **Single repo** with two “apps”: `packages/server` (MCP + Fastify), `packages/webapp` (Vite + React). Shared types in `packages/types` or `shared/`. Use a workspace manager (pnpm workspaces, npm workspaces, or Turborepo) so you can share TypeScript types and run server + webapp in one place.
- **Scalable:** Later you can add `packages/db`, `packages/auth`, etc., without changing the high-level architecture.

---

## Design token strategy (for “looking good”)

Define these once and use them everywhere:

1. **Colors**  
   e.g. `--bg-app`, `--bg-panel`, `--text-primary`, `--text-muted`, `--accent`, `--border`. Use warm/cozy or high-contrast RPG; avoid generic gray stacks.

2. **Typography**  
   `--font-display` (e.g. a distinctive heading font), `--font-body` (readable body). 2–3 sizes: small, body, large/heading.

3. **Motion**  
   Shared Framer Motion variants: `springBouncy`, `springSmooth`, `fadeInUp`. Reuse so the whole app feels consistent.

4. **Spacing & radius**  
   Tailwind theme or CSS variables: e.g. `panel-radius`, `card-padding`. Keeps panels and cards visually consistent.

Put tokens in:
- `tailwind.config.ts` (theme.extend)
- Optional: `src/theme.css` or `src/design-tokens.ts` if you want a single source of truth that Tailwind and Framer Motion both use.

---

## What to avoid (for aesthetics and scalability)

- **Default Tailwind palette** for main UI (makes everything look the same).
- **Heavy pre-styled component library** (Material, default Chakra) unless you’re willing to deeply override; Radix + your styling is more flexible.
- **Skipping design tokens** at the start (leads to one-off colors and fonts; harder to make it feel “designed” later).
- **No animation** or only CSS hover: motion is a big part of “cozy” and “game-like”; Framer Motion is worth the dependency.
- **Tightly coupling the server to a single store implementation** (no interface); makes it harder to scale to SQLite/DB and multi-user later.

---

## Summary

| Concern | Choice |
|--------|--------|
| Personal + scalable | Node + TypeScript, one server (MCP + HTTP), store behind an interface. |
| “Looking good” | Radix (you own the look) + Tailwind with a strict custom theme + Framer Motion + design tokens from day one. |
| Your preference | TypeScript, React, Node—this stack aligns and doubles down on aesthetics and future flexibility. |

Next step could be a minimal repo layout (e.g. `packages/server`, `packages/webapp`, `packages/types`) and a one-page “stack checklist” (Vite, Tailwind theme, Radix, Framer Motion, Fastify, MCP SDK) so you can tick them off as you build.
