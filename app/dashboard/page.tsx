import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { StatCard } from "@/components/onyx/stat-card";
import { FlagTile } from "@/components/onyx/flag-tile";
import { QuickActions } from "@/components/onyx/quick-actions";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/onyx/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";
import { UserPlus, Hammer, ScanLine } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TriagePage() {
  const supabase = getSupabaseServer();

  const [
    { data: redFlags },
    { data: greenFlags },
    { data: feed },
    { data: clients },
  ] = await Promise.all([
    supabase
      .from("triage_flags")
      .select("id, kind, rule, title, detail, severity, created_at, client:clients(full_name)")
      .eq("kind", "red")
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("triage_flags")
      .select("id, kind, rule, title, detail, severity, created_at, client:clients(full_name)")
      .eq("kind", "green")
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("activity_events")
      .select("id, event_type, payload, occurred_at, client:clients(full_name, avatar_url)")
      .gte("occurred_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("occurred_at", { ascending: false })
      .limit(40),
    supabase.from("coaches_clients").select("client_id", { count: "exact", head: true }).eq("active", true),
  ]);

  const redCount = redFlags?.length ?? 0;
  const greenCount = greenFlags?.length ?? 0;
  const activityCount = feed?.length ?? 0;

  return (
    <div className="space-y-12 onyx-enter">
      <PageHeader
        eyebrow="THE TRIAGE"
        title={<span>Today&apos;s <em className="not-italic onyx-signal">field</em>.</span>}
        description="Sorted insights from every client under your roof — surfaced before they need to ask."
      />

      <QuickActions
        items={[
          {
            href: "/dashboard/clients",
            eyebrow: "Roster",
            title: "Add an athlete",
            description: "Invite a new client and they'll get a guided onboarding flow.",
            icon: UserPlus,
            primary: true,
          },
          {
            href: "/dashboard/forge",
            eyebrow: "Programming",
            title: "Build a program",
            description: "Drag-and-drop blocks, weeks and exercises into a fresh template.",
            icon: Hammer,
          },
          {
            href: "/dashboard/form-checks",
            eyebrow: "Form Studio",
            title: "Review a clip",
            description: "Annotate technique videos and ship a voice memo back.",
            icon: ScanLine,
          },
        ]}
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 onyx-stagger">
        <StatCard
          label="Red Flags · Open"
          value={String(redCount).padStart(2, "0")}
          hint={redCount > 0 ? "Action required — sorted by severity" : "All quiet on the front line"}
          trend={redCount > 0 ? { direction: "up", value: "needs review" } : undefined}
        />
        <StatCard
          label="Green Flags · 24h"
          value={String(greenCount).padStart(2, "0")}
          hint="Wins worth celebrating with the athlete"
          trend={{ direction: "up", value: "momentum" }}
        />
        <StatCard
          label="Activity · 24h"
          value={String(activityCount).padStart(3, "0")}
          hint="Workouts, meals, PRs and uploads logged in the last day"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="onyx-label">Section · 01</span>
              <h2 className="onyx-display text-4xl mt-2 text-onyx-bone">Flags requiring you.</h2>
            </div>
            <span className="font-mono text-[11px] text-onyx-dim">SORTED · SEVERITY ↓</span>
          </div>
          <Card>
            {redFlags && redFlags.length > 0 ? (
              <div className="divide-y divide-onyx-line">
                {redFlags.map((f: any) => (
                  <FlagTile
                    key={f.id}
                    kind="red"
                    title={f.title}
                    detail={f.detail}
                    rule={f.rule}
                    client={f.client?.full_name ?? "Client"}
                    occurredAt={f.created_at}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No fires to put out."
                description="Every athlete is hitting their marks. Use this calm to draft next week's blocks."
              />
            )}
          </Card>

          {greenFlags && greenFlags.length > 0 && (
            <>
              <div className="flex items-end justify-between pt-4">
                <div>
                  <span className="onyx-label">Section · 02</span>
                  <h2 className="onyx-display text-4xl mt-2 text-onyx-bone">Wins to acknowledge.</h2>
                </div>
              </div>
              <Card>
                <div className="divide-y divide-onyx-line">
                  {greenFlags.map((f: any) => (
                    <FlagTile
                      key={f.id}
                      kind="green"
                      title={f.title}
                      detail={f.detail}
                      rule={f.rule}
                      client={f.client?.full_name ?? "Client"}
                      occurredAt={f.created_at}
                    />
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>

        <aside className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="onyx-label">Section · 03</span>
              <h2 className="onyx-display text-3xl mt-2 text-onyx-bone">Daily feed.</h2>
            </div>
            <span className="font-mono text-[10px] text-onyx-dim">LIVE</span>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Last 24 hours</CardTitle>
              <span className="font-mono text-[10px] text-onyx-dim">{activityCount} events</span>
            </CardHeader>
            <CardBody>
              {feed && feed.length > 0 ? (
                <ul className="space-y-4">
                  {feed.slice(0, 14).map((e: any) => (
                    <FeedRow key={e.id} event={e} />
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-onyx-mute py-4">
                  No activity logged yet today. The feed populates as athletes complete workouts and log meals.
                </p>
              )}
            </CardBody>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function FeedRow({ event }: { event: any }) {
  const verb: Record<string, string> = {
    workout_completed: "completed a session",
    workout_missed: "missed a session",
    meal_logged: "logged a meal",
    pr_achieved: "set a new PR",
    metric_logged: "logged metrics",
    form_check_uploaded: "uploaded a form check",
    message_sent: "sent a message",
  };
  const tone =
    event.event_type === "workout_missed"
      ? "red"
      : event.event_type === "pr_achieved"
        ? "signal"
        : "default";
  return (
    <li className="flex items-start gap-3">
      <Avatar name={event.client?.full_name} size={28} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-onyx-bone truncate">{event.client?.full_name}</span>
          <span className="font-mono text-[10px] text-onyx-dim shrink-0">{formatRelative(event.occurred_at)}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={tone as any}>{verb[event.event_type] ?? event.event_type}</Badge>
        </div>
      </div>
    </li>
  );
}
