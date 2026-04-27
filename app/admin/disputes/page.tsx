import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/onyx/empty-state";
import { formatCurrencyCents, formatDate, formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DisputesPage() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("stripe_disputes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="STRIPE · DISPUTES"
        title={<span>Money in <em className="not-italic onyx-signal">contention</em>.</span>}
        description="Active disputes with evidence due dates, status, and the coach involved."
      />

      {!data || data.length === 0 ? (
        <EmptyState title="No disputes." description="When Stripe flags a disputed charge, it lands here with the evidence-due window." />
      ) : (
        <Card>
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-onyx-line">
            <span className="onyx-label col-span-3">Dispute</span>
            <span className="onyx-label col-span-2">Reason</span>
            <span className="onyx-label col-span-2">Status</span>
            <span className="onyx-label col-span-2">Amount</span>
            <span className="onyx-label col-span-2">Evidence due</span>
            <span className="onyx-label col-span-1 text-right">Created</span>
          </div>
          <ul className="divide-y divide-onyx-line">
            {data.map((d: any) => (
              <li
                key={d.id}
                className="flex flex-col gap-2 px-4 py-4 sm:px-6 md:grid md:grid-cols-12 md:gap-4 md:items-center"
              >
                <div className="md:col-span-3 flex items-start justify-between gap-3 md:block">
                  <div className="font-mono text-[11px] text-onyx-mute truncate min-w-0">{d.id}</div>
                  <div className="md:hidden font-mono text-[12px] text-onyx-bone shrink-0">{formatCurrencyCents(d.amount_cents, d.currency ?? "EUR")}</div>
                </div>
                <div className="md:col-span-2 text-[13px] text-onyx-bone">{d.reason ?? "—"}</div>
                <div className="md:col-span-2 flex flex-wrap items-center gap-2 md:block">
                  <Badge variant={d.status?.includes("response") ? "red" : "default"}>{d.status}</Badge>
                  <span className="md:hidden font-mono text-[11px] text-onyx-mute">· due {formatDate(d.evidence_due_by)}</span>
                  <span className="md:hidden font-mono text-[10px] text-onyx-dim">· {formatRelative(d.created_at)}</span>
                </div>
                <div className="hidden md:block md:col-span-2 font-mono text-[12px] text-onyx-bone">{formatCurrencyCents(d.amount_cents, d.currency ?? "EUR")}</div>
                <div className="hidden md:block md:col-span-2 font-mono text-[11px] text-onyx-mute">{formatDate(d.evidence_due_by)}</div>
                <div className="hidden md:block md:col-span-1 text-right font-mono text-[10px] text-onyx-dim">{formatRelative(d.created_at)}</div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
