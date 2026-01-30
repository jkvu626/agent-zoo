import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { fadeInUp } from "../../theme/motion";
import { Button } from "../ui/Button";
import { SkillsTree } from "./SkillsTree";
import { mockAgents } from "../../data/mockAgents";

export function SkillsTreeView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const agent = mockAgents.find((item) => item.id === id);

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
        <SkillsTree />
      </div>
    </motion.div>
  );
}
