"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

const MUSCLES = [
  "chest","back","quadriceps","hamstrings","glutes","shoulders","biceps","triceps",
  "calves","core","obliques","forearms","traps","rear delts","adductors","cardio",
] as const;
const EQUIPMENT = [
  "barbell","dumbbell","kettlebell","cable","machine","bodyweight","plate","band","other",
] as const;
const CATEGORIES = [
  "compound","isolation","unilateral","cardio","mobility","plyometric",
] as const;

export const MUSCLE_OPTIONS = MUSCLES;
export const EQUIPMENT_OPTIONS = EQUIPMENT;
export const CATEGORY_OPTIONS = CATEGORIES;

export async function addGlobalExercise(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const name = (formData.get("name") ?? "").toString().trim();
  const primary = (formData.get("primary_muscle") ?? "").toString().trim();
  const equipment = (formData.get("equipment") ?? "").toString().trim();
  const category = (formData.get("category") ?? "").toString().trim();
  const secondaryRaw = (formData.get("secondary_muscles") ?? "").toString().trim();
  const cues = (formData.get("cues") ?? "").toString().trim();
  const videoUrl = (formData.get("video_url") ?? "").toString().trim();

  if (!name) return { ok: false, error: "Name required." };
  if (name.length > 120) return { ok: false, error: "Name too long (≤120)." };
  if (primary && !MUSCLES.includes(primary as any)) {
    return { ok: false, error: `Unknown primary muscle: ${primary}.` };
  }
  if (equipment && !EQUIPMENT.includes(equipment as any)) {
    return { ok: false, error: `Unknown equipment: ${equipment}.` };
  }
  if (category && !CATEGORIES.includes(category as any)) {
    return { ok: false, error: `Unknown category: ${category}.` };
  }
  if (cues.length > 1000) return { ok: false, error: "Cues too long (≤1000)." };
  if (videoUrl && !/^https?:\/\//i.test(videoUrl)) {
    return { ok: false, error: "Video URL must start with http(s)://" };
  }

  const secondary = secondaryRaw
    ? secondaryRaw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    : [];
  const unknown = secondary.find((m) => !MUSCLES.includes(m as any));
  if (unknown) return { ok: false, error: `Unknown secondary muscle: ${unknown}.` };

  const { error } = await supabase.from("exercises").insert({
    source: "global",
    name,
    primary_muscle: primary || null,
    secondary_muscles: secondary,
    equipment: equipment || null,
    category: category || null,
    cues: cues || null,
    video_url: videoUrl || null,
    is_public: true,
  });
  if (error) {
    // 23505 = unique_violation on the (lower(name)) global partial index
    if ((error as any).code === "23505") {
      return { ok: false, error: "An exercise with that name already exists." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/exercises");
  return { ok: true };
}

export async function deleteGlobalExercise(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!id) return { ok: false, error: "Missing id." };
  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", id)
    .in("source", ["global", "wger"]);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/exercises");
  return { ok: true };
}
