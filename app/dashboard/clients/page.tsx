import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
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
  const { supabase, user } = await getCurrentUser();
  if (!user) return null;

  const { data: links } = await supabase
    .from("coaches_clients")
    .select("started_at, monthly_rate_cents, currency, client:clients(id, full_name, email, onboarding_step, avatar_url, created_at, goals)")
    .eq("coach_id", user.id)
    .eq("active", true)
    .order("started_at", { ascending: false });

  const rows = links ?? [];

  return (
    <div className="space-y-10 onyx-enter">
      <PageHeader
        eyebrow="The roster"
        title={<>Your <span className="text-gradient-brand">athletes</span>.</>}
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
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-onyx-line">
            <span className="onyx-label col-span-5">Athlete</span>
            <span className="onyx-label col-span-3">Onboarding</span>
            <span className="onyx-label col-span-2">Started</span>
            <span className="onyx-label col-span-2 text-right">Plan</span>
          </div>
          <ul className="divide-y divide-onyx-line">
            {rows.map((r: any) => (
              <li key={r.client.id}>
                <Link
                  href={`/dashboard/clients/${r.client.id}`}
                  className="flex flex-col gap-3 px-4 py-4 sm:px-6 md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-fg/[.03] transition-colors group"
                >
                  <div className="md:col-span-5 flex items-center gap-3 sm:gap-4 min-w-0">
                    <Avatar name={r.client.full_name} src={r.client.avatar_url} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-medium text-fg truncate group-hover:text-primary transition-colors">{r.client.full_name}</div>
                      <div className="text-[12px] text-fg-3 truncate">{r.client.email ?? "no email"}</div>
                    </div>
                    <div className="md:hidden text-right font-mono text-[13px] text-onyx-bone shrink-0">
                      {r.monthly_rate_cents != null
                        ? new Intl.NumberFormat("en-DE", { style: "currency", currency: r.currency ?? "EUR" }).format(r.monthly_rate_cents / 100)
                        : <span className="text-onyx-dim">—</span>}
                      <span className="text-onyx-dim text-[10px] ml-1">/mo</span>
                    </div>
                  </div>
                  <div className="md:col-span-3 flex items-center justify-between gap-3 md:block">
                    <Badge variant={r.client.onboarding_step === "complete" ? "green" : "default"}>
                      {STEP_LABEL[r.client.onboarding_step] ?? r.client.onboarding_step}
                    </Badge>
                    <span className="md:hidden font-mono text-[12px] text-onyx-mute">{formatDate(r.started_at)}</span>
                  </div>
                  <div className="hidden md:block md:col-span-2 font-mono text-[12px] text-onyx-mute">{formatDate(r.started_at)}</div>
                  <div className="hidden md:block md:col-span-2 text-right font-mono text-[13px] text-onyx-bone">
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
