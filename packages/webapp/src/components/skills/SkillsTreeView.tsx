import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { fadeInUp } from "../../theme/motion";
import { Button } from "../ui/Button";
import { SkillsTree } from "./SkillsTree";
import { EmptyState } from "../ui/EmptyState";
import { ErrorMessage } from "../ui/ErrorMessage";
import { LoadingState } from "../ui/LoadingState";
import { Panel } from "../ui/Panel";
import { useAgent } from "../../api/hooks";

export function SkillsTreeView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: agent, isPending, isError, refetch } = useAgent(id);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-text-primary">
            Skills Tree
          </h2>
          <p className="text-sm text-text-muted">
            {agent ? `Exploring ${agent.name}` : "Explore the skill graph"}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate(agent ? `/agent/${agent.id}` : "/")}
        >
          Back to Agent
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        {isPending ? (
          <Panel className="h-full">
            <LoadingState label="Loading skills" />
          </Panel>
        ) : isError ? (
          <Panel className="h-full">
            <ErrorMessage
              message="Unable to load skills."
              onRetry={() => refetch()}
            />
          </Panel>
        ) : agent ? (
          <SkillsTree agent={agent} agentId={agent.id} />
        ) : (
          <Panel className="h-full">
            <EmptyState
              title="Agent not found"
              description="Pick another agent to view skills."
            />
          </Panel>
        )}
      </div>
    </motion.div>
  );
}
