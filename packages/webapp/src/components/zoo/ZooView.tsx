import { motion } from "framer-motion";
import { fadeInUp } from "../../theme/motion";
import { ZooStage } from "./ZooStage";
import { Panel } from "../ui/Panel";
import { EmptyState } from "../ui/EmptyState";
import { ErrorMessage } from "../ui/ErrorMessage";
import { LoadingState } from "../ui/LoadingState";
import { useAgents } from "../../api/hooks";

export function ZooView() {
  const { data: agents, isPending, isError, refetch } = useAgents();

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex h-full min-h-0 flex-col"
    >
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-text-primary">
            Welcome to AgentZoo!
          </h2>
          <p className="text-sm text-text-muted">
            Meet the agents strolling through the enclosure.
          </p>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        {isPending ? (
          <Panel className="h-full">
            <LoadingState label="Loading agents" />
          </Panel>
        ) : isError ? (
          <Panel className="h-full">
            <ErrorMessage
              message="Unable to load agents."
              onRetry={() => refetch()}
            />
          </Panel>
        ) : agents && agents.length > 0 ? (
          <ZooStage agents={agents} />
        ) : (
          <Panel className="h-full">
            <EmptyState
              title="No agents yet"
              description="Agents appear when they connect via MCP."
            />
          </Panel>
        )}
      </div>
    </motion.div>
  );
}
