import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/onyx/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyCents, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VaultPage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: subs }, { data: resources }] = await Promise.all([
    supabase.from("subscriptions").select("id, status, amount_cents, currency, current_period_end, next_billing_locked, locked_reason, client:clients(full_name)").eq("coach_id", user.id).order("current_period_end", { ascending: false }).limit(20),
    supabase.from("resource_files").select("id, title, kind, visibility, created_at").eq("coach_id", user.id).order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="HEALTH & BUSINESS VAULT"
        title={<span>Markers, money, <em className="not-italic onyx-signal">memorabilia</em>.</span>}
        description="Biomarker timelines, automated subscription state, and the resource library you share only with paying athletes."
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Subscription health</CardTitle></CardHeader>
          <CardBody>
            {subs && subs.length > 0 ? (
              <ul className="divide-y divide-onyx-line">
                {subs.map((s: any) => (
                  <li key={s.id} className="py-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[14px] text-onyx-bone">{s.client?.full_name}</div>
                      <div className="font-mono text-[11px] text-onyx-dim">renews {formatDate(s.current_period_end)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={s.status === "active" ? "green" : s.status === "past_due" ? "red" : "default"}>{s.status}</Badge>
                      <span className="font-mono text-[13px] text-onyx-bone">{formatCurrencyCents(s.amount_cents, s.currency ?? "EUR")}</span>
                      {s.next_billing_locked && <Badge variant="red">LOCKED · {s.locked_reason}</Badge>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-onyx-mute py-4">No subscriptions yet. They appear here once Stripe webhooks confirm a paid cycle.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Biomarker map</CardTitle></CardHeader>
          <CardBody>
            <p className="text-[13px] text-onyx-mute">
              Plot client-submitted blood work — testosterone, cortisol, vitamin D, ferritin —
              against weekly training volume to spot overtraining or recovery debt.
            </p>
            <div className="mt-6 onyx-forge-rail border border-onyx-line h-32 grid place-items-center">
              <span className="onyx-label">— No labs uploaded —</span>
            </div>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader><CardTitle>Resource library</CardTitle><Button variant="ghost" size="sm">+ Upload</Button></CardHeader>
        <CardBody>
          {resources && resources.length > 0 ? (
            <ul className="divide-y divide-onyx-line">
              {resources.map((r: any) => (
                <li key={r.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-[14px] text-onyx-bone">{r.title}</div>
                    <div className="font-mono text-[11px] text-onyx-dim">{r.kind} · {r.visibility} · {formatDate(r.created_at)}</div>
                  </div>
                  <Button size="sm" variant="ghost">Manage →</Button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Your private shelf is empty." description="Upload PDFs, recipe books, and discount codes — visible only to active subscribers." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
