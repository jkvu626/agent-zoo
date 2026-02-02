/**
 * Shared types for AgentZoo (webapp + server).
 */

export interface SkillCategory {
  id: string;
  name: string;
  color: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  enabled: boolean;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  skillCategories: SkillCategory[];
  skills: Skill[];
  contextRefs: string[];
  appearanceSeed?: string;
}

export interface StoreShape {
  agents: Agent[];
  currentAgentId: string | null;
}

export type CreateAgentInput = Omit<Agent, "id"> & { id?: string };
export type UpdateAgentInput = Partial<Omit<Agent, "id">>;
