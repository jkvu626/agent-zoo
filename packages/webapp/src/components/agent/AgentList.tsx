import type { Agent } from "@agent-zoo/types";
import { AgentListItem } from "./AgentListItem";

type AgentListProps = {
  agents: Agent[];
};

export function AgentList({ agents }: AgentListProps) {
  return (
    <div className="flex flex-col gap-2">
      {agents.map((agent) => (
        <AgentListItem key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
