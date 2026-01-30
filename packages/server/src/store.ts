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
      this.cache = JSON.parse(raw) as StoreShape;
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

    const agent: Agent = {
      ...input,
      id: requestedId ? ensureUniqueId(requestedId) : randomUUID(),
      skills: input.skills ?? {},
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
