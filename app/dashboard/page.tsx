import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/onyx/page-header";
import { StatCard } from "@/components/onyx/stat-card";
import { FlagTile } from "@/components/onyx/flag-tile";
import { QuickActions } from "@/components/onyx/quick-actions";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/onyx/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";
import {
  AlertTriangle,
  Hammer,
  ScanLine,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TriagePage() {
  const { supabase, user } = await getCurrentUser();
  if (!user) return null;

  const [
    { data: redFlags },
    { data: greenFlags },
    { data: feed },
    { count: clientCount },
  ] = await Promise.all([
    supabase
      .from("triage_flags")
      .select(
        "id, kind, rule, title, detail, severity, created_at, client:clients(full_name)",
      )
      .eq("kind", "red")
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("triage_flags")
      .select(
        "id, kind, rule, title, detail, severity, created_at, client:clients(full_name)",
      )
      .eq("kind", "green")
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("activity_events")
      .select(
        "id, event_type, payload, occurred_at, client:clients(full_name, avatar_url)",
      )
      .gte(
        "occurred_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      )
      .order("occurred_at", { ascending: false })
      .limit(40),
    supabase
      .from("coaches_clients")
      .select("client_id", { count: "exact", head: true })
      .eq("coach_id", user.id)
      .eq("active", true),
  ]);

  const redCount = redFlags?.length ?? 0;
  const greenCount = greenFlags?.length ?? 0;
  const activityCount = feed?.length ?? 0;
  const totalClients = clientCount ?? 0;

  // First-run hero — coach with zero athletes gets a different welcome
  if (totalClients === 0) {
    return (
      <div className="space-y-10 onyx-enter">
        <div className="onyx-aurora rounded-2xl border border-line bg-card overflow-hidden p-10 md:p-14">
          <span className="inline-flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.22em] text-fg-3 mb-5">
            <span className="block h-1 w-1 rounded-full bg-primary" />
            Welcome to Onyx
          </span>
          <h1 className="text-[clamp(32px,5vw,52px)] font-semibold tracking-tight text-fg leading-[1.05] max-w-3xl">
            Your coaching console is{" "}
            <span className="text-gradient-brand">ready</span>. Let&apos;s bring
            in your first athlete.
          </h1>
          <p className="mt-4 text-[15px] text-fg-2 leading-relaxed max-w-xl">
            Invite a client and they&apos;ll get a guided onboarding flow —
            medical questionnaire, injury history and consent — all in one link.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="/dashboard/clients"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-primary text-primary-fg text-[14px] font-semibold shadow-soft hover:shadow-glow-primary hover:brightness-[1.04] transition-all duration-200 ease-out-expo active:scale-[0.97]"
            >
              <UserPlus size={16} strokeWidth={2} />
              Invite first athlete
            </a>
            <a
              href="/dashboard/forge"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-md border border-line-strong text-fg hover:border-primary hover:text-primary transition-colors duration-200"
            >
              <Hammer size={16} strokeWidth={1.6} />
              Build a program first
            </a>
          </div>
        </div>

        <QuickActions
          items={[
            {
              href: "/dashboard/clients",
              eyebrow: "Roster",
              title: "Add an athlete",
              description: "Send an invite link with full medical onboarding baked in.",
              icon: UserPlus,
              tone: "primary",
              primary: true,
            },
            {
              href: "/dashboard/forge",
              eyebrow: "Programming",
              title: "Build a program",
              description: "Drag-and-drop weeks, days, and exercises into a template.",
              icon: Hammer,
              tone: "violet",
            },
            {
              href: "/admin/exercises",
              eyebrow: "Library",
              title: "Browse the catalog",
              description: "140+ canonical exercises, ready to drop into any program.",
              icon: Sparkles,
              tone: "emerald",
            },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 onyx-enter">
      <PageHeader
        eyebrow="Today's field"
        title={
          <>
            Triage,{" "}
            <span className="text-gradient-brand">at a glance</span>.
          </>
        }
        description="Sorted insights from every athlete under your roof — surfaced before they need to ask."
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 onyx-stagger">
        <StatCard
          label="Athletes"
          value={String(totalClients).padStart(2, "0")}
          hint="Active under your roof"
          tone="primary"
          icon={<Users size={15} strokeWidth={1.8} />}
        />
        <StatCard
          label="Red flags"
          value={String(redCount).padStart(2, "0")}
          hint={redCount > 0 ? "Action required" : "All quiet on the front line"}
          tone={redCount > 0 ? "rose" : "neutral"}
          icon={<AlertTriangle size={15} strokeWidth={1.8} />}
          trend={redCount > 0 ? { direction: "up", value: "review" } : undefined}
        />
        <StatCard
          label="Green flags · 24h"
          value={String(greenCount).padStart(2, "0")}
          hint="Wins worth a message back"
          tone="emerald"
          icon={<Sparkles size={15} strokeWidth={1.8} />}
          trend={{ direction: "up", value: "momentum" }}
        />
        <StatCard
          label="Activity · 24h"
          value={String(activityCount).padStart(3, "0")}
          hint="Workouts, meals and uploads logged"
          tone="violet"
          icon={<TrendingUp size={15} strokeWidth={1.8} />}
        />
      </section>

      <QuickActions
        items={[
          {
            href: "/dashboard/clients",
            eyebrow: "Roster",
            title: "Invite an athlete",
            description: "Send a guided onboarding link — medical, injury, consent.",
            icon: UserPlus,
            tone: "primary",
          },
          {
            href: "/dashboard/forge",
            eyebrow: "Programming",
            title: "Open the Forge",
            description: "Build or assign a program in seconds.",
            icon: Hammer,
            tone: "violet",
          },
          {
            href: "/dashboard/form-checks",
            eyebrow: "Form Studio",
            title: "Review a clip",
            description: "Annotate technique videos and ship a voice memo.",
            icon: ScanLine,
            tone: "emerald",
          },
        ]}
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold tracking-tight text-fg">
              Flags requiring you
            </h2>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-fg-3">
              Sorted · severity ↓
            </span>
          </div>
          <Card>
            {redFlags && redFlags.length > 0 ? (
              <div className="divide-y divide-line">
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
                icon={<Sparkles size={20} strokeWidth={1.6} />}
                title="No fires to put out."
                description="Every athlete is hitting their marks. Use this calm to draft next week's blocks."
              />
            )}
          </Card>

          {greenFlags && greenFlags.length > 0 && (
            <>
              <div className="flex items-center justify-between pt-4">
                <h2 className="text-[20px] font-semibold tracking-tight text-fg">
                  Wins to acknowledge
                </h2>
              </div>
              <Card>
                <div className="divide-y divide-line">
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

        <aside className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold tracking-tight text-fg">
              Daily feed
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.22em] text-emerald">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald onyx-dot-pulse" />
              Live
            </span>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Last 24 hours</CardTitle>
              <span className="text-[11px] text-fg-3">{activityCount} events</span>
            </CardHeader>
            <CardBody>
              {feed && feed.length > 0 ? (
                <ul className="space-y-4">
                  {feed.slice(0, 14).map((e: any) => (
                    <FeedRow key={e.id} event={e} />
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-fg-2 py-4">
                  No activity logged yet today. The feed populates as athletes
                  complete workouts and log meals.
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
        ? "primary"
        : "default";
  return (
    <li className="flex items-start gap-3">
      <Avatar name={event.client?.full_name} size={32} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13.5px] font-medium text-fg truncate">
            {event.client?.full_name}
          </span>
          <span className="text-[10.5px] text-fg-3 shrink-0">
            {formatRelative(event.occurred_at)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={tone as any}>
            {verb[event.event_type] ?? event.event_type}
          </Badge>
        </div>
      </div>
    </li>
  );
}
