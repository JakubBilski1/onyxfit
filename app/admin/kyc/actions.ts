"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { mailer } from "@/lib/mailer";
import { kycApprovedEmail, kycRejectedEmail } from "@/lib/mailer/templates";

export type KycResult = { ok: true } | { ok: false; error: string };

export async function approveKyc(profileId: string): Promise<KycResult> {
  if (!profileId) return { ok: false, error: "Missing profile id." };
  const { supabase, user } = await requireAdmin();

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({
      verification_status: "active",
      kyc_reviewed_at: new Date().toISOString(),
      kyc_reviewed_by: user.id,
      kyc_rejection_reason: null,
    })
    .eq("id", profileId)
    .eq("role", "coach")
    .select("email, full_name")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  if (updated?.email) {
    const r = await mailer().send(
      kycApprovedEmail({ to: updated.email, fullName: updated.full_name }),
    );
    if (!r.ok) console.warn("[approveKyc] mailer error:", r.error);
  }

  revalidatePath("/admin/kyc");
  return { ok: true };
}

export async function rejectKyc(
  profileId: string,
  reason: string,
): Promise<KycResult> {
  if (!profileId) return { ok: false, error: "Missing profile id." };
  const trimmed = reason.trim();
  if (!trimmed) return { ok: false, error: "Reason is required." };
  if (trimmed.length > 500) return { ok: false, error: "Reason is too long." };

  const { supabase, user } = await requireAdmin();

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({
      verification_status: "rejected",
      kyc_reviewed_at: new Date().toISOString(),
      kyc_reviewed_by: user.id,
      kyc_rejection_reason: trimmed,
    })
    .eq("id", profileId)
    .eq("role", "coach")
    .select("email, full_name")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  if (updated?.email) {
    const r = await mailer().send(
      kycRejectedEmail({
        to: updated.email,
        fullName: updated.full_name,
        reason: trimmed,
      }),
    );
    if (!r.ok) console.warn("[rejectKyc] mailer error:", r.error);
  }

  revalidatePath("/admin/kyc");
  return { ok: true };
}
