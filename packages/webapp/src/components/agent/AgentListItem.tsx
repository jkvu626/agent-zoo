import type { MouseEvent } from "react";
import type { Agent } from "@agent-zoo/types";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { IconButton } from "../ui/IconButton";
import { TrashIcon } from "../icons/TrashIcon";
import { useDeleteAgent } from "../../api/hooks";

type AgentListItemProps = {
  agent: Agent;
};

export function AgentListItem({ agent }: AgentListItemProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const deleteAgent = useDeleteAgent();

  const isViewingAgent =
    location.pathname === `/agent/${agent.id}` ||
    location.pathname.startsWith(`/agent/${agent.id}/`);

  const handleRemove = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    deleteAgent.mutate(
      { id: agent.id },
      {
        onSuccess: () => {
          if (isViewingAgent) navigate("/");
        },
      },
    );
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-bg-app",
        isViewingAgent
          ? "border-accent-orange bg-bg-app text-text-primary"
          : "text-text-muted",
      )}
    >
      <NavLink to={`/agent/${agent.id}`} className="min-w-0 flex-1 truncate">
        {agent.name}
      </NavLink>
      <IconButton
        icon={<TrashIcon className="h-4 w-4" />}
        aria-label={`Remove ${agent.name}`}
        tooltip={`Remove ${agent.name}`}
        variant="ghost"
        onClick={handleRemove}
        disabled={deleteAgent.isPending}
        className="h-8 w-8 shrink-0 opacity-60 hover:opacity-100 hover:text-red-500"
      />
    </div>
  );
}
