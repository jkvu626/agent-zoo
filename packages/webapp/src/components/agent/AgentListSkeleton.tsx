type AgentListSkeletonProps = {
  count?: number;
};

export function AgentListSkeleton({ count = 4 }: AgentListSkeletonProps) {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-9 rounded-md bg-border" />
      ))}
    </div>
  );
}
