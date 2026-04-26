"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCoach } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

const PHASES = ["cut", "bulk", "maintenance", "recomp"] as const;
const MODES = ["flexible", "strict_meal_plan"] as const;
type Phase = (typeof PHASES)[number];
type Mode = (typeof MODES)[number];

function intOrNull(v: FormDataEntryValue | null, max = 100000): number | null {
  if (v == null) return null;
  const s = v.toString().trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0 || n > max) return Number.NaN;
  return Math.round(n);
}

export async function saveNutritionProtocol(
  clientId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!clientId) return { ok: false, error: "Missing client id." };
  const { supabase, user } = await requireActiveCoach();

  const phase = (formData.get("phase") ?? "maintenance").toString() as Phase;
  const dietMode = (formData.get("diet_mode") ?? "flexible").toString() as Mode;
  if (!PHASES.includes(phase)) return { ok: false, error: "Invalid phase." };
  if (!MODES.includes(dietMode)) return { ok: false, error: "Invalid diet mode." };

  const bmr = intOrNull(formData.get("bmr_kcal"));
  const tdee = intOrNull(formData.get("tdee_kcal"));
  const target = intOrNull(formData.get("target_kcal"));
  const protein = intOrNull(formData.get("protein_g"), 1000);
  const carbs = intOrNull(formData.get("carbs_g"), 1500);
  const fats = intOrNull(formData.get("fats_g"), 500);
  const fiber = intOrNull(formData.get("fiber_g"), 200);
  const water = intOrNull(formData.get("water_ml"), 20000);
  const notes = (formData.get("notes") ?? "").toString();

  if ([bmr, tdee, target, protein, carbs, fats, fiber, water].some((v) => Number.isNaN(v))) {
    return { ok: false, error: "Numeric fields must be non-negative integers." };
  }
  if (notes.length > 5000) return { ok: false, error: "Notes too long." };

  // ownership check (defense in depth)
  const { data: link } = await supabase
    .from("coaches_clients")
    .select("client_id")
    .eq("coach_id", user.id)
    .eq("client_id", clientId)
    .eq("active", true)
    .maybeSingle();
  if (!link) return { ok: false, error: "Not your client." };

  // upsert active protocol
  const { data: existing } = await supabase
    .from("nutrition_protocols")
    .select("id")
    .eq("coach_id", user.id)
    .eq("client_id", clientId)
    .eq("active", true)
    .maybeSingle();

  const payload = {
    coach_id: user.id,
    client_id: clientId,
    phase,
    diet_mode: dietMode,
    bmr_kcal: bmr,
    tdee_kcal: tdee,
    target_kcal: target,
    protein_g: protein,
    carbs_g: carbs,
    fats_g: fats,
    fiber_g: fiber,
    water_ml: water,
    notes: notes || null,
    active: true,
  };

  if (existing) {
    const { error } = await supabase
      .from("nutrition_protocols")
      .update(payload)
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("nutrition_protocols").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/nutrition");
  revalidatePath(`/dashboard/clients/${clientId}`);
  return { ok: true };
}

export async function addCustomFood(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await requireActiveCoach();

  const name = (formData.get("name") ?? "").toString().trim();
  const brand = (formData.get("brand") ?? "").toString().trim();
  const kcal = Number(formData.get("kcal_per_100g") ?? 0);
  const protein = Number(formData.get("protein_per_100g") ?? 0);
  const carbs = Number(formData.get("carbs_per_100g") ?? 0);
  const fats = Number(formData.get("fats_per_100g") ?? 0);

  if (!name) return { ok: false, error: "Name required." };
  if (name.length > 200) return { ok: false, error: "Name too long." };
  if (brand.length > 200) return { ok: false, error: "Brand too long." };
  for (const [n, v] of [["kcal", kcal], ["protein", protein], ["carbs", carbs], ["fats", fats]] as const) {
    if (!Number.isFinite(v) || v < 0 || v > 1000) {
      return { ok: false, error: `${n} must be 0–1000.` };
    }
  }

  const { error } = await supabase.from("foods").insert({
    owner_coach_id: user.id,
    source: "custom",
    name,
    brand: brand || null,
    kcal_per_100g: kcal,
    protein_per_100g: protein,
    carbs_per_100g: carbs,
    fats_per_100g: fats,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/nutrition");
  return { ok: true };
}
