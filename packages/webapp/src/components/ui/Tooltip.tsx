import type { ReactNode } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "../../utils/cn";

type TooltipProps = {
  content: string;
  children: ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
};

export function Tooltip({
  content,
  children,
  className,
  side,
  sideOffset = 10,
}: TooltipProps) {
  return (
    <RadixTooltip.Root delayDuration={200}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side ?? "top"}
          sideOffset={sideOffset}
          className={cn(
            "rounded-md border border-border bg-bg-panel px-2 py-1 text-xs text-text-primary shadow-sm",
            className,
          )}
        >
          {content}
          <RadixTooltip.Arrow className="fill-border" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

export const TooltipProvider = RadixTooltip.Provider;
