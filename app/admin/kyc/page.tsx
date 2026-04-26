import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/onyx/empty-state";
import { formatRelative } from "@/lib/utils";
import { KycRowActions } from "./kyc-row-actions";
import { KycDocsViewer } from "./kyc-docs-viewer";

export const dynamic = "force-dynamic";

export default async function KycPage() {
  const supabase = getSupabaseServer();

  const { data: pending } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, verification_status, kyc_legal_name, kyc_tax_id, kyc_documents, kyc_submitted_at",
    )
    .eq("role", "coach")
    .in("verification_status", ["under_review", "pending_verification"])
    .order("kyc_submitted_at", { ascending: false, nullsFirst: false });

  const { data: rejected } = await supabase
    .from("profiles")
    .select("id, full_name, email, kyc_rejection_reason, kyc_reviewed_at")
    .eq("role", "coach")
    .eq("verification_status", "rejected")
    .order("kyc_reviewed_at", { ascending: false })
    .limit(8);

  return (
    <div className="space-y-10 onyx-enter">
      <PageHeader
        eyebrow="KYC · verification queue"
        title={
          <>
            Who gets <span className="text-gradient-brand">in</span>.
          </>
        }
        description="Every coach who lands on Onyx must be ratified. Read the docs, check the credentials, and decide."
      />

      <Card>
        <CardHeader>
          <CardTitle>In review · awaiting decision</CardTitle>
          <Badge variant={pending && pending.length > 0 ? "primary" : "default"}>
            {pending?.length ?? 0}
          </Badge>
        </CardHeader>
        <CardBody>
          {pending && pending.length > 0 ? (
            <ul className="divide-y divide-line">
              {pending.map((p: any) => {
                const docCount = Array.isArray(p.kyc_documents)
                  ? p.kyc_documents.length
                  : 0;
                const hasSubmitted = p.verification_status === "under_review";
                return (
                  <li key={p.id} className="py-5 space-y-3">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Identity */}
                      <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
                        <Avatar name={p.full_name} size={40} />
                        <div className="min-w-0">
                          <div className="text-[14.5px] font-medium text-fg truncate">
                            {p.full_name ?? p.kyc_legal_name ?? "Unnamed"}
                          </div>
                          <div className="text-[12px] text-fg-3 truncate">
                            {p.email}
                          </div>
                        </div>
                      </div>

                      {/* Legal / Tax */}
                      <div className="col-span-6 md:col-span-3 text-[12px] leading-relaxed">
                        <div className="text-fg-3">Legal</div>
                        <div className="text-fg-2 truncate">
                          {p.kyc_legal_name ?? "—"}
                        </div>
                        <div className="text-fg-3 mt-1">Tax ID</div>
                        <div className="text-fg-2 font-mono text-[11.5px] truncate">
                          {p.kyc_tax_id ?? "—"}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-6 md:col-span-3">
                        <Badge variant={hasSubmitted ? "primary" : "muted"}>
                          {hasSubmitted ? "Under review" : "Awaiting submission"}
                        </Badge>
                        <div className="text-[11px] text-fg-3 mt-1.5">
                          {p.kyc_submitted_at
                            ? `submitted ${formatRelative(p.kyc_submitted_at)}`
                            : "no docs yet"}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-12 md:col-span-2 flex md:justify-end">
                        {hasSubmitted ? (
                          <KycRowActions profileId={p.id} />
                        ) : (
                          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-fg-3">
                            awaiting submission
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Documents — expandable */}
                    {hasSubmitted && (
                      <div className="pl-[52px]">
                        <KycDocsViewer profileId={p.id} count={docCount} />
                      </div>
                    )}
                  </li>
                );
              })}
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
            <ul className="divide-y divide-line">
              {rejected.map((r: any) => (
                <li
                  key={r.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-medium text-fg truncate">
                      {r.full_name}
                    </div>
                    <div className="text-[11.5px] text-fg-3 truncate">
                      {r.kyc_rejection_reason ?? "no reason recorded"}
                    </div>
                  </div>
                  <span className="text-[11px] text-fg-3 shrink-0">
                    {formatRelative(r.kyc_reviewed_at)}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
