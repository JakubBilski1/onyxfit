"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProgramStructure } from "../actions";
import {
  BLOCK_KINDS,
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

// ─── DnD payload ─────────────────────────────────────────────────────────────
//
// Two payload shapes go through dataTransfer:
//   { kind: "exercise", exerciseId, name, ... }
//   { kind: "row", rowId, fromBlockId, fromDayId, fromWeekId }
//
// We always set both as JSON under "application/x-onyx" and a plain-text
// fallback so the browser doesn't think the drag is empty.

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

  // ─── mutations ──────────────────────────────────────────────────────────

  function update(fn: (prev: ProgramStructure) => ProgramStructure) {
    setStructure((prev) => fn(structuredClone(prev)));
  }

  function addRowToBlock(weekId: string, dayId: string, blockId: string, row: ExerciseRow) {
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

  function removeRow(weekId: string, dayId: string, blockId: string, rowId: string) {
    update((s) => {
      const b = s.weeks
        .find((w) => w.id === weekId)
        ?.days.find((d) => d.id === dayId)
        ?.blocks.find((b) => b.id === blockId);
      if (b) b.rows = b.rows.filter((r) => r.id !== rowId);
      return s;
    });
  }

  function cycleBlockKind(weekId: string, dayId: string, blockId: string) {
    update((s) => {
      const b = s.weeks
        .find((w) => w.id === weekId)
        ?.days.find((d) => d.id === dayId)
        ?.blocks.find((b) => b.id === blockId);
      if (!b) return s;
      const i = BLOCK_KINDS.indexOf(b.kind);
      b.kind = BLOCK_KINDS[(i + 1) % BLOCK_KINDS.length] as BlockKind;
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
      // Adjust target index if we're moving inside the same day past the
      // original slot.
      let insertAt = targetIndex;
      if (fromDay === toDay && idx < targetIndex) insertAt -= 1;
      insertAt = Math.max(0, Math.min(insertAt, toDay.blocks.length));
      toDay.blocks.splice(insertAt, 0, block);
      return s;
    });
  }

  function addBlock(weekId: string, dayId: string) {
    update((s) => {
      const d = s.weeks.find((w) => w.id === weekId)?.days.find((x) => x.id === dayId);
      if (d) d.blocks.push(newBlock());
      return s;
    });
  }

  function removeBlock(weekId: string, dayId: string, blockId: string) {
    update((s) => {
      const d = s.weeks.find((w) => w.id === weekId)?.days.find((x) => x.id === dayId);
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
      const d = s.weeks.find((x) => x.id === weekId)?.days.find((d) => d.id === dayId);
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
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      {/* ── Exercise palette ─────────────────────────────────────────────── */}
      <aside className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="onyx-label">Exercise library</span>
          <span className="font-mono text-[10px] text-onyx-dim">{filteredExercises.length}</span>
        </div>
        <Input
          placeholder="Search by name, muscle, equipment…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
        <ul className="border border-onyx-line max-h-[640px] overflow-y-auto divide-y divide-onyx-line">
          {filteredExercises.map((ex) => (
            <li
              key={ex.id}
              draggable
              onDragStart={(e) => setDrag(e, { kind: "exercise", ex })}
              className="p-3 cursor-grab active:cursor-grabbing hover:bg-white/[0.03]"
              title="Drag onto a block"
            >
              <div className="text-[13px] text-onyx-bone truncate">{ex.name}</div>
              <div className="font-mono text-[10px] text-onyx-dim truncate">
                {ex.primary_muscle ?? "—"} · {ex.equipment ?? "—"}
              </div>
            </li>
          ))}
          {filteredExercises.length === 0 && (
            <li className="p-4 text-[12px] text-onyx-mute">No matches.</li>
          )}
        </ul>
      </aside>

      {/* ── Canvas ───────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="font-mono text-[11px] text-onyx-dim">
              {structure.weeks.length} weeks ·{" "}
              {structure.weeks.reduce((s, w) => s + w.days.length, 0)} days ·{" "}
              {structure.weeks.reduce(
                (s, w) =>
                  s +
                  w.days.reduce(
                    (sd, d) =>
                      sd + d.blocks.reduce((sb, b) => sb + b.rows.length, 0),
                    0,
                  ),
                0,
              )}{" "}
              exercises
            </div>
            <div className="flex border border-onyx-line">
              <button
                type="button"
                onClick={() => setView("coach")}
                className={`px-3 py-1 text-[10px] font-mono tracking-widest ${
                  view === "coach"
                    ? "bg-onyx-amber text-onyx-ink"
                    : "text-onyx-mute hover:text-onyx-bone"
                }`}
              >
                COACH
              </button>
              <button
                type="button"
                onClick={() => setView("athlete")}
                className={`px-3 py-1 text-[10px] font-mono tracking-widest ${
                  view === "athlete"
                    ? "bg-onyx-amber text-onyx-ink"
                    : "text-onyx-mute hover:text-onyx-bone"
                }`}
              >
                ATHLETE
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {error && <span className="text-[12px] font-mono text-onyx-red">{error}</span>}
            {!error && savedAt && (
              <span className="text-[11px] font-mono text-onyx-dim">
                saved {savedAt.toLocaleTimeString()}
              </span>
            )}
            {view === "coach" && (
              <Button type="button" variant="ghost" size="sm" onClick={addWeek}>
                + Week
              </Button>
            )}
            <ApplyToClient programId={programId} clients={clients} />
            <Button type="button" variant="signal" size="sm" onClick={save} disabled={pending}>
              {pending ? "Saving…" : "Save snapshot"}
            </Button>
          </div>
        </div>

        {view === "athlete" ? (
          <AthletePreview structure={structure} />
        ) : structure.weeks.length === 0 ? (
          <div className="onyx-card p-10 text-center">
            <span className="onyx-label">Empty canvas</span>
            <p className="text-[13px] text-onyx-mute mt-3 max-w-md mx-auto">
              Add a week to start. Then drag exercises from the left panel
              onto a block.
            </p>
            <Button
              type="button"
              variant="signal"
              size="md"
              onClick={addWeek}
              className="mt-6"
            >
              + First week
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {structure.weeks.map((w) => (
              <WeekCanvas
                key={w.id}
                week={w}
                onAddDay={() => addDay(w.id)}
                onRemoveDay={(dayId) => removeDay(w.id, dayId)}
                onRenameDay={(dayId, n) => renameDay(w.id, dayId, n)}
                onAddBlock={(dayId) => addBlock(w.id, dayId)}
                onRemoveBlock={(dayId, blockId) => removeBlock(w.id, dayId, blockId)}
                onCycleBlockKind={(dayId, blockId) =>
                  cycleBlockKind(w.id, dayId, blockId)
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
                onRemoveWeek={() => removeWeek(w.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── child components ────────────────────────────────────────────────────────

function WeekCanvas({
  week,
  onAddDay,
  onRemoveDay,
  onRenameDay,
  onAddBlock,
  onRemoveBlock,
  onCycleBlockKind,
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
  onCycleBlockKind: (dayId: string, blockId: string) => void;
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
          <h2 className="onyx-display text-3xl text-onyx-bone mt-1">{week.name}</h2>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onAddDay}>+ Day</Button>
          <Button type="button" variant="ghost" size="sm" onClick={onDuplicate}>Duplicate week</Button>
          <Button type="button" variant="danger" size="sm" onClick={onRemoveWeek}>Delete week</Button>
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
            onCycleBlockKind={(blockId) => onCycleBlockKind(d.id, blockId)}
            onDropOnBlock={(blockId, payload) => onDropOnBlock(d.id, blockId, payload)}
            onDropBlockAt={(targetIndex, payload) =>
              onDropBlockAt(d.id, targetIndex, payload)
            }
            onDragBlockStart={(blockId, e) => onDragBlockStart(d.id, blockId, e)}
            onDragRowStart={(blockId, rowId, e) =>
              onDragRowStart(d.id, blockId, rowId, e)
            }
            onUpdateRow={(blockId, rowId, patch) =>
              onUpdateRow(d.id, blockId, rowId, patch)
            }
            onRemoveRow={(blockId, rowId) => onRemoveRow(d.id, blockId, rowId)}
          />
        ))}
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
  onCycleBlockKind,
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
  onCycleBlockKind: (blockId: string) => void;
  onDropOnBlock: (blockId: string, payload: DragPayload) => void;
  onDropBlockAt: (targetIndex: number, payload: DragPayload) => void;
  onDragBlockStart: (blockId: string, e: React.DragEvent) => void;
  onDragRowStart: (blockId: string, rowId: string, e: React.DragEvent) => void;
  onUpdateRow: (blockId: string, rowId: string, patch: Partial<ExerciseRow>) => void;
  onRemoveRow: (blockId: string, rowId: string) => void;
}) {
  return (
    <div className="border border-onyx-line bg-[#0e0e0e] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={day.name}
          onChange={(e) => onRename(e.target.value)}
          className="flex-1 bg-transparent text-[14px] text-onyx-bone border-b border-transparent hover:border-onyx-line focus:border-onyx-amber focus:outline-none px-1 py-0.5"
        />
        <button
          type="button"
          onClick={onRemove}
          title="Remove day"
          className="text-[10px] font-mono text-onyx-dim hover:text-onyx-red"
        >
          ✕
        </button>
      </div>

      <div>
        {day.blocks.map((b, i) => (
          <div key={b.id}>
            <BlockDropLine onDrop={(p) => onDropBlockAt(i, p)} />
            <BlockCard
              block={b}
              onCycleKind={() => onCycleBlockKind(b.id)}
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
      </div>

      <button
        type="button"
        onClick={onAddBlock}
        className="w-full py-2 border border-dashed border-onyx-line hover:border-onyx-amber text-[10px] font-mono tracking-widest text-onyx-dim hover:text-onyx-amber"
      >
        + BLOCK
      </button>
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
      className={`h-2 my-1 transition-all ${
        over ? "h-3 bg-onyx-amber/60" : ""
      }`}
    />
  );
}

function BlockCard({
  block,
  onCycleKind,
  onRemove,
  onDrop,
  onDragStart,
  onDragRowStart,
  onUpdateRow,
  onRemoveRow,
}: {
  block: Block;
  onCycleKind: () => void;
  onRemove: () => void;
  onDrop: (payload: DragPayload) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragRowStart: (rowId: string, e: React.DragEvent) => void;
  onUpdateRow: (rowId: string, patch: Partial<ExerciseRow>) => void;
  onRemoveRow: (rowId: string) => void;
}) {
  const [over, setOver] = useState(false);

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
        // Block drops are handled by the surrounding BlockDropLines, not the
        // block itself — ignore them here so they don't fall into the block as
        // a row.
        if (p && p.kind !== "block") onDrop(p);
      }}
      className={`border ${
        over ? "border-onyx-amber bg-onyx-amber/5" : "border-onyx-line"
      } bg-[#0a0a0a] p-3 transition-colors`}
    >
      <div
        draggable
        onDragStart={onDragStart}
        className="flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing select-none"
        title="Drag from here to reorder"
      >
        <span className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-onyx-dim">⋮⋮</span>
          <button
            type="button"
            onClick={onCycleKind}
            onMouseDown={(e) => e.stopPropagation()}
            draggable={false}
            className="font-mono text-[10px] tracking-[0.32em] text-onyx-amber hover:text-onyx-bone"
            title="Click to cycle through STRAIGHT / SUPERSET / DROPSET / CIRCUIT"
          >
            {block.kind}
          </button>
        </span>
        <button
          type="button"
          onClick={onRemove}
          onMouseDown={(e) => e.stopPropagation()}
          draggable={false}
          className="text-[10px] font-mono text-onyx-dim hover:text-onyx-red"
          title="Remove block"
        >
          ✕
        </button>
      </div>

      {block.rows.length === 0 ? (
        <p className="text-[11px] font-mono text-onyx-dim text-center py-3 italic">
          drop an exercise here
        </p>
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
  return (
    <li
      draggable
      onDragStart={onDragStart}
      className="border border-onyx-line p-2 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[12px] text-onyx-bone truncate">{row.name}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[10px] font-mono text-onyx-dim hover:text-onyx-red shrink-0"
        >
          ✕
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
        <NumField
          label="sets"
          value={row.sets}
          onChange={(v) => onUpdate({ sets: Math.max(1, Math.min(100, v || 1)) })}
        />
        <TextField
          label="reps"
          value={row.reps}
          onChange={(v) => onUpdate({ reps: v.slice(0, 30) })}
        />
        <NumField
          label="rpe"
          value={row.rpe ?? ""}
          step={0.5}
          onChange={(v) => onUpdate({ rpe: Number.isNaN(v) ? null : v })}
        />
        <NumField
          label="rest"
          value={row.rest_sec ?? ""}
          onChange={(v) => onUpdate({ rest_sec: Number.isNaN(v) ? null : Math.max(0, v) })}
        />
      </div>
    </li>
  );
}

function NumField({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number | string;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="flex flex-col">
      <span className="text-[9px] uppercase tracking-widest text-onyx-dim">{label}</span>
      <input
        type="number"
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-transparent border-b border-onyx-line text-onyx-bone focus:border-onyx-amber focus:outline-none px-0.5 py-0.5"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col">
      <span className="text-[9px] uppercase tracking-widest text-onyx-dim">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-b border-onyx-line text-onyx-bone focus:border-onyx-amber focus:outline-none px-0.5 py-0.5"
      />
    </label>
  );
}
