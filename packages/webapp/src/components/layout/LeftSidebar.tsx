import { AgentList } from "../agent/AgentList";
import { AgentListSkeleton } from "../agent/AgentListSkeleton";
import { EmptyState } from "../ui/EmptyState";
import { ErrorMessage } from "../ui/ErrorMessage";
import { useAgents } from "../../api/hooks";

export function LeftSidebar() {
  const { data: agents, isPending, isError, refetch } = useAgents();

  return (
    <div className="h-full w-64 rounded-panel border border-border bg-bg-sidebar p-0 shadow-sm">
      <div className="border-b border-border px-panel py-3">
        <h2 className="font-display text-lg text-text-primary">Agents</h2>
      </div>
      <div className="px-panel py-3">
        {isPending ? (
          <AgentListSkeleton />
        ) : isError ? (
          <ErrorMessage
            message="Unable to load agents."
            onRetry={() => refetch()}
          />
        ) : agents && agents.length > 0 ? (
          <AgentList agents={agents} />
        ) : (
          <EmptyState
            title="No agents yet"
            description="Agents appear when they connect via MCP."
          />
        )}
      </div>
    </div>
  );
}
