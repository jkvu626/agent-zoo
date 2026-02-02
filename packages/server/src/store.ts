import type {
  Agent,
  BrainEntry,
  BrainEntryType,
  CreateAgentInput,
  StoreShape,
} from "@agent-zoo/types";

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
  getBrainEntries(agentId: string): Promise<BrainEntry[]>;
  createBrainEntry(
    agentId: string,
    entry: Omit<BrainEntry, "id" | "agentId" | "timestamp">,
  ): Promise<BrainEntry>;
  updateBrainEntry(
    agentId: string,
    entryId: string,
    data: Partial<BrainEntry>,
  ): Promise<BrainEntry | null>;
  deleteBrainEntry(agentId: string, entryId: string): Promise<boolean>;
  queryBrainEntries(
    agentId: string,
    filters?: {
      type?: BrainEntryType;
      tags?: string[];
      dateFrom?: string;
      dateTo?: string;
      pinned?: boolean;
    },
  ): Promise<BrainEntry[]>;
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
  const hasBrainEntries = Array.isArray(agent.brainEntries);

  if (hasSkillArray && hasCategoryArray && hasBrainEntries) {
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
      brainEntries: hasBrainEntries ? agent.brainEntries : [],
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
      brainEntries: input.brainEntries ?? [],
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

  async getBrainEntries(agentId: string): Promise<BrainEntry[]> {
    const store = await this.read();
    const agent = store.agents.find((a) => a.id === agentId);
    return agent?.brainEntries ?? [];
  }

  async createBrainEntry(
    agentId: string,
    entry: Omit<BrainEntry, "id" | "agentId" | "timestamp">,
  ): Promise<BrainEntry> {
    const { randomUUID } = await import("node:crypto");
    const store = await this.read();
    const idx = store.agents.findIndex((a) => a.id === agentId);
    if (idx === -1) {
      throw new Error(`Agent with id '${agentId}' not found.`);
    }

    const trimmedTags =
      entry.tags?.map((tag) => tag.trim()).filter(Boolean) ?? undefined;
    const newEntry: BrainEntry = {
      id: randomUUID(),
      agentId,
      type: entry.type,
      content: entry.content,
      timestamp: new Date().toISOString(),
      pinned: Boolean(entry.pinned),
      tags: trimmedTags && trimmedTags.length > 0 ? trimmedTags : undefined,
      metadata: entry.metadata,
    };

    const agent = store.agents[idx];
    const brainEntries = agent.brainEntries ?? [];
    store.agents[idx] = {
      ...agent,
      brainEntries: [...brainEntries, newEntry],
    };
    await this.write(store);
    return newEntry;
  }

  async updateBrainEntry(
    agentId: string,
    entryId: string,
    data: Partial<BrainEntry>,
  ): Promise<BrainEntry | null> {
    const store = await this.read();
    const idx = store.agents.findIndex((a) => a.id === agentId);
    if (idx === -1) return null;

    const agent = store.agents[idx];
    const brainEntries = agent.brainEntries ?? [];
    const entryIndex = brainEntries.findIndex((entry) => entry.id === entryId);
    if (entryIndex === -1) return null;

    const { id: _id, agentId: _agentId, timestamp: _timestamp, ...rest } = data;
    const updated = {
      ...brainEntries[entryIndex],
      ...rest,
    };
    if (rest.tags) {
      const trimmedTags = rest.tags.map((tag) => tag.trim()).filter(Boolean);
      updated.tags = trimmedTags.length > 0 ? trimmedTags : undefined;
    }

    const nextEntries = [...brainEntries];
    nextEntries[entryIndex] = updated;
    store.agents[idx] = {
      ...agent,
      brainEntries: nextEntries,
    };
    await this.write(store);
    return updated;
  }

  async deleteBrainEntry(agentId: string, entryId: string): Promise<boolean> {
    const store = await this.read();
    const idx = store.agents.findIndex((a) => a.id === agentId);
    if (idx === -1) return false;

    const agent = store.agents[idx];
    const brainEntries = agent.brainEntries ?? [];
    const nextEntries = brainEntries.filter((entry) => entry.id !== entryId);
    if (nextEntries.length === brainEntries.length) return false;

    store.agents[idx] = {
      ...agent,
      brainEntries: nextEntries,
    };
    await this.write(store);
    return true;
  }

  async queryBrainEntries(
    agentId: string,
    filters?: {
      type?: BrainEntryType;
      tags?: string[];
      dateFrom?: string;
      dateTo?: string;
      pinned?: boolean;
    },
  ): Promise<BrainEntry[]> {
    const entries = await this.getBrainEntries(agentId);
    if (!filters) return entries;

    const normalizedTags =
      filters.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [];
    const dateFrom = filters.dateFrom
      ? new Date(filters.dateFrom).getTime()
      : null;
    const dateTo = filters.dateTo ? new Date(filters.dateTo).getTime() : null;

    return entries.filter((entry) => {
      if (filters.type && entry.type !== filters.type) return false;
      if (filters.pinned !== undefined && entry.pinned !== filters.pinned) {
        return false;
      }
      if (normalizedTags.length > 0) {
        const entryTags = entry.tags ?? [];
        const hasTag = normalizedTags.some((tag) => entryTags.includes(tag));
        if (!hasTag) return false;
      }
      if (dateFrom || dateTo) {
        const entryTime = new Date(entry.timestamp).getTime();
        if (dateFrom && entryTime < dateFrom) return false;
        if (dateTo && entryTime > dateTo) return false;
      }
      return true;
    });
  }
}
