import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { springSmooth } from "../../theme/motion";
import { Panel } from "../ui/Panel";
import { SoulEditor } from "../agent-view/SoulEditor";
import { Button } from "../ui/Button";

type RightSidebarProps = {
  isOpen: boolean;
  prompt: string;
  onPromptSubmit: (value: string) => void;
};

export function RightSidebar({
  isOpen,
  prompt,
  onPromptSubmit,
}: RightSidebarProps) {
  const [draftPrompt, setDraftPrompt] = useState(prompt);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setDraftPrompt(prompt);
    setHasSubmitted(false);
  }, [prompt, isOpen]);

  if (!isOpen) {
    return null;
  }

  const isDirty = draftPrompt !== prompt;
  const handleSubmit = () => {
    onPromptSubmit(draftPrompt);
    setHasSubmitted(true);
  };

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
          <SoulEditor
            value={draftPrompt}
            onChange={(value) => {
              setDraftPrompt(value);
              setHasSubmitted(false);
            }}
          />
        </div>
        <div className="flex items-center justify-between border-t border-border px-panel py-3">
          <p className="text-xs text-text-muted" aria-live="polite">
            {hasSubmitted && !isDirty ? "Prompt saved." : ""}
          </p>
          <Button onClick={handleSubmit} disabled={!isDirty}>
            Submit
          </Button>
        </div>
      </Panel>
    </motion.div>
  );
}
