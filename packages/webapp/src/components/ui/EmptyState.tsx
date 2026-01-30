import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center gap-2 text-center text-text-muted",
        className,
      )}
    >
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {description ? <p className="text-xs">{description}</p> : null}
      {action}
    </div>
  );
}
