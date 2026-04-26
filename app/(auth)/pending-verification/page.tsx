import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KycForm } from "./kyc-form";

export const dynamic = "force-dynamic";

export default async function PendingVerificationPage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("verification_status, kyc_legal_name, kyc_tax_id, kyc_documents, kyc_submitted_at, kyc_rejection_reason, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login");
  if (profile.role === "admin" || (profile.role === "coach" && profile.verification_status === "active")) {
    redirect(profile.role === "admin" ? "/admin" : "/dashboard");
  }

  const status = profile.verification_status;

  return (
    <div className="onyx-stagger">
      <span className="onyx-label">Status · {status?.toUpperCase()}</span>
      <h1 className="onyx-display text-5xl text-onyx-bone mt-3">
        {status === "under_review"
          ? "We have your file."
          : status === "rejected"
            ? "Application not approved."
            : "Submit your credentials."}
      </h1>

      {status === "pending_verification" && (
        <>
          <p className="text-[13px] text-onyx-mute mt-3 leading-relaxed">
            Upload your certificates and tax ID below. Once submitted, your file enters the verification queue
            and we&apos;ll respond within 48 hours.
          </p>
          <div className="mt-10">
            <KycForm />
          </div>
        </>
      )}

      {status === "under_review" && (
        <>
          <p className="text-[13px] text-onyx-mute mt-3 leading-relaxed">
            File received. Review in progress — you&apos;ll receive a decision via email within 48 hours.
            The console unlocks the moment you&apos;re cleared.
          </p>
          <div className="mt-10 onyx-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="onyx-label">Legal name</span>
              <span className="text-[13px] text-onyx-bone">{profile.kyc_legal_name ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="onyx-label">Tax ID</span>
              <span className="font-mono text-[12px] text-onyx-mute">{profile.kyc_tax_id ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="onyx-label">Documents</span>
              <Badge>{Array.isArray(profile.kyc_documents) ? profile.kyc_documents.length : 0}</Badge>
            </div>
          </div>
        </>
      )}

      {status === "rejected" && (
        <>
          <p className="text-[13px] text-onyx-red mt-3">{profile.kyc_rejection_reason ?? "Application declined."}</p>
          <p className="text-[13px] text-onyx-mute mt-3">
            You can re-submit with corrected documents. Reach out to verification@onyx.coach if you believe this was in error.
          </p>
          <div className="mt-10">
            <KycForm />
          </div>
        </>
      )}

      <div className="mt-10">
        <form action="/api/auth/sign-out" method="post">
          <Button type="submit" variant="ghost" size="sm">← Sign out</Button>
        </form>
      </div>
    </div>
  );
}
