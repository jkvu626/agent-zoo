import type { PropsWithChildren } from "react";
import { cn } from "../../utils/cn";

type PanelProps = PropsWithChildren<{
  className?: string;
}>;

export function Panel({ className, children }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-panel border border-border bg-bg-panel p-panel shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
