import { useRef, type CSSProperties } from "react";
import { motion } from "framer-motion";
import type { Skill } from "../../data/mockSkills";
import { cn } from "../../utils/cn";

type SkillNodeProps = {
  skill: Skill;
  x: number;
  y: number;
  state: "locked" | "unlocked" | "active";
  isHovered: boolean;
  onToggle: (skillId: string) => void;
  onHover: (skillId: string | null) => void;
};

export function SkillNode({
  skill,
  x,
  y,
  state,
  isHovered,
  onToggle,
  onHover,
}: SkillNodeProps) {
  const longPressTimer = useRef<number | null>(null);
  const isLocked = state === "locked";

  const handleToggle = () => {
    if (isLocked) {
      return;
    }
    onToggle(skill.id);
  };

  const handleTouchStart = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
    }
    longPressTimer.current = window.setTimeout(() => {
      onHover(skill.id);
    }, 350);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    onHover(null);
  };

  return (
    <motion.button
      type="button"
      className={cn(
        "skill-node shadow-sm",
        `skill-node--${state}`,
        isHovered && "skill-node--hover",
      )}
      data-tier={skill.tier}
      style={
        {
          left: `${x}%`,
          top: `${y}%`,
          transform: "translate(-50%, -50%)",
          "--skill-accent": `var(--skill-${skill.category})`,
        } as CSSProperties
      }
      onClick={handleToggle}
      onMouseEnter={() => onHover(skill.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(skill.id)}
      onBlur={() => onHover(null)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      whileHover={!isLocked ? { scale: 1.05 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      aria-pressed={state === "active"}
      aria-disabled={isLocked}
    >
      <span className="skill-node__ring" aria-hidden="true" />
      <span className="skill-node__label">{skill.name}</span>
    </motion.button>
  );
}
