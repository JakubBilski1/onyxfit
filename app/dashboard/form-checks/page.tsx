import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/onyx/empty-state";
import { formatRelative } from "@/lib/utils";
import { Studio, type ActiveClip } from "./studio";
import type { Annotation } from "./actions";

export const dynamic = "force-dynamic";

export default async function FormChecksPage({
  searchParams,
}: {
  searchParams: { clip?: string };
}) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: pending }, { data: reviewed }] = await Promise.all([
    supabase
      .from("form_checks")
      .select("id, title, status, created_at, exercise:exercises(name), client:clients(full_name, avatar_url)")
      .eq("coach_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("form_checks")
      .select("id, title, status, updated_at, exercise:exercises(name), client:clients(full_name, avatar_url)")
      .eq("coach_id", user.id)
      .eq("status", "reviewed")
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  const selectedId = searchParams.clip;
  let active: ActiveClip | null = null;
  if (selectedId) {
    const { data: clip } = await supabase
      .from("form_checks")
      .select(
        "id, client_id, title, status, text_feedback, annotations, client_video_path, coach_voiceover_path, exercise:exercises(name), client:clients(full_name)",
      )
      .eq("id", selectedId)
      .eq("coach_id", user.id)
      .maybeSingle();

    if (clip) {
      const ex = Array.isArray((clip as any).exercise)
        ? (clip as any).exercise[0]
        : (clip as any).exercise;
      const cl = Array.isArray((clip as any).client)
        ? (clip as any).client[0]
        : (clip as any).client;

      let videoUrl: string | null = null;
      if ((clip as any).client_video_path) {
        const { data } = await supabase.storage
          .from("form-checks")
          .createSignedUrl((clip as any).client_video_path, 60 * 60);
        videoUrl = data?.signedUrl ?? null;
      }
      let voiceoverUrl: string | null = null;
      if ((clip as any).coach_voiceover_path) {
        const { data } = await supabase.storage
          .from("voiceovers")
          .createSignedUrl((clip as any).coach_voiceover_path, 60 * 60);
        voiceoverUrl = data?.signedUrl ?? null;
      }

      active = {
        id: clip.id,
        clientId: (clip as any).client_id,
        title: (clip as any).title ?? null,
        exerciseName: ex?.name ?? null,
        clientName: cl?.full_name ?? null,
        videoUrl,
        voiceoverUrl,
        voiceoverPath: (clip as any).coach_voiceover_path ?? null,
        textFeedback: (clip as any).text_feedback ?? "",
        annotations: ((clip as any).annotations as Annotation[]) ?? [],
        status: (clip as any).status ?? "pending",
      };
    }
  }

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="FORM STUDIO"
        title={<span>Klatka po klatce, <em className="not-italic onyx-signal">analiza</em>.</span>}
        description="Wybierz klip, dodaj adnotacje na osi czasu, nagraj komentarz głosowy, wyślij."
      />

      <Card>
        <Studio clip={active} />
      </Card>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Kolejka oczekujących</CardTitle>
              <Badge variant="signal">{pending?.length ?? 0}</Badge>
            </CardHeader>
            <CardBody>
              {pending && pending.length > 0 ? (
                <ul className="divide-y divide-onyx-line">
                  {pending.map((p: any) => {
                    const isActive = p.id === selectedId;
                    return (
                      <li
                        key={p.id}
                        className={`py-4 flex items-center gap-4 ${
                          isActive ? "bg-onyx-amber/5" : ""
                        }`}
                      >
                        <Avatar name={p.client?.full_name} src={p.client?.avatar_url} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] text-onyx-bone truncate">
                            {p.title ?? p.exercise?.name ?? "Bez tytułu"}
                          </div>
                          <div className="text-[11px] font-mono text-onyx-dim">
                            {p.client?.full_name} · {formatRelative(p.created_at)}
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/form-checks?clip=${p.id}`}
                          className="px-3 h-8 inline-flex items-center justify-center text-[12px] uppercase tracking-[0.2em] border border-onyx-line2 text-onyx-bone hover:border-onyx-amber hover:text-onyx-amber"
                        >
                          {isActive ? "Aktywne" : "Recenzja →"}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-[13px] text-onyx-mute py-6">
                  Pusta kolejka. Klipy pojawią się po wgraniu z aplikacji mobilnej.
                </p>
              )}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ostatnio przejrzane</CardTitle>
          </CardHeader>
          <CardBody>
            {reviewed && reviewed.length > 0 ? (
              <ul className="space-y-3">
                {reviewed.map((r: any) => (
                  <li
                    key={r.id}
                    className="text-[13px] text-onyx-bone border-b border-onyx-line pb-3 last:border-0"
                  >
                    <Link
                      href={`/dashboard/form-checks?clip=${r.id}`}
                      className="block hover:text-onyx-amber"
                    >
                      {r.title ?? r.exercise?.name}
                      <div className="text-[11px] font-mono text-onyx-dim">
                        {r.client?.full_name} · {formatRelative(r.updated_at)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Brak historii."
                description="Twoje przejrzane klipy znajdą się tutaj, posortowane wg atlety."
              />
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
