import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddExerciseForm } from "./add-exercise-form";
import { DeleteExerciseButton } from "./delete-exercise-button";

export const dynamic = "force-dynamic";

export default async function GlobalExerciseDbPage({
  searchParams,
}: {
  searchParams: { q?: string; muscle?: string };
}) {
  const supabase = getSupabaseServer();
  const q = (searchParams.q ?? "").trim();
  const muscle = (searchParams.muscle ?? "").trim();

  let query = supabase
    .from("exercises")
    .select("id, name, primary_muscle, equipment, category, source, external_id")
    .in("source", ["global", "wger"])
    .order("name")
    .limit(500);
  if (q) query = query.ilike("name", `%${q}%`);
  if (muscle) query = query.eq("primary_muscle", muscle);

  const [{ data: rows }, { count: totalCount }] = await Promise.all([
    query,
    supabase
      .from("exercises")
      .select("id", { count: "exact", head: true })
      .in("source", ["global", "wger"]),
  ]);

  const exs = rows ?? [];

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="GLOBAL DB · EXERCISES"
        title={<span>The <em className="not-italic onyx-signal">canon</em>.</span>}
        description={
          <>
            The baseline exercise database every coach inherits — currently
            <span className="text-onyx-bone font-mono"> {totalCount ?? 0}</span> entries.
            Coaches can layer their own custom moves on top in /dashboard/forge.
          </>
        }
      />

      <AddExerciseForm />

      <form className="flex flex-wrap gap-3 items-end" method="get">
        <div className="flex-1 min-w-[240px]">
          <label className="onyx-label" htmlFor="q">Search</label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="bench, row, hip…"
            className="w-full bg-transparent border border-onyx-line px-3 py-2 text-[13px] text-onyx-bone focus:outline-none focus:border-onyx-amber"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="onyx-label" htmlFor="muscle">Primary muscle</label>
          <input
            id="muscle"
            name="muscle"
            defaultValue={muscle}
            placeholder="chest, back…"
            className="w-full bg-transparent border border-onyx-line px-3 py-2 text-[13px] text-onyx-bone focus:outline-none focus:border-onyx-amber"
          />
        </div>
        <button
          type="submit"
          className="border border-onyx-line px-4 py-2 text-[12px] text-onyx-bone hover:border-onyx-amber transition-colors"
        >
          Filter
        </button>
        {(q || muscle) && (
          <Link
            href="/admin/exercises"
            className="text-[12px] text-onyx-dim hover:text-onyx-amber px-2 py-2"
          >
            Clear
          </Link>
        )}
      </form>

      <Card>
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-onyx-line">
          <span className="onyx-label col-span-4">Name</span>
          <span className="onyx-label col-span-2">Primary muscle</span>
          <span className="onyx-label col-span-2">Equipment</span>
          <span className="onyx-label col-span-2">Category</span>
          <span className="onyx-label col-span-1">Source</span>
          <span className="onyx-label col-span-1 text-right">·</span>
        </div>
        <ul className="divide-y divide-onyx-line">
          {exs.map((e: any) => (
            <li
              key={e.id}
              className="grid grid-cols-12 gap-4 px-6 py-3 items-center"
            >
              <div className="col-span-4 text-[14px] text-onyx-bone truncate">{e.name}</div>
              <div className="col-span-2 font-mono text-[11px] text-onyx-mute truncate">
                {e.primary_muscle ?? "—"}
              </div>
              <div className="col-span-2 font-mono text-[11px] text-onyx-mute truncate">
                {e.equipment ?? "—"}
              </div>
              <div className="col-span-2 font-mono text-[11px] text-onyx-mute truncate">
                {e.category ?? "—"}
              </div>
              <div className="col-span-1">
                <Badge variant={e.source === "wger" ? "default" : "signal"}>{e.source}</Badge>
              </div>
              <div className="col-span-1 text-right">
                <DeleteExerciseButton id={e.id} name={e.name} />
              </div>
            </li>
          ))}
          {exs.length === 0 && (
            <li className="px-6 py-12 text-[13px] text-onyx-mute text-center">
              {q || muscle
                ? "No exercises match those filters."
                : "No global exercises yet. Use “+ Add exercise” above."}
            </li>
          )}
        </ul>
        {exs.length === 500 && (
          <div className="px-6 py-3 border-t border-onyx-line text-[11px] font-mono text-onyx-dim">
            Showing first 500 results — refine the search to see more.
          </div>
        )}
      </Card>
    </div>
  );
}
