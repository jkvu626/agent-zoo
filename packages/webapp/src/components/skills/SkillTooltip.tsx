import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import type { Skill } from "../../data/mockSkills";

type SkillTooltipProps = {
  skill: Skill | null;
  anchor: { x: number; y: number } | null;
  containerRef: RefObject<HTMLDivElement>;
  skillMap: Map<string, Skill>;
};

export function SkillTooltip({
  skill,
  anchor,
  containerRef,
  skillMap,
}: SkillTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!skill || !anchor || !containerRef.current || !tooltipRef.current) {
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const anchorX = (anchor.x / 100) * containerRect.width;
    const anchorY = (anchor.y / 100) * containerRect.height;
    const padding = 12;
    const prefersRight = anchorX < containerRect.width * 0.65;

    let left = prefersRight ? anchorX + 16 : anchorX - tooltipRect.width - 16;
    let top = anchorY - tooltipRect.height / 2;

    left = Math.max(
      padding,
      Math.min(left, containerRect.width - tooltipRect.width - padding),
    );
    top = Math.max(
      padding,
      Math.min(top, containerRect.height - tooltipRect.height - padding),
    );

    setStyle({
      left,
      top,
    });
  }, [skill, anchor, containerRef]);

  if (!skill || !anchor) {
    return null;
  }

  const prerequisites =
    skill.requires?.map((id) => skillMap.get(id)?.name ?? id) ?? [];

  return (
    <div
      ref={tooltipRef}
      className="skill-tooltip"
      style={
        {
          ...style,
          "--skill-accent": `var(--skill-${skill.category})`,
        } as CSSProperties
      }
    >
      <div className="skill-tooltip__header">
        <span className="skill-tooltip__name">{skill.name}</span>
        <span className="skill-tooltip__badge">{skill.category}</span>
      </div>
      <p className="skill-tooltip__description">{skill.description}</p>
      <div className="skill-tooltip__requirements">
        <span className="skill-tooltip__label">Prerequisites</span>
        <span className="skill-tooltip__value">
          {prerequisites.length ? prerequisites.join(", ") : "None"}
        </span>
      </div>
    </div>
  );
}
