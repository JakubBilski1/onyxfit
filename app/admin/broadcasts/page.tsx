import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { formatRelative } from "@/lib/utils";
import { BroadcastForm } from "./broadcast-form";

export const dynamic = "force-dynamic";

export default async function BroadcastsPage() {
  const supabase = getSupabaseServer();
  const { data: history } = await supabase
    .from("admin_broadcasts")
    .select("id, title, body, audience, sent_at")
    .order("sent_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="GLOBAL · BROADCAST"
        title={<span>One <em className="not-italic onyx-signal">message</em> · the whole platform.</span>}
        description="Push announcements to all coaches, all clients, or specific verification cohorts."
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>New broadcast</CardTitle></CardHeader>
          <CardBody>
            <BroadcastForm />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>History</CardTitle></CardHeader>
          <CardBody>
            {history && history.length > 0 ? (
              <ul className="divide-y divide-onyx-line">
                {history.map((h: any) => (
                  <li key={h.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] text-onyx-bone">{h.title}</span>
                      <span className="font-mono text-[10px] text-onyx-dim">{formatRelative(h.sent_at)}</span>
                    </div>
                    <p className="text-[13px] text-onyx-mute mt-1 line-clamp-2">{h.body}</p>
                    <span className="onyx-label mt-2 inline-block">{h.audience}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-onyx-mute py-4">No broadcasts sent. The first one sets the tone.</p>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
