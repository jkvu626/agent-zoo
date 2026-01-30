import {
  Server,
  StdioServerTransport,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/server";
import type { AgentStore } from "./store.js";

const AGENT_ZOO_SCHEME = "agent-zoo";

export async function runMcpServer(store: AgentStore): Promise<void> {
  const server = new Server(
    {
      name: "agent-zoo",
      version: "0.1.0",
    },
    {
      capabilities: {
        resources: {},
      },
    }
  );

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const agents = await store.getAll();
    return {
      resources: [
        { uri: `${AGENT_ZOO_SCHEME}://agents`, name: "Agent list", description: "All agents" },
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

  server.setRequestHandler(ReadResourceRequestSchema, async ({ uri }) => {
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

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[agent-zoo] MCP server running on stdio");
}
