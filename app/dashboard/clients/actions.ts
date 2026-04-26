"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCoach } from "@/lib/auth";

export type InviteResult =
  | { ok: true; clientId: string }
  | { ok: false; error: string };

export async function inviteClient(
  _prev: InviteResult | null,
  formData: FormData,
): Promise<InviteResult> {
  const { supabase, user } = await requireActiveCoach();

  const fullName = (formData.get("full_name") ?? "").toString().trim();
  const email = (formData.get("email") ?? "").toString().trim().toLowerCase();
  const phone = (formData.get("phone") ?? "").toString().trim();
  const goals = (formData.get("goals") ?? "").toString().trim();
  const rateRaw = formData.get("monthly_rate_cents")?.toString().trim();
  const currency = (formData.get("currency") ?? "EUR").toString().trim().toUpperCase();

  if (!fullName) return { ok: false, error: "Full name required." };
  if (fullName.length > 120) return { ok: false, error: "Name too long (≤120)." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Invalid email." };
  }
  if (phone.length > 40) return { ok: false, error: "Phone too long." };
  if (goals.length > 1000) return { ok: false, error: "Goals too long." };
  const rate = rateRaw ? Number(rateRaw) : null;
  if (rate != null && (!Number.isFinite(rate) || rate < 0 || !Number.isInteger(rate))) {
    return { ok: false, error: "Rate must be a non-negative integer (cents)." };
  }
  if (currency.length !== 3) {
    return { ok: false, error: "Currency must be a 3-letter ISO code." };
  }

  const { data: client, error: cErr } = await supabase
    .from("clients")
    .insert({
      full_name: fullName,
      email: email || null,
      phone: phone || null,
      goals: goals || null,
      onboarding_step: "invited",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (cErr) return { ok: false, error: cErr.message };

  const { error: lErr } = await supabase.from("coaches_clients").insert({
    coach_id: user.id,
    client_id: client.id,
    active: true,
    monthly_rate_cents: rate,
    currency,
  });

  if (lErr) {
    await supabase.from("clients").delete().eq("id", client.id);
    return { ok: false, error: lErr.message };
  }

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard");
  return { ok: true, clientId: client.id };
}
