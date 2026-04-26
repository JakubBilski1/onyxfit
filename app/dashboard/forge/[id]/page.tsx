import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { Badge } from "@/components/ui/badge";
import { ForgeEditor } from "./forge-editor";
import {
  EMPTY_STRUCTURE,
  type ExerciseLite,
  type ProgramStructure,
} from "../types";

export const dynamic = "force-dynamic";

export default async function ProgramDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: program }, { data: exercises }, { data: links }] = await Promise.all([
    supabase
      .from("programs")
      .select("id, name, weeks, days_per_week, goal, is_template, metadata, updated_at")
      .eq("id", params.id)
      .eq("coach_id", user.id)
      .maybeSingle(),
    supabase
      .from("exercises")
      .select("id, name, primary_muscle, equipment, source")
      .or(`source.in.(global,wger),and(source.eq.custom,owner_coach_id.eq.${user.id})`)
      .order("name")
      .limit(1000),
    supabase
      .from("coaches_clients")
      .select("client:clients(id, full_name)")
      .eq("coach_id", user.id)
      .eq("active", true)
      .order("started_at", { ascending: false }),
  ]);

  if (!program) notFound();

  const initial =
    (program.metadata as ProgramStructure | null) ?? EMPTY_STRUCTURE;
  const exList = (exercises ?? []) as ExerciseLite[];
  const clientList = (links ?? [])
    .map((l: any) => {
      // Supabase typegen returns the join as an array even on 1-to-1 FKs.
      const c = Array.isArray(l.client) ? l.client[0] : l.client;
      return c as { id: string; full_name: string } | null;
    })
    .filter((c): c is { id: string; full_name: string } => !!c);

  return (
    <div className="space-y-10">
      <Link
        href="/dashboard/forge"
        className="onyx-label hover:text-onyx-amber inline-block"
      >
        ← All programs
      </Link>

      <PageHeader
        eyebrow={program.is_template ? "TEMPLATE · EDITING" : "PROGRAM · EDITING"}
        title={
          <span>
            {program.name}
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Badge>{program.weeks}w</Badge>
            {program.days_per_week && <Badge>{program.days_per_week} d/wk</Badge>}
            {program.goal && <Badge variant="signal">{program.goal}</Badge>}
            {program.is_template && <Badge variant="green">TEMPLATE</Badge>}
          </span>
        }
      />

      <ForgeEditor
        programId={program.id}
        initial={initial}
        exercises={exList}
        clients={clientList}
      />
    </div>
  );
}
