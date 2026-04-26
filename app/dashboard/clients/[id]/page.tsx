import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { StatCard } from "@/components/onyx/stat-card";
import { FlagTile } from "@/components/onyx/flag-tile";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/onyx/empty-state";
import { formatCurrencyCents, formatDate, formatRelative } from "@/lib/utils";
import { ClientLinkForm } from "./client-link-form";
import { DangerZone } from "./danger-zone";
import { ResolveFlagButton } from "./resolve-flag-button";

export const dynamic = "force-dynamic";

const STEP_LABEL: Record<string, string> = {
  invited: "Invited",
  medical_questionnaire: "Medical Q",
  injury_history: "Injury History",
  consent_forms: "Consent",
  complete: "Onboarded",
};

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Verify the link first — RLS would also enforce, but a clean 404 is nicer
  // than empty data.
  const { data: link } = await supabase
    .from("coaches_clients")
    .select("started_at, monthly_rate_cents, currency, notes, active")
    .eq("coach_id", user.id)
    .eq("client_id", params.id)
    .eq("active", true)
    .maybeSingle();
  if (!link) notFound();

  const since28d = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: client },
    { data: flags },
    { data: feed },
    { data: assignments },
    { data: metrics },
    { data: prs },
    { count: completedCount },
    { count: missedCount },
  ] = await Promise.all([
    supabase
      .from("clients")
      .select(
        "id, full_name, email, phone, date_of_birth, sex, height_cm, weight_kg, body_fat_pct, goals, injury_history, medical_questionnaire, consent_signed_at, onboarding_step, notes, avatar_url, created_at",
      )
      .eq("id", params.id)
      .maybeSingle(),
    supabase
      .from("triage_flags")
      .select("id, kind, rule, title, detail, severity, created_at, resolved")
      .eq("client_id", params.id)
      .eq("resolved", false)
      .order("severity", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("activity_events")
      .select("id, event_type, payload, occurred_at")
      .eq("client_id", params.id)
      .gte("occurred_at", since28d)
      .order("occurred_at", { ascending: false })
      .limit(20),
    supabase
      .from("program_assignments")
      .select(
        "id, starts_on, ends_on, active, program:programs(id, name, weeks, days_per_week, goal)",
      )
      .eq("client_id", params.id)
      .eq("active", true)
      .order("starts_on", { ascending: false }),
    supabase
      .from("body_metrics")
      .select("recorded_at, weight_kg, body_fat_pct, sleep_hours, steps")
      .eq("client_id", params.id)
      .order("recorded_at", { ascending: false })
      .limit(6),
    supabase
      .from("personal_records")
      .select("metric, value, achieved_at, exercise:exercises(name)")
      .eq("client_id", params.id)
      .order("achieved_at", { ascending: false })
      .limit(6),
    supabase
      .from("activity_events")
      .select("id", { count: "exact", head: true })
      .eq("client_id", params.id)
      .eq("event_type", "workout_completed")
      .gte("occurred_at", since28d),
    supabase
      .from("activity_events")
      .select("id", { count: "exact", head: true })
      .eq("client_id", params.id)
      .eq("event_type", "workout_missed")
      .gte("occurred_at", since28d),
  ]);

  if (!client) notFound();

  const daysOnRoster = Math.max(
    1,
    Math.floor((Date.now() - new Date(link.started_at).getTime()) / (24 * 60 * 60 * 1000)),
  );

  return (
    <div className="space-y-12">
      <Link
        href="/dashboard/clients"
        className="onyx-label hover:text-onyx-amber inline-block"
      >
        ← All clients
      </Link>

      <PageHeader
        eyebrow={`ATHLETE · ${STEP_LABEL[client.onboarding_step] ?? client.onboarding_step}`}
        title={
          <span className="flex items-center gap-5">
            <Avatar name={client.full_name} src={client.avatar_url} size={56} />
            <span>{client.full_name}</span>
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {client.email && (
              <span className="font-mono text-[12px] text-onyx-mute">{client.email}</span>
            )}
            {client.phone && (
              <span className="font-mono text-[12px] text-onyx-mute">{client.phone}</span>
            )}
            <span className="font-mono text-[11px] text-onyx-dim">
              joined {formatDate(client.created_at)} · {daysOnRoster}d on roster
            </span>
          </span>
        }
      />

      {/* Stat cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Open red flags"
          value={String(flags?.filter((f: any) => f.kind === "red").length ?? 0).padStart(2, "0")}
          hint="Sorted by severity"
        />
        <StatCard
          label="Workouts · 28d"
          value={String(completedCount ?? 0).padStart(2, "0")}
          hint={`${missedCount ?? 0} missed`}
        />
        <StatCard
          label="Active programs"
          value={String(assignments?.length ?? 0).padStart(2, "0")}
          hint={
            assignments && assignments.length > 0
              ? "Currently assigned"
              : "No program in flight"
          }
        />
        <StatCard
          label="Plan"
          value={
            link.monthly_rate_cents != null
              ? formatCurrencyCents(link.monthly_rate_cents, link.currency ?? "EUR").replace(/\.00$/, "")
              : "—"
          }
          hint="Monthly · gross"
        />
      </section>

      {/* Two-column main grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Open flags */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <h2 className="onyx-display text-3xl text-onyx-bone">Open flags</h2>
              <span className="font-mono text-[10px] text-onyx-dim">
                {flags?.length ?? 0} OPEN
              </span>
            </div>
            <Card>
              {flags && flags.length > 0 ? (
                <ul className="divide-y divide-onyx-line">
                  {flags.map((f: any) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between gap-4 px-6 py-4"
                    >
                      <div className="flex-1 min-w-0">
                        <FlagTile
                          kind={f.kind}
                          title={f.title}
                          detail={f.detail}
                          rule={f.rule}
                          client={client.full_name}
                          occurredAt={f.created_at}
                        />
                      </div>
                      <ResolveFlagButton flagId={f.id} clientId={client.id} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="No open flags."
                  description="Either everything's calm or this athlete just joined. Either way — no fires."
                />
              )}
            </Card>
          </div>

          {/* Active programs */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <h2 className="onyx-display text-3xl text-onyx-bone">Active programs</h2>
              <span className="font-mono text-[10px] text-onyx-dim">
                {assignments?.length ?? 0}
              </span>
            </div>
            <Card>
              {assignments && assignments.length > 0 ? (
                <ul className="divide-y divide-onyx-line">
                  {assignments.map((a: any) => (
                    <li
                      key={a.id}
                      className="px-6 py-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-[14px] text-onyx-bone">
                          {a.program?.name ?? "Untitled program"}
                        </div>
                        <div className="font-mono text-[11px] text-onyx-dim">
                          {a.program?.weeks ?? "?"}w ·{" "}
                          {a.program?.days_per_week ?? "?"} d/wk ·{" "}
                          {a.program?.goal ?? "—"} · started{" "}
                          {formatDate(a.starts_on)}
                        </div>
                      </div>
                      {a.program?.id && (
                        <Link
                          href={`/dashboard/forge?program=${a.program.id}`}
                          className="onyx-label hover:text-onyx-amber"
                        >
                          Open in forge →
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="No program assigned."
                  description="Build a block in the Forge or apply a template, then assign it here."
                />
              )}
            </Card>
          </div>

          {/* Recent activity */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <h2 className="onyx-display text-3xl text-onyx-bone">Activity · 28d</h2>
              <span className="font-mono text-[10px] text-onyx-dim">
                {feed?.length ?? 0} EVENTS
              </span>
            </div>
            <Card>
              {feed && feed.length > 0 ? (
                <ul className="divide-y divide-onyx-line">
                  {feed.map((e: any) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between gap-4 px-6 py-3"
                    >
                      <Badge
                        variant={
                          e.event_type === "workout_missed"
                            ? "red"
                            : e.event_type === "pr_achieved"
                              ? "signal"
                              : "default"
                        }
                      >
                        {e.event_type.replace(/_/g, " ")}
                      </Badge>
                      <span className="font-mono text-[10px] text-onyx-dim">
                        {formatRelative(e.occurred_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-onyx-mute px-6 py-6">
                  No activity in the last 28 days.
                </p>
              )}
            </Card>
          </div>

          {/* Body metrics */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <h2 className="onyx-display text-3xl text-onyx-bone">Body metrics</h2>
              <span className="font-mono text-[10px] text-onyx-dim">LATEST 6</span>
            </div>
            <Card>
              {metrics && metrics.length > 0 ? (
                <table className="w-full">
                  <thead className="border-b border-onyx-line">
                    <tr className="text-left">
                      <th className="onyx-label px-6 py-3">Date</th>
                      <th className="onyx-label py-3">Weight</th>
                      <th className="onyx-label py-3">BF%</th>
                      <th className="onyx-label py-3">Sleep</th>
                      <th className="onyx-label py-3 pr-6">Steps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-onyx-line">
                    {metrics.map((m: any) => (
                      <tr key={m.recorded_at} className="font-mono text-[12px] text-onyx-bone">
                        <td className="px-6 py-3 text-onyx-mute">{formatDate(m.recorded_at)}</td>
                        <td className="py-3">{m.weight_kg != null ? `${m.weight_kg} kg` : "—"}</td>
                        <td className="py-3">{m.body_fat_pct != null ? `${m.body_fat_pct}%` : "—"}</td>
                        <td className="py-3">{m.sleep_hours != null ? `${m.sleep_hours}h` : "—"}</td>
                        <td className="py-3 pr-6">{m.steps != null ? m.steps.toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-[13px] text-onyx-mute px-6 py-6">
                  No biomarkers logged yet. The mobile app pushes them in.
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Right rail */}
        <aside className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Athlete file</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <FactRow label="Goals" value={client.goals} />
              <FactRow label="DOB" value={client.date_of_birth ? formatDate(client.date_of_birth) : null} />
              <FactRow label="Sex" value={client.sex} />
              <FactRow label="Height" value={client.height_cm ? `${client.height_cm} cm` : null} />
              <FactRow label="Weight" value={client.weight_kg ? `${client.weight_kg} kg` : null} />
              <FactRow label="Body fat" value={client.body_fat_pct ? `${client.body_fat_pct}%` : null} />
              <div>
                <span className="onyx-label">Consent</span>
                <div className="mt-1 text-[13px] text-onyx-bone">
                  {client.consent_signed_at
                    ? `Signed ${formatDate(client.consent_signed_at)}`
                    : <span className="text-onyx-dim">Not signed</span>}
                </div>
              </div>
              {client.injury_history && (
                <div>
                  <span className="onyx-label">Injury history</span>
                  <p className="mt-1 text-[13px] text-onyx-mute whitespace-pre-wrap">
                    {typeof client.injury_history === "string"
                      ? client.injury_history
                      : JSON.stringify(client.injury_history, null, 2)}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent PRs</CardTitle></CardHeader>
            <CardBody>
              {prs && prs.length > 0 ? (
                <ul className="space-y-3">
                  {prs.map((p: any, i: number) => (
                    <li
                      key={i}
                      className="flex items-center justify-between border-b border-onyx-line pb-2 last:border-0"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] text-onyx-bone truncate">
                          {p.exercise?.name ?? "Exercise"}
                        </div>
                        <div className="font-mono text-[10px] text-onyx-dim">
                          {p.metric} · {formatRelative(p.achieved_at)}
                        </div>
                      </div>
                      <span className="font-mono text-[12px] text-onyx-amber">
                        {p.value}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[12px] text-onyx-mute">No PRs logged yet.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Plan & private notes</CardTitle></CardHeader>
            <CardBody>
              <ClientLinkForm
                clientId={client.id}
                defaults={{
                  monthly_rate_cents: link.monthly_rate_cents ?? "",
                  currency: link.currency ?? "EUR",
                  notes: link.notes ?? "",
                }}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Danger zone</CardTitle></CardHeader>
            <CardBody>
              <DangerZone
                clientId={client.id}
                onboardingComplete={client.onboarding_step === "complete"}
              />
            </CardBody>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <span className="onyx-label">{label}</span>
      <div className="mt-1 text-[13px] text-onyx-bone">
        {value ?? <span className="text-onyx-dim">—</span>}
      </div>
    </div>
  );
}
