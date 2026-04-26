"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActiveCoach } from "@/lib/auth";
import {
  BLOCK_KINDS,
  type ProgramStructure,
  type Block,
  type Day,
  type Week,
  type ExerciseRow,
} from "./types";

export type ActionResult = { ok: true } | { ok: false; error: string };

const NAME_MAX = 120;
const GOAL_MAX = 60;

export async function createProgram(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await requireActiveCoach();

  const name = (formData.get("name") ?? "").toString().trim();
  const weeks = Number(formData.get("weeks") ?? 4);
  const daysRaw = formData.get("days_per_week")?.toString().trim();
  const goal = (formData.get("goal") ?? "").toString().trim();
  const isTemplate = formData.get("is_template") === "on";

  if (!name) return { ok: false, error: "Name required." };
  if (name.length > NAME_MAX) return { ok: false, error: `Name ≤${NAME_MAX} chars.` };
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > 52) {
    return { ok: false, error: "Weeks must be 1–52." };
  }
  const daysPerWeek = daysRaw ? Number(daysRaw) : null;
  if (daysPerWeek != null && (!Number.isInteger(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7)) {
    return { ok: false, error: "Days per week must be 1–7." };
  }
  if (goal.length > GOAL_MAX) return { ok: false, error: `Goal ≤${GOAL_MAX} chars.` };

  const { data, error } = await supabase
    .from("programs")
    .insert({
      coach_id: user.id,
      name,
      weeks,
      days_per_week: daysPerWeek,
      goal: goal || null,
      is_template: isTemplate,
      metadata: { weeks: [] },
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/forge");
  redirect(`/dashboard/forge/${data.id}`);
}

// ─── custom exercises ──────────────────────────────────────────────────────

export type AddExerciseResult =
  | { ok: true; id: string; name: string }
  | { ok: false; error: string };

export async function addCustomExercise(
  _prev: AddExerciseResult | null,
  formData: FormData,
): Promise<AddExerciseResult> {
  const { supabase, user } = await requireActiveCoach();

  const name = (formData.get("name") ?? "").toString().trim();
  const primaryMuscle = (formData.get("primary_muscle") ?? "").toString().trim();
  const equipment = (formData.get("equipment") ?? "").toString().trim();
  const videoUrl = (formData.get("video_url") ?? "").toString().trim();

  if (!name) return { ok: false, error: "Name required." };
  if (name.length > 120) return { ok: false, error: "Name too long (≤120)." };
  if (primaryMuscle.length > 60) return { ok: false, error: "Primary muscle too long." };
  if (equipment.length > 60) return { ok: false, error: "Equipment too long." };
  if (videoUrl && !/^https?:\/\//i.test(videoUrl)) {
    return { ok: false, error: "Video URL must start with http(s)://" };
  }
  if (videoUrl.length > 500) return { ok: false, error: "URL too long." };

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      source: "custom",
      owner_coach_id: user.id,
      name,
      primary_muscle: primaryMuscle || null,
      equipment: equipment || null,
      video_url: videoUrl || null,
    })
    .select("id, name")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/forge");
  return { ok: true, id: data.id, name: data.name };
}

// ─── apply program to client ───────────────────────────────────────────────

export type ApplyResult =
  | { ok: true; assignment_id: string; program_id: string }
  | { ok: false; error: string };

export async function applyProgramToClient(
  programId: string,
  clientId: string,
  startsOn: string,
): Promise<ApplyResult> {
  if (!programId) return { ok: false, error: "Missing program id." };
  if (!clientId) return { ok: false, error: "Missing client id." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startsOn)) {
    return { ok: false, error: "Invalid start date." };
  }
  const { supabase, user } = await requireActiveCoach();

  // 1. Verify caller owns this client.
  const { data: link } = await supabase
    .from("coaches_clients")
    .select("client_id, client:clients(full_name)")
    .eq("coach_id", user.id)
    .eq("client_id", clientId)
    .eq("active", true)
    .maybeSingle();
  if (!link) return { ok: false, error: "Not your client." };

  // 2. Fetch source program (must be coach's own).
  const { data: source, error: srcErr } = await supabase
    .from("programs")
    .select("id, name, weeks, days_per_week, goal, metadata, is_template")
    .eq("id", programId)
    .eq("coach_id", user.id)
    .maybeSingle();
  if (srcErr) return { ok: false, error: srcErr.message };
  if (!source) return { ok: false, error: "Program not found." };

  // 3. Clone (always — instances are independent of templates).
  const clientName =
    (link as any).client?.full_name ?? "athlete";
  const { data: cloned, error: cloneErr } = await supabase
    .from("programs")
    .insert({
      coach_id: user.id,
      name: source.is_template
        ? `${source.name} · ${clientName}`
        : `${source.name} (copy)`,
      weeks: source.weeks,
      days_per_week: source.days_per_week,
      goal: source.goal,
      is_template: false,
      metadata: source.metadata ?? { weeks: [] },
    })
    .select("id")
    .single();
  if (cloneErr) return { ok: false, error: cloneErr.message };

  // 4. Create assignment.
  const { data: assign, error: asgErr } = await supabase
    .from("program_assignments")
    .insert({
      program_id: cloned.id,
      client_id: clientId,
      coach_id: user.id,
      starts_on: startsOn,
      active: true,
    })
    .select("id")
    .single();
  if (asgErr) {
    // best-effort rollback of the clone
    await supabase.from("programs").delete().eq("id", cloned.id);
    return { ok: false, error: asgErr.message };
  }

  revalidatePath("/dashboard/forge");
  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  return { ok: true, assignment_id: assign.id, program_id: cloned.id };
}

export async function deleteProgram(programId: string): Promise<ActionResult> {
  if (!programId) return { ok: false, error: "Missing program id." };
  const { supabase, user } = await requireActiveCoach();
  const { error } = await supabase
    .from("programs")
    .delete()
    .eq("id", programId)
    .eq("coach_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/forge");
  return { ok: true };
}

// ─── structure validation ──────────────────────────────────────────────────

function validateStructure(input: unknown): ProgramStructure | string {
  if (!input || typeof input !== "object") return "structure must be an object";
  const root = input as { weeks?: unknown };
  if (!Array.isArray(root.weeks)) return "structure.weeks must be an array";
  if (root.weeks.length > 52) return "max 52 weeks";

  const weeks: Week[] = [];
  for (const w of root.weeks) {
    if (!w || typeof w !== "object") return "malformed week";
    const wo = w as Partial<Week>;
    if (typeof wo.id !== "string" || typeof wo.name !== "string") return "week missing id/name";
    if (!Array.isArray(wo.days)) return "week.days must be an array";
    if (wo.days.length > 7) return "max 7 days per week";

    const days: Day[] = [];
    for (const d of wo.days) {
      if (!d || typeof d !== "object") return "malformed day";
      const dd = d as Partial<Day>;
      if (typeof dd.id !== "string" || typeof dd.name !== "string") return "day missing id/name";
      if (!Array.isArray(dd.blocks)) return "day.blocks must be an array";
      if (dd.blocks.length > 50) return "max 50 blocks per day";

      const blocks: Block[] = [];
      for (const b of dd.blocks) {
        if (!b || typeof b !== "object") return "malformed block";
        const bb = b as Partial<Block>;
        if (typeof bb.id !== "string") return "block missing id";
        if (!BLOCK_KINDS.includes(bb.kind as any)) return `invalid block.kind: ${bb.kind}`;
        if (!Array.isArray(bb.rows)) return "block.rows must be an array";
        if (bb.rows.length > 30) return "max 30 rows per block";

        const rows: ExerciseRow[] = [];
        for (const r of bb.rows) {
          if (!r || typeof r !== "object") return "malformed row";
          const rr = r as Partial<ExerciseRow>;
          if (typeof rr.id !== "string") return "row missing id";
          if (typeof rr.exerciseId !== "string" || rr.exerciseId.length === 0)
            return "row missing exerciseId";
          if (typeof rr.name !== "string") return "row missing name";
          const sets = Number(rr.sets);
          if (!Number.isInteger(sets) || sets < 1 || sets > 100)
            return "row.sets must be 1–100";
          const reps = String(rr.reps ?? "");
          if (reps.length > 30) return "row.reps too long";
          const rpe = rr.rpe == null ? null : Number(rr.rpe);
          if (rpe != null && (Number.isNaN(rpe) || rpe < 0 || rpe > 10))
            return "row.rpe must be 0–10";
          const restSec = rr.rest_sec == null ? null : Number(rr.rest_sec);
          if (restSec != null && (!Number.isInteger(restSec) || restSec < 0 || restSec > 3600))
            return "row.rest_sec must be 0–3600";
          const notes = rr.notes == null ? null : String(rr.notes);
          if (notes != null && notes.length > 500) return "row.notes too long";

          rows.push({
            id: rr.id,
            exerciseId: rr.exerciseId,
            name: rr.name.slice(0, 120),
            sets,
            reps,
            rpe,
            rest_sec: restSec,
            notes,
          });
        }
        blocks.push({ id: bb.id, kind: bb.kind as Block["kind"], rows });
      }
      days.push({ id: dd.id, name: dd.name.slice(0, 80), blocks });
    }
    weeks.push({ id: wo.id, name: wo.name.slice(0, 80), days });
  }

  return { weeks };
}

export async function saveProgramStructure(
  programId: string,
  structure: unknown,
): Promise<ActionResult> {
  if (!programId) return { ok: false, error: "Missing program id." };
  const { supabase, user } = await requireActiveCoach();

  const validated = validateStructure(structure);
  if (typeof validated === "string") return { ok: false, error: validated };

  // Verify all referenced exerciseIds exist (and are global or owned by coach).
  const ids = Array.from(
    new Set(
      validated.weeks.flatMap((w) =>
        w.days.flatMap((d) => d.blocks.flatMap((b) => b.rows.map((r) => r.exerciseId))),
      ),
    ),
  );
  if (ids.length > 0) {
    const { data: found, error: exErr } = await supabase
      .from("exercises")
      .select("id")
      .in("id", ids);
    if (exErr) return { ok: false, error: exErr.message };
    const foundIds = new Set((found ?? []).map((r: { id: string }) => r.id));
    const missing = ids.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      return { ok: false, error: `Unknown exercises: ${missing.length}` };
    }
  }

  const { error } = await supabase
    .from("programs")
    .update({ metadata: validated })
    .eq("id", programId)
    .eq("coach_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/forge/${programId}`);
  return { ok: true };
}
