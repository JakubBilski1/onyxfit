import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/onyx/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/onyx/empty-state";
import { formatRelative } from "@/lib/utils";
import { NewProgramForm } from "./new-program-form";
import { AddCustomExercise } from "./add-custom-exercise";

export const dynamic = "force-dynamic";

export default async function ForgePage() {
  const { supabase, user } = await getCurrentUser();
  if (!user) return null;

  const [{ data: programs }, { data: templates }, { data: customExercises }] =
    await Promise.all([
      supabase
        .from("programs")
        .select("id, name, weeks, days_per_week, goal, is_template, updated_at")
        .eq("coach_id", user.id)
        .eq("is_template", false)
        .order("updated_at", { ascending: false })
        .limit(40),
      supabase
        .from("programs")
        .select("id, name, weeks, days_per_week, goal, updated_at")
        .eq("coach_id", user.id)
        .eq("is_template", true)
        .order("updated_at", { ascending: false })
        .limit(40),
      supabase
        .from("exercises")
        .select("id, name, primary_muscle, equipment")
        .eq("source", "custom")
        .eq("owner_coach_id", user.id)
        .order("name")
        .limit(20),
    ]);

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="THE FORGE"
        title={
          <span>
            Where <em className="not-italic onyx-signal">programs</em> are
            hammered into shape.
          </span>
        }
        description="Drag exercises onto blocks. Reorder rows between blocks. Save 12-week templates once; instantiate them per athlete."
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>+ New program</CardTitle>
          </CardHeader>
          <CardBody>
            <NewProgramForm />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>+ New template</CardTitle>
          </CardHeader>
          <CardBody>
            <NewProgramForm template />
          </CardBody>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Active programs</CardTitle>
              <span className="font-mono text-[10px] text-onyx-dim">
                {programs?.length ?? 0}
              </span>
            </CardHeader>
            <CardBody>
              {programs && programs.length > 0 ? (
                <ul className="divide-y divide-onyx-line">
                  {programs.map((p: any) => (
                    <li key={p.id}>
                      <Link
                        href={`/dashboard/forge/${p.id}`}
                        className="flex flex-col gap-1 py-3 px-1 hover:bg-white/[0.02] md:grid md:grid-cols-12 md:gap-3 md:items-center"
                      >
                        <div className="md:col-span-6 flex items-center justify-between gap-3">
                          <span className="text-[14px] text-onyx-bone truncate min-w-0 flex-1">
                            {p.name}
                          </span>
                          <span className="md:hidden font-mono text-[10px] text-onyx-dim shrink-0">
                            {formatRelative(p.updated_at)}
                          </span>
                        </div>
                        <div className="md:col-span-2 font-mono text-[11px] text-onyx-dim">
                          {p.weeks}w · {p.days_per_week ?? "—"} d/wk
                        </div>
                        <div className="md:col-span-2">
                          {p.goal && <Badge>{p.goal}</Badge>}
                        </div>
                        <div className="hidden md:block md:col-span-2 font-mono text-[10px] text-onyx-dim text-right">
                          {formatRelative(p.updated_at)}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="No programs yet."
                  description="Create your first block above. The editor opens straight away."
                />
              )}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reusable templates</CardTitle>
            <span className="font-mono text-[10px] text-onyx-dim">
              {templates?.length ?? 0}
            </span>
          </CardHeader>
          <CardBody>
            {templates && templates.length > 0 ? (
              <ul className="space-y-3">
                {templates.map((t: any) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 border-b border-onyx-line pb-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <div className="text-[14px] text-onyx-bone truncate">
                        {t.name}
                      </div>
                      <div className="text-[11px] font-mono text-onyx-dim">
                        {t.weeks}w · {t.goal ?? "—"}
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/forge/${t.id}`}
                      className="onyx-label hover:text-onyx-amber"
                    >
                      Open →
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-onyx-mute py-4">
                No templates. Build one — start with a 12-week powerbuilding
                block.
              </p>
            )}
          </CardBody>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Your custom exercises</CardTitle>
            <span className="font-mono text-[10px] text-onyx-dim">
              {customExercises?.length ?? 0}
            </span>
          </CardHeader>
          <CardBody className="space-y-6">
            <AddCustomExercise />
            {customExercises && customExercises.length > 0 ? (
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {customExercises.map((e: any) => (
                  <li
                    key={e.id}
                    className="border border-onyx-line p-3"
                  >
                    <div className="text-[13px] text-onyx-bone truncate">
                      {e.name}
                    </div>
                    <div className="font-mono text-[10px] text-onyx-dim truncate">
                      {e.primary_muscle ?? "—"} · {e.equipment ?? "—"}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-onyx-mute">
                Nothing custom yet. Add what the global library doesn't cover.
              </p>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
