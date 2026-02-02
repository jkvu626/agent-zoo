type SoulEditorProps = {
  description: string;
  systemPrompt: string;
  onDescriptionChange: (value: string) => void;
  onSystemPromptChange: (value: string) => void;
  disabled?: boolean;
};

export function SoulEditor({
  description,
  systemPrompt,
  onDescriptionChange,
  onSystemPromptChange,
  disabled,
}: SoulEditorProps) {
  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          className="text-xs font-medium text-text-muted"
          htmlFor="description"
        >
          Description
        </label>
        <input
          id="description"
          type="text"
          className="w-full rounded-md border border-border bg-bg-panel px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          placeholder="A short summary of this agent..."
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="flex min-h-0 flex-col gap-2">
        <label
          className="text-xs font-medium text-text-muted"
          htmlFor="systemPrompt"
        >
          System prompt
        </label>
        <textarea
          id="systemPrompt"
          rows={10}
          className="min-h-[160px] w-full flex-1 resize-none rounded-md border border-border bg-bg-panel p-3 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          placeholder="You are a teacher..."
          value={systemPrompt}
          onChange={(event) => onSystemPromptChange(event.target.value)}
          disabled={disabled}
        />
        <p className="text-xs text-text-muted">
          Injected via MCP when this agent is active.
        </p>
      </div>
    </div>
  );
}
