import type { BrainEntry, BrainEntryType } from "@agent-zoo/types";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

const ENTRY_LABELS: Record<BrainEntryType, string> = {
  decision: "Decision",
  milestone: "Milestone",
  note: "Note",
  summary: "Summary",
};

const ENTRY_ACCENTS: Record<BrainEntryType, string> = {
  decision: "border-l-accent-orange text-accent-orange",
  milestone: "border-l-accent-green text-accent-green",
  note: "border-l-text-muted text-text-muted",
  summary: "border-l-[color:var(--accent-orange)] text-accent-orange",
};

type BrainEntryCardProps = {
  entry: BrainEntry;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  disabled?: boolean;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleString();
};

export function BrainEntryCard({
  entry,
  onEdit,
  onDelete,
  onTogglePin,
  disabled,
}: BrainEntryCardProps) {
  const tags = entry.tags ?? [];

  return (
    <div
      className={cn(
        "rounded-card border border-border bg-bg-panel p-4 shadow-sm border-l-4",
        ENTRY_ACCENTS[entry.type],
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                ENTRY_ACCENTS[entry.type],
              )}
            >
              {ENTRY_LABELS[entry.type]}
            </span>
            {entry.pinned ? (
              <span className="rounded-full border border-border bg-bg-app px-2 py-0.5 text-xs text-text-muted">
                Pinned
              </span>
            ) : null}
            <span className="text-xs text-text-muted">
              {formatTimestamp(entry.timestamp)}
            </span>
          </div>

          <p className="text-sm text-text-primary whitespace-pre-wrap">
            {entry.content}
          </p>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={`${entry.id}-${tag}`}
                  className="rounded-full border border-border bg-bg-app px-2 py-0.5 text-xs text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="ghost"
            className="h-8 px-3 text-xs"
            onClick={onEdit}
            disabled={disabled}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            className="h-8 px-3 text-xs"
            onClick={onTogglePin}
            disabled={disabled}
          >
            {entry.pinned ? "Unpin" : "Pin"}
          </Button>
          <Button
            variant="destructive"
            className="h-8 px-3 text-xs"
            onClick={onDelete}
            disabled={disabled}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
