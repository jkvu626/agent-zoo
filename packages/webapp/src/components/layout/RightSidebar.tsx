import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { springSmooth } from "../../theme/motion";
import { Panel } from "../ui/Panel";
import { SoulEditor } from "../agent-view/SoulEditor";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { ErrorMessage } from "../ui/ErrorMessage";
import { LoadingState } from "../ui/LoadingState";
import { useAgent, useUpdateAgent } from "../../api/hooks";

type RightSidebarProps = {
  isOpen: boolean;
  agentId: string | null;
};

export function RightSidebar({ isOpen, agentId }: RightSidebarProps) {
  const {
    data: agent,
    isPending,
    isError,
    refetch,
  } = useAgent(agentId ?? undefined);
  const updateAgent = useUpdateAgent();
  const [draftPrompt, setDraftPrompt] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setDraftPrompt(agent?.personality ?? "");
    setHasSubmitted(false);
  }, [agent?.id, agent?.personality, isOpen]);

  if (!isOpen) {
    return null;
  }

  const currentPrompt = agent?.personality ?? "";
  const isDirty = Boolean(agent) && draftPrompt !== currentPrompt;
  const canSubmit = Boolean(agent) && isDirty && !updateAgent.isPending;
  const handleSubmit = () => {
    if (!agentId) {
      return;
    }
    updateAgent.mutate(
      { id: agentId, updates: { personality: draftPrompt } },
      {
        onSuccess: () => setHasSubmitted(true),
        onError: () => setHasSubmitted(false),
      },
    );
  };
  const statusMessage = updateAgent.isPending
    ? "Saving..."
    : updateAgent.isError
      ? "Save failed. Try again."
      : hasSubmitted && !isDirty
        ? "Prompt saved."
        : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={springSmooth}
    >
      <Panel className="flex h-full w-80 flex-col p-0">
        <div className="border-b border-border px-panel py-3">
          <h2 className="font-display text-lg text-text-primary">Soul</h2>
          <p className="text-xs text-text-muted">
            Shape the agent personality prompt.
          </p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-panel py-4">
          {!agentId ? (
            <EmptyState
              title="Select an agent"
              description="Choose an agent to edit their system prompt."
            />
          ) : isPending ? (
            <LoadingState label="Loading soul" />
          ) : isError ? (
            <ErrorMessage
              message="Unable to load this agent."
              onRetry={() => refetch()}
            />
          ) : !agent ? (
            <EmptyState
              title="Agent not found"
              description="Pick another agent from the sidebar."
            />
          ) : (
            <SoulEditor
              value={draftPrompt}
              onChange={(value) => {
                setDraftPrompt(value);
                setHasSubmitted(false);
              }}
              disabled={updateAgent.isPending}
            />
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border px-panel py-3">
          <p className="text-xs text-text-muted" aria-live="polite">
            {statusMessage}
          </p>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {updateAgent.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </Panel>
    </motion.div>
  );
}
