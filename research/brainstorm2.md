# Ideas for AgentZoo Expansions & New Features

_Brainstorm session — refer to `docs/VISION.md` for product direction._

---

## Brain & Memory

_Ordered by implementation complexity (Low → High)_

### 1. Brain timeline [COMPLEXITY: Low-Medium]

**What it is:** A chronological "diary" view of what's in the Brain: decisions, milestones, and pinned notes, ordered by time.

**How it could work:**

- Every Brain entry has a timestamp (and optionally an optional "event type": decision, milestone, note, summary).
- Agent View gets a "Timeline" tab or section: list or cards ordered by date, with optional filters (e.g., decisions only, date range).
- Pinned notes stay at the top or in a separate "Pinned" section; the rest scroll by date.
- Entries can be edited, deleted, or pinned from this view.

**Why it matters:** Makes it easy to see what the agent "knows" over time and to correct or prune memory. Surfaces the narrative of the project (decisions, milestones) at a glance.

**Considerations:** Whether to auto-generate timeline events (e.g., from session summaries) or keep it user/agent-curated; how much metadata (author, source) to store per entry.

---

### 2. Ask the Brain [COMPLEXITY: Medium]

**What it is:** Inside Agent View, a way to search and retrieve specific memory snippets from the Brain instead of dumping the whole thing into context.

**How it could work:**

- A search box (and optional filters: project, date range, tags) in the Brain section of Agent View.
- Query is run against Brain entries (local search in the store, or embedded search if you add embeddings later). Results shown as a list of snippets with date and tags.
- User (or the IDE agent via MCP) can "retrieve" selected snippets: they get injected into the next prompt or shown in the UI for copy-paste.
- MCP could expose a "read Brain" resource that supports query params for search, so the IDE can ask "what do we know about X?" and get back only relevant chunks.

**Why it matters:** Keeps context relevant and within token limits. Lets you verify what the agent "remembers" and pull only what's needed for the current task.

**Considerations:** MVP can be keyword/tag search; later, semantic search (embeddings) would improve recall. Need a clear contract for how retrieved snippets are used (injection format, length limits).

---

### 3. Memory snapshots [COMPLEXITY: Medium]

**What it is:** Save and restore named "context states": a point-in-time snapshot of what's in the Brain (and optionally which project/workspace) so you can switch tasks and come back without losing that mental state.

**How it could work:**

- "Save snapshot" captures the current Brain contents (for the current project and/or global) under a name (e.g., "Before refactor", "Q1 planning").
- Snapshots are stored as copies or references; restoring overwrites (or merges, depending on design) the active Brain with that snapshot.
- In the webapp, a "Snapshots" list in the Brain section: name, date saved, optional note; actions: Restore, View, Delete.
- Optional: "Branch" from a snapshot so you don't overwrite the current state—e.g., try a different direction and then discard or keep.

**Why it matters:** Lets you context-switch (e.g., to a bugfix or a different feature) and then return to a previous "mental state" without re-reading logs or re-summarizing. Especially useful with project-scoped Brain.

**Considerations:** Whether snapshots are per-agent only or can reference shared Brain data; storage size if users save many snapshots; and whether "restore" is full replace or merge (and how conflicts are handled).

---

### 4. Project-scoped Brain [COMPLEXITY: Medium-High]

**What it is:** The agent's Brain is split into memory chunks that are tied to specific repos or workspaces. When you open a project, only that project's chunk (plus any global memory) is loaded into context.

**How it could work:**

- Store Brain as a map: `workspaceId` or repo path → list of memory entries (text, timestamps, optional tags).
- IDE/MCP reports current workspace; server returns Brain content for that workspace + global.
- In the webapp, Brain UI could show a workspace selector or tabs (e.g., "This project", "Global").
- Workspace identity could be folder path, or a hash of the root path for privacy.

**Why it matters:** Stops project A's context from leaking into project B. Lets you keep many projects in one agent without token bloat or confusion.

**Considerations:** Defining "workspace" (path vs. named workspace), handling renamed/moved folders, and whether "global" memory is one bucket or also structured.

---

### 5. Auto-summarize sessions [COMPLEXITY: Medium-High]

**What it is:** When a chat session ends (or on demand), a short summary is produced and appended to the agent's Brain with tags so it can be found later.

**How it could work:**

- IDE or MCP signals "session ended" (or user runs "Summarize and save").
- A summary is generated (either by the same model in the IDE or by a small server-side job): what was discussed, key decisions, open questions, code areas touched.
- That summary is written into the Brain store (project-scoped if that exists) with metadata: timestamp, optional tags (e.g., `#refactor`, `#bugfix`), and maybe session id.
- Tags can be user-defined or suggested from the summary content.

**Why it matters:** Reduces the need to manually "tell" the agent what happened. The next session starts with recent context; timeline and "Ask the Brain" can surface it.

**Considerations:** Who generates the summary (IDE vs. server), token/cost control, and whether summaries are editable after the fact. Privacy: summaries stay local in the store.

---

## Skills & Tooling

1. **Skill packs** — Save/load themed bundles (e.g., "Code Review", "Brainstormer").
2. **Skill compatibility checks** — Warn when skills conflict or duplicate.
3. **MCP-bound skills** — Skills that declare tools/resources and show connection status.
4. **Skill prompt preview** — A clear "what gets injected" inspector.
5. **Skill templates** — Quick-start new skills from curated patterns.

---

## IDE Integration & Workflow

1. **MCP write tools** — Set current agent, toggle skills, update Soul from IDE.
2. **Quick agent switcher** — Command-palette style selection in IDE.
3. **Session handoff** — Auto-generate a handoff summary when switching agents.
4. **Active agent status** — Webapp shows which agent is active in the IDE.
5. **Per-project defaults** — Remember preferred agent per repo.

---

## Zoo Interaction & UI

1. **Agent interactions** — Light "chat bubbles" between idle agents sharing context.
2. **Agent moods** — Subtle animation changes based on recent activity (build, test).
3. **Enclosure themes** — Per-project backgrounds and decor (cozy, not gamified).
4. **Agent roles** — Visual tags or badges (e.g., "Reviewer", "Planner").

---

## Data & Portability

1. **Agent export bundles** — Shareable JSON + assets, import in one click.
2. **Version history** — Roll back changes to Soul/Skills per agent.
3. **Encrypted store option** — Local encryption for Soul/Brain content.
4. **Backup snapshots** — One-click backup to a chosen folder.

---

## Observability & Trust

1. **Prompt inspector** — One view showing Soul + Skills + Brain injection order.
2. **Change diff view** — See what changed when editing skills or soul text.
3. **Activity log** — Simple timeline of edits (no surveillance, just ownership).

---

## Wild Cards

1. **Agent hybridizer** — Blend two agents into a "mashup" persona.
2. **Zoo map mode** — Drag agents into pens representing projects or contexts.
3. **Ambient "story mode"** — The zoo narrates what each agent was last doing.

---

## Next Steps

- Score ideas by impact vs effort.
- Zoom into one pillar (Brain, Skills, IDE, or Zoo UX) and turn the top 2–3 into mini-specs.
