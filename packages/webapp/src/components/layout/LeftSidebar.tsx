import { AgentList } from "../agent/AgentList";
import { mockAgents } from "../../data/mockAgents";

export function LeftSidebar() {
  return (
    <div className="h-full w-64 rounded-panel border border-border bg-bg-sidebar p-0 shadow-sm">
      <div className="border-b border-border px-panel py-3">
        <h2 className="font-display text-lg text-text-primary">Agents</h2>
      </div>
      <div className="px-panel py-3">
        {mockAgents.length === 0 ? (
          <p className="text-sm text-text-muted">
            Agents appear when they connect via MCP.
          </p>
        ) : (
          <AgentList agents={mockAgents} />
        )}
      </div>
    </div>
  );
}
