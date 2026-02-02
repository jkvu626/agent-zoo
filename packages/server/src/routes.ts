import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { AgentStore } from "./store.js";
import type { Agent, CreateAgentInput } from "@agent-zoo/types";

type AgentIdParams = { id: string };

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
