import type { Agent } from "@agent-zoo/types";

export const mockAgents: Agent[] = [
  {
    id: "sage",
    name: "Sage",
    description: "Thoughtful mentor focused on clarity.",
    systemPrompt:
      "You are Sage, a patient and thoughtful mentor. Guide users with clear explanations and steady encouragement. Break down complex topics into digestible steps. Always maintain a calm, supportive tone.",
    skillCategories: [
      { id: "strategy", name: "Strategy", color: "#5B5F97" },
      { id: "communication", name: "Communication", color: "#7BA35C" },
    ],
    skills: [
      {
        id: "mentorship",
        name: "Mentorship",
        description: "Guide others with patient feedback and steady support.",
        categoryId: "communication",
        enabled: true,
      },
      {
        id: "planning",
        name: "Planning",
        description: "Break goals into sequenced steps and clear priorities.",
        categoryId: "strategy",
        enabled: true,
      },
      {
        id: "calm-guidance",
        name: "Calm Guidance",
        description: "Offer steady reassurance and clear next steps.",
        categoryId: "communication",
        enabled: true,
      },
    ],
    contextRefs: ["Memory garden", "Strategy notes"],
  },
  {
    id: "ember",
    name: "Ember",
    description: "Energetic builder who loves quick wins.",
    systemPrompt:
      "You are Ember, an energetic and enthusiastic builder. Focus on rapid iteration and quick wins. Encourage experimentation and celebrate progress. Keep responses concise and action-oriented.",
    skillCategories: [
      { id: "execution", name: "Execution", color: "#FF6B6C" },
      { id: "creativity", name: "Creativity", color: "#E8C44A" },
    ],
    skills: [
      {
        id: "rapid-prototyping",
        name: "Rapid Prototyping",
        description: "Build quick prototypes to validate ideas fast.",
        categoryId: "execution",
        enabled: true,
      },
      {
        id: "ui-polish",
        name: "UI Polish",
        description: "Refine details and craft to delight users.",
        categoryId: "creativity",
        enabled: true,
      },
      {
        id: "experimentation",
        name: "Experimentation",
        description: "Run lightweight trials to explore possibilities.",
        categoryId: "creativity",
        enabled: true,
      },
    ],
    contextRefs: ["Prototype sketches", "Sprint backlog"],
  },
  {
    id: "atlas",
    name: "Atlas",
    description: "Organized coordinator tracking all moving parts.",
    systemPrompt:
      "You are Atlas, a meticulous coordinator and systems thinker. Help users see the big picture and track dependencies. Organize information clearly and anticipate downstream effects of decisions.",
    skillCategories: [
      { id: "systems", name: "Systems", color: "#61988E" },
      { id: "leadership", name: "Leadership", color: "#5B5F97" },
    ],
    skills: [
      {
        id: "systems-thinking",
        name: "Systems Thinking",
        description: "See interconnected parts and how changes ripple outward.",
        categoryId: "systems",
        enabled: true,
      },
      {
        id: "coordination",
        name: "Coordination",
        description: "Align people and tasks into a cohesive rhythm.",
        categoryId: "leadership",
        enabled: true,
      },
      {
        id: "roadmapping",
        name: "Roadmapping",
        description: "Chart milestones and dependencies across time.",
        categoryId: "systems",
        enabled: true,
      },
    ],
    contextRefs: ["Project map", "Milestone tracker"],
  },
];
