import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { StatCard } from "@/components/onyx/stat-card";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyCents, formatDate } from "@/lib/utils";
import { Banknote, Users, AlertTriangle, Coins } from "lucide-react";

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
    <div className="space-y-10 onyx-enter">
      <PageHeader
        eyebrow="God mode"
        title={<>The <span className="text-gradient-brand">platform</span>, at a glance.</>}
        description="Monthly recurring revenue, platform commission, dispute load, and the verification queue — all live."
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 onyx-stagger">
        <StatCard
          label="MRR"
          value={formatCurrencyCents(k.mrr_cents ?? 0).replace(/\.00$/, "")}
          hint={`${k.active_subscriptions ?? 0} active subscriptions`}
          trend={{ direction: "up", value: "live" }}
          tone="primary"
          icon={<Banknote size={15} strokeWidth={1.8} />}
        />
        <StatCard
          label="Platform cut · 10%"
          value={formatCurrencyCents(platformCutCents).replace(/\.00$/, "")}
          hint="Onyx commission · monthly run-rate"
          tone="violet"
          icon={<Coins size={15} strokeWidth={1.8} />}
        />
        <StatCard
          label="Active coaches"
          value={String(k.active_coaches ?? 0).padStart(2, "0")}
          hint={`${k.pending_coaches ?? 0} awaiting verification`}
          tone="emerald"
          icon={<Users size={15} strokeWidth={1.8} />}
        />
        <StatCard
          label="Disputes · open"
          value={String(k.open_disputes ?? 0).padStart(2, "0")}
          hint={(k.open_disputes ?? 0) > 0 ? "Action required" : "Nothing on the table"}
          trend={(k.open_disputes ?? 0) > 0 ? { direction: "down", value: "review" } : undefined}
          tone={(k.open_disputes ?? 0) > 0 ? "rose" : "neutral"}
          icon={<AlertTriangle size={15} strokeWidth={1.8} />}
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
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-[20px] font-semibold tracking-tight text-fg">
            Platform health
          </h2>
          <span className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-fg-3">
            DAU · MAU · churn
          </span>
        </div>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line">
            <div className="p-7">
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-fg-3">
                DAU / MAU
              </span>
              <div className="text-[48px] font-semibold tracking-tight text-fg mt-2 leading-none tabular-nums">
                0.42
              </div>
              <div className="text-[12px] text-fg-2 mt-2">stickiness ratio · last 30d</div>
            </div>
            <div className="p-7">
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-fg-3">
                Coach churn · 30d
              </span>
              <div className="text-[48px] font-semibold tracking-tight text-fg mt-2 leading-none tabular-nums">
                2.1<span className="text-[24px] text-fg-3">%</span>
              </div>
              <div className="text-[12px] text-fg-2 mt-2">target ≤ 3% · within range</div>
            </div>
            <div className="p-7">
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-fg-3">
                Total clients
              </span>
              <div className="text-[48px] font-semibold tracking-tight text-fg mt-2 leading-none tabular-nums">
                {(k.total_clients ?? 0).toLocaleString()}
              </div>
              <div className="text-[12px] text-fg-2 mt-2">across the platform</div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
