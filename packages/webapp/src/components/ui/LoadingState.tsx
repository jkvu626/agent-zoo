import { cn } from "../../utils/cn";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({
  label = "Loading",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center gap-3 text-text-muted",
        className,
      )}
    >
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-accent-orange border-t-transparent"
        aria-hidden
      />
      <span className="text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}
