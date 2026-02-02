import { useEffect, useMemo, useRef, useState } from "react";
import type { BrainEntryType } from "@agent-zoo/types";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

const ENTRY_TYPES: BrainEntryType[] = [
  "decision",
  "milestone",
  "note",
  "summary",
];

type BrainEntryFormValues = {
  type: BrainEntryType;
  content: string;
  tags: string[];
  pinned: boolean;
};

type BrainEntryFormProps = {
  mode: "create" | "edit";
  initialType?: BrainEntryType;
  initialContent?: string;
  initialTags?: string[];
  initialPinned?: boolean;
  onSave: (values: BrainEntryFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  className?: string;
};

export function BrainEntryForm({
  mode,
  initialType = "note",
  initialContent = "",
  initialTags = [],
  initialPinned = false,
  onSave,
  onCancel,
  onDelete,
  disabled,
  className,
}: BrainEntryFormProps) {
  const [type, setType] = useState<BrainEntryType>(initialType);
  const [content, setContent] = useState(initialContent);
  const [tagsInput, setTagsInput] = useState(initialTags.join(", "));
  const [pinned, setPinned] = useState(initialPinned);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setType(initialType);
    setContent(initialContent);
    setTagsInput(initialTags.join(", "));
    setPinned(initialPinned);
  }, [initialType, initialContent, initialTags, initialPinned]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [content]);

  const trimmedContent = content.trim();
  const parsedTags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsInput],
  );

  const canSubmit = trimmedContent.length > 0 && !disabled;
  const title = mode === "create" ? "New brain entry" : "Edit brain entry";
  const submitLabel = mode === "create" ? "Add entry" : "Save changes";

  return (
    <form
      className={cn(
        "flex min-h-0 flex-col gap-3 rounded-card border border-border bg-bg-panel p-4 shadow-sm",
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSave({
          type,
          content: trimmedContent,
          tags: parsedTags,
          pinned,
        });
      }}
    >
      <div>
        <h3 className="font-display text-base text-text-primary">{title}</h3>
        <p className="text-xs text-text-muted">
          Capture a decision, milestone, note, or summary for this agent.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-medium text-text-muted"
            htmlFor="brain-entry-type"
          >
            Entry type
          </label>
          <select
            id="brain-entry-type"
            value={type}
            onChange={(event) => setType(event.target.value as BrainEntryType)}
            className="w-full rounded-md border border-border bg-bg-panel px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
            disabled={disabled}
          >
            {ENTRY_TYPES.map((entryType) => (
              <option key={entryType} value={entryType}>
                {entryType.charAt(0).toUpperCase() + entryType.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-medium text-text-muted"
            htmlFor="brain-entry-tags"
          >
            Tags
          </label>
          <input
            id="brain-entry-tags"
            type="text"
            placeholder="e.g. refactor, onboarding"
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            className="w-full rounded-md border border-border bg-bg-panel px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-xs font-medium text-text-muted"
          htmlFor="brain-entry-content"
        >
          Entry text
        </label>
        <textarea
          id="brain-entry-content"
          ref={textareaRef}
          rows={3}
          className="min-h-[4.5rem] w-full overflow-hidden rounded-md border border-border bg-bg-panel p-3 text-sm text-text-primary shadow-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          placeholder="What should this agent remember?"
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            event.currentTarget.style.height = "auto";
            event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
          }}
          disabled={disabled}
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-text-muted">
        <input
          type="checkbox"
          checked={pinned}
          onChange={(event) => setPinned(event.target.checked)}
          className="h-4 w-4 rounded border-border text-accent-orange focus:ring-accent-orange"
          disabled={disabled}
        />
        Pin this entry to the top of the timeline
      </label>

      <div className="mt-auto flex items-center justify-between gap-2">
        {mode === "edit" && onDelete ? (
          <Button variant="destructive" type="button" onClick={onDelete}>
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            type="button"
            onClick={onCancel}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
