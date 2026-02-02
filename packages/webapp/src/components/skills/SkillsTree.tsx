import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Agent, Skill, SkillCategory } from "@agent-zoo/types";
import { cn } from "../../utils/cn";
import { useUpdateAgent } from "../../api/hooks";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { PlusIcon } from "../icons/PlusIcon";
import { CategoryForm } from "./CategoryForm";
import { SkillForm } from "./SkillForm";
import "./skills.css";

const CATEGORY_COLOR_PALETTE = [
  "#5B5F97",
  "#61988E",
  "#FF6B6C",
  "#E8C44A",
  "#7BA35C",
  "#8D6AE3",
  "#F08A4B",
];

type SidebarState =
  | { mode: "empty" }
  | { mode: "create-category" }
  | { mode: "edit-category"; categoryId: string }
  | { mode: "create-skill"; categoryId: string }
  | { mode: "view-skill"; skillId: string }
  | { mode: "edit-skill"; skillId: string };

type SkillsTreeProps = {
  agent: Agent;
  agentId: string;
  searchQuery: string;
  createCategorySignal: number;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const createUniqueId = (
  label: string,
  existing: Set<string>,
  fallback: string,
) => {
  const baseId = slugify(label) || fallback;
  let candidate = baseId;
  let counter = 2;
  while (existing.has(candidate)) {
    candidate = `${baseId}-${counter}`;
    counter += 1;
  }
  return candidate;
};

const pickCategoryColor = (categories: SkillCategory[]) => {
  const used = new Set(
    categories.map((category) => category.color.toLowerCase()),
  );
  const available = CATEGORY_COLOR_PALETTE.find(
    (color) => !used.has(color.toLowerCase()),
  );
  return (
    available ??
    CATEGORY_COLOR_PALETTE[categories.length % CATEGORY_COLOR_PALETTE.length]
  );
};

export function SkillsTree({
  agent,
  agentId,
  searchQuery,
  createCategorySignal,
}: SkillsTreeProps) {
  const updateAgent = useUpdateAgent();
  const [sidebarState, setSidebarState] = useState<SidebarState>({
    mode: "empty",
  });
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [createCategoryDefaults, setCreateCategoryDefaults] = useState(() => ({
    name: "",
    color: pickCategoryColor([]),
  }));
  const [createSkillDefaults, setCreateSkillDefaults] = useState(() => ({
    name: "",
    description: "",
  }));
  const lastCreateSignal = useRef(0);

  const categories = agent.skillCategories ?? [];
  const skills = agent.skills ?? [];
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const skillMap = useMemo(
    () => new Map(skills.map((skill) => [skill.id, skill])),
    [skills],
  );

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(normalizedQuery),
    );
  }, [categories, normalizedQuery]);

  const skillsByCategory = useMemo(() => {
    const groups = new Map<string, Skill[]>();
    skills.forEach((skill) => {
      const group = groups.get(skill.categoryId) ?? [];
      group.push(skill);
      groups.set(skill.categoryId, group);
    });
    groups.forEach((group) => {
      group.sort((a, b) => a.name.localeCompare(b.name));
    });
    return groups;
  }, [skills]);

  useEffect(() => {
    if (createCategorySignal === lastCreateSignal.current) {
      return;
    }
    lastCreateSignal.current = createCategorySignal;
    if (createCategorySignal < 1) return;
    setCreateCategoryDefaults({
      name: "",
      color: pickCategoryColor(categories),
    });
    setSidebarState({ mode: "create-category" });
  }, [createCategorySignal, categories]);

  useEffect(() => {
    setSidebarState({ mode: "empty" });
  }, [agent.id]);

  const persistAgent = (updates: Partial<Omit<Agent, "id">>) => {
    updateAgent.mutate({ id: agentId, updates });
  };

  const handleCreateCategory = (values: { name: string; color: string }) => {
    const existingIds = new Set(categories.map((category) => category.id));
    const id = createUniqueId(values.name, existingIds, "category");
    const nextCategories = [...categories, { id, ...values }];
    persistAgent({ skillCategories: nextCategories, skills });
    setSidebarState({ mode: "edit-category", categoryId: id });
  };

  const handleUpdateCategory = (
    categoryId: string,
    values: { name: string; color: string },
  ) => {
    const nextCategories = categories.map((category) =>
      category.id === categoryId ? { ...category, ...values } : category,
    );
    persistAgent({ skillCategories: nextCategories, skills });
    setSidebarState({ mode: "edit-category", categoryId });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const nextCategories = categories.filter(
      (category) => category.id !== categoryId,
    );
    const nextSkills = skills.filter(
      (skill) => skill.categoryId !== categoryId,
    );
    persistAgent({ skillCategories: nextCategories, skills: nextSkills });
    setSidebarState({ mode: "empty" });
  };

  const handleCreateSkill = (
    categoryId: string,
    values: { name: string; description: string },
  ) => {
    const existingIds = new Set(skills.map((skill) => skill.id));
    const id = createUniqueId(values.name, existingIds, "skill");
    const newSkill: Skill = {
      id,
      name: values.name,
      description: values.description,
      categoryId,
      enabled: true, // New skills start enabled
    };
    const nextSkills = [...skills, newSkill];
    persistAgent({ skillCategories: categories, skills: nextSkills });
    setSidebarState({ mode: "view-skill", skillId: id });
  };

  const handleUpdateSkill = (
    skillId: string,
    values: { name: string; description: string },
  ) => {
    const nextSkills = skills.map((skill) =>
      skill.id === skillId ? { ...skill, ...values } : skill,
    );
    persistAgent({ skillCategories: categories, skills: nextSkills });
    setSidebarState({ mode: "view-skill", skillId });
  };

  const handleDeleteSkill = (skillId: string) => {
    const nextSkills = skills.filter((skill) => skill.id !== skillId);
    persistAgent({ skillCategories: categories, skills: nextSkills });
    setSidebarState({ mode: "empty" });
  };

  const handleToggleSkillEnabled = (skillId: string) => {
    const skill = skillMap.get(skillId);
    if (!skill) return;
    const nextSkills = skills.map((s) =>
      s.id === skillId ? { ...s, enabled: !s.enabled } : s,
    );
    persistAgent({ skillCategories: categories, skills: nextSkills });
    setSidebarState({ mode: "view-skill", skillId });
  };

  const selectedCategoryId =
    sidebarState.mode === "edit-category" ||
    sidebarState.mode === "create-skill"
      ? sidebarState.categoryId
      : null;
  const selectedSkillId =
    sidebarState.mode === "edit-skill" ? sidebarState.skillId : null;
  const hoveredSkill = hoveredSkillId ? skillMap.get(hoveredSkillId) : null;

  return (
    <div className="skills-tree rounded-panel border border-border bg-bg-panel p-panel flex min-h-0 h-full flex-col">
      <div className="skills-grid">
        <div className="skills-statblock">
          {filteredCategories.length === 0 ? (
            <div className="skills-empty">
              <p className="skills-empty-title">
                {normalizedQuery
                  ? "No categories match this search."
                  : "No categories yet."}
              </p>
              <p className="skills-empty-body">
                {normalizedQuery
                  ? "Try another keyword or clear the search."
                  : "Use the + button to add your first category."}
              </p>
            </div>
          ) : (
            filteredCategories.map((category) => {
              const categorySkills = skillsByCategory.get(category.id) ?? [];
              const isSelected = selectedCategoryId === category.id;
              const categoryAccent = category.color;

              return (
                <section key={category.id} className="skills-category-row">
                  <button
                    type="button"
                    className={cn(
                      "skills-category-button",
                      isSelected && "skills-category-button--active",
                    )}
                    style={
                      {
                        "--skill-accent": categoryAccent,
                      } as CSSProperties
                    }
                    onClick={() =>
                      setSidebarState({
                        mode: "edit-category",
                        categoryId: category.id,
                      })
                    }
                  >
                    <span className="skills-category-header">
                      <span
                        className="skills-category-dot"
                        style={
                          {
                            "--skill-accent": categoryAccent,
                          } as CSSProperties
                        }
                        aria-hidden="true"
                      />
                      <span className="skills-category-title">
                        {category.name}
                      </span>
                    </span>
                    <span className="skills-category-meta">
                      {categorySkills.length} skills
                    </span>
                  </button>
                  <div className="skills-skill-list">
                    <div className="skills-skill-list-header">
                      <span className="skills-skill-list-title">Skills</span>
                      <IconButton
                        icon={<PlusIcon className="h-4 w-4" />}
                        aria-label={`Add skill to ${category.name}`}
                        tooltip="Add skill"
                        className="h-8 w-8"
                        onClick={() => {
                          setCreateSkillDefaults({
                            name: "",
                            description: "",
                          });
                          setSidebarState({
                            mode: "create-skill",
                            categoryId: category.id,
                          });
                        }}
                      />
                    </div>
                    <div className="skills-skill-items">
                      {categorySkills.length === 0 ? (
                        <p className="skills-skill-empty">
                          Add the first skill for this category.
                        </p>
                      ) : (
                        categorySkills.map((skill) => {
                          const isSelectedSkill = selectedSkillId === skill.id;
                          return (
                            <div key={skill.id} className="skills-skill-row">
                              <span
                                className={cn(
                                  "skills-skill-line",
                                  skill.enabled && "skills-skill-line--active",
                                )}
                                style={
                                  {
                                    "--skill-accent": categoryAccent,
                                  } as CSSProperties
                                }
                                aria-hidden="true"
                              />
                              <button
                                type="button"
                                className={cn(
                                  "skills-skill-button",
                                  skill.enabled &&
                                    "skills-skill-button--active",
                                  isSelectedSkill &&
                                    "skills-skill-button--selected",
                                )}
                                style={
                                  {
                                    "--skill-accent": categoryAccent,
                                  } as CSSProperties
                                }
                                onClick={() =>
                                  handleToggleSkillEnabled(skill.id)
                                }
                                onDoubleClick={() =>
                                  setSidebarState({
                                    mode: "edit-skill",
                                    skillId: skill.id,
                                  })
                                }
                                onMouseEnter={() => setHoveredSkillId(skill.id)}
                                onMouseLeave={() => setHoveredSkillId(null)}
                              >
                                <span className="skills-skill-title">
                                  {skill.name}
                                </span>
                                <span className="skills-skill-tier">
                                  {skill.enabled ? "Enabled" : "Disabled"}
                                </span>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </section>
              );
            })
          )}
        </div>
        <aside className="skills-detail-panel">
          {sidebarState.mode === "create-category" ? (
            <CategoryForm
              mode="create"
              initialName={createCategoryDefaults.name}
              initialColor={createCategoryDefaults.color}
              onSave={handleCreateCategory}
              onCancel={() => setSidebarState({ mode: "empty" })}
            />
          ) : sidebarState.mode === "edit-category" ? (
            categoryMap.get(sidebarState.categoryId) ? (
              <CategoryForm
                mode="edit"
                initialName={categoryMap.get(sidebarState.categoryId)!.name}
                initialColor={categoryMap.get(sidebarState.categoryId)!.color}
                onSave={(values) =>
                  handleUpdateCategory(sidebarState.categoryId, values)
                }
                onCancel={() => setSidebarState({ mode: "empty" })}
                onDelete={() => handleDeleteCategory(sidebarState.categoryId)}
              />
            ) : (
              <p className="skills-detail-empty">Select a category to edit.</p>
            )
          ) : sidebarState.mode === "create-skill" ? (
            categoryMap.get(sidebarState.categoryId) ? (
              <SkillForm
                mode="create"
                initialName={createSkillDefaults.name}
                initialDescription={createSkillDefaults.description}
                onSave={(values) =>
                  handleCreateSkill(sidebarState.categoryId, values)
                }
                onCancel={() => setSidebarState({ mode: "empty" })}
              />
            ) : (
              <p className="skills-detail-empty">
                Select a category to add a skill.
              </p>
            )
          ) : sidebarState.mode === "empty" && hoveredSkill ? (
            <div className="flex h-full flex-col gap-4">
              <div>
                <h3 className="font-display text-base text-text-primary">
                  {hoveredSkill.name}
                </h3>
                <p className="text-xs text-text-muted">
                  {hoveredSkill.enabled ? "Enabled" : "Disabled"} · Read-only
                  preview
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                  {hoveredSkill.description || "No description yet."}
                </p>
              </div>
            </div>
          ) : sidebarState.mode === "view-skill" ? (
            skillMap.get(sidebarState.skillId) ? (
              <div className="flex h-full flex-col gap-4">
                <div>
                  <h3 className="font-display text-base text-text-primary">
                    {skillMap.get(sidebarState.skillId)!.name}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {skillMap.get(sidebarState.skillId)!.enabled
                      ? "Enabled"
                      : "Disabled"}{" "}
                    · Double-click to edit
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">
                    {skillMap.get(sidebarState.skillId)!.description ||
                      "No description yet."}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() =>
                    setSidebarState({
                      mode: "edit-skill",
                      skillId: sidebarState.skillId,
                    })
                  }
                >
                  Edit skill
                </Button>
              </div>
            ) : (
              <p className="skills-detail-empty">Select a skill to view.</p>
            )
          ) : sidebarState.mode === "edit-skill" ? (
            skillMap.get(sidebarState.skillId) ? (
              <SkillForm
                mode="edit"
                initialName={skillMap.get(sidebarState.skillId)!.name}
                initialDescription={
                  skillMap.get(sidebarState.skillId)!.description
                }
                onSave={(values) =>
                  handleUpdateSkill(sidebarState.skillId, values)
                }
                onCancel={() =>
                  setSidebarState({
                    mode: "view-skill",
                    skillId: sidebarState.skillId,
                  })
                }
                onDelete={() => handleDeleteSkill(sidebarState.skillId)}
              />
            ) : (
              <p className="skills-detail-empty">Select a skill to edit.</p>
            )
          ) : (
            <p className="skills-detail-empty">
              Select a category or skill to edit its details.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
