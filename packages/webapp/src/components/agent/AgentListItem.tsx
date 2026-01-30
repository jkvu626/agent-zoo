import type { Agent } from "@agent-zoo/types";
import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";

type AgentListItemProps = {
  agent: Agent;
};

export function AgentListItem({ agent }: AgentListItemProps) {
  return (
    <NavLink
      to={`/agent/${agent.id}`}
      className={({ isActive }) =>
        cn(
          "rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-bg-app",
          isActive
            ? "border-accent-orange bg-bg-app text-text-primary"
            : "text-text-muted",
        )
      }
    >
      {agent.name}
    </NavLink>
  );
}
