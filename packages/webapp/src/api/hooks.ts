import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Agent,
  BrainEntry,
  CreateAgentInput,
  UpdateAgentInput,
} from "@agent-zoo/types";
import {
  client,
  type BrainEntryCreateInput,
  type BrainEntryFilters,
} from "./client";

const agentsQueryKey = ["agents"];
const agentQueryKey = (id: string) => ["agents", id];
const brainEntriesQueryKey = (id: string, filters?: BrainEntryFilters) => [
  "agents",
  id,
  "brain",
  filters ? JSON.stringify(filters) : "all",
];

type UpdateAgentVariables = {
  id: string;
  updates: UpdateAgentInput;
};

type DeleteAgentVariables = {
  id: string;
};

type CreateBrainEntryVariables = {
  agentId: string;
  entry: BrainEntryCreateInput;
};

type UpdateBrainEntryVariables = {
  agentId: string;
  entryId: string;
  updates: Partial<BrainEntry>;
};

type DeleteBrainEntryVariables = {
  agentId: string;
  entryId: string;
};

type TogglePinEntryVariables = {
  agentId: string;
  entryId: string;
};

export function useAgents() {
  return useQuery({
    queryKey: agentsQueryKey,
    queryFn: () => client.getAll(),
  });
}

export function useAgent(id?: string) {
  return useQuery({
    queryKey: id ? agentQueryKey(id) : ["agents", "missing-id"],
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error("Missing agent id."));
      }
      return client.getById(id);
    },
    enabled: Boolean(id),
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agent: CreateAgentInput) => client.create(agent),
    onSuccess: (created) => {
      queryClient.setQueryData<Agent[]>(agentsQueryKey, (prev) =>
        prev ? [created, ...prev] : [created],
      );
      queryClient.setQueryData(agentQueryKey(created.id), created);
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: UpdateAgentVariables) =>
      client.update(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(agentQueryKey(updated.id), updated);
      queryClient.setQueryData<Agent[]>(agentsQueryKey, (prev) =>
        prev
          ? prev.map((agent) => (agent.id === updated.id ? updated : agent))
          : prev,
      );
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: DeleteAgentVariables) => client.delete(id),
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<Agent[]>(agentsQueryKey, (prev) =>
        prev ? prev.filter((agent) => agent.id !== variables.id) : prev,
      );
      queryClient.removeQueries({ queryKey: agentQueryKey(variables.id) });
    },
  });
}

export function useBrainEntries(agentId?: string, filters?: BrainEntryFilters) {
  return useQuery({
    queryKey: agentId
      ? brainEntriesQueryKey(agentId, filters)
      : ["agents", "missing-brain-agent"],
    queryFn: () => {
      if (!agentId) {
        return Promise.reject(new Error("Missing agent id."));
      }
      return client.getBrainEntries(agentId, filters);
    },
    enabled: Boolean(agentId),
  });
}

export function useCreateBrainEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, entry }: CreateBrainEntryVariables) =>
      client.createBrainEntry(agentId, entry),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["agents", variables.agentId, "brain"],
      });
    },
  });
}

export function useUpdateBrainEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, entryId, updates }: UpdateBrainEntryVariables) =>
      client.updateBrainEntry(agentId, entryId, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["agents", variables.agentId, "brain"],
      });
    },
  });
}

export function useDeleteBrainEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, entryId }: DeleteBrainEntryVariables) =>
      client.deleteBrainEntry(agentId, entryId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["agents", variables.agentId, "brain"],
      });
    },
  });
}

export function useTogglePinEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, entryId }: TogglePinEntryVariables) =>
      client.togglePinEntry(agentId, entryId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["agents", variables.agentId, "brain"],
      });
    },
  });
}
