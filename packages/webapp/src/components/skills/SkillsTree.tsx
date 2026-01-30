import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Agent } from "@agent-zoo/types";
import {
  categoryLabels,
  skillCatalog,
  type Skill,
  type SkillCategory,
} from "../../data/mockSkills";
import { cn } from "../../utils/cn";
import { useUpdateAgent } from "../../api/hooks";
import "./skills.css";

const skillMap = new Map<string, Skill>(
  skillCatalog.map((skill) => [skill.id, skill]),
);
const nameToId = new Map<string, string>(
  skillCatalog.map((skill) => [skill.name.toLowerCase(), skill.id]),
);
const categoryOrder = Array.from(
  new Set(skillCatalog.map((skill) => skill.category)),
) as SkillCategory[];

type CategoryState = "none" | "mixed" | "active";

type SkillsTreeProps = {
  agent: Agent;
  agentId: string;
};

export function SkillsTree({ agent, agentId }: SkillsTreeProps) {
  const updateAgent = useUpdateAgent();
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const skillsByCategory = useMemo(() => {
    const groups = new Map<SkillCategory, Skill[]>();
    skillCatalog.forEach((skill) => {
      const group = groups.get(skill.category) ?? [];
      group.push(skill);
      groups.set(skill.category, group);
    });
    groups.forEach((group) => {
      group.sort((a, b) => {
        if (a.tier !== b.tier) {
          return a.tier - b.tier;
        }
        return a.name.localeCompare(b.name);
      });
    });
    return groups;
  }, []);

  const initialEnabled = useMemo(() => {
    const ids = Object.entries(agent.skills)
      .filter(([, enabled]) => enabled)
      .map(([key]) => nameToId.get(key.toLowerCase()) ?? key)
      .filter((key): key is string => Boolean(key))
      .filter((key) => skillMap.has(key));
    return new Set(ids);
  }, [agent]);

  const [enabledSkills, setEnabledSkills] =
    useState<Set<string>>(initialEnabled);

  useEffect(() => {
    setEnabledSkills(new Set(initialEnabled));
  }, [initialEnabled]);

  const toSkillsPayload = (enabled: Set<string>) => {
    const nextSkills: Record<string, boolean> = { ...agent.skills };
    skillCatalog.forEach((skill) => {
      nextSkills[skill.id] = enabled.has(skill.id);
    });
    return nextSkills;
  };

  const persistSkills = (enabled: Set<string>) => {
    updateAgent.mutate({
      id: agentId,
      updates: { skills: toSkillsPayload(enabled) },
    });
  };

  const handleToggle = (skillId: string) => {
    setEnabledSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      persistSkills(next);
      return next;
    });
  };

  const getCategoryState = (
    categorySkills: Skill[],
    enabled: Set<string>,
  ): CategoryState => {
    if (categorySkills.length === 0) {
      return "none";
    }
    const activeCount = categorySkills.filter((skill) =>
      enabled.has(skill.id),
    ).length;
    if (activeCount === 0) {
      return "none";
    }
    if (activeCount === categorySkills.length) {
      return "active";
    }
    return "mixed";
  };

  const handleCategoryToggle = (category: SkillCategory) => {
    const categorySkills = skillsByCategory.get(category) ?? [];
    setEnabledSkills((prev) => {
      const next = new Set(prev);
      const state = getCategoryState(categorySkills, next);
      if (state === "active") {
        categorySkills.forEach((skill) => next.delete(skill.id));
      } else {
        categorySkills.forEach((skill) => next.add(skill.id));
      }
      persistSkills(next);
      return next;
    });
  };

  const hoveredSkill = hoveredSkillId
    ? (skillMap.get(hoveredSkillId) ?? null)
    : null;

  return (
    <div
      className="skills-tree rounded-panel border border-border bg-bg-panel p-panel flex min-h-0 h-full flex-col"
      onMouseLeave={() => setHoveredSkillId(null)}
    >
      <div className="skills-grid">
        <div className="skills-statblock">
          {categoryOrder.map((category) => {
            const categorySkills = skillsByCategory.get(category) ?? [];
            const categoryState = getCategoryState(
              categorySkills,
              enabledSkills,
            );

            return (
              <section key={category} className="skills-category-row">
                <button
                  type="button"
                  className={cn(
                    "skills-category-button",
                    `skills-category-button--${categoryState}`,
                  )}
                  style={
                    {
                      "--skill-accent": `var(--skill-${category})`,
                    } as CSSProperties
                  }
                  onClick={() => handleCategoryToggle(category)}
                  aria-pressed={
                    categoryState === "mixed"
                      ? "mixed"
                      : categoryState === "active"
                  }
                >
                  <span className="skills-category-title">
                    {categoryLabels[category]}
                  </span>
                  <span className="skills-category-meta">
                    {categorySkills.length} skills
                  </span>
                </button>
                <div className="skills-skill-list">
                  {categorySkills.map((skill) => {
                    const active = enabledSkills.has(skill.id);
                    return (
                      <div key={skill.id} className="skills-skill-row">
                        <span
                          className={cn(
                            "skills-skill-line",
                            active && "skills-skill-line--active",
                          )}
                          style={
                            {
                              "--skill-accent": `var(--skill-${skill.category})`,
                            } as CSSProperties
                          }
                          aria-hidden="true"
                        />
                        <button
                          type="button"
                          className={cn(
                            "skills-skill-button",
                            active && "skills-skill-button--active",
                          )}
                          style={
                            {
                              "--skill-accent": `var(--skill-${skill.category})`,
                            } as CSSProperties
                          }
                          onClick={() => handleToggle(skill.id)}
                          onMouseEnter={() => setHoveredSkillId(skill.id)}
                          onFocus={() => setHoveredSkillId(skill.id)}
                          onBlur={() => setHoveredSkillId(null)}
                          aria-pressed={active}
                        >
                          <span className="skills-skill-title">
                            {skill.name}
                          </span>
                          <span className="skills-skill-tier">
                            Tier {skill.tier}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
        <aside className="skills-detail-panel">
          {hoveredSkill ? (
            <>
              <div
                className="skills-detail-header"
                style={
                  {
                    "--skill-accent": `var(--skill-${hoveredSkill.category})`,
                  } as CSSProperties
                }
              >
                <span className="skills-detail-title">{hoveredSkill.name}</span>
                <span className="skills-detail-tier">
                  Tier {hoveredSkill.tier}
                </span>
              </div>
              <p className="skills-detail-description">
                {hoveredSkill.description}
              </p>
            </>
          ) : (
            <p className="skills-detail-empty">
              Hover a skill to see its description.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
