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
import type { Agent, Skill } from "@agent-zoo/types";
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
        ...agents.map((a) => ({
          uri: `${AGENT_ZOO_SCHEME}://agents/${a.id}`,
          name: a.name,
          description: `Agent: ${a.name}`,
        })),
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
    } else if (path === "agents/current") {
      const current = await store.getCurrent();
      content = JSON.stringify(current ?? {});
    } else if (path.startsWith("agents/")) {
      const id = path.slice("agents/".length);
      const agent = await store.getById(id);
      content = JSON.stringify(agent ?? {});
    } else {
      throw new Error(`Unknown resource: ${uri}`);
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
    const text = buildInjectionMessage(agent.personality, enabledSkills);

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
