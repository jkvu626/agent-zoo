import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { AgentStore } from "./store.js";
import type {
  Agent,
  BrainEntry,
  BrainEntryType,
  CreateAgentInput,
} from "@agent-zoo/types";

type AgentIdParams = { id: string };
type BrainEntryParams = { id: string; entryId: string };
type BrainEntryQuery = {
  type?: BrainEntryType;
  tags?: string;
  dateFrom?: string;
  dateTo?: string;
  pinned?: string;
};
type BrainEntryInput = Omit<BrainEntry, "id" | "agentId" | "timestamp">;

export async function registerRoutes(
  app: FastifyInstance,
  store: AgentStore,
): Promise<void> {
  // List agents
  app.get("/api/agents", async (_req: FastifyRequest, reply: FastifyReply) => {
    const agents = await store.getAll();
    return reply.send(agents);
  });

  // Get one agent
  app.get<{ Params: AgentIdParams }>(
    "/api/agents/:id",
    async (
      req: FastifyRequest<{ Params: AgentIdParams }>,
      reply: FastifyReply,
    ) => {
      const agent = await store.getById(req.params.id);
      if (!agent) return reply.status(404).send({ error: "Agent not found" });
      return reply.send(agent);
    },
  );

  // Create agent
  app.post<{ Body: CreateAgentInput }>(
    "/api/agents",
    async (
      req: FastifyRequest<{ Body: CreateAgentInput }>,
      reply: FastifyReply,
    ) => {
      const body = req.body ?? {};
      const agent = await store.create({
        id: body.id,
        name: body.name ?? "Unnamed",
        description: body.description ?? "",
        systemPrompt: body.systemPrompt ?? "",
        skillCategories: body.skillCategories ?? [],
        skills: body.skills ?? [],
        contextRefs: body.contextRefs ?? [],
        appearanceSeed: body.appearanceSeed,
      });
      return reply.status(201).send(agent);
    },
  );

  // Update agent
  app.put<{ Params: AgentIdParams; Body: Partial<Omit<Agent, "id">> }>(
    "/api/agents/:id",
    async (
      req: FastifyRequest<{
        Params: AgentIdParams;
        Body: Partial<Omit<Agent, "id">>;
      }>,
      reply: FastifyReply,
    ) => {
      const agent = await store.update(req.params.id, req.body ?? {});
      if (!agent) return reply.status(404).send({ error: "Agent not found" });
      return reply.send(agent);
    },
  );

  // Delete agent
  app.delete<{ Params: AgentIdParams }>(
    "/api/agents/:id",
    async (
      req: FastifyRequest<{ Params: AgentIdParams }>,
      reply: FastifyReply,
    ) => {
      const ok = await store.delete(req.params.id);
      if (!ok) return reply.status(404).send({ error: "Agent not found" });
      return reply.status(204).send();
    },
  );

  // List brain entries
  app.get<{ Params: AgentIdParams; Querystring: BrainEntryQuery }>(
    "/api/agents/:id/brain",
    async (
      req: FastifyRequest<{
        Params: AgentIdParams;
        Querystring: BrainEntryQuery;
      }>,
      reply: FastifyReply,
    ) => {
      const agent = await store.getById(req.params.id);
      if (!agent) return reply.status(404).send({ error: "Agent not found" });

      const { type, tags, dateFrom, dateTo, pinned } = req.query ?? {};
      const normalizedTags = tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : undefined;
      const pinnedValue =
        pinned !== undefined ? pinned.toLowerCase() === "true" : undefined;

      const entries = await store.queryBrainEntries(req.params.id, {
        type,
        tags: normalizedTags,
        dateFrom,
        dateTo,
        pinned: pinnedValue,
      });
      return reply.send(entries);
    },
  );

  // Create brain entry
  app.post<{ Params: AgentIdParams; Body: BrainEntryInput }>(
    "/api/agents/:id/brain",
    async (
      req: FastifyRequest<{ Params: AgentIdParams; Body: BrainEntryInput }>,
      reply: FastifyReply,
    ) => {
      const agent = await store.getById(req.params.id);
      if (!agent) return reply.status(404).send({ error: "Agent not found" });

      const type = req.body?.type;
      const content = req.body?.content?.trim() ?? "";
      if (!type) {
        return reply.status(400).send({ error: "Entry type is required" });
      }
      if (!["decision", "milestone", "note", "summary"].includes(type)) {
        return reply.status(400).send({ error: "Invalid entry type" });
      }
      if (!content) {
        return reply.status(400).send({ error: "Entry content is required" });
      }

      const entry = await store.createBrainEntry(req.params.id, {
        type,
        content,
        pinned: req.body?.pinned ?? false,
        tags: req.body?.tags ?? [],
        metadata: req.body?.metadata,
      });
      return reply.status(201).send(entry);
    },
  );

  // Update brain entry
  app.put<{ Params: BrainEntryParams; Body: Partial<BrainEntry> }>(
    "/api/agents/:id/brain/:entryId",
    async (
      req: FastifyRequest<{
        Params: BrainEntryParams;
        Body: Partial<BrainEntry>;
      }>,
      reply: FastifyReply,
    ) => {
      const agent = await store.getById(req.params.id);
      if (!agent) return reply.status(404).send({ error: "Agent not found" });

      const nextType = req.body?.type;
      if (
        nextType &&
        !["decision", "milestone", "note", "summary"].includes(nextType)
      ) {
        return reply.status(400).send({ error: "Invalid entry type" });
      }

      const entry = await store.updateBrainEntry(
        req.params.id,
        req.params.entryId,
        req.body ?? {},
      );
      if (!entry) return reply.status(404).send({ error: "Entry not found" });
      return reply.send(entry);
    },
  );

  // Delete brain entry
  app.delete<{ Params: BrainEntryParams }>(
    "/api/agents/:id/brain/:entryId",
    async (
      req: FastifyRequest<{ Params: BrainEntryParams }>,
      reply: FastifyReply,
    ) => {
      const agent = await store.getById(req.params.id);
      if (!agent) return reply.status(404).send({ error: "Agent not found" });

      const ok = await store.deleteBrainEntry(
        req.params.id,
        req.params.entryId,
      );
      if (!ok) return reply.status(404).send({ error: "Entry not found" });
      return reply.status(204).send();
    },
  );

  // Toggle pin status
  app.patch<{ Params: BrainEntryParams }>(
    "/api/agents/:id/brain/:entryId/pin",
    async (
      req: FastifyRequest<{ Params: BrainEntryParams }>,
      reply: FastifyReply,
    ) => {
      const agent = await store.getById(req.params.id);
      if (!agent) return reply.status(404).send({ error: "Agent not found" });

      const entries = await store.getBrainEntries(req.params.id);
      const entry = entries.find((item) => item.id === req.params.entryId);
      if (!entry) return reply.status(404).send({ error: "Entry not found" });

      const updated = await store.updateBrainEntry(
        req.params.id,
        req.params.entryId,
        { pinned: !entry.pinned },
      );
      if (!updated) return reply.status(404).send({ error: "Entry not found" });
      return reply.send(updated);
    },
  );

  // Get current agent id
  app.get("/api/current", async (_req: FastifyRequest, reply: FastifyReply) => {
    const id = await store.getCurrentId();
    return reply.send({ currentAgentId: id });
  });

  // Set current agent id
  app.put<{ Body: { currentAgentId: string | null } }>(
    "/api/current",
    async (
      req: FastifyRequest<{ Body: { currentAgentId: string | null } }>,
      reply: FastifyReply,
    ) => {
      await store.setCurrentId(req.body?.currentAgentId ?? null);
      return reply.send({ currentAgentId: req.body?.currentAgentId ?? null });
    },
  );
}
