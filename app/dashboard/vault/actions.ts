"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCoach } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

// ─── Biomarkers ──────────────────────────────────────────────────────────

const BIO_CATEGORIES = [
  "blood",
  "hormones",
  "vitamins",
  "minerals",
  "lipids",
  "metabolic",
  "other",
] as const;

export async function addBiomarker(
  clientId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!clientId) return { ok: false, error: "Brak ID klienta." };
  const { supabase, user } = await requireActiveCoach();

  const { data: link } = await supabase
    .from("coaches_clients")
    .select("client_id")
    .eq("coach_id", user.id)
    .eq("client_id", clientId)
    .eq("active", true)
    .maybeSingle();
  if (!link) return { ok: false, error: "Nie twój klient." };

  const category = (formData.get("category") ?? "blood").toString();
  const marker = (formData.get("marker") ?? "").toString().trim();
  const valueRaw = formData.get("value")?.toString().trim();
  const unit = (formData.get("unit") ?? "").toString().trim();
  const refLowRaw = formData.get("reference_low")?.toString().trim();
  const refHighRaw = formData.get("reference_high")?.toString().trim();
  const recordedAt = (formData.get("recorded_at") ?? "").toString().trim();
  const notes = (formData.get("notes") ?? "").toString();
  const documentPath = (formData.get("document_path") ?? "").toString().trim();

  if (!BIO_CATEGORIES.includes(category as any)) {
    return { ok: false, error: "Nieprawidłowa kategoria." };
  }
  if (!marker) return { ok: false, error: "Marker wymagany." };
  if (marker.length > 80) return { ok: false, error: "Nazwa markera za długa." };
  if (unit.length > 20) return { ok: false, error: "Jednostka za długa." };
  if (notes.length > 2000) return { ok: false, error: "Notatka za długa." };
  if (documentPath.length > 500) return { ok: false, error: "Ścieżka pliku za długa." };

  const value = valueRaw ? Number(valueRaw) : null;
  if (value == null || !Number.isFinite(value)) {
    return { ok: false, error: "Wartość musi być liczbą." };
  }
  const refLow = refLowRaw ? Number(refLowRaw) : null;
  const refHigh = refHighRaw ? Number(refHighRaw) : null;
  if (refLow != null && !Number.isFinite(refLow)) {
    return { ok: false, error: "Norma dolna musi być liczbą." };
  }
  if (refHigh != null && !Number.isFinite(refHigh)) {
    return { ok: false, error: "Norma górna musi być liczbą." };
  }

  let recordedIso: string | null = null;
  if (recordedAt) {
    const t = Date.parse(recordedAt);
    if (Number.isNaN(t)) return { ok: false, error: "Nieprawidłowa data." };
    recordedIso = new Date(t).toISOString();
  }

  const { error } = await supabase.from("health_vault").insert({
    client_id: clientId,
    coach_id: user.id,
    category,
    marker,
    value,
    unit: unit || null,
    reference_low: refLow,
    reference_high: refHigh,
    recorded_at: recordedIso ?? new Date().toISOString(),
    notes: notes || null,
    document_path: documentPath || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/vault");
  revalidatePath(`/dashboard/clients/${clientId}`);
  return { ok: true };
}

export async function deleteBiomarker(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Brak ID." };
  const { supabase, user } = await requireActiveCoach();

  const { data: existing } = await supabase
    .from("health_vault")
    .select("document_path")
    .eq("id", id)
    .eq("coach_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("health_vault")
    .delete()
    .eq("id", id)
    .eq("coach_id", user.id);
  if (error) return { ok: false, error: error.message };

  if (existing?.document_path) {
    await supabase.storage.from("health-vault").remove([existing.document_path]);
  }

  revalidatePath("/dashboard/vault");
  return { ok: true };
}

const KINDS = ["pdf", "doc", "image", "video", "link", "discount_code"] as const;
const VISIBILITIES = ["paid_clients", "all_clients", "private"] as const;

export async function createResource(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await requireActiveCoach();

  const title = (formData.get("title") ?? "").toString().trim();
  const description = (formData.get("description") ?? "").toString().trim();
  const kind = (formData.get("kind") ?? "pdf").toString();
  const visibility = (formData.get("visibility") ?? "paid_clients").toString();
  const externalUrl = (formData.get("external_url") ?? "").toString().trim();
  const storagePath = (formData.get("storage_path") ?? "").toString().trim();

  if (!title) return { ok: false, error: "Title required." };
  if (title.length > 200) return { ok: false, error: "Title too long." };
  if (description.length > 2000) return { ok: false, error: "Description too long." };
  if (!KINDS.includes(kind as any)) return { ok: false, error: "Invalid kind." };
  if (!VISIBILITIES.includes(visibility as any)) {
    return { ok: false, error: "Invalid visibility." };
  }
  if (externalUrl && !/^https?:\/\//i.test(externalUrl)) {
    return { ok: false, error: "URL must start with http(s)://" };
  }
  if (externalUrl.length > 1000) return { ok: false, error: "URL too long." };
  if (storagePath.length > 500) return { ok: false, error: "Storage path too long." };
  if (!externalUrl && !storagePath) {
    return { ok: false, error: "Either upload a file or paste a URL." };
  }

  const { error } = await supabase.from("resource_files").insert({
    coach_id: user.id,
    title,
    description: description || null,
    kind,
    visibility,
    external_url: externalUrl || null,
    storage_path: storagePath || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/vault");
  return { ok: true };
}

export async function deleteResource(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Missing id." };
  const { supabase, user } = await requireActiveCoach();

  const { data: existing } = await supabase
    .from("resource_files")
    .select("storage_path")
    .eq("id", id)
    .eq("coach_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("resource_files")
    .delete()
    .eq("id", id)
    .eq("coach_id", user.id);

  if (error) return { ok: false, error: error.message };

  if (existing?.storage_path) {
    await supabase.storage.from("resources").remove([existing.storage_path]);
  }

  revalidatePath("/dashboard/vault");
  return { ok: true };
}
