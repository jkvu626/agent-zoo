import type { Agent } from "@agent-zoo/types";
import { motion, useAnimationControls } from "framer-motion";
import { AgentSprite } from "../agent/AgentSprite";
import { AgentNametag } from "../agent/AgentNametag";
import { Tooltip } from "../ui/Tooltip";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

type ZooAgentProps = {
  agent: Agent;
  index: number;
};

const idleTimeMs = { min: 2000, max: 6000 };
const travelDistance = { min: 10, max: 28 };
const hashString = (value: string) =>
  value.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

export function ZooAgent({ agent, index }: ZooAgentProps) {
  const navigate = useNavigate();
  const controls = useAnimationControls();
  const [isWalking, setIsWalking] = useState(false);

  const seed = useMemo(
    () => hashString(agent.id) + index * 1000,
    [agent.id, index],
  );
  const rngRef = useRef(seed);
  const currentPosRef = useRef({
    x: 15 + (index % 5) * 12,
    y: 20 + (index % 3) * 15,
  });

  const bounds = useMemo(
    () => ({
      minX: 6 + (index % 3) * 5,
      maxX: 82 - (index % 2) * 8,
      minY: 14,
      maxY: 72,
    }),
    [index],
  );

  const nextRandom = () => {
    rngRef.current += 1;
    const x = Math.sin(rngRef.current) * 10000;
    return x - Math.floor(x);
  };

  const randomInRange = (min: number, max: number) =>
    min + nextRandom() * (max - min);
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const pickDestination = () => {
    const angle = nextRandom() * Math.PI * 2;
    const distance = randomInRange(travelDistance.min, travelDistance.max);
    const current = currentPosRef.current;
    return {
      x: clamp(
        current.x + Math.cos(angle) * distance,
        bounds.minX,
        bounds.maxX,
      ),
      y: clamp(
        current.y + Math.sin(angle) * distance,
        bounds.minY,
        bounds.maxY,
      ),
    };
  };

  useEffect(() => {
    let active = true;
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const walkLoop = async () => {
      const start = currentPosRef.current;
      await controls.set({ left: `${start.x}%`, top: `${start.y}%` });

      while (active) {
        setIsWalking(false);
        await sleep(randomInRange(idleTimeMs.min, idleTimeMs.max));
        if (!active) return;

        const target = pickDestination();
        const dx = target.x - currentPosRef.current.x;
        const dy = target.y - currentPosRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = 3.4 + (index % 2) * 0.6;
        const duration = Math.max(2, distance / speed);

        setIsWalking(true);
        await controls.start({
          left: `${target.x}%`,
          top: `${target.y}%`,
          transition: { duration, ease: "easeInOut" },
        });
        currentPosRef.current = target;
      }
    };

    walkLoop();
    return () => {
      active = false;
      controls.stop();
    };
  }, [controls, bounds, index]);

  return (
    <Tooltip content={agent.personality}>
      <motion.button
        type="button"
        onClick={() => navigate(`/agent/${agent.id}`)}
        className="absolute flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-offset-2 focus-visible:ring-offset-bg-app"
        animate={controls}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
      >
        <div className="absolute -bottom-1 left-1/2 h-3 w-10 -translate-x-1/2 rounded-full bg-black/15 blur-sm" />
        <motion.div
          animate={isWalking ? { y: [0, -2, 0] } : { y: 0 }}
          transition={
            isWalking
              ? { duration: 0.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3, ease: "easeOut" }
          }
        >
          <AgentSprite agent={agent} size="small" />
        </motion.div>
        <AgentNametag name={agent.name} />
      </motion.button>
    </Tooltip>
  );
}
