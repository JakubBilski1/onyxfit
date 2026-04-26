// Forge program structure — persisted into programs.metadata (jsonb).
// Local-only fields (`id`) are uuids generated client-side, used as React keys
// and dnd identifiers. They are never read by SQL.

export type ExerciseRow = {
  id: string;
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;          // "8" or "8-12"
  rpe?: number | null;
  rest_sec?: number | null;
  notes?: string | null;
};

export type BlockKind = "STRAIGHT" | "SUPERSET" | "DROPSET" | "CIRCUIT";

export type Block = {
  id: string;
  kind: BlockKind;
  rows: ExerciseRow[];
};

export type Day = {
  id: string;
  name: string;
  blocks: Block[];
};

export type Week = {
  id: string;
  name: string;
  days: Day[];
};

export type ProgramStructure = {
  weeks: Week[];
};

export const EMPTY_STRUCTURE: ProgramStructure = { weeks: [] };

export const BLOCK_KINDS: BlockKind[] = [
  "STRAIGHT",
  "SUPERSET",
  "DROPSET",
  "CIRCUIT",
];

export type ExerciseLite = {
  id: string;
  name: string;
  primary_muscle: string | null;
  equipment: string | null;
  source: "global" | "wger" | "custom";
};
