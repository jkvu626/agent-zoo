import { Button } from "./Button";
import { cn } from "../../utils/cn";

type ErrorMessageProps = {
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorMessage({
  message = "Something went wrong.",
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border border-border bg-bg-panel p-3 text-sm text-text-primary",
        className,
      )}
    >
      <p className="text-sm text-text-primary">{message}</p>
      {onRetry ? (
        <Button variant="ghost" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
