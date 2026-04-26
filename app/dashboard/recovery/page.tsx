import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/onyx/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/onyx/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { CardioBlockForm, CardioRow } from "./cardio-form";
import { CompoundForm, CompoundRow } from "./compound-form";

export const dynamic = "force-dynamic";

export default async function RecoveryPage({
  searchParams,
}: {
  searchParams: { client?: string };
}) {
  const { supabase, user } = await getCurrentUser();
  if (!user) return null;

  const { data: links } = await supabase
    .from("coaches_clients")
    .select("client:clients(id, full_name, avatar_url)")
    .eq("coach_id", user.id)
    .eq("active", true)
    .order("started_at", { ascending: false });

  const clients = (links ?? [])
    .map((l: any) => (Array.isArray(l.client) ? l.client[0] : l.client))
    .filter(Boolean);

  const selectedId = searchParams.client;
  const selected = selectedId ? clients.find((c: any) => c.id === selectedId) : null;

  let cardio: any[] = [];
  let compounds: any[] = [];

  if (selected) {
    const [{ data: cps }, { data: stack }] = await Promise.all([
      supabase
        .from("cardio_prescriptions")
        .select("id, kind, duration_minutes, weekly_target_sessions, target_hr_low, target_hr_high, daily_steps_target")
        .eq("coach_id", user.id)
        .eq("client_id", selected.id)
        .eq("active", true)
        .order("created_at", { ascending: true }),
      supabase
        .from("supplement_stacks")
        .select("id, supplement_items(id, name, dosage, timing, brand, with_food, position)")
        .eq("coach_id", user.id)
        .eq("client_id", selected.id)
        .eq("active", true)
        .maybeSingle(),
    ]);
    cardio = cps ?? [];
    const items = (stack as any)?.supplement_items ?? [];
    compounds = [...items].sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
  }

  const stepsTarget = cardio.find((c: any) => c.daily_steps_target)?.daily_steps_target ?? null;

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="ENGINE & RECOVERY"
        title={<span>The <em className="not-italic onyx-signal">other</em> half.</span>}
        description="Cardio prescriptions, NEAT step targets, supplement timing — recovery treated with the same rigour as the lifts."
      />

      <Card>
        <CardHeader>
          <CardTitle>Athlete</CardTitle>
          {selected && (
            <Link href="/dashboard/recovery" className="onyx-label hover:text-onyx-amber">
              Clear
            </Link>
          )}
        </CardHeader>
        <CardBody>
          {clients.length === 0 ? (
            <EmptyState
              title="No athletes yet."
              description="Invite an athlete on the Clients tab to start prescribing recovery."
            />
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {clients.map((c: any) => {
                const active = c.id === selectedId;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/dashboard/recovery?client=${c.id}`}
                      className={`flex items-center gap-3 border p-3 transition-colors ${
                        active
                          ? "border-onyx-amber bg-onyx-amber/5"
                          : "border-onyx-line hover:border-onyx-line2"
                      }`}
                    >
                      <Avatar name={c.full_name} src={c.avatar_url} size={32} />
                      <span className="text-[13px] text-onyx-bone truncate">{c.full_name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      {selected ? (
        <>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cardio prescription</CardTitle>
                <CardioBlockForm clientId={selected.id} />
              </CardHeader>
              <CardBody>
                {cardio.length === 0 ? (
                  <p className="text-[13px] text-onyx-mute py-4">
                    No cardio yet. Click <em>+ Block</em> above to prescribe one.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cardio.map((c: any) => {
                      const hr =
                        c.target_hr_low && c.target_hr_high
                          ? ` · HR ${c.target_hr_low}-${c.target_hr_high}`
                          : "";
                      const meta = `${c.weekly_target_sessions}× / week · ${c.duration_minutes} min${hr}`;
                      return (
                        <CardioRow
                          key={c.id}
                          id={c.id}
                          kind={String(c.kind).toUpperCase()}
                          meta={meta}
                        />
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader><CardTitle>NEAT target</CardTitle></CardHeader>
              <CardBody>
                <div className="flex items-baseline gap-3">
                  <span className="onyx-display text-[80px] text-onyx-bone leading-none">
                    {stepsTarget ? stepsTarget.toLocaleString() : "—"}
                  </span>
                  <span className="font-mono text-[11px] text-onyx-dim">steps / day</span>
                </div>
                <p className="text-[13px] text-onyx-mute mt-3">
                  Set a daily-steps target on a cardio block to drive this. Apple Health
                  delivery shows up here once the mobile app is connected.
                </p>
              </CardBody>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Onyx supplement stack · timeline</CardTitle>
              <CompoundForm clientId={selected.id} />
            </CardHeader>
            <CardBody>
              {compounds.length === 0 ? (
                <p className="text-[13px] text-onyx-mute py-4">
                  No compounds yet. Add one with <em>+ Compound</em>.
                </p>
              ) : (
                <ol className="space-y-4">
                  {compounds.map((it: any) => (
                    <CompoundRow
                      key={it.id}
                      id={it.id}
                      time={it.timing ?? "—"}
                      name={it.name}
                      dose={[it.dosage, it.brand].filter(Boolean).join(" · ") || "—"}
                      withFood={it.with_food}
                    />
                  ))}
                </ol>
              )}
            </CardBody>
          </Card>
        </>
      ) : clients.length > 0 ? (
        <Card>
          <CardBody>
            <p className="text-[13px] text-onyx-mute py-6 text-center">
              Pick an athlete above to prescribe cardio and supplements.
            </p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
