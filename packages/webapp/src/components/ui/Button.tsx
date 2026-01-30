import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { springBouncy } from "../../theme/motion";
import { cn } from "../../utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

/** Event props that conflict between React DOM and Framer Motion (same name, different signature). */
const MOTION_CONFLICT_PROPS = [
  "onDrag",
  "onDragStart",
  "onDragEnd",
  "onAnimationStart",
  "onAnimationEnd",
] as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

type MotionButtonProps = Omit<
  ButtonProps,
  "variant" | "icon" | (typeof MOTION_CONFLICT_PROPS)[number]
>;

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-offset-2 focus-visible:ring-offset-bg-app disabled:cursor-not-allowed disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent-orange text-white shadow-sm hover:brightness-95",
  secondary: "bg-accent-green text-white shadow-sm hover:brightness-95",
  ghost: "bg-transparent text-text-primary hover:bg-bg-app",
  destructive:
    "bg-[var(--accent-orange-muted)] text-white shadow-sm hover:brightness-95",
};

export function Button({
  variant = "primary",
  icon,
  className,
  children,
  onDrag: _onDrag,
  onDragStart: _onDragStart,
  onDragEnd: _onDragEnd,
  onAnimationStart: _onAnimationStart,
  onAnimationEnd: _onAnimationEnd,
  ...props
}: ButtonProps) {
  const motionProps: MotionButtonProps = props;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      transition={springBouncy}
      className={cn(baseClasses, variantClasses[variant], className)}
      {...motionProps}
    >
      {icon}
      {children}
    </motion.button>
  );
}
