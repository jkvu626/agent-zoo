import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { BrainEntryType } from "@agent-zoo/types";
import { fadeInUp } from "../../theme/motion";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { ErrorMessage } from "../ui/ErrorMessage";
import { LoadingState } from "../ui/LoadingState";
import { Panel } from "../ui/Panel";
import {
  useAgent,
  useBrainEntries,
  useCreateBrainEntry,
  useDeleteBrainEntry,
  useTogglePinEntry,
  useUpdateBrainEntry,
} from "../../api/hooks";
import { BrainEntryCard } from "./BrainEntryCard";
import { BrainEntryForm } from "./BrainEntryForm";

const ENTRY_TYPES: Array<BrainEntryType | "all"> = [
  "all",
  "decision",
  "milestone",
  "note",
  "summary",
];

const toEntryLabel = (value: BrainEntryType | "all") =>
  value === "all"
    ? "All types"
    : value.charAt(0).toUpperCase() + value.slice(1);

const sortByTimestampDesc = (
  a: { timestamp: string },
  b: { timestamp: string },
) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();

export function BrainTimelineView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [typeFilter, setTypeFilter] = useState<BrainEntryType | "all">("all");
  const [tagFilter, setTagFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const {
    data: agent,
    isPending: agentPending,
    isError: agentError,
    refetch: refetchAgent,
  } = useAgent(id);

  const filters = useMemo(() => {
    const tags = tagFilter
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const hasTags = tags.length > 0;
    return {
      type: typeFilter === "all" ? undefined : typeFilter,
      tags: hasTags ? tags : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      pinned: pinnedOnly ? true : undefined,
    };
  }, [typeFilter, tagFilter, dateFrom, dateTo, pinnedOnly]);

  const {
    data: entries = [],
    isPending: entriesPending,
    isError: entriesError,
    refetch: refetchEntries,
  } = useBrainEntries(id, filters);

  const createBrainEntry = useCreateBrainEntry();
  const updateBrainEntry = useUpdateBrainEntry();
  const deleteBrainEntry = useDeleteBrainEntry();
  const togglePinEntry = useTogglePinEntry();

  const isPending = agentPending || entriesPending;
  const isError = agentError || entriesError;
  const hasFilters =
    typeFilter !== "all" ||
    tagFilter.trim().length > 0 ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    pinnedOnly;

  const sortedEntries = useMemo(
    () => [...entries].sort(sortByTimestampDesc),
    [entries],
  );
  const pinnedEntries = sortedEntries.filter((entry) => entry.pinned);
  const unpinnedEntries = sortedEntries.filter((entry) => !entry.pinned);
  const editingEntry = editingEntryId
    ? (sortedEntries.find((entry) => entry.id === editingEntryId) ?? null)
    : null;

  useEffect(() => {
    if (editingEntryId && !editingEntry) {
      setEditingEntryId(null);
    }
  }, [editingEntryId, editingEntry]);

  if (isPending) {
    return (
      <Panel className="flex h-full items-center justify-center">
        <LoadingState label="Loading brain timeline" />
      </Panel>
    );
  }

  if (isError) {
    return (
      <Panel className="flex h-full items-center justify-center">
        <ErrorMessage
          message="Unable to load brain timeline."
          onRetry={() => {
            refetchAgent();
            refetchEntries();
          }}
        />
      </Panel>
    );
  }

  if (!agent) {
    return (
      <Panel className="flex h-full items-center justify-center">
        <EmptyState
          title="Agent not found"
          description="Pick another agent from the sidebar."
        />
      </Panel>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col gap-4"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl text-text-primary">
              Brain Timeline
            </h2>
            <p className="text-sm text-text-muted">
              {`Reflecting ${agent.name}'s decisions, milestones, and notes`}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate(`/agent/${agent.id}`)}
          >
            Back to Agent
          </Button>
        </div>

        <Panel>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-[140px] flex-col gap-2">
              <label className="text-xs font-medium text-text-muted">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as BrainEntryType | "all")
                }
                className="rounded-md border border-border bg-bg-panel px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
              >
                {ENTRY_TYPES.map((entryType) => (
                  <option key={entryType} value={entryType}>
                    {toEntryLabel(entryType)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex min-w-[180px] flex-1 flex-col gap-2">
              <label className="text-xs font-medium text-text-muted">
                Tags
              </label>
              <input
                type="text"
                placeholder="e.g. refactor, onboarding"
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                className="w-full rounded-md border border-border bg-bg-panel px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-text-muted">
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="rounded-md border border-border bg-bg-panel px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-text-muted">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="rounded-md border border-border bg-bg-panel px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-text-muted">
              <input
                type="checkbox"
                checked={pinnedOnly}
                onChange={(event) => setPinnedOnly(event.target.checked)}
                className="h-4 w-4 rounded border-border text-accent-orange focus:ring-accent-orange"
              />
              Pinned only
            </label>

            {hasFilters ? (
              <Button
                variant="ghost"
                className="h-9 px-3 text-xs"
                onClick={() => {
                  setTypeFilter("all");
                  setTagFilter("");
                  setDateFrom("");
                  setDateTo("");
                  setPinnedOnly(false);
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-muted">
              {entries.length} entries captured
            </p>
            <Button
              onClick={() => {
                setIsCreating(true);
                setEditingEntryId(null);
              }}
            >
              Add entry
            </Button>
          </div>
        </Panel>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {isCreating ? (
          <BrainEntryForm
            className="flex-1 min-h-0 overflow-y-auto pb-4"
            mode="create"
            onSave={(values) => {
              if (!id) return;
              createBrainEntry.mutate(
                {
                  agentId: id,
                  entry: {
                    ...values,
                    metadata: { source: "manual" },
                  },
                },
                {
                  onSuccess: () => setIsCreating(false),
                },
              );
            }}
            onCancel={() => setIsCreating(false)}
            disabled={createBrainEntry.isPending}
          />
        ) : editingEntry ? (
          <BrainEntryForm
            className="flex-1 min-h-0 overflow-y-auto pb-4"
            mode="edit"
            initialType={editingEntry.type}
            initialContent={editingEntry.content}
            initialTags={editingEntry.tags ?? []}
            initialPinned={editingEntry.pinned}
            onSave={(values) => {
              if (!id || !editingEntry) return;
              updateBrainEntry.mutate(
                {
                  agentId: id,
                  entryId: editingEntry.id,
                  updates: values,
                },
                {
                  onSuccess: () => setEditingEntryId(null),
                },
              );
            }}
            onCancel={() => setEditingEntryId(null)}
            onDelete={() => {
              if (!id || !editingEntry) return;
              if (!window.confirm("Delete this brain entry?")) return;
              deleteBrainEntry.mutate(
                { agentId: id, entryId: editingEntry.id },
                {
                  onSuccess: () => setEditingEntryId(null),
                },
              );
            }}
            disabled={updateBrainEntry.isPending}
          />
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto pb-4 space-y-4">
            {pinnedEntries.length > 0 && !pinnedOnly ? (
              <Panel className="space-y-3">
                <div>
                  <h3 className="font-display text-base text-text-primary">
                    Pinned highlights
                  </h3>
                  <p className="text-xs text-text-muted">
                    The moments you want this agent to remember first.
                  </p>
                </div>
                {pinnedEntries.map((entry) => (
                  <BrainEntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={() => {
                      setEditingEntryId(entry.id);
                      setIsCreating(false);
                    }}
                    onDelete={() => {
                      if (!id) return;
                      if (!window.confirm("Delete this brain entry?")) return;
                      deleteBrainEntry.mutate({
                        agentId: id,
                        entryId: entry.id,
                      });
                    }}
                    onTogglePin={() => {
                      if (!id) return;
                      togglePinEntry.mutate({ agentId: id, entryId: entry.id });
                    }}
                    disabled={
                      deleteBrainEntry.isPending || togglePinEntry.isPending
                    }
                  />
                ))}
              </Panel>
            ) : null}

            <Panel className="space-y-3">
              {unpinnedEntries.length > 0 || pinnedOnly ? (
                <>
                  <div>
                    <h3 className="font-display text-base text-text-primary">
                      Timeline
                    </h3>
                    <p className="text-xs text-text-muted">
                      {pinnedOnly
                        ? "Showing only pinned memories."
                        : "Most recent memories are shown first."}
                    </p>
                  </div>
                  {(pinnedOnly ? pinnedEntries : unpinnedEntries).map(
                    (entry) => (
                      <BrainEntryCard
                        key={entry.id}
                        entry={entry}
                        onEdit={() => {
                          setEditingEntryId(entry.id);
                          setIsCreating(false);
                        }}
                        onDelete={() => {
                          if (!id) return;
                          if (!window.confirm("Delete this brain entry?"))
                            return;
                          deleteBrainEntry.mutate({
                            agentId: id,
                            entryId: entry.id,
                          });
                        }}
                        onTogglePin={() => {
                          if (!id) return;
                          togglePinEntry.mutate({
                            agentId: id,
                            entryId: entry.id,
                          });
                        }}
                        disabled={
                          deleteBrainEntry.isPending || togglePinEntry.isPending
                        }
                      />
                    ),
                  )}
                </>
              ) : (
                <EmptyState
                  title="No memories yet"
                  description="Start capturing decisions, milestones, and notes for this agent."
                />
              )}
            </Panel>
          </div>
        )}
      </div>
    </motion.div>
  );
}
