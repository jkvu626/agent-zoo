import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { fadeInUp } from "../../theme/motion";
import { mockAgents } from "../../data/mockAgents";

const buttonHoverBounce = {
  whileHover: { scale: 1.12 },
  transition: { type: "spring" as const, stiffness: 400, damping: 15 },
};
import { AgentSprite } from "../agent/AgentSprite";
import { IconButton } from "../ui/IconButton";
import { useLayoutState } from "../layout/AppShell";

export function AgentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSoulOpen, setSoulOpen } = useLayoutState();

  const agent = mockAgents.find((item) => item.id === id);

  if (!agent) {
    return (
      <div className="rounded-panel border border-border bg-bg-panel p-panel">
        <p className="text-text-primary">Agent not found.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="relative flex h-full flex-col items-center justify-start gap-6 pt-6"
    >
      <div className="text-center pb-6">
        <h2 className="font-display text-xl text-text-primary">{agent.name}</h2>
        <p className="mt-1.5 text-sm text-text-muted">{agent.personality}</p>
      </div>
      <div className="relative flex h-80 w-80 items-center justify-center">
        <motion.div
          animate={{
            y: [0, -12, 0],
          }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <AgentSprite agent={agent} size="large" />
        </motion.div>
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
          <IconButton
            aria-label="Brain"
            tooltip="Brain"
            icon={<span className="text-sm font-semibold text-white">B</span>}
            className="bg-[#FF6B6C] text-white hover:bg-[#E85E5F]"
            {...buttonHoverBounce}
          />
        </div>
        <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2">
          <IconButton
            aria-label="Soul"
            tooltip="Soul"
            aria-pressed={isSoulOpen}
            icon={<span className="text-sm font-semibold text-white">S</span>}
            className={
              isSoulOpen
                ? "bg-[#5B5F97] text-white hover:bg-[#4C507F] ring-2 ring-accent-orange ring-offset-2 ring-offset-bg-app"
                : "bg-[#5B5F97] text-white hover:bg-[#4C507F]"
            }
            onClick={() => setSoulOpen(!isSoulOpen)}
            {...buttonHoverBounce}
          />
        </div>
        <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2">
          <IconButton
            aria-label="Skills"
            tooltip="Skills"
            icon={<span className="text-sm font-semibold text-white">K</span>}
            className="bg-[#61988E] text-white hover:bg-[#528279]"
            onClick={() => navigate(`/agent/${agent.id}/skills`)}
            {...buttonHoverBounce}
          />
        </div>
      </div>
    </motion.div>
  );
}
