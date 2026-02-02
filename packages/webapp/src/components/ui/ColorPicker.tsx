import type { ChangeEvent } from "react";
import { cn } from "../../utils/cn";

type ColorPickerProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function ColorPicker({
  id,
  label,
  value,
  onChange,
  className,
}: ColorPickerProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const resolvedLabel = label ?? "Category color";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <label className="text-xs font-medium text-text-muted" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div className="flex items-center gap-3 rounded-md border border-border bg-bg-panel px-3 py-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={handleChange}
          aria-label={resolvedLabel}
          className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0"
        />
        <div className="flex flex-col text-xs text-text-muted">
          <span className="text-[10px] uppercase tracking-wide">Hex</span>
          <span className="font-medium text-text-primary">
            {value.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
