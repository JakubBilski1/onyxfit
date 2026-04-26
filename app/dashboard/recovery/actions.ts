"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCoach } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

const CARDIO_KINDS = ["liss", "hiit", "moderate", "sport"] as const;
type CardioKind = (typeof CARDIO_KINDS)[number];

async function assertOwnsClient(supabase: any, coachId: string, clientId: string) {
  const { data } = await supabase
    .from("coaches_clients")
    .select("client_id")
    .eq("coach_id", coachId)
    .eq("client_id", clientId)
    .eq("active", true)
    .maybeSingle();
  return !!data;
}

// ─── Cardio prescriptions ────────────────────────────────────────────────

export async function addCardioBlock(
  clientId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await requireActiveCoach();
  if (!(await assertOwnsClient(supabase, user.id, clientId))) {
    return { ok: false, error: "Not your client." };
  }

  const kind = (formData.get("kind") ?? "liss").toString() as CardioKind;
  if (!CARDIO_KINDS.includes(kind)) return { ok: false, error: "Invalid kind." };

  const duration = Number(formData.get("duration_minutes") ?? 0);
  const sessions = Number(formData.get("weekly_target_sessions") ?? 0);
  const hrLow = formData.get("target_hr_low")?.toString().trim();
  const hrHigh = formData.get("target_hr_high")?.toString().trim();
  const steps = formData.get("daily_steps_target")?.toString().trim();
  const notes = (formData.get("notes") ?? "").toString();

  if (!Number.isInteger(duration) || duration < 1 || duration > 600) {
    return { ok: false, error: "Duration must be 1–600 min." };
  }
  if (!Number.isInteger(sessions) || sessions < 1 || sessions > 14) {
    return { ok: false, error: "Sessions must be 1–14." };
  }
  const lowN = hrLow ? Number(hrLow) : null;
  const highN = hrHigh ? Number(hrHigh) : null;
  if (lowN != null && (!Number.isInteger(lowN) || lowN < 30 || lowN > 230)) {
    return { ok: false, error: "HR low out of range." };
  }
  if (highN != null && (!Number.isInteger(highN) || highN < 30 || highN > 230)) {
    return { ok: false, error: "HR high out of range." };
  }
  const stepsN = steps ? Number(steps) : null;
  if (stepsN != null && (!Number.isInteger(stepsN) || stepsN < 0 || stepsN > 200000)) {
    return { ok: false, error: "Steps out of range." };
  }
  if (notes.length > 2000) return { ok: false, error: "Notes too long." };

  const { error } = await supabase.from("cardio_prescriptions").insert({
    coach_id: user.id,
    client_id: clientId,
    kind,
    duration_minutes: duration,
    weekly_target_sessions: sessions,
    target_hr_low: lowN,
    target_hr_high: highN,
    daily_steps_target: stepsN,
    notes: notes || null,
    active: true,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/recovery");
  return { ok: true };
}

export async function deleteCardioBlock(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Missing id." };
  const { supabase, user } = await requireActiveCoach();
  const { error } = await supabase
    .from("cardio_prescriptions")
    .delete()
    .eq("id", id)
    .eq("coach_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/recovery");
  return { ok: true };
}

// ─── Supplement stacks ───────────────────────────────────────────────────

async function ensureStack(
  supabase: any,
  coachId: string,
  clientId: string,
): Promise<{ id: string } | { error: string }> {
  const { data } = await supabase
    .from("supplement_stacks")
    .select("id")
    .eq("coach_id", coachId)
    .eq("client_id", clientId)
    .eq("active", true)
    .maybeSingle();
  if (data) return { id: data.id };

  const { data: created, error } = await supabase
    .from("supplement_stacks")
    .insert({
      coach_id: coachId,
      client_id: clientId,
      name: "Onyx stack",
      active: true,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: created.id };
}

export async function addCompound(
  clientId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await requireActiveCoach();
  if (!(await assertOwnsClient(supabase, user.id, clientId))) {
    return { ok: false, error: "Not your client." };
  }

  const name = (formData.get("name") ?? "").toString().trim();
  const dosage = (formData.get("dosage") ?? "").toString().trim();
  const timing = (formData.get("timing") ?? "").toString().trim();
  const brand = (formData.get("brand") ?? "").toString().trim();
  const withFood = formData.get("with_food") === "on";
  const notes = (formData.get("notes") ?? "").toString();

  if (!name) return { ok: false, error: "Name required." };
  if (name.length > 200) return { ok: false, error: "Name too long." };
  if (dosage.length > 100) return { ok: false, error: "Dosage too long." };
  if (timing.length > 100) return { ok: false, error: "Timing too long." };
  if (brand.length > 100) return { ok: false, error: "Brand too long." };
  if (notes.length > 2000) return { ok: false, error: "Notes too long." };

  const stack = await ensureStack(supabase, user.id, clientId);
  if ("error" in stack) return { ok: false, error: stack.error };

  const { count } = await supabase
    .from("supplement_items")
    .select("id", { count: "exact", head: true })
    .eq("stack_id", stack.id);

  const { error } = await supabase.from("supplement_items").insert({
    stack_id: stack.id,
    name,
    dosage: dosage || null,
    timing: timing || null,
    brand: brand || null,
    with_food: withFood,
    notes: notes || null,
    position: (count ?? 0) + 1,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/recovery");
  return { ok: true };
}

export async function deleteCompound(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Missing id." };
  const { supabase, user } = await requireActiveCoach();

  // RLS already checks stack ownership; no extra ownership query needed.
  const { error } = await supabase
    .from("supplement_items")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  // referenced for unused param to satisfy lint
  void user;
  revalidatePath("/dashboard/recovery");
  return { ok: true };
}
