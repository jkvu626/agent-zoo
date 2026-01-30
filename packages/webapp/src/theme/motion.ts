import type { Variants } from "framer-motion";

export const springBouncy = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

export const springSmooth = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const motionTokens = {
  springBouncy,
  springSmooth,
  fadeInUp,
} as const;
