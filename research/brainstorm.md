# Feature Brainstorm: AgentZoo Evolution

## Introduction

This document captures ideas for new features and improvements to AgentZoo. Ideas are categorized by scope and effort, with notes on implementation complexity and user value.

---

## Quick Wins (1-4 Hours Each)

### 1. Agent Creation UI

**Current:** Only mock agents exist; no way to create new agents in the webapp.

**Proposed:**
- Add "+" button at bottom of agent list sidebar
- Modal or inline form: name, initial personality, optional starter template
- New agent appears in zoo with default sprite

**Implementation:**
```tsx
// Add to LeftSidebar.tsx
<Button onClick={() => setShowCreateModal(true)}>
  <PlusIcon /> New Agent
</Button>

// CreateAgentModal.tsx
<Modal>
  <Input label="Name" value={name} onChange={setName} />
  <Select label="Template" options={templates} />
  <Button onClick={handleCreate}>Create</Button>
</Modal>
```

**Value:** Essential for actual product usage. Currently blocked on mock data.

---

### 2. Agent Deletion

**Current:** No way to delete agents.

**Proposed:**
- Add delete button in AgentView (destructive action, bottom of page)
- Confirmation modal: "Delete [name]? This cannot be undone."
- Soft delete option: archive instead of permanent removal

**Value:** Basic CRUD completion.

---

### 3. Copy Agent Config

**Current:** No way to share/export agent configuration.

**Proposed:**
- Add "Copy Config" button in AgentView
- Copies JSON to clipboard: `{ name, personality, skills, contextRefs }`
- Toast notification: "Config copied!"

**Implementation:**
```tsx
const handleCopy = () => {
  navigator.clipboard.writeText(JSON.stringify(agent, null, 2));
  toast.success('Config copied to clipboard');
};
```

**Value:** Enables sharing agents between users, debugging, backup.

---

### 4. Keyboard Shortcuts

**Current:** All interaction is mouse-only.

**Proposed shortcuts:**
- `Cmd/Ctrl + K` — Toggle Soul sidebar
- `Cmd/Ctrl + S` — Save current edits
- `Escape` — Close sidebar/modal
- `1-9` — Quick-select agent by position
- `←/→` — Navigate between agents

**Implementation:** Use `useEffect` with global keydown listener or a library like `@react-hook/keyboard`.

**Value:** Power users love keyboard shortcuts. Small effort, big UX improvement.

---

### 5. Search/Filter Agents

**Current:** Agent list shows all agents with no filtering.

**Proposed:**
- Search input at top of sidebar
- Filters by name (fuzzy match)
- Optional: filter by enabled skills

**Implementation:**
```tsx
const filteredAgents = agents.filter(a =>
  a.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

**Value:** Becomes essential once users have 10+ agents.

---

### 6. Agent Duplicate/Clone

**Current:** Must create agents from scratch.

**Proposed:**
- "Duplicate" button in AgentView
- Creates copy with name "Agent Name (Copy)"
- Opens new agent for editing

**Value:** Speeds up creating variations of existing agents.

---

### 7. Skill Dependency Visualization

**Current:** Skills have `requires: [...]` but dependencies aren't visually shown.

**Proposed:**
- On skill hover, highlight required skills with connecting lines
- Dim skills that aren't unlockable (missing dependencies)
- Or: draw actual tree structure instead of flat grid

**Value:** Makes skill system feel more like a real skill tree.

---

### 8. Dark Mode

**Current:** Single warm light theme.

**Proposed:**
- Dark palette: deep espresso background, muted accents
- Toggle in header
- Persist preference to localStorage

**CSS Variables for dark:**
```css
[data-theme="dark"] {
  --bg-app: #1a1512;
  --bg-sidebar: #252019;
  --bg-panel: #2d2620;
  --text-primary: #e8e0d8;
  --text-muted: #a89888;
  --border: #3d352c;
}
```

**Value:** Many users prefer dark mode, especially developers.

---

## Medium Effort Features (4-12 Hours Each)

### 9. Rich Personality Editor

**Current:** Plain textarea for system prompt.

**Proposed:**
- Structured sections: Role, Personality Traits, Expertise, Constraints
- Collapsible sections
- Character count / token estimate
- Markdown preview
- Prompt templates (Teacher, Analyst, Creative, etc.)

**Mockup:**
```
┌─────────────────────────────────────┐
│ Personality Editor                  │
├─────────────────────────────────────┤
│ ▼ Role                              │
│   [You are a senior engineer...]    │
│                                     │
│ ▼ Expertise                         │
│   [Python, TypeScript, databases]   │
│                                     │
│ ▶ Constraints (collapsed)           │
│ ▶ Examples (collapsed)              │
└─────────────────────────────────────┘
```

**Value:** Better prompts = better agent behavior. Guided editing helps users craft effective personalities.

---

### 10. Context References UI

**Current:** `contextRefs` field exists but has no UI.

**Proposed:**
- Section in AgentView to manage context references
- Add file paths, URLs, or text snippets
- Display as chips with remove button
- Drag to reorder priority

**Use case:** "Always include the project README and API docs when this agent responds."

**Value:** Key differentiator for IDE integration. Allows agents to have persistent context.

---

### 11. Agent Activity Log

**Current:** No visibility into agent usage.

**Proposed:**
- Track when agent is selected, modified
- Show "last active" in agent list
- Optional: log MCP access attempts

**Implementation:**
```typescript
// Add to Agent type
lastActiveAt: string;
activityLog: Array<{
  action: 'selected' | 'modified' | 'mcp_read';
  timestamp: string;
  details?: Record<string, unknown>;
}>;
```

**Value:** Helps users understand which agents they actually use.

---

### 12. Skill Presets/Templates

**Current:** Users must manually toggle each skill.

**Proposed:**
- Pre-built presets: "Data Analyst", "Code Reviewer", "Creative Writer"
- Apply preset → enables appropriate skills
- Save custom presets

**Preset Example:**
```typescript
const presets = {
  'Code Reviewer': {
    skills: ['code-review', 'syntax-analysis', 'best-practices', 'documentation'],
    description: 'Focus on code quality and standards'
  },
  'Creative Writer': {
    skills: ['storytelling', 'brainstorming', 'metaphor', 'tone-adaptation'],
    description: 'Emphasis on creative expression'
  }
};
```

**Value:** Faster agent setup, especially for new users.

---

### 13. Agent Sprite Customization

**Current:** Agents have a fixed sprite style (only color varies).

**Proposed:**
- Multiple sprite base types (humanoid, animal, robot, abstract)
- Color picker for primary/secondary colors
- Accessories (hats, glasses, items)
- Save as SVG or export

**Implementation:** Store sprite config in agent:
```typescript
sprite: {
  base: 'humanoid' | 'robot' | 'animal' | 'abstract';
  primaryColor: string;
  secondaryColor: string;
  accessories: string[];
}
```

**Value:** Personalization creates attachment. Users will want "their" agents to look unique.

---

### 14. Import/Export Agents

**Current:** No way to backup or share agents.

**Proposed:**
- Export single agent as JSON file
- Export all agents as JSON archive
- Import agent from JSON file
- Import from clipboard (paste JSON)

**Value:** Backup, sharing, migration between machines.

---

### 15. Undo/Redo for Edits

**Current:** All changes are immediate and permanent.

**Proposed:**
- Track edit history per session
- Undo last change (Cmd+Z)
- Redo (Cmd+Shift+Z)
- Visual indicator of unsaved changes

**Implementation:** Use `use-undo` or custom reducer with history stack.

**Value:** Safety net for accidental changes. Expected UX pattern.

---

## Larger Features (Days to Weeks)

### 16. Agent Versioning

**Current:** Agents have single current state.

**Proposed:**
- Every save creates a version
- Version history sidebar
- Compare versions (diff view)
- Restore previous version
- Optional: name important versions ("v1.0 - Production Ready")

**Database Schema:**
```prisma
model AgentVersion {
  id          String   @id @default(uuid())
  agentId     String
  agent       Agent    @relation(fields: [agentId], references: [id])
  name        String?
  personality String   @db.Text
  skills      Json
  createdAt   DateTime @default(now())
}
```

**Value:** Rollback bad changes, track evolution, A/B test configurations.

---

### 17. Agent Testing Playground

**Current:** No way to test agents without using Cursor.

**Proposed:**
- Built-in chat interface to test agents
- Shows how personality + skills affect responses
- Compare two agents side-by-side
- Mock responses (no actual API call) or integrate Claude API

**Mockup:**
```
┌─────────────────────────────────────────────────────┐
│ Test Playground                                     │
├─────────────────────────────────────────────────────┤
│ Agent: [Dropdown: Select Agent]                     │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ User: Explain recursion                         │ │
│ │                                                 │ │
│ │ Agent: Recursion is when a function calls      │ │
│ │ itself. Imagine a Russian nesting doll...      │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [Input: Type a message...] [Send]                   │
└─────────────────────────────────────────────────────┘
```

**Value:** Validate agent behavior before using in actual work. Game-changer for prompt engineering.

---

### 18. Collaborative Editing (Multi-User)

**Current:** Single-user, local-only.

**Proposed:**
- Invite collaborators to workspace
- Real-time sync (WebSocket)
- Presence indicators (who's viewing)
- Comments on agents
- Role-based permissions (owner, editor, viewer)

**Implementation complexity:** High. Requires auth, database, WebSocket, conflict resolution.

**Value:** Team-based agent management. Enterprise feature.

---

### 19. Skills Marketplace

**Current:** Fixed set of built-in skills.

**Proposed:**
- Community-contributed skill definitions
- Browse, search, install skills
- Skill ratings and reviews
- Create and publish your own skills

**Skill Package Format:**
```json
{
  "id": "code-review-pro",
  "name": "Advanced Code Review",
  "author": "community",
  "description": "In-depth code analysis with security focus",
  "tier": 3,
  "category": "analysis",
  "requires": ["code-review"],
  "promptFragment": "When reviewing code, always check for security vulnerabilities including..."
}
```

**Value:** Ecosystem play. Users contribute value, platform grows.

---

### 20. Workflow Automation

**Current:** Agents are static configurations.

**Proposed:**
- Define workflows: sequences of agent actions
- Triggers: time-based, file change, webhook
- Actions: switch agent, update personality, enable skills
- Integrations: GitHub, Slack, Discord

**Example workflow:**
```yaml
name: Daily Standup Prep
trigger:
  schedule: "0 9 * * 1-5"  # 9am weekdays
actions:
  - set_current_agent: standup-helper
  - notify:
      channel: slack
      message: "Ready for standup!"
```

**Value:** Automation reduces friction. Power users will love this.

---

### 21. Analytics Dashboard

**Current:** No insights into agent usage.

**Proposed:**
- Which agents are used most
- Skill usage patterns
- Time spent per agent
- Trend charts over time
- Export analytics data

**Metrics to track:**
- Agent selection events
- Personality edit frequency
- Skill toggle events
- MCP access logs
- Session duration

**Value:** Data-driven agent optimization. Required for teams.

---

### 22. Mobile Companion App

**Current:** Desktop webapp only.

**Proposed:**
- View agents on mobile
- Quick personality tweaks
- Switch current agent on-the-go
- Push notifications for activity

**Tech:** React Native or PWA (Progressive Web App).

**Value:** Convenience, accessibility, mobile-first generation.

---

## UX Improvements

### 23. Onboarding Flow

**Current:** Empty state, no guidance.

**Proposed:**
- First-run tutorial
- Create first agent with guided steps
- Explain skill system
- Link to Cursor MCP setup

**Implementation:** Modal wizard with steps, local storage flag for completion.

---

### 24. Empty States

**Current:** Components show nothing when no data.

**Proposed:**
- Friendly empty state illustrations
- Clear call-to-action: "No agents yet. Create your first one!"
- Starter templates for quick setup

---

### 25. Loading States

**Current:** No loading indicators.

**Proposed:**
- Skeleton loaders for agent list
- Spinner for actions (save, delete)
- Progress indicators for long operations

---

### 26. Error Handling UI

**Current:** Errors fail silently or show raw messages.

**Proposed:**
- Toast notifications for errors
- Inline error messages in forms
- Retry buttons for failed operations
- Friendly error copy (not technical jargon)

---

### 27. Responsive Design

**Current:** Desktop-first, breaks on mobile.

**Proposed:**
- Collapsible sidebars on tablet
- Bottom navigation on mobile
- Touch-friendly hit targets
- Responsive typography

---

## Technical Improvements

### 28. Real-time Sync

**Current:** No sync between webapp and IDE.

**Proposed:**
- WebSocket connection to server
- Broadcast store changes to all clients
- Optimistic updates with rollback

**Value:** Changes in webapp immediately visible to Cursor and vice versa.

---

### 29. Offline Support

**Current:** Requires network connection.

**Proposed:**
- Service worker for caching
- IndexedDB for local storage
- Sync queue for offline edits
- Online/offline indicator

**Value:** Works in airplane mode, unreliable networks.

---

### 30. Plugin System

**Current:** Monolithic, all features built-in.

**Proposed:**
- Plugin API for extensions
- Third-party skill sources
- Custom sprite packs
- Theme plugins

**Value:** Ecosystem, community contributions, customization.

---

## Integration Ideas

### 31. GitHub Integration

- Import context from repository READMEs
- Auto-update context on push
- Sync agents to GitHub repo (version control)

### 32. Slack/Discord Bot

- `/agent switch [name]` — switch current agent
- `/agent list` — show available agents
- Notifications when agent is modified

### 33. VS Code Extension

- Alternative to MCP for VS Code users
- Sidebar panel showing current agent
- Quick-switch command palette

### 34. CLI Tool

```bash
# List agents
agent-zoo list

# Switch current
agent-zoo use sage

# Export agent
agent-zoo export sage > sage.json

# Start local MCP server
agent-zoo mcp
```

---

## Monetization Ideas (Future)

### Free Tier
- Up to 5 agents
- Basic skills
- Local storage only

### Pro Tier ($10/month)
- Unlimited agents
- Cloud sync
- Version history
- Priority support

### Team Tier ($25/user/month)
- Everything in Pro
- Shared workspaces
- Collaborative editing
- Admin controls
- Audit log

### Enterprise
- Self-hosted option
- SSO integration
- Custom SLA
- Dedicated support

---

## Priority Matrix

### High Value, Low Effort (Do First)
1. Agent Creation UI
2. Agent Deletion
3. Keyboard Shortcuts
4. Search/Filter Agents
5. Copy Agent Config

### High Value, Medium Effort (Do Soon)
6. Dark Mode
7. Rich Personality Editor
8. Context References UI
9. Skill Presets
10. Import/Export

### High Value, High Effort (Plan Carefully)
11. Agent Versioning
12. Testing Playground
13. Real-time Sync
14. Collaborative Editing

### Lower Priority (Nice to Have)
15. Analytics Dashboard
16. Mobile App
17. Plugin System
18. Workflow Automation

---

## Next Steps

1. **Validate ideas with users** — Which features would they actually use?
2. **Prioritize by effort/value** — Use the matrix above
3. **Create detailed specs** — For top 3-5 features
4. **Iterate based on feedback** — Ship, measure, learn

---

## Open Questions

1. What's the target user? Solo developer? Team? Enterprise?
2. Should AgentZoo be open-source or proprietary?
3. How important is mobile access?
4. What's the acceptable price point for premium features?
5. Which integrations matter most? (GitHub, Slack, VS Code)
