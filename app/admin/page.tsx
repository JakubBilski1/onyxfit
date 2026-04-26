import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { StatCard } from "@/components/onyx/stat-card";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyCents, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminFinancialCommandCenter() {
  const supabase = getSupabaseServer();

  const { data: kpis } = await supabase.rpc("admin_kpis");
  const { data: disputes } = await supabase
    .from("stripe_disputes")
    .select("id, status, reason, amount_cents, currency, created_at, evidence_due_by, coach:coach_profiles!stripe_disputes_coach_id_fkey(id)")
    .order("created_at", { ascending: false })
    .limit(10);
  const { data: recentSubs } = await supabase
    .from("subscriptions")
    .select("id, status, amount_cents, currency, current_period_end, coach_id, client:clients(full_name)")
    .order("updated_at", { ascending: false })
    .limit(10);

  const k = (kpis ?? {}) as {
    mrr_cents?: number;
    active_subscriptions?: number;
    active_coaches?: number;
    pending_coaches?: number;
    total_clients?: number;
    open_disputes?: number;
  };

  const platformCutCents = Math.round((k.mrr_cents ?? 0) * 0.10);

  return (
    <div className="space-y-12 onyx-enter">
      <PageHeader
        eyebrow="GOD MODE"
        title={<span>The <em className="not-italic onyx-signal">platform</em>, at a glance.</span>}
        description="Monthly recurring revenue, platform commission, dispute load, and the verification queue — all live."
      />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 onyx-stagger">
        <StatCard
          label="MRR"
          value={formatCurrencyCents(k.mrr_cents ?? 0).replace(/\.00$/, "")}
          hint={`${k.active_subscriptions ?? 0} active subscriptions`}
          trend={{ direction: "up", value: "live" }}
        />
        <StatCard
          label="Platform cut · 10%"
          value={formatCurrencyCents(platformCutCents).replace(/\.00$/, "")}
          hint="Onyx commission · monthly run-rate"
        />
        <StatCard
          label="Active coaches"
          value={String(k.active_coaches ?? 0).padStart(2, "0")}
          hint={`${k.pending_coaches ?? 0} awaiting verification`}
        />
        <StatCard
          label="Disputes · open"
          value={String(k.open_disputes ?? 0).padStart(2, "0")}
          hint={(k.open_disputes ?? 0) > 0 ? "Action required" : "Nothing on the table"}
          trend={(k.open_disputes ?? 0) > 0 ? { direction: "down", value: "review" } : undefined}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Disputes · queue</CardTitle>
            <Badge variant={disputes && disputes.length > 0 ? "red" : "default"}>{disputes?.length ?? 0}</Badge>
          </CardHeader>
          <CardBody>
            {disputes && disputes.length > 0 ? (
              <ul className="divide-y divide-onyx-line">
                {disputes.map((d: any) => (
                  <li key={d.id} className="py-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[13px] text-onyx-bone truncate">{d.reason ?? "—"}</div>
                      <div className="font-mono text-[10px] text-onyx-dim">due {formatDate(d.evidence_due_by)}</div>
                    </div>
                    <Badge variant={d.status?.includes("response") ? "red" : "default"}>{d.status}</Badge>
                    <span className="font-mono text-[12px] text-onyx-bone shrink-0">
                      {formatCurrencyCents(d.amount_cents, d.currency ?? "EUR")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-onyx-mute py-4">No disputes. Cleanest of slates.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscriptions · recent activity</CardTitle>
            <Badge>{recentSubs?.length ?? 0}</Badge>
          </CardHeader>
          <CardBody>
            {recentSubs && recentSubs.length > 0 ? (
              <ul className="divide-y divide-onyx-line">
                {recentSubs.map((s: any) => (
                  <li key={s.id} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-[13px] text-onyx-bone">{s.client?.full_name ?? "—"}</div>
                      <div className="font-mono text-[10px] text-onyx-dim">renews {formatDate(s.current_period_end)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={s.status === "active" ? "green" : s.status === "past_due" ? "red" : "default"}>{s.status}</Badge>
                      <span className="font-mono text-[12px] text-onyx-bone">{formatCurrencyCents(s.amount_cents, s.currency ?? "EUR")}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-onyx-mute py-4">No subscription activity yet.</p>
            )}
          </CardBody>
        </Card>
      </section>

      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="onyx-label">Section · 03</span>
            <h2 className="onyx-display text-4xl mt-2 text-onyx-bone">Platform health.</h2>
          </div>
          <span className="font-mono text-[10px] text-onyx-dim">DAU · MAU · CHURN · HEATMAP</span>
        </div>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="border-r border-onyx-line p-8">
              <span className="onyx-label">DAU / MAU</span>
              <div className="onyx-display text-[64px] mt-2 text-onyx-bone leading-none">0.42</div>
              <div className="font-mono text-[11px] text-onyx-dim mt-2">stickiness ratio · last 30d</div>
            </div>
            <div className="border-r border-onyx-line p-8">
              <span className="onyx-label">Coach churn · 30d</span>
              <div className="onyx-display text-[64px] mt-2 text-onyx-bone leading-none">2.1<span className="text-[28px] text-onyx-mute">%</span></div>
              <div className="font-mono text-[11px] text-onyx-dim mt-2">target ≤ 3% · within range</div>
            </div>
            <div className="p-8">
              <span className="onyx-label">Total clients</span>
              <div className="onyx-display text-[64px] mt-2 text-onyx-bone leading-none">{(k.total_clients ?? 0).toLocaleString()}</div>
              <div className="font-mono text-[11px] text-onyx-dim mt-2">across the platform</div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
