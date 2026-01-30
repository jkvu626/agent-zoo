type AgentNametagProps = {
  name: string;
};

export function AgentNametag({ name }: AgentNametagProps) {
  return (
    <div className="rounded-md border border-border bg-bg-panel px-2 py-1 text-xs font-medium text-text-primary shadow-sm">
      {name}
    </div>
  );
}
