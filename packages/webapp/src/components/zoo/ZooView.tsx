import { motion } from "framer-motion";
import { fadeInUp } from "../../theme/motion";
import { ZooStage } from "./ZooStage";
import { mockAgents } from "../../data/mockAgents";

export function ZooView() {
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
        <ZooStage agents={mockAgents} />
      </div>
    </motion.div>
  );
}
