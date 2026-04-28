"use client";

import Link from "next/link";
import {
  Check,
  ChevronDown,
  Eye,
  GripVertical,
  Hammer,
  Info,
  Link2,
  Plus,
  RefreshCw,
  Rows3,
  Save,
  Trash2,
  TrendingDown,
  User,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { saveProgramStructure } from "../actions";
import {
  type Block,
  type BlockKind,
  type Day,
  type ExerciseLite,
  type ExerciseRow,
  type ProgramStructure,
  type Week,
} from "../types";
import { ApplyToClient } from "./apply-to-client";
import { AthletePreview } from "./athlete-preview";

type ClientLite = { id: string; full_name: string };

// ─── tiny local id helpers ───────────────────────────────────────────────────

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function newRow(ex: ExerciseLite): ExerciseRow {
  return {
    id: uid("row"),
    exerciseId: ex.id,
    name: ex.name,
    sets: 3,
    reps: "8-12",
    rpe: null,
    rest_sec: 90,
    notes: null,
  };
}

function newBlock(): Block {
  return { id: uid("blk"), kind: "STRAIGHT", rows: [] };
}

function newDay(name = "Day"): Day {
  return { id: uid("day"), name, blocks: [newBlock()] };
}

function newWeek(name = "Week"): Week {
  return { id: uid("wk"), name, days: [newDay("Day 1")] };
}

function pluralize(n: number, sing: string, plur: string): string {
  return `${n} ${n === 1 ? sing : plur}`;
}

// ─── block kind metadata ─────────────────────────────────────────────────────
//
// Tailwind JIT cannot resolve template-literal class names, so each tone
// variant is enumerated as a literal string here.

type KindMeta = {
  label: string;
  description: string;
  icon: typeof Rows3;
  // pill (trigger) classes
  pill: string;
  // small icon-square in popover row
  square: string;
  // 2px left border on block card
  leftBorder: string;
};

const KIND_META: Record<BlockKind, KindMeta> = {
  STRAIGHT: {
    label: "Straight sets",
    description: "Same exercise, set after set, with rest in between.",
    icon: Rows3,
    pill: "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15",
    square: "bg-primary/10 text-primary",
    leftBorder: "border-l-2 border-primary/50",
  },
  SUPERSET: {
    label: "Superset",
    description: "Two or more exercises back-to-back, then rest.",
    icon: Link2,
    pill: "bg-violet/10 text-violet border-violet/30 hover:bg-violet/15",
    square: "bg-violet/10 text-violet",
    leftBorder: "border-l-2 border-violet/50",
  },
  DROPSET: {
    label: "Drop set",
    description: "One exercise — drop the weight when you can't go further.",
    icon: TrendingDown,
    pill: "bg-rose/10 text-rose border-rose/30 hover:bg-rose/15",
    square: "bg-rose/10 text-rose",
    leftBorder: "border-l-2 border-rose/50",
  },
  CIRCUIT: {
    label: "Circuit",
    description: "Move through every exercise, rest at the end, repeat.",
    icon: RefreshCw,
    pill: "bg-sky/10 text-sky border-sky/30 hover:bg-sky/15",
    square: "bg-sky/10 text-sky",
    leftBorder: "border-l-2 border-sky/50",
  },
};

const KIND_ORDER: BlockKind[] = ["STRAIGHT", "SUPERSET", "DROPSET", "CIRCUIT"];

// ─── DnD payload ─────────────────────────────────────────────────────────────

type DragPayload =
  | { kind: "exercise"; ex: ExerciseLite }
  | {
      kind: "row";
      rowId: string;
      fromBlockId: string;
      fromDayId: string;
      fromWeekId: string;
    }
  | {
      kind: "block";
      blockId: string;
      fromDayId: string;
      fromWeekId: string;
    };

const DT = "application/x-onyx";

function setDrag(e: React.DragEvent, payload: DragPayload) {
  e.dataTransfer.setData(DT, JSON.stringify(payload));
  e.dataTransfer.setData("text/plain", payload.kind);
  e.dataTransfer.effectAllowed = "move";
}

function readDrag(e: React.DragEvent): DragPayload | null {
  const raw = e.dataTransfer.getData(DT);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DragPayload;
  } catch {
    return null;
  }
}

// ─── pending-deletion state shape ────────────────────────────────────────────

type PendingDelete =
  | {
      kind: "week";
      weekId: string;
      label: string;
    }
  | {
      kind: "day";
      weekId: string;
      dayId: string;
      label: string;
    }
  | {
      kind: "block";
      weekId: string;
      dayId: string;
      blockId: string;
      label: string;
    };

// ─── editor ──────────────────────────────────────────────────────────────────

export function ForgeEditor({
  programId,
  initial,
  exercises,
  clients,
}: {
  programId: string;
  initial: ProgramStructure;
  exercises: ExerciseLite[];
  clients: ClientLite[];
}) {
  const [structure, setStructure] = useState<ProgramStructure>(
    initial.weeks.length > 0 ? initial : { weeks: [newWeek("Week 1")] },
  );
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [pending, startTransition] = useTransition();
  const [view, setView] = useState<"coach" | "athlete">("coach");
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );

  const filteredExercises = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.primary_muscle ?? "").toLowerCase().includes(q) ||
        (e.equipment ?? "").toLowerCase().includes(q),
    );
  }, [exercises, search]);

  // ─── totals for the toolbar stats line ──────────────────────────────────

  const totals = useMemo(() => {
    const weeks = structure.weeks.length;
    let days = 0;
    let exercisesCount = 0;
    for (const w of structure.weeks) {
      days += w.days.length;
      for (const d of w.days)
        for (const b of d.blocks) exercisesCount += b.rows.length;
    }
    return { weeks, days, exercises: exercisesCount };
  }, [structure]);

  // ─── mutations ──────────────────────────────────────────────────────────

  function update(fn: (prev: ProgramStructure) => ProgramStructure) {
    setStructure((prev) => fn(structuredClone(prev)));
  }

  function addRowToBlock(
    weekId: string,
    dayId: string,
    blockId: string,
    row: ExerciseRow,
  ) {
    update((s) => {
      const w = s.weeks.find((x) => x.id === weekId);
      const d = w?.days.find((x) => x.id === dayId);
      const b = d?.blocks.find((x) => x.id === blockId);
      if (b) b.rows.push(row);
      return s;
    });
  }

  function moveRow(
    fromWeekId: string,
    fromDayId: string,
    fromBlockId: string,
    rowId: string,
    toWeekId: string,
    toDayId: string,
    toBlockId: string,
  ) {
    if (
      fromWeekId === toWeekId &&
      fromDayId === toDayId &&
      fromBlockId === toBlockId
    )
      return;
    update((s) => {
      const fromBlock = s.weeks
        .find((w) => w.id === fromWeekId)
        ?.days.find((d) => d.id === fromDayId)
        ?.blocks.find((b) => b.id === fromBlockId);
      const toBlock = s.weeks
        .find((w) => w.id === toWeekId)
        ?.days.find((d) => d.id === toDayId)
        ?.blocks.find((b) => b.id === toBlockId);
      if (!fromBlock || !toBlock) return s;
      const idx = fromBlock.rows.findIndex((r) => r.id === rowId);
      if (idx < 0) return s;
      const [row] = fromBlock.rows.splice(idx, 1);
      toBlock.rows.push(row);
      return s;
    });
  }

  function updateRow(
    weekId: string,
    dayId: string,
    blockId: string,
    rowId: string,
    patch: Partial<ExerciseRow>,
  ) {
    update((s) => {
      const r = s.weeks
        .find((w) => w.id === weekId)
        ?.days.find((d) => d.id === dayId)
        ?.blocks.find((b) => b.id === blockId)
        ?.rows.find((r) => r.id === rowId);
      if (r) Object.assign(r, patch);
      return s;
    });
  }

  function removeRow(
    weekId: string,
    dayId: string,
    blockId: string,
    rowId: string,
  ) {
    update((s) => {
      const b = s.weeks
        .find((w) => w.id === weekId)
        ?.days.find((d) => d.id === dayId)
        ?.blocks.find((b) => b.id === blockId);
      if (b) b.rows = b.rows.filter((r) => r.id !== rowId);
      return s;
    });
  }

  function setBlockKind(
    weekId: string,
    dayId: string,
    blockId: string,
    kind: BlockKind,
  ) {
    update((s) => {
      const b = s.weeks
        .find((w) => w.id === weekId)
        ?.days.find((d) => d.id === dayId)
        ?.blocks.find((b) => b.id === blockId);
      if (b) b.kind = kind;
      return s;
    });
  }

  function moveBlockTo(
    fromWeekId: string,
    fromDayId: string,
    blockId: string,
    toWeekId: string,
    toDayId: string,
    targetIndex: number,
  ) {
    update((s) => {
      const fromDay = s.weeks
        .find((w) => w.id === fromWeekId)
        ?.days.find((d) => d.id === fromDayId);
      const toDay = s.weeks
        .find((w) => w.id === toWeekId)
        ?.days.find((d) => d.id === toDayId);
      if (!fromDay || !toDay) return s;
      const idx = fromDay.blocks.findIndex((b) => b.id === blockId);
      if (idx < 0) return s;
      const [block] = fromDay.blocks.splice(idx, 1);
      let insertAt = targetIndex;
      if (fromDay === toDay && idx < targetIndex) insertAt -= 1;
      insertAt = Math.max(0, Math.min(insertAt, toDay.blocks.length));
      toDay.blocks.splice(insertAt, 0, block);
      return s;
    });
  }

  function addBlock(weekId: string, dayId: string) {
    update((s) => {
      const d = s.weeks
        .find((w) => w.id === weekId)
        ?.days.find((x) => x.id === dayId);
      if (d) d.blocks.push(newBlock());
      return s;
    });
  }

  function removeBlock(weekId: string, dayId: string, blockId: string) {
    update((s) => {
      const d = s.weeks
        .find((w) => w.id === weekId)
        ?.days.find((x) => x.id === dayId);
      if (d) d.blocks = d.blocks.filter((b) => b.id !== blockId);
      return s;
    });
  }

  function addDay(weekId: string) {
    update((s) => {
      const w = s.weeks.find((x) => x.id === weekId);
      if (w) w.days.push(newDay(`Day ${w.days.length + 1}`));
      return s;
    });
  }

  function removeDay(weekId: string, dayId: string) {
    update((s) => {
      const w = s.weeks.find((x) => x.id === weekId);
      if (w) w.days = w.days.filter((d) => d.id !== dayId);
      return s;
    });
  }

  function renameDay(weekId: string, dayId: string, name: string) {
    update((s) => {
      const d = s.weeks
        .find((x) => x.id === weekId)
        ?.days.find((d) => d.id === dayId);
      if (d) d.name = name.slice(0, 80);
      return s;
    });
  }

  function addWeek() {
    update((s) => {
      s.weeks.push(newWeek(`Week ${s.weeks.length + 1}`));
      return s;
    });
  }

  function duplicateWeek(weekId: string) {
    update((s) => {
      const idx = s.weeks.findIndex((w) => w.id === weekId);
      if (idx < 0) return s;
      const src = s.weeks[idx];
      const copy: Week = {
        id: uid("wk"),
        name: `${src.name} (copy)`,
        days: src.days.map((d) => ({
          id: uid("day"),
          name: d.name,
          blocks: d.blocks.map((b) => ({
            id: uid("blk"),
            kind: b.kind,
            rows: b.rows.map((r) => ({ ...r, id: uid("row") })),
          })),
        })),
      };
      s.weeks.splice(idx + 1, 0, copy);
      return s;
    });
  }

  function removeWeek(weekId: string) {
    update((s) => {
      s.weeks = s.weeks.filter((w) => w.id !== weekId);
      return s;
    });
  }

  // ─── delete confirmation gating ─────────────────────────────────────────

  function weekHasContent(w: Week): boolean {
    return w.days.some((d) => d.blocks.some((b) => b.rows.length > 0));
  }
  function dayHasContent(d: Day): boolean {
    return d.blocks.some((b) => b.rows.length > 0);
  }

  function requestRemoveWeek(weekId: string) {
    const w = structure.weeks.find((x) => x.id === weekId);
    if (!w) return;
    if (weekHasContent(w)) {
      setPendingDelete({ kind: "week", weekId, label: w.name });
    } else {
      removeWeek(weekId);
    }
  }
  function requestRemoveDay(weekId: string, dayId: string) {
    const w = structure.weeks.find((x) => x.id === weekId);
    const d = w?.days.find((x) => x.id === dayId);
    if (!w || !d) return;
    if (dayHasContent(d)) {
      setPendingDelete({ kind: "day", weekId, dayId, label: d.name });
    } else {
      removeDay(weekId, dayId);
    }
  }
  function requestRemoveBlock(
    weekId: string,
    dayId: string,
    blockId: string,
  ) {
    const w = structure.weeks.find((x) => x.id === weekId);
    const d = w?.days.find((x) => x.id === dayId);
    const b = d?.blocks.find((x) => x.id === blockId);
    if (!b) return;
    if (b.rows.length > 0) {
      setPendingDelete({
        kind: "block",
        weekId,
        dayId,
        blockId,
        label: KIND_META[b.kind].label,
      });
    } else {
      removeBlock(weekId, dayId, blockId);
    }
  }
  function confirmDelete() {
    if (!pendingDelete) return;
    if (pendingDelete.kind === "week") removeWeek(pendingDelete.weekId);
    else if (pendingDelete.kind === "day")
      removeDay(pendingDelete.weekId, pendingDelete.dayId);
    else
      removeBlock(
        pendingDelete.weekId,
        pendingDelete.dayId,
        pendingDelete.blockId,
      );
    setPendingDelete(null);
  }

  // ─── save ────────────────────────────────────────────────────────────────

  function save() {
    setError(null);
    startTransition(async () => {
      const r = await saveProgramStructure(programId, structure);
      if (!r.ok) setError(r.error);
      else setSavedAt(new Date());
    });
  }

  // ─── render ──────────────────────────────────────────────────────────────

  return (
    <>
      {/* Mobile gate — DnD editor needs real estate */}
      <div className="md:hidden">
        <div className="rounded-xl border border-onyx-line bg-onyx-card p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Hammer size={20} />
          </div>
          <h2 className="text-[18px] font-semibold text-fg">
            The Forge needs more room.
          </h2>
          <p className="text-[13px] text-fg-2 max-w-xs mx-auto leading-relaxed">
            Drag-drop programming is a desktop tool. Open Onyx on a tablet,
            laptop, or larger to edit this program.
          </p>
          <Link
            href="/dashboard/forge"
            className="inline-flex items-center justify-center h-11 px-5 rounded-md border border-line-strong text-fg text-[14px] font-medium hover:border-primary hover:text-primary transition-colors"
          >
            ← Back to programs
          </Link>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* ── Exercise palette ─────────────────────────────────────────── */}
        <aside className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="onyx-label">Exercises</span>
            <span className="text-[11.5px] text-fg-3">
              {filteredExercises.length}
            </span>
          </div>
          <Input
            placeholder="Search exercises…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
          <ul className="rounded-lg border border-line max-h-[calc(100vh-220px)] overflow-y-auto divide-y divide-line">
            {filteredExercises.map((ex) => (
              <li
                key={ex.id}
                draggable
                onDragStart={(e) => setDrag(e, { kind: "exercise", ex })}
                className="px-3 py-2.5 cursor-grab active:cursor-grabbing hover:bg-card-2 rounded-md flex items-start gap-2"
                title="Drag onto a block to add it to the program"
              >
                <GripVertical
                  size={14}
                  className="text-fg-3 shrink-0 mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-fg truncate">{ex.name}</div>
                  <div className="text-[11.5px] text-fg-3 truncate mt-0.5">
                    {ex.primary_muscle ?? "—"} · {ex.equipment ?? "—"}
                  </div>
                </div>
              </li>
            ))}
            {filteredExercises.length === 0 && (
              <li className="p-4 text-[12.5px] text-fg-2 leading-relaxed">
                No exercises match your search. Try a different word.
              </li>
            )}
          </ul>
        </aside>

        {/* ── Canvas ───────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-[12px] text-fg-3">
                {pluralize(totals.weeks, "week", "weeks")} ·{" "}
                {pluralize(totals.days, "day", "days")} ·{" "}
                {pluralize(totals.exercises, "exercise", "exercises")}
              </div>
              <div className="flex p-1 rounded-md bg-fg/[.04] border border-line">
                <button
                  type="button"
                  onClick={() => setView("coach")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12.5px] font-medium transition-colors ${
                    view === "coach"
                      ? "bg-card text-fg shadow-soft"
                      : "text-fg-2 hover:text-fg"
                  }`}
                >
                  <Eye size={14} />
                  Coach view
                </button>
                <button
                  type="button"
                  onClick={() => setView("athlete")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12.5px] font-medium transition-colors ${
                    view === "athlete"
                      ? "bg-card text-fg shadow-soft"
                      : "text-fg-2 hover:text-fg"
                  }`}
                >
                  <User size={14} />
                  Athlete view
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {error && (
                <span className="text-[12px] text-rose">{error}</span>
              )}
              {!error && savedAt && (
                <span className="text-[12px] text-fg-3">
                  Saved {savedAt.toLocaleTimeString()}
                </span>
              )}
              {view === "coach" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addWeek}
                >
                  <Plus size={14} /> Add week
                </Button>
              )}
              <ApplyToClient programId={programId} clients={clients} />
              <Button
                type="button"
                variant="signal"
                size="md"
                onClick={save}
                disabled={pending}
              >
                <Save size={14} />
                {pending ? "Saving…" : "Save program"}
              </Button>
            </div>
          </div>

          {view === "athlete" ? (
            <AthletePreview structure={structure} />
          ) : structure.weeks.length === 0 ? (
            <EmptyState onAddWeek={addWeek} />
          ) : (
            <div className="space-y-8">
              {structure.weeks.map((w) => (
                <WeekCanvas
                  key={w.id}
                  week={w}
                  onAddDay={() => addDay(w.id)}
                  onRemoveDay={(dayId) => requestRemoveDay(w.id, dayId)}
                  onRenameDay={(dayId, n) => renameDay(w.id, dayId, n)}
                  onAddBlock={(dayId) => addBlock(w.id, dayId)}
                  onRemoveBlock={(dayId, blockId) =>
                    requestRemoveBlock(w.id, dayId, blockId)
                  }
                  onSetBlockKind={(dayId, blockId, kind) =>
                    setBlockKind(w.id, dayId, blockId, kind)
                  }
                  onDropOnBlock={(dayId, blockId, payload) => {
                    if (payload.kind === "exercise") {
                      addRowToBlock(w.id, dayId, blockId, newRow(payload.ex));
                    } else if (payload.kind === "row") {
                      moveRow(
                        payload.fromWeekId,
                        payload.fromDayId,
                        payload.fromBlockId,
                        payload.rowId,
                        w.id,
                        dayId,
                        blockId,
                      );
                    }
                  }}
                  onDropBlockAt={(dayId, targetIndex, payload) => {
                    if (payload.kind !== "block") return;
                    moveBlockTo(
                      payload.fromWeekId,
                      payload.fromDayId,
                      payload.blockId,
                      w.id,
                      dayId,
                      targetIndex,
                    );
                  }}
                  onDragBlockStart={(dayId, blockId, e) =>
                    setDrag(e, {
                      kind: "block",
                      blockId,
                      fromDayId: dayId,
                      fromWeekId: w.id,
                    })
                  }
                  onDragRowStart={(dayId, blockId, rowId, e) =>
                    setDrag(e, {
                      kind: "row",
                      rowId,
                      fromBlockId: blockId,
                      fromDayId: dayId,
                      fromWeekId: w.id,
                    })
                  }
                  onUpdateRow={(dayId, blockId, rowId, patch) =>
                    updateRow(w.id, dayId, blockId, rowId, patch)
                  }
                  onRemoveRow={(dayId, blockId, rowId) =>
                    removeRow(w.id, dayId, blockId, rowId)
                  }
                  onDuplicate={() => duplicateWeek(w.id)}
                  onRemoveWeek={() => requestRemoveWeek(w.id)}
                />
              ))}
              <button
                type="button"
                onClick={addWeek}
                className="w-full min-h-[120px] rounded-xl border border-dashed border-line text-fg-2 hover:border-primary hover:text-primary hover:bg-primary/[.04] flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={20} /> Add week
              </button>
            </div>
          )}
        </div>
      </div>

      {/* destructive confirmation */}
      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title={
          pendingDelete ? `Delete this ${pendingDelete.kind}?` : undefined
        }
        size="sm"
      >
        {pendingDelete && (
          <div className="space-y-5">
            <p className="text-[13px] text-fg-2 leading-relaxed">
              This removes &lsquo;{pendingDelete.label}&rsquo; and everything
              inside it. This can&apos;t be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={confirmDelete}
              >
                <Trash2 size={14} /> Delete {pendingDelete.kind}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

// ─── child components ────────────────────────────────────────────────────────

function EmptyState({ onAddWeek }: { onAddWeek: () => void }) {
  // TODO: template picker
  const steps = [
    "Add a week",
    "Drag exercises onto a block",
    "Save — clients see updates instantly",
  ];
  return (
    <div className="onyx-card p-8 md:p-10">
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Hammer size={28} strokeWidth={1.6} />
        </span>
        <div>
          <h3 className="onyx-headline text-[22px] text-fg">
            Let&apos;s build your program
          </h3>
          <p className="text-[13px] text-fg-2 max-w-md mx-auto mt-2 leading-relaxed">
            A program is made of weeks → days → blocks of exercises. Drag from
            the library on the left, or start with what you have.
          </p>
        </div>
      </div>
      <ol className="max-w-md mx-auto space-y-3 mb-8">
        {steps.map((step, i) => (
          <li
            key={i}
            className="flex items-center gap-3 text-[13px] text-fg-2"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-card-2 text-[11.5px] font-semibold text-fg">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-col items-center gap-3">
        <Button type="button" variant="signal" size="md" onClick={onAddWeek}>
          <Plus size={14} /> Add first week
        </Button>
      </div>
    </div>
  );
}

function WeekCanvas({
  week,
  onAddDay,
  onRemoveDay,
  onRenameDay,
  onAddBlock,
  onRemoveBlock,
  onSetBlockKind,
  onDropOnBlock,
  onDropBlockAt,
  onDragBlockStart,
  onDragRowStart,
  onUpdateRow,
  onRemoveRow,
  onDuplicate,
  onRemoveWeek,
}: {
  week: Week;
  onAddDay: () => void;
  onRemoveDay: (dayId: string) => void;
  onRenameDay: (dayId: string, name: string) => void;
  onAddBlock: (dayId: string) => void;
  onRemoveBlock: (dayId: string, blockId: string) => void;
  onSetBlockKind: (dayId: string, blockId: string, kind: BlockKind) => void;
  onDropOnBlock: (dayId: string, blockId: string, payload: DragPayload) => void;
  onDropBlockAt: (
    dayId: string,
    targetIndex: number,
    payload: DragPayload,
  ) => void;
  onDragBlockStart: (
    dayId: string,
    blockId: string,
    e: React.DragEvent,
  ) => void;
  onDragRowStart: (
    dayId: string,
    blockId: string,
    rowId: string,
    e: React.DragEvent,
  ) => void;
  onUpdateRow: (
    dayId: string,
    blockId: string,
    rowId: string,
    patch: Partial<ExerciseRow>,
  ) => void;
  onRemoveRow: (dayId: string, blockId: string, rowId: string) => void;
  onDuplicate: () => void;
  onRemoveWeek: () => void;
}) {
  return (
    <section className="onyx-card p-6">
      <div className="flex items-end justify-between mb-5">
        <div>
          <span className="onyx-label">Week</span>
          <h2 className="onyx-headline text-[24px] text-fg">{week.name}</h2>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAddDay}
          >
            <Plus size={14} /> Add day
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
          >
            Duplicate week
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onRemoveWeek}
          >
            <Trash2 size={14} /> Delete week
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {week.days.map((d) => (
          <DayCard
            key={d.id}
            day={d}
            onRename={(n) => onRenameDay(d.id, n)}
            onRemove={() => onRemoveDay(d.id)}
            onAddBlock={() => onAddBlock(d.id)}
            onRemoveBlock={(blockId) => onRemoveBlock(d.id, blockId)}
            onSetBlockKind={(blockId, kind) =>
              onSetBlockKind(d.id, blockId, kind)
            }
            onDropOnBlock={(blockId, payload) =>
              onDropOnBlock(d.id, blockId, payload)
            }
            onDropBlockAt={(targetIndex, payload) =>
              onDropBlockAt(d.id, targetIndex, payload)
            }
            onDragBlockStart={(blockId, e) =>
              onDragBlockStart(d.id, blockId, e)
            }
            onDragRowStart={(blockId, rowId, e) =>
              onDragRowStart(d.id, blockId, rowId, e)
            }
            onUpdateRow={(blockId, rowId, patch) =>
              onUpdateRow(d.id, blockId, rowId, patch)
            }
            onRemoveRow={(blockId, rowId) =>
              onRemoveRow(d.id, blockId, rowId)
            }
          />
        ))}
        <button
          type="button"
          onClick={onAddDay}
          className="rounded-lg border border-dashed border-line min-h-[200px] flex items-center justify-center gap-2 text-fg-2 hover:border-primary hover:text-primary hover:bg-primary/[.04] transition-colors"
        >
          <Plus size={20} /> Add day
        </button>
      </div>
    </section>
  );
}

function DayCard({
  day,
  onRename,
  onRemove,
  onAddBlock,
  onRemoveBlock,
  onSetBlockKind,
  onDropOnBlock,
  onDropBlockAt,
  onDragBlockStart,
  onDragRowStart,
  onUpdateRow,
  onRemoveRow,
}: {
  day: Day;
  onRename: (name: string) => void;
  onRemove: () => void;
  onAddBlock: () => void;
  onRemoveBlock: (blockId: string) => void;
  onSetBlockKind: (blockId: string, kind: BlockKind) => void;
  onDropOnBlock: (blockId: string, payload: DragPayload) => void;
  onDropBlockAt: (targetIndex: number, payload: DragPayload) => void;
  onDragBlockStart: (blockId: string, e: React.DragEvent) => void;
  onDragRowStart: (blockId: string, rowId: string, e: React.DragEvent) => void;
  onUpdateRow: (
    blockId: string,
    rowId: string,
    patch: Partial<ExerciseRow>,
  ) => void;
  onRemoveRow: (blockId: string, rowId: string) => void;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex items-center gap-2">
        <input
          value={day.name}
          onChange={(e) => onRename(e.target.value)}
          className="flex-1 bg-transparent text-[15px] font-semibold text-fg border-b border-transparent hover:border-line focus:border-primary focus:outline-none px-1 py-0.5"
        />
        <button
          type="button"
          onClick={onRemove}
          title="Delete day"
          className="text-fg-3 hover:text-rose hover:bg-rose/10 rounded-md p-1 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {day.blocks.map((b, i) => (
          <div key={b.id}>
            <BlockDropLine onDrop={(p) => onDropBlockAt(i, p)} />
            <BlockCard
              block={b}
              onSetKind={(kind) => onSetBlockKind(b.id, kind)}
              onRemove={() => onRemoveBlock(b.id)}
              onDrop={(payload) => onDropOnBlock(b.id, payload)}
              onDragStart={(e) => onDragBlockStart(b.id, e)}
              onDragRowStart={(rowId, e) => onDragRowStart(b.id, rowId, e)}
              onUpdateRow={(rowId, patch) => onUpdateRow(b.id, rowId, patch)}
              onRemoveRow={(rowId) => onRemoveRow(b.id, rowId)}
            />
          </div>
        ))}
        <BlockDropLine onDrop={(p) => onDropBlockAt(day.blocks.length, p)} />

        <button
          type="button"
          onClick={onAddBlock}
          className="w-full h-11 rounded-md border border-dashed border-line text-fg-2 hover:border-primary hover:text-primary hover:bg-primary/[.04] flex items-center justify-center gap-2 text-[13px] font-medium transition-colors"
        >
          <Plus size={14} /> Add block
        </button>
      </div>
    </div>
  );
}

function BlockDropLine({ onDrop }: { onDrop: (payload: DragPayload) => void }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragEnter={(e) => {
        // only react to block drags — exercise/row drops belong to the block itself
        if (e.dataTransfer.types.includes("text/plain")) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const p = readDrag(e);
        if (p && p.kind === "block") onDrop(p);
      }}
      className={`transition-all ${
        over ? "h-2 bg-primary/60 rounded-full mx-2" : "h-1.5"
      }`}
    />
  );
}

function BlockCard({
  block,
  onSetKind,
  onRemove,
  onDrop,
  onDragStart,
  onDragRowStart,
  onUpdateRow,
  onRemoveRow,
}: {
  block: Block;
  onSetKind: (kind: BlockKind) => void;
  onRemove: () => void;
  onDrop: (payload: DragPayload) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragRowStart: (rowId: string, e: React.DragEvent) => void;
  onUpdateRow: (rowId: string, patch: Partial<ExerciseRow>) => void;
  onRemoveRow: (rowId: string) => void;
}) {
  const [over, setOver] = useState(false);
  const meta = KIND_META[block.kind];

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const p = readDrag(e);
        // Block drops are handled by the surrounding BlockDropLines.
        if (p && p.kind !== "block") onDrop(p);
      }}
      className={`rounded-md bg-card p-3 transition-colors group ${
        meta.leftBorder
      } ${
        over
          ? "ring-2 ring-primary/15 bg-primary/[.04]"
          : "border-y border-r border-line"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            draggable
            onDragStart={onDragStart}
            className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-fg/[.04]"
            title="Drag to reorder this block"
          >
            <GripVertical
              size={16}
              className="text-fg-3 group-hover:text-fg-2"
            />
          </div>
          <BlockKindSelector kind={block.kind} onChange={onSetKind} />
        </div>
        <button
          type="button"
          onClick={onRemove}
          onMouseDown={(e) => e.stopPropagation()}
          draggable={false}
          className="text-fg-3 hover:text-rose hover:bg-rose/10 rounded-md p-1 transition-colors"
          title="Delete block"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {block.rows.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center py-6 gap-1.5 min-h-[88px] rounded-md border border-dashed transition-all ${
            over
              ? "border-primary border-[1.5px] bg-primary/[.06] ring-2 ring-primary/15 rounded-lg"
              : "border-line bg-card-2/40"
          }`}
        >
          <Plus size={18} className="text-fg-3" />
          <span className="text-[13px] text-fg-2">Drop an exercise here</span>
          <span className="text-[12px] text-fg-3">
            or pick from the library on the left
          </span>
        </div>
      ) : (
        <ul className="space-y-2">
          {block.rows.map((r) => (
            <RowCard
              key={r.id}
              row={r}
              onDragStart={(e) => onDragRowStart(r.id, e)}
              onUpdate={(patch) => onUpdateRow(r.id, patch)}
              onRemove={() => onRemoveRow(r.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function BlockKindSelector({
  kind,
  onChange,
}: {
  kind: BlockKind;
  onChange: (k: BlockKind) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const meta = KIND_META[kind];
  const Icon = meta.icon;

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseDown={(e) => e.stopPropagation()}
        draggable={false}
        className={`inline-flex items-center gap-2 h-8 px-3 rounded-full border ${meta.pill}`}
      >
        <Icon size={14} />
        <span className="text-[12.5px] font-semibold">{meta.label}</span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute z-20 left-0 top-full mt-2 w-[260px] rounded-lg border border-line bg-card shadow-lift p-1">
          {KIND_ORDER.map((k) => {
            const m = KIND_META[k];
            const KIcon = m.icon;
            const active = k === kind;
            return (
              <button
                key={k}
                type="button"
                onClick={() => {
                  onChange(k);
                  setOpen(false);
                }}
                className="w-full flex items-start gap-3 p-3 rounded-md hover:bg-card-2 text-left"
              >
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-md shrink-0 ${m.square}`}
                >
                  <KIcon size={14} />
                </span>
                <span className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-fg">
                    {m.label}
                  </div>
                  <div className="text-[11.5px] text-fg-2 leading-snug mt-0.5">
                    {m.description}
                  </div>
                </span>
                {active && (
                  <Check size={14} className="text-primary mt-1 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RowCard({
  row,
  onDragStart,
  onUpdate,
  onRemove,
}: {
  row: ExerciseRow;
  onDragStart: (e: React.DragEvent) => void;
  onUpdate: (patch: Partial<ExerciseRow>) => void;
  onRemove: () => void;
}) {
  const [showNote, setShowNote] = useState<boolean>(row.notes != null);

  function handleDelete() {
    if (row.notes && row.notes.trim().length > 0) {
      const ok = window.confirm(
        `Delete "${row.name}"? The note attached to it will be lost.`,
      );
      if (!ok) return;
    }
    onRemove();
  }

  return (
    <li className="rounded-md bg-card-2 p-2.5 group">
      <div className="flex items-start gap-2">
        <div
          draggable
          onDragStart={onDragStart}
          className="w-7 shrink-0 flex items-start justify-center pt-1 cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical
            size={16}
            className="text-fg-3 group-hover:text-fg-2"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-medium text-fg truncate">
            {row.name}
          </div>
          {!showNote && (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="text-[12px] text-fg-3 hover:text-primary mt-0.5"
            >
              + Add note
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="text-fg-3 hover:text-rose hover:bg-rose/10 rounded-md p-1 transition-colors shrink-0"
          title="Delete exercise"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pl-9">
        <SetsStepper
          value={row.sets}
          onChange={(v) => onUpdate({ sets: Math.max(1, Math.min(100, v)) })}
        />
        <RepsField
          value={row.reps}
          onChange={(v) => onUpdate({ reps: v.slice(0, 30) })}
        />
        <RpeSelect
          value={row.rpe ?? null}
          onChange={(v) => onUpdate({ rpe: v })}
        />
        <RestStepper
          value={row.rest_sec ?? 0}
          onChange={(v) => onUpdate({ rest_sec: v })}
        />
      </div>

      {showNote && (
        <div className="mt-2 pl-9">
          <input
            type="text"
            value={row.notes ?? ""}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Cue or coaching note (optional)"
            className="w-full h-9 rounded-md border border-line bg-card-2 px-2 text-[13px] text-fg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}
    </li>
  );
}

const FIELD_INPUT =
  "h-9 rounded-md border border-line bg-card-2 px-2 text-[13px] text-fg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
const FIELD_LABEL = "text-[11.5px] font-medium text-fg-2";

function SetsStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={FIELD_LABEL}>Sets</span>
      <div className="flex">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="h-9 w-7 rounded-l-md border border-line border-r-0 bg-card-2 text-fg-2 hover:text-fg hover:bg-card text-[13px]"
          aria-label="Decrease sets"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 1)}
          className="h-9 w-full min-w-0 border-y border-line bg-card-2 px-1 text-center text-[13px] text-fg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(100, value + 1))}
          className="h-9 w-7 rounded-r-md border border-line border-l-0 bg-card-2 text-fg-2 hover:text-fg hover:bg-card text-[13px]"
          aria-label="Increase sets"
        >
          +
        </button>
      </div>
    </label>
  );
}

function RepsField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={FIELD_LABEL}>Reps</span>
      <input
        type="text"
        value={value}
        placeholder="e.g. 8–12"
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD_INPUT} w-full`}
      />
    </label>
  );
}

const RPE_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: "—", value: null },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "7.5", value: 7.5 },
  { label: "8", value: 8 },
  { label: "8.5", value: 8.5 },
  { label: "9", value: 9 },
  { label: "9.5", value: 9.5 },
  { label: "10", value: 10 },
];

function RpeSelect({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const current = value == null ? "—" : String(value);
  return (
    <label className="flex flex-col gap-1">
      <span className={`${FIELD_LABEL} flex items-center gap-1`}>
        RPE
        <span
          title="Rate of Perceived Exertion. 8 = could do 2 more reps. 10 = absolute max."
          className="inline-flex"
          aria-label="Rate of Perceived Exertion. 8 = could do 2 more reps. 10 = absolute max."
        >
          <Info size={13} className="text-fg-3" />
        </span>
      </span>
      <div className="relative">
        <select
          value={current}
          onChange={(e) => {
            const lbl = e.target.value;
            const opt = RPE_OPTIONS.find((o) => o.label === lbl);
            onChange(opt ? opt.value : null);
          }}
          className={`${FIELD_INPUT} w-full appearance-none pr-7 cursor-pointer`}
        >
          {RPE_OPTIONS.map((o) => (
            <option key={o.label} value={o.label} className="bg-card">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-fg-3"
        />
      </div>
    </label>
  );
}

function RestStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={FIELD_LABEL}>Rest</span>
      <div className="relative">
        <input
          type="number"
          step={5}
          min={0}
          value={value}
          onChange={(e) =>
            onChange(Math.max(0, Number(e.target.value) || 0))
          }
          className={`${FIELD_INPUT} w-full pr-6`}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-fg-3 pointer-events-none">
          s
        </span>
      </div>
    </label>
  );
}
