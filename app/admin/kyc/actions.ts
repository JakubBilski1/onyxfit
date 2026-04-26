"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { mailer } from "@/lib/mailer";
import { kycApprovedEmail, kycRejectedEmail } from "@/lib/mailer/templates";

export type KycResult = { ok: true } | { ok: false; error: string };

export type KycDocLink = {
  name: string;
  storage_path: string;
  kind: string;
  uploaded_at: string | null;
  signed_url: string | null;
  error?: string;
};

export type KycDocsResult =
  | { ok: true; docs: KycDocLink[] }
  | { ok: false; error: string };

const SIGNED_URL_TTL_S = 60 * 10; // 10 minutes — long enough to view, short enough to be safe

/**
 * Returns short-lived signed URLs for every KYC document the coach uploaded.
 * Admin-gated. RLS on storage.objects already permits is_admin() reads on
 * the kyc-documents bucket, so we don't need the service-role key.
 */
export async function getKycDocLinks(profileId: string): Promise<KycDocsResult> {
  if (!profileId) return { ok: false, error: "Missing profile id." };
  const { supabase } = await requireAdmin();

  const { data: prof, error: pErr } = await supabase
    .from("profiles")
    .select("kyc_documents")
    .eq("id", profileId)
    .eq("role", "coach")
    .maybeSingle();
  if (pErr) return { ok: false, error: pErr.message };
  if (!prof) return { ok: false, error: "Coach not found." };

  const raw = Array.isArray(prof.kyc_documents) ? prof.kyc_documents : [];
  if (raw.length === 0) return { ok: true, docs: [] };

  const paths: string[] = [];
  const meta: Array<{ kind: string; uploaded_at: string | null }> = [];
  for (const d of raw) {
    if (!d || typeof d !== "object") continue;
    const path = String((d as any).storage_path ?? "");
    if (!path) continue;
    paths.push(path);
    meta.push({
      kind: String((d as any).kind ?? "document"),
      uploaded_at: (d as any).uploaded_at ?? null,
    });
  }
  if (paths.length === 0) return { ok: true, docs: [] };

  const { data: signed, error: sErr } = await supabase.storage
    .from("kyc-documents")
    .createSignedUrls(paths, SIGNED_URL_TTL_S);
  if (sErr) return { ok: false, error: sErr.message };

  const docs: KycDocLink[] = (signed ?? []).map((s, i) => {
    const path = paths[i];
    const m = meta[i];
    const filename = path.split("/").pop() ?? path;
    // Strip the leading "<timestamp>-" we added on upload for nicer display.
    const displayName = filename.replace(/^\d+-/, "");
    return {
      name: displayName,
      storage_path: path,
      kind: m.kind,
      uploaded_at: m.uploaded_at,
      signed_url: s.signedUrl ?? null,
      error: s.error ?? undefined,
    };
  });

  return { ok: true, docs };
}

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
