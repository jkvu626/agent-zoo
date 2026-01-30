/**
 * Shared types for AgentZoo (webapp + server).
 */

export interface Agent {
  id: string;
  name: string;
  personality: string;
  skills: Record<string, boolean>;
  contextRefs: string[];
  appearanceSeed?: string;
}

export interface StoreShape {
  agents: Agent[];
  currentAgentId: string | null;
}

export type CreateAgentInput = Omit<Agent, "id"> & { id?: string };
export type UpdateAgentInput = Partial<Omit<Agent, "id">>;
