# AgentZoo Frontend Layout

**Design direction:** Zoo window with walking agents is core from day one. Left sidebar for agent selection; Agent view (same space as Zoo) with Brain / Soul / Skills; right sidebar for personality when Soul is active; Skills Tree zooms out from agent.

This doc defines the **UI structure**, **button behavior**, and **view hierarchy** so the app is built consistently from the ground up.

---

## 1. The 4.5 Elements

| # | Element | Role |
|---|---------|------|
| **1** | **Zoo Window** | Main area when no agent is selected. Stylized characters with nametags walk around a big empty area; hover shows description; click opens Agent view. Persistent header. |
| **2** | **Left Sidebar** | List of agents **connected via MCP**. Clickable names only; selecting one opens Agent view with that agent. No "add agent" in the app—agents appear when they connect. |
| **3** | **Agent View** | Replaces the Zoo window when an agent is selected. Same layout space. Large agent sprite in center; three circle buttons in a triangle: Brain (top), Soul (left), Skills (right). |
| **3.5** | **Right Sidebar** | Only in Agent view. Appears when **Soul** is active. Editable system prompt for personality ("You are a teacher..."); always-on customization. |
| **4** | **Skills Tree** | Separate view that zooms out from the agent. Opened by the **Skills** button. Skill-tree interface (MVP: structure in place). |

**Flow:** Left sidebar → click agent name → Agent view. From Agent view: Soul → right sidebar; Skills → Skills Tree. Brain is present but no-op for MVP.

---

## 2. Buttons

### Hierarchy (unchanged)

- **Primary:** Burnt apricot (`--accent-orange`) — main actions. Rounded-rect, soft shadow, `springBouncy` on tap.
- **Secondary:** Sage (`--accent-green`) or outline (Oatmeal border) — secondary actions. Same radius and motion.
- **Ghost:** Text or subtle bg — low emphasis (nav, "Back", etc.).
- **Destructive:** Darker/muted apricot (not red). Define a token e.g. `--accent-orange-muted` or `--destructive` derived from apricot so it stays in the warm family.

### Shape & behavior

- **Shape:** Rounded-rect (e.g. `--radius-sm` / `--radius-md`). Not pill.
- **Shadow:** Soft shadow on buttons so they feel pressable.
- **Hover:** Darken button (slightly darker than default); same spring feel.
- **Icon-only:** Always use tooltips (e.g. Radix Tooltip or title + aria-label).
- **Focus:** Visible focus ring (e.g. apricot or darker apricot).

### Token suggestion (destructive)

Add to theme if not present:

```css
--accent-orange-muted: #B86B2E;   /* or similar darker/muted apricot for destructive */
```

Use for delete, remove, "Are you sure?" actions so the palette stays warm and consistent.

---

## 3. Left Sidebar

- **Content:** List of agents that are **currently connected** to the webapp via MCP. No manual "add agent"—agents show up when they connect.
- **UI:** Simple list. Each item = clickable **agent name** (no avatars required for MVP). Click → select that agent → main area switches to **Agent view** with that agent.
- **State:** Selected agent = active state (e.g. apricot left border or light apricot bg) so it's clear who is selected.
- **Empty state:** If no agents connected, show a short message (e.g. "No agents connected" or "Agents will appear when they connect via MCP") so the behavior is clear.
- **Style:** `--bg-panel`, `--border` on right edge, `--radius-panel` if you want soft inner corner. Use `springSmooth` for any list animations; optional `fadeInUp` when list updates.

---

## 4. Zoo Window

- **Purpose:** The "agents walking" experience is **core to MVP**—built in from the ground up. Not an afterthought.
- **Layout:** Same rectangle as the main content area (where Agent view will later appear). Big, empty-feeling area (Warm Linen `--bg-app` or similar) so the space feels like a "room" or enclosure.
- **Agents:** Little **stylized characters** (sprites or simple illustrations). Each has:
  - **Nametag** (visible by default).
  - **Description on hover** (e.g. tooltip or small popover with one line or short blurb).
  - **Click** → open **Agent view** with that agent selected.
- **Motion:** Agents **walk around** (idle/walking animation). Kept simple for MVP but present so the zoo feels alive.
- **Header:** **Persistent header** above the zoo area (e.g. "AgentZoo" or app title; optional global actions). Same header can persist when in Agent view for consistency.
- **Tech note:** Not inherently hard—a canvas or div-based "stage," simple path or random movement for each agent, click/hover hit detection. Framer Motion or CSS animation for walk cycles; sprites or SVG characters. Build it early so layout and routing assume this view exists.

---

## 5. Agent View

- **When:** Replaces the Zoo window when the user selects an agent from the left sidebar (or clicks an agent in the Zoo).
- **Space:** Uses the **same main content area** as the Zoo window—no second window; it's a view swap (with optional transition, e.g. `fadeInUp` or a short zoom).
- **Center:** **Larger version of the agent sprite** in the middle. This is the "character sheet" focal point.
- **Three circle buttons (triangle):**
  - **Brain (top):** Placeholder for MVP. Button is visible and in the layout but does nothing for now. Keeps the mental model (Brain / Soul / Skills) in place.
  - **Soul (left vertex):** Opens the **right sidebar** with an **editable system prompt**. User can customize personality (e.g. "You are a teacher..."). System prompt is always on for that agent when set.
  - **Skills (right vertex):** Zooms out (or transitions) to the **Skills Tree** interface. MVP: skill tree UI/structure in place; full behavior can come later.
- **Styling:** Circle buttons use the same design tokens (accent-orange for primary action, sage or outline for secondary). Soft shadow, rounded (full circle). Tooltips: "Brain", "Soul", "Skills".
- **Header:** Same persistent header as Zoo window so the user always knows they're in AgentZoo.

---

## 6. Right Sidebar (Soul / Personality)

- **When visible:** Only in **Agent view**, when the user activates **Soul** (clicks the Soul button).
- **Content:** **Editable system prompt** for the selected agent. Single text area (or rich text if you add it later). Placeholder or default like "You are a teacher..." so the intent is clear. Saves with the agent (via API/store); always on for that agent when configured.
- **Behavior:** Can be toggled open/closed from the Soul button. When open, it doesn’t replace the center sprite—main area still shows the large sprite and the three buttons; right sidebar overlays or sits beside it (depending on layout). Use `springSmooth` for open/close.
- **Style:** `--bg-panel`, `--border` on left edge, `--padding-panel`. Match left sidebar weight so the app feels balanced.

---

## 7. Skills Tree

- **Entry:** From Agent view, user clicks **Skills** → zooms out (or transitions) to a **Skills Tree** view.
- **Feel:** "Zoom out from agent" suggests the camera/view pulls back to reveal a tree (or graph) rooted at or near the agent. MVP: implement the **interface** (nodes, connections, or a simple tree layout) and the transition; full skill logic can follow.
- **Space:** Can be full main area (replacing the center sprite + triangle) or a large overlay. Same persistent header so user can navigate back (e.g. "Back to Agent" or clicking the agent in the left sidebar returns to Agent view).
- **Back:** Clear way to return to Agent view (button or sidebar selection).

---

## 8. Summary

| Area | Decision |
|------|----------|
| **Buttons** | Primary (apricot), secondary (sage/outline), ghost, destructive (muted apricot). Rounded-rect, soft shadow, darken on hover. Tooltips on icon-only. |
| **Left Sidebar** | List of MCP-connected agents; clickable names; no "add agent"; selection opens Agent view. |
| **Zoo Window** | Core to MVP. Walking stylized characters, nametags, description on hover, click → Agent view. Persistent header. |
| **Agent View** | Same space as Zoo. Large center sprite; triangle of circles: Brain (no-op), Soul (right sidebar), Skills (Skills Tree). |
| **Right Sidebar** | Soul only. Editable system prompt for personality; always on for agent. |
| **Skills Tree** | Opened from Skills button; zoom-out feel; tree interface in place for MVP. |

Result: four main structural elements (Zoo, Left Sidebar, Agent View + Right Sidebar, Skills Tree) with a clear flow from "browse agents in the zoo" to "inspect and customize one agent" to "see their skills."
