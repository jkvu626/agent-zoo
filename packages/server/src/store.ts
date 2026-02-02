import type { Agent, CreateAgentInput, StoreShape } from "@agent-zoo/types";

/**
 * Store interface so we can swap JSON file → SQLite → DB later.
 */
export interface AgentStore {
  getAll(): Promise<Agent[]>;
  getById(id: string): Promise<Agent | null>;
  getCurrent(): Promise<Agent | null>;
  getCurrentId(): Promise<string | null>;
  setCurrentId(id: string | null): Promise<void>;
  create(agent: CreateAgentInput): Promise<Agent>;
  update(id: string, data: Partial<Omit<Agent, "id">>): Promise<Agent | null>;
  delete(id: string): Promise<boolean>;
}

const defaultStore: StoreShape = {
  agents: [],
  currentAgentId: null,
};

const DEFAULT_CATEGORY = {
  id: "general",
  name: "General",
  color: "#61988E",
};

const toTitleCase = (value: string) =>
  value.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const migrateAgent = (agent: Agent): { agent: Agent; didChange: boolean } => {
  const hasSkillArray = Array.isArray(agent.skills);
  const hasCategoryArray = Array.isArray(agent.skillCategories);

  if (hasSkillArray && hasCategoryArray) {
    return {
      agent: {
        ...agent,
        contextRefs: agent.contextRefs ?? [],
      },
      didChange: false,
    };
  }

  const legacySkills =
    !hasSkillArray && typeof agent.skills === "object" && agent.skills
      ? (agent.skills as Record<string, boolean>)
      : {};

  const skillCategories =
    hasCategoryArray && agent.skillCategories.length > 0
      ? agent.skillCategories
      : [DEFAULT_CATEGORY];

  const skills = hasSkillArray
    ? agent.skills
    : Object.entries(legacySkills).map(([id, enabled]) => ({
        id,
        name: toTitleCase(id),
        description: "",
        categoryId: skillCategories[0]?.id ?? DEFAULT_CATEGORY.id,
        enabled: Boolean(enabled),
      }));

  const categoryIds = new Set(skillCategories.map((category) => category.id));
  const normalizedSkills = skills.map((skill) =>
    categoryIds.has(skill.categoryId)
      ? skill
      : { ...skill, categoryId: skillCategories[0]?.id ?? DEFAULT_CATEGORY.id },
  );

  return {
    agent: {
      ...agent,
      skillCategories,
      skills: normalizedSkills,
      contextRefs: agent.contextRefs ?? [],
    },
    didChange: true,
  };
};

export class JsonFileStore implements AgentStore {
  private path: string;
  private cache: StoreShape | null = null;

  constructor(filePath: string) {
    this.path = filePath;
  }

  private async read(): Promise<StoreShape> {
    if (this.cache) return this.cache;
    const { readFile, writeFile, mkdir } = await import("node:fs/promises");
    const { dirname } = await import("node:path");
    try {
      const raw = await readFile(this.path, "utf-8");
      const parsed = JSON.parse(raw) as StoreShape;
      let didChange = false;
      const migratedAgents = parsed.agents.map((agent) => {
        const result = migrateAgent(agent);
        if (result.didChange) {
          didChange = true;
        }
        return result.agent;
      });
      const nextStore = {
        ...parsed,
        agents: migratedAgents,
      };
      if (didChange) {
        await writeFile(this.path, JSON.stringify(nextStore, null, 2), "utf-8");
      }
      this.cache = nextStore;
      return this.cache!;
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        await mkdir(dirname(this.path), { recursive: true });
        await writeFile(
          this.path,
          JSON.stringify(defaultStore, null, 2),
          "utf-8",
        );
        this.cache = { ...defaultStore };
        return this.cache;
      }
      throw err;
    }
  }

  private async write(data: StoreShape): Promise<void> {
    const { writeFile, mkdir } = await import("node:fs/promises");
    const { dirname } = await import("node:path");
    await mkdir(dirname(this.path), { recursive: true });
    await writeFile(this.path, JSON.stringify(data, null, 2), "utf-8");
    this.cache = data;
  }

  async getAll(): Promise<Agent[]> {
    const store = await this.read();
    return store.agents;
  }

  async getById(id: string): Promise<Agent | null> {
    const store = await this.read();
    return store.agents.find((a) => a.id === id) ?? null;
  }

  async getCurrent(): Promise<Agent | null> {
    const store = await this.read();
    if (!store.currentAgentId) return null;
    return this.getById(store.currentAgentId);
  }

  async getCurrentId(): Promise<string | null> {
    const store = await this.read();
    return store.currentAgentId;
  }

  async setCurrentId(id: string | null): Promise<void> {
    const store = await this.read();
    store.currentAgentId = id;
    await this.write(store);
  }

  async create(input: CreateAgentInput): Promise<Agent> {
    const { randomUUID } = await import("node:crypto");
    const store = await this.read();
    const ensureUniqueId = (baseId: string) => {
      if (!store.agents.some((agent) => agent.id === baseId)) {
        return baseId;
      }
      let counter = 2;
      let candidate = `${baseId}-${counter}`;
      while (store.agents.some((agent) => agent.id === candidate)) {
        counter += 1;
        candidate = `${baseId}-${counter}`;
      }
      return candidate;
    };

    const requestedId = input.id?.trim();
    const appearanceSeed =
      input.appearanceSeed?.trim() || requestedId || input.name;
    const skillCategories =
      input.skillCategories && input.skillCategories.length > 0
        ? input.skillCategories
        : [{ ...DEFAULT_CATEGORY }];
    const skills = input.skills ?? [];

    const agent: Agent = {
      ...input,
      id: requestedId ? ensureUniqueId(requestedId) : randomUUID(),
      skillCategories,
      skills,
      contextRefs: input.contextRefs ?? [],
      appearanceSeed,
    };
    store.agents.push(agent);
    await this.write(store);
    return agent;
  }

  async update(
    id: string,
    data: Partial<Omit<Agent, "id">>,
  ): Promise<Agent | null> {
    const store = await this.read();
    const idx = store.agents.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    store.agents[idx] = { ...store.agents[idx], ...data };
    await this.write(store);
    return store.agents[idx];
  }

  async delete(id: string): Promise<boolean> {
    const store = await this.read();
    const before = store.agents.length;
    store.agents = store.agents.filter((a) => a.id !== id);
    if (store.currentAgentId === id) store.currentAgentId = null;
    if (store.agents.length === before) return false;
    await this.write(store);
    return true;
  }
}
