import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Agent,
  CreateAgentInput,
  UpdateAgentInput,
} from "@agent-zoo/types";
import { client } from "./client";

const agentsQueryKey = ["agents"];
const agentQueryKey = (id: string) => ["agents", id];
const currentAgentQueryKey = ["currentAgent"];

type UpdateAgentVariables = {
  id: string;
  updates: UpdateAgentInput;
};

type DeleteAgentVariables = {
  id: string;
};

type SetCurrentAgentVariables = {
  id: string | null;
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

export function useCurrentAgent() {
  return useQuery({
    queryKey: currentAgentQueryKey,
    queryFn: () => client.getCurrent(),
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

export function useSetCurrentAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: SetCurrentAgentVariables) => client.setCurrent(id),
    onSuccess: (current) => {
      queryClient.setQueryData(currentAgentQueryKey, current);
    },
  });
}
