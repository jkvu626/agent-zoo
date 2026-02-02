import type {
  Agent,
  BrainEntry,
  BrainEntryType,
  CreateAgentInput,
  UpdateAgentInput,
} from "@agent-zoo/types";

const BASE_URL = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const hasBody = options.body !== undefined;
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export type BrainEntryFilters = {
  type?: BrainEntryType;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  pinned?: boolean;
};

export type BrainEntryCreateInput = Omit<
  BrainEntry,
  "id" | "agentId" | "timestamp"
>;

export const client = {
  getAll(): Promise<Agent[]> {
    return request("/agents");
  },
  getById(id: string): Promise<Agent> {
    return request(`/agents/${id}`);
  },
  create(agent: CreateAgentInput): Promise<Agent> {
    return request("/agents", {
      method: "POST",
      body: JSON.stringify(agent),
    });
  },
  update(id: string, updates: UpdateAgentInput): Promise<Agent> {
    return request(`/agents/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },
  delete(id: string): Promise<void> {
    return request(`/agents/${id}`, { method: "DELETE" });
  },
  getCurrent(): Promise<{ currentAgentId: string | null }> {
    return request("/current");
  },
  setCurrent(id: string | null): Promise<{ currentAgentId: string | null }> {
    return request("/current", {
      method: "PUT",
      body: JSON.stringify({ currentAgentId: id }),
    });
  },
  getBrainEntries(
    agentId: string,
    filters?: BrainEntryFilters,
  ): Promise<BrainEntry[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.set("type", filters.type);
    if (filters?.tags && filters.tags.length > 0) {
      params.set("tags", filters.tags.join(","));
    }
    if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.set("dateTo", filters.dateTo);
    if (filters?.pinned !== undefined) {
      params.set("pinned", String(filters.pinned));
    }
    const query = params.toString();
    return request(`/agents/${agentId}/brain${query ? `?${query}` : ""}`);
  },
  createBrainEntry(
    agentId: string,
    entry: BrainEntryCreateInput,
  ): Promise<BrainEntry> {
    return request(`/agents/${agentId}/brain`, {
      method: "POST",
      body: JSON.stringify(entry),
    });
  },
  updateBrainEntry(
    agentId: string,
    entryId: string,
    updates: Partial<BrainEntry>,
  ): Promise<BrainEntry> {
    return request(`/agents/${agentId}/brain/${entryId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },
  deleteBrainEntry(agentId: string, entryId: string): Promise<void> {
    return request(`/agents/${agentId}/brain/${entryId}`, {
      method: "DELETE",
    });
  },
  togglePinEntry(agentId: string, entryId: string): Promise<BrainEntry> {
    return request(`/agents/${agentId}/brain/${entryId}/pin`, {
      method: "PATCH",
    });
  },
};
