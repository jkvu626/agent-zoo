import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fadeInUp } from "../../theme/motion";
import { Button } from "../ui/Button";
import { SkillsTree } from "./SkillsTree";
import { EmptyState } from "../ui/EmptyState";
import { ErrorMessage } from "../ui/ErrorMessage";
import { LoadingState } from "../ui/LoadingState";
import { Panel } from "../ui/Panel";
import { useAgent } from "../../api/hooks";
import { IconButton } from "../ui/IconButton";
import { PlusIcon } from "../icons/PlusIcon";

export function SkillsTreeView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: agent, isPending, isError, refetch } = useAgent(id);
  const [categorySearch, setCategorySearch] = useState("");
  const [createCategorySignal, setCreateCategorySignal] = useState(0);

  const canEdit = Boolean(agent);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col gap-4"
    >
      <div className="flex flex-col gap-3">
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
        <div className="w-full">
          <label
            className="mb-1 block text-xs font-medium text-text-muted"
            htmlFor="skills-category-search"
          >
            Search categories
          </label>
          <div className="flex items-center gap-2">
            <input
              id="skills-category-search"
              type="search"
              placeholder="Filter categories by name..."
              value={categorySearch}
              onChange={(event) => setCategorySearch(event.target.value)}
              className="min-w-0 flex-1 rounded-md border border-border bg-bg-panel px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
              disabled={!canEdit}
            />
            <IconButton
              icon={<PlusIcon className="h-5 w-5" />}
              aria-label="Add category"
              tooltip="Add category"
              variant="primary"
              className="h-9 w-9 shrink-0"
              disabled={!canEdit}
              onClick={() => setCreateCategorySignal((prev) => prev + 1)}
            />
          </div>
        </div>
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
          <SkillsTree
            agent={agent}
            agentId={agent.id}
            searchQuery={categorySearch}
            createCategorySignal={createCategorySignal}
          />
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
