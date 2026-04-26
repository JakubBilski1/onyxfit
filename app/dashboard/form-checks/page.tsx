import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/onyx/empty-state";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FormChecksPage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: pending } = await supabase
    .from("form_checks")
    .select("id, title, status, created_at, exercise:exercises(name), client:clients(full_name, avatar_url)")
    .eq("coach_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: reviewed } = await supabase
    .from("form_checks")
    .select("id, title, status, updated_at, exercise:exercises(name), client:clients(full_name, avatar_url)")
    .eq("coach_id", user.id)
    .eq("status", "reviewed")
    .order("updated_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="FORM STUDIO"
        title={<span>Frame by frame, <em className="not-italic onyx-signal">analysis</em>.</span>}
        description="Slow-motion playback, on-canvas annotations, and voice-over feedback delivered straight to your athlete."
      />

      {/* Studio canvas — single featured form check */}
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 min-h-[440px]">
          <div className="lg:col-span-3 bg-[#050505] relative flex items-center justify-center border-r border-onyx-line">
            <div className="absolute inset-6 border border-onyx-line2 grid place-items-center">
              <div className="text-center">
                <div className="onyx-label">— Player canvas —</div>
                <div className="onyx-display text-3xl text-onyx-mute mt-2">No clip loaded</div>
                <p className="text-[12px] text-onyx-dim mt-3 max-w-xs">
                  Pick a pending submission from the queue. The player supports 0.25× / 0.5× / 1× playback
                  with frame-accurate scrubbing and overlay annotations.
                </p>
              </div>
            </div>
            {/* Speed dial */}
            <div className="absolute bottom-6 left-6 flex gap-2 font-mono text-[10px] text-onyx-dim">
              {["0.25×", "0.5×", "1×", "2×"].map((s, i) => (
                <span key={s} className={i === 2 ? "text-onyx-amber border-b border-onyx-amber pb-0.5" : ""}>{s}</span>
              ))}
            </div>
            {/* Tools */}
            <div className="absolute top-6 right-6 flex flex-col gap-2 font-mono text-[10px] text-onyx-dim">
              <span>LINE</span>
              <span>ANGLE</span>
              <span>CIRCLE</span>
              <span className="text-onyx-amber">VOICE</span>
            </div>
          </div>

          <div className="lg:col-span-2 p-6">
            <span className="onyx-label">Annotations</span>
            <ul className="mt-4 space-y-3 font-mono text-[12px]">
              <li className="flex justify-between text-onyx-mute"><span>00:02 · knee tracking line</span><span className="text-onyx-dim">L · 14°</span></li>
              <li className="flex justify-between text-onyx-mute"><span>00:05 · hip hinge angle</span><span className="text-onyx-dim">R · 92°</span></li>
              <li className="flex justify-between text-onyx-mute"><span>00:08 · voiceover note</span><span className="text-onyx-amber">▶ 0:11</span></li>
            </ul>
            <div className="onyx-rule my-6" />
            <span className="onyx-label">Text feedback</span>
            <p className="text-[13px] text-onyx-mute leading-relaxed mt-3">
              Pick a pending clip to begin annotating. Notes and voice memos sync to the athlete&apos;s mobile app
              the moment you save.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="ghost" size="sm">Save draft</Button>
              <Button variant="signal" size="sm">Send to athlete</Button>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pending queue</CardTitle>
              <Badge variant="signal">{pending?.length ?? 0}</Badge>
            </CardHeader>
            <CardBody>
              {pending && pending.length > 0 ? (
                <ul className="divide-y divide-onyx-line">
                  {pending.map((p: any) => (
                    <li key={p.id} className="py-4 flex items-center gap-4">
                      <Avatar name={p.client?.full_name} src={p.client?.avatar_url} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] text-onyx-bone truncate">{p.title ?? p.exercise?.name ?? "Untitled clip"}</div>
                        <div className="text-[11px] font-mono text-onyx-dim">{p.client?.full_name} · {formatRelative(p.created_at)}</div>
                      </div>
                      <Button size="sm" variant="outline">Review →</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-onyx-mute py-6">Nothing pending. Athletes upload via their mobile app and they&apos;ll show up here.</p>
              )}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recently reviewed</CardTitle>
          </CardHeader>
          <CardBody>
            {reviewed && reviewed.length > 0 ? (
              <ul className="space-y-3">
                {reviewed.map((r: any) => (
                  <li key={r.id} className="text-[13px] text-onyx-bone border-b border-onyx-line pb-3 last:border-0">
                    {r.title ?? r.exercise?.name}
                    <div className="text-[11px] font-mono text-onyx-dim">{r.client?.full_name} · {formatRelative(r.updated_at)}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No history yet." description="Your reviewed clips will live here, archived by athlete." />
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
