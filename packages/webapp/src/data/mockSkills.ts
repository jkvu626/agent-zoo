import type {
  Skill as AgentSkill,
  SkillCategory as AgentSkillCategory,
} from "@agent-zoo/types";

export type SkillCategory =
  | "communication"
  | "analysis"
  | "execution"
  | "creativity"
  | "leadership";

export type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  tier: 1 | 2 | 3;
  requires?: string[];
};

export const categoryLabels: Record<SkillCategory, string> = {
  leadership: "Leadership",
  analysis: "Analysis",
  execution: "Execution",
  creativity: "Creativity",
  communication: "Communication",
};

const categoryColors: Record<SkillCategory, string> = {
  leadership: "#5B5F97",
  analysis: "#61988E",
  execution: "#FF6B6C",
  creativity: "#E8C44A",
  communication: "#7BA35C",
};

export const skillCatalog: Skill[] = [
  {
    id: "mentorship",
    name: "Mentorship",
    category: "leadership",
    tier: 1,
    description: "Guide others with patient feedback and steady support.",
  },
  {
    id: "coordination",
    name: "Coordination",
    category: "leadership",
    tier: 2,
    description: "Align people and tasks into a cohesive working rhythm.",
    requires: ["mentorship"],
  },
  {
    id: "conflict-resolution",
    name: "Conflict Resolution",
    category: "leadership",
    tier: 2,
    description: "Navigate tension and rebuild trust during disagreements.",
    requires: ["mentorship", "calm-guidance"],
  },
  {
    id: "vision-casting",
    name: "Vision Casting",
    category: "leadership",
    tier: 3,
    description: "Translate long-term direction into shared purpose.",
    requires: ["coordination", "roadmapping"],
  },
  {
    id: "planning",
    name: "Planning",
    category: "analysis",
    tier: 1,
    description: "Break goals into sequenced steps and clear priorities.",
  },
  {
    id: "systems-thinking",
    name: "Systems Thinking",
    category: "analysis",
    tier: 2,
    description: "See interconnected parts and how changes ripple outward.",
    requires: ["planning"],
  },
  {
    id: "risk-mapping",
    name: "Risk Mapping",
    category: "analysis",
    tier: 2,
    description: "Spot uncertainty early and prepare mitigation paths.",
    requires: ["planning"],
  },
  {
    id: "roadmapping",
    name: "Roadmapping",
    category: "analysis",
    tier: 3,
    description: "Chart milestones and dependencies across time.",
    requires: ["planning", "systems-thinking"],
  },
  {
    id: "delivery",
    name: "Delivery",
    category: "execution",
    tier: 1,
    description: "Ship consistent outcomes with reliable follow-through.",
  },
  {
    id: "rapid-prototyping",
    name: "Rapid Prototyping",
    category: "execution",
    tier: 2,
    description: "Build quick prototypes to validate ideas fast.",
    requires: ["ideation"],
  },
  {
    id: "automation",
    name: "Automation",
    category: "execution",
    tier: 2,
    description: "Replace repetitive work with dependable tooling.",
    requires: ["delivery"],
  },
  {
    id: "reliability",
    name: "Reliability",
    category: "execution",
    tier: 3,
    description: "Harden workflows to stay stable under load.",
    requires: ["automation"],
  },
  {
    id: "ideation",
    name: "Ideation",
    category: "creativity",
    tier: 1,
    description: "Generate a wide range of original directions.",
  },
  {
    id: "experimentation",
    name: "Experimentation",
    category: "creativity",
    tier: 2,
    description: "Run lightweight trials to explore possibilities.",
    requires: ["ideation"],
  },
  {
    id: "ui-polish",
    name: "UI Polish",
    category: "creativity",
    tier: 2,
    description: "Refine details and craft to delight users.",
    requires: ["rapid-prototyping"],
  },
  {
    id: "storytelling",
    name: "Storytelling",
    category: "creativity",
    tier: 3,
    description: "Shape narratives that move people to action.",
    requires: ["clarity-writing"],
  },
  {
    id: "calm-guidance",
    name: "Calm Guidance",
    category: "communication",
    tier: 1,
    description: "Offer steady reassurance and clear next steps.",
  },
  {
    id: "active-listening",
    name: "Active Listening",
    category: "communication",
    tier: 1,
    description: "Listen deeply to surface needs and nuance.",
  },
  {
    id: "clarity-writing",
    name: "Clarity Writing",
    category: "communication",
    tier: 2,
    description: "Write concise messages that reduce ambiguity.",
    requires: ["active-listening"],
  },
  {
    id: "facilitation",
    name: "Facilitation",
    category: "communication",
    tier: 3,
    description: "Guide groups toward alignment and decisions.",
    requires: ["clarity-writing", "calm-guidance"],
  },
];

export const seedSkillCategories: AgentSkillCategory[] = Object.entries(
  categoryLabels,
).map(([id, name]) => ({
  id,
  name,
  color: categoryColors[id as SkillCategory] ?? "#5B5F97",
}));

export const seedSkills: AgentSkill[] = skillCatalog.map((skill) => ({
  id: skill.id,
  name: skill.name,
  description: skill.description,
  categoryId: skill.category,
  enabled: false,
}));
