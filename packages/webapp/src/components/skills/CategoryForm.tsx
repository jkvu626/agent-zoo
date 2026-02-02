import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ColorPicker } from "../ui/ColorPicker";

type CategoryFormProps = {
  mode: "create" | "edit";
  initialName: string;
  initialColor: string;
  onSave: (values: { name: string; color: string }) => void;
  onCancel: () => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export function CategoryForm({
  mode,
  initialName,
  initialColor,
  onSave,
  onCancel,
  onDelete,
  disabled,
}: CategoryFormProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    setName(initialName);
    setColor(initialColor);
  }, [initialName, initialColor]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !disabled;
  const title = mode === "create" ? "Create category" : "Edit category";
  const submitLabel = mode === "create" ? "Create" : "Save";

  return (
    <form
      className="flex h-full flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSave({ name: trimmedName, color });
      }}
    >
      <div>
        <h3 className="font-display text-base text-text-primary">{title}</h3>
        <p className="text-xs text-text-muted">
          Give this group a name and signature color.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label
          className="text-xs font-medium text-text-muted"
          htmlFor="category-name"
        >
          Category name
        </label>
        <input
          id="category-name"
          type="text"
          placeholder="e.g. Research"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-border bg-bg-panel px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          autoFocus
          disabled={disabled}
        />
      </div>

      <ColorPicker
        id="category-color"
        label="Category color"
        value={color}
        onChange={setColor}
      />

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
