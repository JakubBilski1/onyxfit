import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CoachesPage() {
  const supabase = getSupabaseServer();
  const { data: coaches } = await supabase
    .from("profiles")
    .select("id, full_name, email, verification_status, created_at, coach_profile:coach_profiles(monthly_rate_cents, currency, is_public, stripe_charges_enabled)")
    .eq("role", "coach")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="COACHES"
        title={<span>The <em className="not-italic onyx-signal">roster</em>.</span>}
        description="Every coach the platform has approved, plus those still moving through verification."
      />
      <Card>
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-onyx-line">
          <span className="onyx-label col-span-4">Coach</span>
          <span className="onyx-label col-span-3">Status</span>
          <span className="onyx-label col-span-2">Stripe</span>
          <span className="onyx-label col-span-2">Joined</span>
          <span className="onyx-label col-span-1 text-right">Public</span>
        </div>
        <ul className="divide-y divide-onyx-line">
          {(coaches ?? []).map((c: any) => (
            <li
              key={c.id}
              className="flex flex-col gap-3 px-4 py-4 sm:px-6 md:grid md:grid-cols-12 md:gap-4 md:items-center"
            >
              <div className="md:col-span-4 flex items-center gap-3 min-w-0">
                <Avatar name={c.full_name} />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] text-onyx-bone truncate">{c.full_name ?? "Unnamed"}</div>
                  <div className="font-mono text-[11px] text-onyx-dim truncate">{c.email}</div>
                </div>
                <span className="md:hidden font-mono text-[10px] text-onyx-dim shrink-0">
                  {c.coach_profile?.is_public ? "PUB" : "—"}
                </span>
              </div>
              <div className="md:col-span-3 flex flex-wrap items-center gap-2 md:block">
                <Badge
                  variant={
                    c.verification_status === "active"
                      ? "green"
                      : c.verification_status === "rejected" || c.verification_status === "suspended"
                        ? "red"
                        : "signal"
                  }
                >
                  {c.verification_status}
                </Badge>
                <span className="md:hidden font-mono text-[11px] text-onyx-mute">
                  {c.coach_profile?.stripe_charges_enabled ? "✓ Stripe" : "— No Stripe"}
                </span>
                <span className="md:hidden font-mono text-[11px] text-onyx-mute">
                  · {formatDate(c.created_at)}
                </span>
              </div>
              <div className="hidden md:block md:col-span-2 font-mono text-[11px] text-onyx-mute">
                {c.coach_profile?.stripe_charges_enabled ? "✓ Connected" : <span className="text-onyx-dim">— not linked</span>}
              </div>
              <div className="hidden md:block md:col-span-2 font-mono text-[11px] text-onyx-mute">{formatDate(c.created_at)}</div>
              <div className="hidden md:block md:col-span-1 text-right font-mono text-[10px] text-onyx-dim">
                {c.coach_profile?.is_public ? "PUB" : "—"}
              </div>
            </li>
          ))}
          {(!coaches || coaches.length === 0) && (
            <li className="px-6 py-12 text-center text-[13px] text-onyx-mute">No coaches on the platform yet.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
