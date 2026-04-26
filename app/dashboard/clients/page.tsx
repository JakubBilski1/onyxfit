import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/onyx/empty-state";
import { formatDate } from "@/lib/utils";
import { InviteClient } from "./invite-client";

export const dynamic = "force-dynamic";

const STEP_LABEL: Record<string, string> = {
  invited: "Invited",
  medical_questionnaire: "Medical Q",
  injury_history: "Injury History",
  consent_forms: "Consent",
  complete: "Onboarded",
};

export default async function ClientsPage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: links } = await supabase
    .from("coaches_clients")
    .select("started_at, monthly_rate_cents, currency, client:clients(id, full_name, email, onboarding_step, avatar_url, created_at, goals)")
    .eq("coach_id", user.id)
    .eq("active", true)
    .order("started_at", { ascending: false });

  const rows = links ?? [];

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="THE ROSTER"
        title={<span>Your <em className="not-italic onyx-signal">athletes</em>.</span>}
        description="Each row carries a human story — onboarding, training history, and the shape of their progress."
        action={<InviteClient />}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No clients yet."
          description="Invite your first athlete and the roster will populate. They'll receive an onboarding link with the medical questionnaire, injury history, and consent forms."
          action={<InviteClient label="+ Invite athlete" />}
        />
      ) : (
        <Card>
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-onyx-line">
            <span className="onyx-label col-span-5">Athlete</span>
            <span className="onyx-label col-span-3">Onboarding</span>
            <span className="onyx-label col-span-2">Started</span>
            <span className="onyx-label col-span-2 text-right">Plan</span>
          </div>
          <ul className="divide-y divide-onyx-line">
            {rows.map((r: any) => (
              <li key={r.client.id}>
                <Link href={`/dashboard/clients/${r.client.id}`} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-white/[0.02] transition-colors">
                  <div className="col-span-5 flex items-center gap-4 min-w-0">
                    <Avatar name={r.client.full_name} src={r.client.avatar_url} />
                    <div className="min-w-0">
                      <div className="text-[14px] text-onyx-bone truncate">{r.client.full_name}</div>
                      <div className="text-[12px] text-onyx-dim font-mono truncate">{r.client.email ?? "no email"}</div>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <Badge variant={r.client.onboarding_step === "complete" ? "green" : "default"}>
                      {STEP_LABEL[r.client.onboarding_step] ?? r.client.onboarding_step}
                    </Badge>
                  </div>
                  <div className="col-span-2 font-mono text-[12px] text-onyx-mute">{formatDate(r.started_at)}</div>
                  <div className="col-span-2 text-right font-mono text-[13px] text-onyx-bone">
                    {r.monthly_rate_cents != null
                      ? new Intl.NumberFormat("en-DE", { style: "currency", currency: r.currency ?? "EUR" }).format(r.monthly_rate_cents / 100)
                      : <span className="text-onyx-dim">—</span>}
                    <span className="text-onyx-dim text-[10px] ml-1">/mo</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
