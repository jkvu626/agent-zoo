import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AgentList } from "../agent/AgentList";
import { AgentListSkeleton } from "../agent/AgentListSkeleton";
import { AgentCreator } from "../agent/AgentCreator";
import { EmptyState } from "../ui/EmptyState";
import { ErrorMessage } from "../ui/ErrorMessage";
import { IconButton } from "../ui/IconButton";
import { PlusIcon } from "../icons/PlusIcon";
import { useAgents } from "../../api/hooks";
import { springSmooth } from "../../theme/motion";

export function LeftSidebar() {
  const [view, setView] = useState<"list" | "creator">("list");
  const { data: agents, isPending, isError, refetch } = useAgents();

  return (
    <div className="h-full w-64 rounded-panel border border-border bg-bg-sidebar p-0 shadow-sm">
      {view === "list" && (
        <div className="flex items-center justify-between border-b border-border px-panel py-3">
          <h2 className="font-display text-lg text-text-primary">Agents</h2>
          <IconButton
            icon={<PlusIcon className="h-5 w-5" />}
            aria-label="Create new agent"
            onClick={() => setView("creator")}
          />
        </div>
      )}
      <div className="px-panel py-3">
        <AnimatePresence mode="wait">
          {view === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={springSmooth}
              className="flex flex-col"
            >
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
                  description="Click + to create your first agent."
                />
              )}
            </motion.div>
          ) : (
            <AgentCreator onCancel={() => setView("list")} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
