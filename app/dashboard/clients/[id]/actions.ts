"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCoach } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateClientLink(
  clientId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!clientId) return { ok: false, error: "Missing client id." };
  const { supabase, user } = await requireActiveCoach();

  const rateRaw = formData.get("monthly_rate_cents")?.toString().trim();
  const currency = (formData.get("currency") ?? "EUR").toString().trim().toUpperCase();
  const notes = (formData.get("notes") ?? "").toString();

  const rate = rateRaw ? Number(rateRaw) : null;
  if (rate != null && (!Number.isFinite(rate) || rate < 0)) {
    return { ok: false, error: "Rate must be a non-negative integer (cents)." };
  }
  if (currency.length !== 3) {
    return { ok: false, error: "Currency must be a 3-letter ISO code." };
  }
  if (notes.length > 5000) {
    return { ok: false, error: "Notes too long (max 5000 chars)." };
  }

  const { error } = await supabase
    .from("coaches_clients")
    .update({
      monthly_rate_cents: rate,
      currency,
      notes: notes || null,
    })
    .eq("coach_id", user.id)
    .eq("client_id", clientId)
    .eq("active", true);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/dashboard/clients");
  return { ok: true };
}

export async function markOnboardingComplete(
  clientId: string,
): Promise<ActionResult> {
  if (!clientId) return { ok: false, error: "Missing client id." };
  const { supabase, user } = await requireActiveCoach();

  // Coach must own this client (defense in depth — RLS also enforces it).
  const { data: link } = await supabase
    .from("coaches_clients")
    .select("client_id")
    .eq("coach_id", user.id)
    .eq("client_id", clientId)
    .eq("active", true)
    .maybeSingle();
  if (!link) return { ok: false, error: "Not your client." };

  const { error } = await supabase
    .from("clients")
    .update({ onboarding_step: "complete" })
    .eq("id", clientId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/dashboard/clients/${clientId}`);
  return { ok: true };
}

export async function deactivateClientLink(
  clientId: string,
): Promise<ActionResult> {
  if (!clientId) return { ok: false, error: "Missing client id." };
  const { supabase, user } = await requireActiveCoach();

  const { error } = await supabase
    .from("coaches_clients")
    .update({ active: false, ended_at: new Date().toISOString() })
    .eq("coach_id", user.id)
    .eq("client_id", clientId)
    .eq("active", true);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/clients");
  return { ok: true };
}

export async function resolveTriageFlag(
  flagId: string,
  clientId: string,
): Promise<ActionResult> {
  if (!flagId) return { ok: false, error: "Missing flag id." };
  const { supabase } = await requireActiveCoach();

  const { error } = await supabase
    .from("triage_flags")
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq("id", flagId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
