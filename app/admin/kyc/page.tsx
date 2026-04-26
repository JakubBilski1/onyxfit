import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/onyx/empty-state";
import { formatRelative } from "@/lib/utils";
import { KycRowActions } from "./kyc-row-actions";

export const dynamic = "force-dynamic";

export default async function KycPage() {
  const supabase = getSupabaseServer();

  const { data: pending } = await supabase
    .from("profiles")
    .select("id, full_name, email, verification_status, kyc_legal_name, kyc_tax_id, kyc_documents, kyc_submitted_at")
    .eq("role", "coach")
    .in("verification_status", ["under_review", "pending_verification"])
    .order("kyc_submitted_at", { ascending: false, nullsFirst: false });

  const { data: rejected } = await supabase
    .from("profiles")
    .select("id, full_name, email, kyc_rejection_reason, kyc_reviewed_at")
    .eq("role", "coach").eq("verification_status", "rejected")
    .order("kyc_reviewed_at", { ascending: false }).limit(8);

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="KYC · VERIFICATION QUEUE"
        title={<span>Who gets <em className="not-italic onyx-signal">in</em>.</span>}
        description="Every coach who lands on Onyx must be ratified. Read the docs, check the credentials, and decide."
      />

      <Card>
        <CardHeader>
          <CardTitle>In review · awaiting decision</CardTitle>
          <Badge variant="signal">{pending?.length ?? 0}</Badge>
        </CardHeader>
        <CardBody>
          {pending && pending.length > 0 ? (
            <ul className="divide-y divide-onyx-line">
              {pending.map((p: any) => (
                <li key={p.id} className="py-5 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <Avatar name={p.full_name} />
                    <div className="min-w-0">
                      <div className="text-[14px] text-onyx-bone truncate">{p.full_name ?? p.kyc_legal_name ?? "Unnamed"}</div>
                      <div className="font-mono text-[11px] text-onyx-dim truncate">{p.email}</div>
                    </div>
                  </div>
                  <div className="col-span-3 font-mono text-[11px] text-onyx-mute">
                    <span className="text-onyx-dim">Legal · </span>{p.kyc_legal_name ?? "—"}
                    <br />
                    <span className="text-onyx-dim">Tax ID · </span>{p.kyc_tax_id ?? "—"}
                  </div>
                  <div className="col-span-2">
                    <Badge variant={p.verification_status === "under_review" ? "signal" : "default"}>
                      {p.verification_status === "under_review" ? "UNDER REVIEW" : "PENDING SUBMIT"}
                    </Badge>
                    <div className="font-mono text-[10px] text-onyx-dim mt-1">
                      {p.kyc_submitted_at ? `submitted ${formatRelative(p.kyc_submitted_at)}` : "no docs yet"}
                    </div>
                  </div>
                  <div className="col-span-1 font-mono text-[10px] text-onyx-mute text-center">
                    {Array.isArray(p.kyc_documents) ? p.kyc_documents.length : 0}<br />
                    <span className="text-onyx-dim">DOCS</span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {p.verification_status === "under_review" ? (
                      <KycRowActions profileId={p.id} />
                    ) : (
                      <span className="font-mono text-[10px] text-onyx-dim">
                        awaiting submission
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="The queue is empty."
              description="Every coach is verified or hasn't submitted KYC docs yet. Nothing for you to weigh."
            />
          )}
        </CardBody>
      </Card>

      {rejected && rejected.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently rejected</CardTitle>
            <Badge variant="red">{rejected.length}</Badge>
          </CardHeader>
          <CardBody>
            <ul className="divide-y divide-onyx-line">
              {rejected.map((r: any) => (
                <li key={r.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-[13px] text-onyx-bone">{r.full_name}</div>
                    <div className="font-mono text-[11px] text-onyx-dim">{r.kyc_rejection_reason ?? "no reason recorded"}</div>
                  </div>
                  <span className="font-mono text-[10px] text-onyx-dim">{formatRelative(r.kyc_reviewed_at)}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
