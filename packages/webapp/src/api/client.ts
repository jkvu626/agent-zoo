import type {
  Agent,
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
};
