import { useState } from "react";
import { motion } from "framer-motion";
import type { Agent } from "@agent-zoo/types";
import { AgentSprite } from "./AgentSprite";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { ChevronLeftIcon } from "../icons/ChevronLeftIcon";
import { useCreateAgent } from "../../api/hooks";
import { springSmooth } from "../../theme/motion";

type AgentCreatorProps = {
  onCancel: () => void;
};

const DEFAULT_CATEGORY = {
  id: "general",
  name: "General",
  color: "#61988E",
};

function createAgentId(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

function getPreviewAgent(name: string): Agent {
  const id = createAgentId(name) || "preview";
  return {
    id,
    name: name.trim() || "New Agent",
    description: "",
    systemPrompt: "",
    skillCategories: [{ ...DEFAULT_CATEGORY }],
    skills: [],
    contextRefs: [],
    appearanceSeed: id,
  };
}

export function AgentCreator({ onCancel }: AgentCreatorProps) {
  const [name, setName] = useState("");
  const createAgent = useCreateAgent();

  const previewAgent = getPreviewAgent(name);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const id = createAgentId(trimmed);
      await createAgent.mutateAsync({
        id,
        name: trimmed,
        description: "",
        systemPrompt: "",
        skillCategories: [{ ...DEFAULT_CATEGORY }],
        skills: [],
        contextRefs: [],
        appearanceSeed: id,
      });
      onCancel();
    } catch {
      // Error handled by mutation state if needed
    }
  };

  return (
    <motion.div
      key="creator"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={springSmooth}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <IconButton
          icon={<ChevronLeftIcon className="h-5 w-5" />}
          aria-label="Back to agents"
          onClick={onCancel}
          variant="ghost"
        />
        <h2 className="font-display text-lg text-text-primary">New Agent</h2>
      </div>

      <div className="flex flex-col items-center gap-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSmooth, delay: 0.05 }}
          className="flex justify-center"
        >
          <AgentSprite agent={previewAgent} size="large" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSmooth, delay: 0.1 }}
          className="w-full"
        >
          <label
            className="mb-1 block text-xs font-medium text-text-muted"
            htmlFor="agent-name"
          >
            Name *
          </label>
          <input
            id="agent-name"
            type="text"
            placeholder="Give your agent a name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-panel px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
            autoFocus
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springSmooth, delay: 0.15 }}
        className="mt-auto flex gap-2"
      >
        <Button variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleCreate}
          disabled={!name.trim() || createAgent.isPending}
          className="flex-1"
        >
          {createAgent.isPending ? "Creating…" : "Create"}
        </Button>
      </motion.div>
    </motion.div>
  );
}
