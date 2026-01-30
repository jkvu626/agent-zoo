import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "./Button";
import { Tooltip } from "./Tooltip";
import { cn } from "../../utils/cn";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  "aria-label": string;
  tooltip?: string;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
};

export function IconButton({
  icon,
  tooltip,
  className,
  variant = "ghost",
  ...props
}: IconButtonProps) {
  const label = props["aria-label"];
  const content = tooltip ?? label;

  return (
    <Tooltip content={content}>
      <span>
        <Button
          {...props}
          variant={variant}
          className={cn("h-10 w-10 rounded-full p-0", className)}
        >
          {icon}
        </Button>
      </span>
    </Tooltip>
  );
}
