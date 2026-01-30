type SoulEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function SoulEditor({ value, onChange, disabled }: SoulEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-text-muted" htmlFor="soul">
        System prompt
      </label>
      <textarea
        id="soul"
        rows={10}
        className="w-full rounded-md border border-border bg-bg-panel p-3 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
        placeholder="You are a teacher..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
