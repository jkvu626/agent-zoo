import { Server } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { Agent, BrainEntryType, Skill } from "@agent-zoo/types";
import type { AgentStore } from "./store.js";

const AGENT_ZOO_SCHEME = "agent-zoo";
const PROMPT_PREFIX = "agent_zoo_use_";

const jsonResponse = (payload: unknown) => ({
  content: [
    {
      type: "text",
      text: JSON.stringify(payload, null, 2),
    },
  ],
});

const errorResponse = (code: string, message: string) => ({
  isError: true,
  content: [
    {
      type: "text",
      text: JSON.stringify({ error: true, code, message }, null, 2),
    },
  ],
});

const buildCompiledPrompt = (systemPrompt: string, skills: Skill[]): string => {
  const promptText = systemPrompt?.trim() ?? "";
  const skillBlocks = skills.map((skill) => {
    const description = skill.description?.trim() ?? "";
    return description
      ? `### ${skill.name}\n${description}`
      : `### ${skill.name}`;
  });
  const sections: string[] = [];
  if (promptText) {
    sections.push(promptText);
  }
  if (skillBlocks.length > 0) {
    const skillsSection = `## Active Skills\n\n${skillBlocks.join("\n\n")}`;
    if (sections.length > 0) {
      sections.push("---", skillsSection);
    } else {
      sections.push(skillsSection);
    }
  }
  return sections.join("\n\n");
};

const buildInjectionMessage = (
  systemPrompt: string,
  skills: Skill[],
): string => {
  const compiled = buildCompiledPrompt(systemPrompt, skills);
  const intro =
    "Adopt the following agent persona and skills for this conversation.";
  return compiled ? `${intro}\n\n${compiled}` : intro;
};

const promptNameForAgentId = (agentId: string) =>
  `agent_zoo_use_${encodeURIComponent(agentId)}`;

const resolveAgent = async (
  store: AgentStore,
  agentId?: string,
): Promise<{ agent?: Agent; error?: ReturnType<typeof errorResponse> }> => {
  if (agentId) {
    const agent = await store.getById(agentId);
    if (!agent) {
      return {
        error: errorResponse(
          "AGENT_NOT_FOUND",
          `Agent with ID '${agentId}' not found.`,
        ),
      };
    }
    return { agent };
  }

  const currentId = await store.getCurrentId();
  if (!currentId) {
    return {
      error: errorResponse(
        "NO_CURRENT_AGENT",
        "No current agent set and none specified.",
      ),
    };
  }
  const agent = await store.getById(currentId);
  if (!agent) {
    return {
      error: errorResponse(
        "AGENT_NOT_FOUND",
        `Agent with ID '${currentId}' not found.`,
      ),
    };
  }
  return { agent };
};

export async function runMcpServer(store: AgentStore): Promise<void> {
  const server = new Server(
    {
      name: "agent-zoo",
      version: "0.1.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
        prompts: {
          listChanged: false,
        },
      },
    },
  );

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const agents = await store.getAll();
    const agentResources = agents.flatMap((agent) => [
      {
        uri: `${AGENT_ZOO_SCHEME}://agents/${agent.id}`,
        name: agent.name,
        description: `Agent: ${agent.name}`,
      },
      {
        uri: `${AGENT_ZOO_SCHEME}://agents/${agent.id}/brain`,
        name: `${agent.name} Brain`,
        description: `Brain timeline for ${agent.name}`,
      },
    ]);
    return {
      resources: [
        {
          uri: `${AGENT_ZOO_SCHEME}://agents`,
          name: "Agent list",
          description: "All agents",
        },
        {
          uri: `${AGENT_ZOO_SCHEME}://agents/current`,
          name: "Current agent",
          description: "Config for the current agent",
        },
        ...agentResources,
      ],
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async ({ params }) => {
    const { uri } = params;
    const parsed = new URL(uri);
    if (parsed.protocol !== `${AGENT_ZOO_SCHEME}:`) {
      throw new Error(`Unknown scheme: ${parsed.protocol}`);
    }
    const path = parsed.pathname.replace(/^\/+/, "");
    let content: string;
    if (path === "agents") {
      const agents = await store.getAll();
      content = JSON.stringify(agents.map((a) => ({ id: a.id, name: a.name })));
    } else {
      const segments = path.split("/").filter(Boolean);
      if (segments[0] !== "agents") {
        throw new Error(`Unknown resource: ${uri}`);
      }

      if (segments[1] === "current") {
        const current = await store.getCurrent();
        content = JSON.stringify(current ?? {});
      } else if (segments.length === 2 && segments[1]) {
        const agent = await store.getById(segments[1]);
        content = JSON.stringify(agent ?? {});
      } else if (segments.length >= 3 && segments[2] === "brain") {
        const agentId = segments[1];
        if (segments.length === 3) {
          const type = parsed.searchParams.get("type") as BrainEntryType | null;
          const tags = parsed.searchParams.get("tags");
          const dateFrom = parsed.searchParams.get("dateFrom") ?? undefined;
          const dateTo = parsed.searchParams.get("dateTo") ?? undefined;
          const pinnedParam = parsed.searchParams.get("pinned");
          const pinned =
            pinnedParam !== null ? pinnedParam === "true" : undefined;
          const normalizedTags = tags
            ? tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            : undefined;
          const entries = await store.queryBrainEntries(agentId, {
            type: type ?? undefined,
            tags: normalizedTags,
            dateFrom,
            dateTo,
            pinned,
          });
          content = JSON.stringify(entries ?? []);
        } else if (segments.length === 4) {
          const entryId = segments[3];
          const entries = await store.getBrainEntries(agentId);
          const entry = entries.find((item) => item.id === entryId);
          content = JSON.stringify(entry ?? {});
        } else {
          throw new Error(`Unknown resource: ${uri}`);
        }
      } else {
        throw new Error(`Unknown resource: ${uri}`);
      }
    }
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: content,
        },
      ],
    };
  });

  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    const agents = await store.getAll();
    return {
      prompts: [
        {
          name: "agent_zoo_use_current",
          title: "Use Current Agent",
          description: "Inject the current agent's persona and skills.",
        },
        ...agents.map((agent) => ({
          name: promptNameForAgentId(agent.id),
          title: `Use Agent: ${agent.name}`,
          description: `Inject ${agent.name}'s persona and skills.`,
        })),
      ],
    };
  });

  server.setRequestHandler(GetPromptRequestSchema, async ({ params }) => {
    const { name } = params;
    let agentId: string | undefined;

    if (name === "agent_zoo_use_current") {
      agentId = undefined;
    } else if (name.startsWith(PROMPT_PREFIX)) {
      const encoded = name.slice(PROMPT_PREFIX.length);
      agentId = decodeURIComponent(encoded);
    } else {
      throw new Error(`Unknown prompt: ${name}`);
    }

    const resolved = await resolveAgent(store, agentId);
    if (resolved.error) {
      const raw = resolved.error.content?.[0]?.text ?? "";
      const parsed = raw ? JSON.parse(raw) : null;
      throw new Error(parsed?.message ?? "Agent not found.");
    }

    const agent = resolved.agent!;
    const enabledSkills = agent.skills.filter((skill) => skill.enabled);
    const text = buildInjectionMessage(agent.systemPrompt, enabledSkills);

    return {
      description: `Use ${agent.name} in this conversation.`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text,
          },
        },
      ],
    };
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "agent_zoo_inject",
        description:
          "Return a compiled prompt or structured data for agent injection.",
        inputSchema: {
          type: "object",
          properties: {
            agentId: {
              type: "string",
              description:
                "Optional. Agent ID to inject. Defaults to current agent.",
            },
            format: {
              type: "string",
              enum: ["compiled", "structured"],
              description:
                "Output format. 'compiled' = single prompt string. 'structured' = JSON with systemPrompt + skills.",
            },
          },
          required: [],
        },
      },
      {
        name: "agent_zoo_list_agents",
        description: "List available agents for selection.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "agent_zoo_set_current",
        description: "Set which agent is active for future injections.",
        inputSchema: {
          type: "object",
          properties: {
            agentId: {
              type: "string",
              description: "The agent ID to set as current.",
            },
          },
          required: ["agentId"],
        },
      },
      {
        name: "agent_zoo_get_agent",
        description: "Get the full raw agent configuration.",
        inputSchema: {
          type: "object",
          properties: {
            agentId: {
              type: "string",
              description:
                "Optional. Agent ID to retrieve. Defaults to current agent.",
            },
          },
          required: [],
        },
      },
      {
        name: "agent_zoo_create_brain_entry",
        description: "Create a new brain timeline entry for an agent.",
        inputSchema: {
          type: "object",
          properties: {
            agentId: {
              type: "string",
              description:
                "Optional. Agent ID to write to. Defaults to current agent.",
            },
            type: {
              type: "string",
              enum: ["decision", "milestone", "note", "summary"],
              description: "Entry type.",
            },
            content: {
              type: "string",
              description: "Entry text content.",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Optional tags for filtering.",
            },
            pinned: {
              type: "boolean",
              description: "Whether the entry is pinned.",
            },
            metadata: {
              type: "object",
              description:
                "Optional metadata (source, sessionId, workspaceId).",
            },
          },
          required: ["type", "content"],
        },
      },
      {
        name: "agent_zoo_update_brain_entry",
        description: "Update an existing brain timeline entry.",
        inputSchema: {
          type: "object",
          properties: {
            agentId: {
              type: "string",
              description:
                "Optional. Agent ID to update. Defaults to current agent.",
            },
            entryId: {
              type: "string",
              description: "The brain entry ID to update.",
            },
            type: {
              type: "string",
              enum: ["decision", "milestone", "note", "summary"],
              description: "Updated entry type.",
            },
            content: {
              type: "string",
              description: "Updated entry text content.",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Updated tags for filtering.",
            },
            pinned: {
              type: "boolean",
              description: "Updated pinned state.",
            },
            metadata: {
              type: "object",
              description: "Updated metadata.",
            },
          },
          required: ["entryId"],
        },
      },
      {
        name: "agent_zoo_delete_brain_entry",
        description: "Delete a brain timeline entry.",
        inputSchema: {
          type: "object",
          properties: {
            agentId: {
              type: "string",
              description:
                "Optional. Agent ID to delete from. Defaults to current agent.",
            },
            entryId: {
              type: "string",
              description: "The brain entry ID to delete.",
            },
          },
          required: ["entryId"],
        },
      },
      {
        name: "agent_zoo_query_brain_entries",
        description: "Query brain timeline entries with optional filters.",
        inputSchema: {
          type: "object",
          properties: {
            agentId: {
              type: "string",
              description:
                "Optional. Agent ID to query. Defaults to current agent.",
            },
            type: {
              type: "string",
              enum: ["decision", "milestone", "note", "summary"],
              description: "Filter by entry type.",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Filter by tags (matches any tag).",
            },
            dateFrom: {
              type: "string",
              description: "ISO date string for start of range.",
            },
            dateTo: {
              type: "string",
              description: "ISO date string for end of range.",
            },
            pinned: {
              type: "boolean",
              description: "Filter by pinned state.",
            },
          },
          required: [],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
    const { name } = params;
    const args = (params.arguments ?? {}) as Record<string, unknown>;

    if (name === "agent_zoo_list_agents") {
      const [agents, currentId] = await Promise.all([
        store.getAll(),
        store.getCurrentId(),
      ]);
      return jsonResponse({
        agents: agents.map((agent) => ({
          id: agent.id,
          name: agent.name,
          isCurrent: agent.id === currentId,
        })),
      });
    }

    if (name === "agent_zoo_set_current") {
      const agentId =
        typeof args.agentId === "string" ? args.agentId.trim() : "";
      if (!agentId) {
        return errorResponse(
          "INVALID_ARGUMENTS",
          "agentId is required to set the current agent.",
        );
      }
      const agent = await store.getById(agentId);
      if (!agent) {
        return errorResponse(
          "AGENT_NOT_FOUND",
          `Agent with ID '${agentId}' not found.`,
        );
      }
      await store.setCurrentId(agentId);
      return jsonResponse({
        success: true,
        message: `Current agent set to '${agent.name}'`,
        agentId,
      });
    }

    if (name === "agent_zoo_get_agent") {
      const agentId =
        typeof args.agentId === "string" ? args.agentId.trim() : undefined;
      const resolved = await resolveAgent(store, agentId);
      if (resolved.error) return resolved.error;
      return jsonResponse(resolved.agent);
    }

    if (name === "agent_zoo_create_brain_entry") {
      const agentId =
        typeof args.agentId === "string" ? args.agentId.trim() : undefined;
      const resolved = await resolveAgent(store, agentId);
      if (resolved.error) return resolved.error;

      const type = typeof args.type === "string" ? args.type.trim() : undefined;
      if (!type) {
        return errorResponse("INVALID_ARGUMENTS", "type is required.");
      }
      if (!["decision", "milestone", "note", "summary"].includes(type)) {
        return errorResponse("INVALID_ARGUMENTS", "Invalid brain entry type.");
      }

      const content =
        typeof args.content === "string" ? args.content.trim() : "";
      if (!content) {
        return errorResponse("INVALID_ARGUMENTS", "content is required.");
      }

      const tags = Array.isArray(args.tags)
        ? args.tags.filter((tag) => typeof tag === "string")
        : undefined;
      const pinned = typeof args.pinned === "boolean" ? args.pinned : false;
      const metadata =
        typeof args.metadata === "object" && args.metadata
          ? args.metadata
          : undefined;

      const entry = await store.createBrainEntry(resolved.agent!.id, {
        type: type as BrainEntryType,
        content,
        tags: tags as string[] | undefined,
        pinned,
        metadata: metadata as Record<string, unknown> | undefined,
      });

      return jsonResponse(entry);
    }

    if (name === "agent_zoo_update_brain_entry") {
      const agentId =
        typeof args.agentId === "string" ? args.agentId.trim() : undefined;
      const resolved = await resolveAgent(store, agentId);
      if (resolved.error) return resolved.error;

      const entryId =
        typeof args.entryId === "string" ? args.entryId.trim() : "";
      if (!entryId) {
        return errorResponse("INVALID_ARGUMENTS", "entryId is required.");
      }

      const type = typeof args.type === "string" ? args.type.trim() : undefined;
      if (
        type &&
        !["decision", "milestone", "note", "summary"].includes(type)
      ) {
        return errorResponse("INVALID_ARGUMENTS", "Invalid brain entry type.");
      }

      const content =
        typeof args.content === "string" ? args.content.trim() : undefined;
      const tags = Array.isArray(args.tags)
        ? args.tags.filter((tag) => typeof tag === "string")
        : undefined;
      const pinned = typeof args.pinned === "boolean" ? args.pinned : undefined;
      const metadata =
        typeof args.metadata === "object" && args.metadata
          ? args.metadata
          : undefined;

      const updated = await store.updateBrainEntry(
        resolved.agent!.id,
        entryId,
        {
          type: type as BrainEntryType | undefined,
          content,
          tags: tags as string[] | undefined,
          pinned,
          metadata: metadata as Record<string, unknown> | undefined,
        },
      );

      if (!updated) {
        return errorResponse("NOT_FOUND", "Brain entry not found.");
      }

      return jsonResponse(updated);
    }

    if (name === "agent_zoo_delete_brain_entry") {
      const agentId =
        typeof args.agentId === "string" ? args.agentId.trim() : undefined;
      const resolved = await resolveAgent(store, agentId);
      if (resolved.error) return resolved.error;

      const entryId =
        typeof args.entryId === "string" ? args.entryId.trim() : "";
      if (!entryId) {
        return errorResponse("INVALID_ARGUMENTS", "entryId is required.");
      }

      const ok = await store.deleteBrainEntry(resolved.agent!.id, entryId);
      if (!ok) {
        return errorResponse("NOT_FOUND", "Brain entry not found.");
      }

      return jsonResponse({ success: true, entryId });
    }

    if (name === "agent_zoo_query_brain_entries") {
      const agentId =
        typeof args.agentId === "string" ? args.agentId.trim() : undefined;
      const resolved = await resolveAgent(store, agentId);
      if (resolved.error) return resolved.error;

      const type = typeof args.type === "string" ? args.type.trim() : undefined;
      if (
        type &&
        !["decision", "milestone", "note", "summary"].includes(type)
      ) {
        return errorResponse("INVALID_ARGUMENTS", "Invalid brain entry type.");
      }

      const tags = Array.isArray(args.tags)
        ? args.tags.filter((tag) => typeof tag === "string")
        : undefined;
      const dateFrom =
        typeof args.dateFrom === "string" ? args.dateFrom : undefined;
      const dateTo = typeof args.dateTo === "string" ? args.dateTo : undefined;
      const pinned = typeof args.pinned === "boolean" ? args.pinned : undefined;

      const entries = await store.queryBrainEntries(resolved.agent!.id, {
        type: type as BrainEntryType | undefined,
        tags: tags as string[] | undefined,
        dateFrom,
        dateTo,
        pinned,
      });

      return jsonResponse({
        agentId: resolved.agent!.id,
        entries,
      });
    }

    if (name === "agent_zoo_inject") {
      const agentId =
        typeof args.agentId === "string" ? args.agentId.trim() : undefined;
      const format = typeof args.format === "string" ? args.format : "compiled";

      if (format !== "compiled" && format !== "structured") {
        return errorResponse(
          "INVALID_FORMAT",
          `Unknown format '${format}'. Use 'compiled' or 'structured'.`,
        );
      }

      const resolved = await resolveAgent(store, agentId);
      if (resolved.error) return resolved.error;
      const agent = resolved.agent!;
      const enabledSkills = agent.skills.filter((skill) => skill.enabled);

      if (format === "structured") {
        return jsonResponse({
          agentId: agent.id,
          agentName: agent.name,
          systemPrompt: agent.systemPrompt,
          skills: enabledSkills.map((skill) => ({
            id: skill.id,
            name: skill.name,
            description: skill.description,
          })),
        });
      }

      const prompt = buildCompiledPrompt(agent.systemPrompt, enabledSkills);
      return jsonResponse({
        agentId: agent.id,
        agentName: agent.name,
        prompt,
      });
    }

    return errorResponse("UNKNOWN_TOOL", `Unknown tool '${name}'.`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[agent-zoo] MCP server running on stdio");
}
