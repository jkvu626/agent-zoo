import { useMemo } from "react";
import type { Skill, SkillCategory } from "../data/mockSkills";

export type SkillNode = Skill & {
  x: number;
  y: number;
};

export type SkillEdge = {
  id: string;
  from: string;
  to: string;
};

export type SkillLayout = {
  nodes: SkillNode[];
  edges: SkillEdge[];
  categoryCenters: Record<SkillCategory, { x: number; y: number }>;
};

const CATEGORY_ANGLES: Record<SkillCategory, number> = {
  leadership: -90,
  analysis: 180,
  creativity: 0,
  execution: 90,
  communication: 135,
};

const CENTER = { x: 50, y: 50 };
const CATEGORY_RADIUS = 26;
const TIER_RADIUS: Record<Skill["tier"], number> = {
  1: 6,
  2: 11,
  3: 16,
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const hashToUnit = (text: string) => {
  let hash = 0;
  for (const char of text) {
    hash = (hash * 31 + char.charCodeAt(0)) % 360;
  }
  return hash / 360;
};

const toRadians = (deg: number) => (deg * Math.PI) / 180;

const layoutCategorySkills = (
  skills: Skill[],
  center: { x: number; y: number },
  angleSeed: number,
) => {
  const tiers: Skill["tier"][] = [1, 2, 3];
  const nodes: SkillNode[] = [];

  tiers.forEach((tier, tierIndex) => {
    const tierSkills = skills
      .filter((skill) => skill.tier === tier)
      .sort((a, b) => a.name.localeCompare(b.name));
    const count = tierSkills.length;
    if (count === 0) {
      return;
    }

    tierSkills.forEach((skill, index) => {
      const jitter = (hashToUnit(skill.id) - 0.5) * 0.9;
      const progress = count === 1 ? 0 : index / count;
      const angle = angleSeed + progress * Math.PI * 2 + tierIndex * 0.4;
      const radius = TIER_RADIUS[tier] + jitter * 1.6;
      const x = clamp(center.x + Math.cos(angle) * radius, 10, 90);
      const y = clamp(center.y + Math.sin(angle) * radius, 10, 90);

      nodes.push({ ...skill, x, y });
    });
  });

  return nodes;
};

export function useSkillLayout(skills: Skill[]): SkillLayout {
  return useMemo(() => {
    const categoryCenters = Object.fromEntries(
      (Object.keys(CATEGORY_ANGLES) as SkillCategory[]).map((category) => {
        const angle = toRadians(CATEGORY_ANGLES[category]);
        const x = CENTER.x + Math.cos(angle) * CATEGORY_RADIUS;
        const y = CENTER.y + Math.sin(angle) * CATEGORY_RADIUS;
        return [category, { x, y }];
      }),
    ) as Record<SkillCategory, { x: number; y: number }>;

    const nodes = (Object.keys(categoryCenters) as SkillCategory[]).flatMap(
      (category) =>
        layoutCategorySkills(
          skills.filter((skill) => skill.category === category),
          categoryCenters[category],
          toRadians(CATEGORY_ANGLES[category]),
        ),
    );

    const edges = skills.flatMap((skill) =>
      (skill.requires ?? []).map((requiredId) => ({
        id: `${requiredId}-${skill.id}`,
        from: requiredId,
        to: skill.id,
      })),
    );

    return {
      nodes,
      edges,
      categoryCenters,
    };
  }, [skills]);
}
