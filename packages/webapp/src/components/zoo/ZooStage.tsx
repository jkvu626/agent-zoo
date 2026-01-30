import type { Agent } from "@agent-zoo/types";
import { Panel } from "../ui/Panel";
import { ZooAgent } from "./ZooAgent";
import { ZooBackground } from "./ZooBackground";
import { ZooDecorations } from "./ZooDecorations";
import { ZooParticles } from "./ZooParticles";
import { ZooOverlay } from "./ZooOverlay";

type ZooStageProps = {
  agents: Agent[];
};

export function ZooStage({ agents }: ZooStageProps) {
  return (
    <Panel className="relative h-full min-h-0 overflow-hidden">
      <ZooBackground />
      <ZooDecorations />
      <ZooParticles />
      <div className="absolute inset-0">
        {agents.map((agent, index) => (
          <ZooAgent key={agent.id} agent={agent} index={index} />
        ))}
      </div>
      <ZooOverlay />
    </Panel>
  );
}
