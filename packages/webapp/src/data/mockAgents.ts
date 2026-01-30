import type { Agent } from "@agent-zoo/types";

export const mockAgents: Agent[] = [
  {
    id: "sage",
    name: "Sage",
    personality: "Thoughtful mentor focused on clarity.",
    skills: {
      mentorship: true,
      planning: true,
      "calm-guidance": true,
    },
    contextRefs: ["Memory garden", "Strategy notes"],
  },
  {
    id: "ember",
    name: "Ember",
    personality: "Energetic builder who loves quick wins.",
    skills: {
      "rapid-prototyping": true,
      "ui-polish": true,
      experimentation: true,
    },
    contextRefs: ["Prototype sketches", "Sprint backlog"],
  },
  {
    id: "atlas",
    name: "Atlas",
    personality: "Organized coordinator tracking all moving parts.",
    skills: {
      "systems-thinking": true,
      coordination: true,
      roadmapping: true,
    },
    contextRefs: ["Project map", "Milestone tracker"],
  },
];
