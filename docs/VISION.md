# AgentZoo Vision

AgentZoo is a **personal agent hub** — a cozy, game-inspired interface for customizing and managing AI agent personas that integrate with your IDE through MCP (Model Context Protocol).

---

## The Core Idea

Modern AI agents are powerful but generic. Every chat starts fresh. Every project requires re-explaining your preferences. AgentZoo changes this by giving you a place to **define, customize, and persist** agent configurations that follow you across tools and conversations.

Think of it as a character creator for your AI assistants — but one that actually matters because the characters you create show up in your IDE and remember what they're working on.

---

## The Zoo Metaphor

The "zoo" isn't just branding. It's a design philosophy:

- **Agents are characters**, not settings pages. They have visual presence, personality, and (eventually) basic social behavior.
- **The enclosure is your workspace.** Agents wander, idle, and can be observed before you interact with them.
- **Interaction is playful.** Clicking an agent opens their "character sheet" (Agent View), not a modal form.

The zoo window is intentionally more interactive than a typical dashboard. Agents walk around, have unique appearances generated from their names, and exist as entities you cultivate rather than configurations you edit.

**Future direction:** Basic agent interaction — imagine two agents (from different chats) being able to "talk" to each other, sharing context or handing off tasks.

---

## The Three Pillars: Brain, Soul, Skills

Each agent has three customizable dimensions, represented as buttons in the Agent View:

### Brain — Memory & Knowledge Base

The Brain is an agent's **persistent memory**. It allows agents to retain context across conversations.

- **What it stores:** Summaries of past work, project context, key decisions, ongoing tasks.
- **How it works:** When you start a new chat, the agent's Brain is injected as context, so it "remembers" what it was working on.
- **Why it matters:** No more re-explaining your codebase or project goals. The agent picks up where you left off.

_Status: Planned. Currently no-op in the UI._

### Soul — Personality & System Prompt

The Soul defines **who the agent is**. It's the system prompt that shapes the agent's tone, expertise, and behavior.

- **What it stores:** A free-form text prompt (e.g., "You are a senior engineer who values clean code and clear explanations").
- **How it works:** The personality is injected as the system prompt when the agent is active in your IDE.
- **Why it matters:** Different tasks need different personas. A code reviewer should behave differently than a brainstorming partner.

_Status: Implemented. Editable via the Soul sidebar in Agent View._

### Skills — Capabilities & Plugins

Skills are **injectable capabilities** that direct agent behavior. Think of it as a plugin manager for AI agents.

- **What it stores:** A tree of skills organized by category, each with a name, description, and enabled/disabled state.
- **How it works:** Skills are prompt fragments or directives that get injected when enabled. The agent doesn't have to "reason" into using a skill — it's told to use it.
- **Project portability:** You can create a skill tree in AgentZoo, then add those skills to any new project. Skills travel with your workflow.
- **Future direction:** Skills that interact with MCP servers and tools (e.g., "Enable the GitHub skill" actually connects to a GitHub MCP server). Not MVP.

_Status: Implemented. Skill tree UI with toggles, categories, and persistence._

---

## How It Connects to Your IDE

AgentZoo is not a standalone chat app. It's a **configuration hub** that your IDE reads from.

```
┌─────────────────┐         ┌──────────────────────────────────┐         ┌─────────────────┐
│   AgentZoo      │  write  │   Shared store                   │  read   │   Cursor / IDE  │
│   Webapp        │ ──────► │   (agents.json)                  │ ◄────── │   Agent         │
│   (browser)     │         │                                  │         │   (MCP client)  │
└─────────────────┘         └──────────────────────────────────┘         └─────────────────┘
```

- **Webapp writes:** You customize agents in the cozy UI — set their personality, toggle skills, (eventually) curate their Brain.
- **Store persists:** A JSON file (or future database) holds all agent configurations.
- **IDE reads:** Your IDE (Cursor, VS Code, etc.) connects to AgentZoo via MCP and reads the current agent's config. It injects the personality, skills, and brain context into the chat.

The result: **What you configure in the zoo shows up in your code editor.**

---

## Target Audience

AgentZoo is a **personal productivity tool** for:

- **Developers interested in agent management** — People who want fine-grained control over how AI assistants behave in their workflow.
- **Learners exploring agentic programming** — A hands-on way to understand how prompts, skills, and context shape agent behavior.
- **Power users who want consistency** — If you're tired of re-prompting every new chat, AgentZoo gives you persistent, reusable agent configurations.

This is **not** an enterprise tool. It's a personal utility — opinionated, focused, and designed for individual developers rather than teams or organizations.

**Distribution:** Eventually available online. Open source status undecided.

---

## Design Philosophy

### Warm, Cozy, Intentional

AgentZoo rejects the generic SaaS aesthetic. The design is:

- **Warm colors:** Creamy backgrounds (Warm Linen), burnt apricot accents, sage greens. No cold grays.
- **Soft edges:** Generous border radius, subtle shadows, rounded everything.
- **Bouncy motion:** Spring-based animations via Framer Motion. The UI feels alive and responsive.
- **Game-inspired:** Character sprites, nametags, walking animations. More RPG hub than admin panel.

### All Features Available

No artificial gating. No "unlock this feature" mechanics. AgentZoo is a tool, not a game with progression systems. Every capability is available from the start.

### Personal Scale

The architecture is designed for a single user with a handful of agents, not thousands of users with enterprise requirements. Simplicity over scalability (for now).

---

## Current State

| Component                          | Status         |
| ---------------------------------- | -------------- |
| Zoo window with walking agents     | ✅ Complete    |
| Agent list sidebar                 | ✅ Complete    |
| Agent creation with live preview   | ✅ Complete    |
| Agent View (character sheet)       | ✅ Complete    |
| Soul Editor (personality)          | ✅ Complete    |
| Skills Tree with categories        | ✅ Complete    |
| Skill toggles (persist to backend) | ✅ Complete    |
| Backend API (CRUD agents)          | ✅ Complete    |
| MCP server (read resources)        | ✅ Complete    |
| MCP tools (write operations)       | 🔄 In Progress |
| Brain (memory/knowledge base)      | 📋 Planned     |
| Agent interaction (cross-chat)     | 📋 Planned     |
| Online deployment                  | 📋 Planned     |

---

## What AgentZoo Is Not

- **Not a chat interface.** AgentZoo configures agents; your IDE is where you chat with them.
- **Not a prompt library.** Skills and personalities are tied to specific agents, not a shared catalog.
- **Not an enterprise platform.** No teams, no SSO, no admin dashboards.
- **Not a game with progression.** No unlocks, no leveling, no gamification. Just tools.

---

## Summary

AgentZoo is where you **create, customize, and manage AI agent personas** in a cozy, visual interface. Those agents then appear in your IDE via MCP, carrying their personality (Soul), capabilities (Skills), and memory (Brain) with them.

It's a personal tool for developers who want their AI assistants to be more than generic chatbots — agents that know who they are, what they're good at, and what they were working on.
