import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function GlobalExerciseDbPage() {
  const supabase = getSupabaseServer();
  const { data: globalExs } = await supabase
    .from("exercises")
    .select("id, name, primary_muscle, equipment, source, external_id")
    .in("source", ["global", "wger"])
    .order("name")
    .limit(100);

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="GLOBAL DB · EXERCISES"
        title={<span>The <em className="not-italic onyx-signal">canon</em>.</span>}
        description="Curate the baseline exercise database every coach inherits. Imported from wger or hand-authored."
        action={<Button variant="signal">+ Add exercise</Button>}
      />
      <Card>
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-onyx-line">
          <span className="onyx-label col-span-5">Name</span>
          <span className="onyx-label col-span-3">Primary muscle</span>
          <span className="onyx-label col-span-2">Equipment</span>
          <span className="onyx-label col-span-2 text-right">Source</span>
        </div>
        <ul className="divide-y divide-onyx-line">
          {(globalExs ?? []).map((e: any) => (
            <li key={e.id} className="grid grid-cols-12 gap-4 px-6 py-3 items-center">
              <div className="col-span-5 text-[14px] text-onyx-bone truncate">{e.name}</div>
              <div className="col-span-3 font-mono text-[11px] text-onyx-mute">{e.primary_muscle ?? "—"}</div>
              <div className="col-span-2 font-mono text-[11px] text-onyx-mute">{e.equipment ?? "—"}</div>
              <div className="col-span-2 text-right">
                <Badge variant={e.source === "wger" ? "default" : "signal"}>{e.source}</Badge>
              </div>
            </li>
          ))}
          {(!globalExs || globalExs.length === 0) && (
            <li className="px-6 py-12 text-[13px] text-onyx-mute text-center">
              No global exercises yet. Import from wger or seed manually.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
