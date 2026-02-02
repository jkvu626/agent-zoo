import { useEffect, useState } from "react";
import { Button } from "../ui/Button";

type SkillFormProps = {
  mode: "create" | "edit";
  initialName: string;
  initialDescription: string;
  onSave: (values: { name: string; description: string }) => void;
  onCancel: () => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export function SkillForm({
  mode,
  initialName,
  initialDescription,
  onSave,
  onCancel,
  onDelete,
  disabled,
}: SkillFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
  }, [initialName, initialDescription]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !disabled;
  const title = mode === "create" ? "Create skill" : "Edit skill";
  const submitLabel = mode === "create" ? "Create" : "Save";

  return (
    <form
      className="flex h-full flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSave({ name: trimmedName, description });
      }}
    >
      <div>
        <h3 className="font-display text-base text-text-primary">{title}</h3>
        <p className="text-xs text-text-muted">
          Describe what this skill unlocks for the agent.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label
          className="text-xs font-medium text-text-muted"
          htmlFor="skill-name"
        >
          Skill name
        </label>
        <input
          id="skill-name"
          type="text"
          placeholder="e.g. Competitive research"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-border bg-bg-panel px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          autoFocus
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-xs font-medium text-text-muted"
          htmlFor="skill-description"
        >
          Description
        </label>
        <textarea
          id="skill-description"
          rows={6}
          className="w-full rounded-md border border-border bg-bg-panel p-3 text-sm text-text-primary shadow-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          placeholder="What does this help the agent do?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={disabled}
        />
      </div>

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
