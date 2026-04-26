"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCoach } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type Annotation = {
  id: string;
  t: number; // seconds into clip
  kind: "line" | "angle" | "circle" | "voice";
  label: string;
  side?: "L" | "R";
  value?: string;
};

function validateAnnotations(input: unknown): Annotation[] | string {
  if (input == null) return [];
  if (!Array.isArray(input)) return "annotations must be an array";
  if (input.length > 200) return "max 200 annotations";
  const out: Annotation[] = [];
  for (const a of input) {
    if (!a || typeof a !== "object") return "malformed annotation";
    const aa = a as Partial<Annotation>;
    if (typeof aa.id !== "string") return "annotation missing id";
    const t = Number(aa.t);
    if (!Number.isFinite(t) || t < 0 || t > 86400) return "annotation.t invalid";
    if (!["line", "angle", "circle", "voice"].includes(aa.kind as string)) {
      return "annotation.kind invalid";
    }
    const label = String(aa.label ?? "").slice(0, 200);
    out.push({
      id: aa.id,
      t,
      kind: aa.kind as Annotation["kind"],
      label,
      ...(aa.side === "L" || aa.side === "R" ? { side: aa.side } : {}),
      ...(aa.value ? { value: String(aa.value).slice(0, 60) } : {}),
    });
  }
  return out;
}

export async function saveFormCheckDraft(
  formCheckId: string,
  payload: { text_feedback?: string | null; annotations?: unknown },
): Promise<ActionResult> {
  if (!formCheckId) return { ok: false, error: "Missing form-check id." };
  const { supabase, user } = await requireActiveCoach();

  const annotations = validateAnnotations(payload.annotations);
  if (typeof annotations === "string") return { ok: false, error: annotations };

  const text = payload.text_feedback == null ? null : String(payload.text_feedback);
  if (text != null && text.length > 5000) {
    return { ok: false, error: "Feedback too long (≤5000)." };
  }

  const { error } = await supabase
    .from("form_checks")
    .update({ text_feedback: text, annotations })
    .eq("id", formCheckId)
    .eq("coach_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/form-checks");
  return { ok: true };
}

export async function sendFormCheck(
  formCheckId: string,
  payload: { text_feedback?: string | null; annotations?: unknown },
): Promise<ActionResult> {
  if (!formCheckId) return { ok: false, error: "Missing form-check id." };
  const { supabase, user } = await requireActiveCoach();

  const annotations = validateAnnotations(payload.annotations);
  if (typeof annotations === "string") return { ok: false, error: annotations };

  const text = payload.text_feedback == null ? null : String(payload.text_feedback);
  if (text != null && text.length > 5000) {
    return { ok: false, error: "Feedback too long (≤5000)." };
  }

  const { data: updated, error } = await supabase
    .from("form_checks")
    .update({ text_feedback: text, annotations, status: "reviewed" })
    .eq("id", formCheckId)
    .eq("coach_id", user.id)
    .select("id, client_id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  if (updated?.client_id) {
    await supabase.from("activity_events").insert({
      client_id: updated.client_id,
      coach_id: user.id,
      event_type: "form_check_uploaded",
      payload: { form_check_id: updated.id, direction: "coach_to_client" },
      occurred_at: new Date().toISOString(),
    });
  }

  revalidatePath("/dashboard/form-checks");
  return { ok: true };
}

export async function setFormCheckVoiceover(
  formCheckId: string,
  path: string | null,
): Promise<ActionResult> {
  if (!formCheckId) return { ok: false, error: "Brak ID nagrania." };
  const { supabase, user } = await requireActiveCoach();

  if (path != null) {
    if (typeof path !== "string" || path.length > 500) {
      return { ok: false, error: "Nieprawidłowa ścieżka." };
    }
  }

  const { data: existing } = await supabase
    .from("form_checks")
    .select("coach_voiceover_path")
    .eq("id", formCheckId)
    .eq("coach_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("form_checks")
    .update({ coach_voiceover_path: path })
    .eq("id", formCheckId)
    .eq("coach_id", user.id);

  if (error) return { ok: false, error: error.message };

  // best-effort: prune the old voice memo when replacing or clearing
  if (existing?.coach_voiceover_path && existing.coach_voiceover_path !== path) {
    await supabase.storage
      .from("voiceovers")
      .remove([existing.coach_voiceover_path]);
  }

  revalidatePath("/dashboard/form-checks");
  return { ok: true };
}
