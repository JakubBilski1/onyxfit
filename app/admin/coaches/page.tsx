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
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-onyx-line">
          <span className="onyx-label col-span-4">Coach</span>
          <span className="onyx-label col-span-3">Status</span>
          <span className="onyx-label col-span-2">Stripe</span>
          <span className="onyx-label col-span-2">Joined</span>
          <span className="onyx-label col-span-1 text-right">Public</span>
        </div>
        <ul className="divide-y divide-onyx-line">
          {(coaches ?? []).map((c: any) => (
            <li key={c.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <Avatar name={c.full_name} />
                <div className="min-w-0">
                  <div className="text-[14px] text-onyx-bone truncate">{c.full_name ?? "Unnamed"}</div>
                  <div className="font-mono text-[11px] text-onyx-dim truncate">{c.email}</div>
                </div>
              </div>
              <div className="col-span-3">
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
              </div>
              <div className="col-span-2 font-mono text-[11px] text-onyx-mute">
                {c.coach_profile?.stripe_charges_enabled ? "✓ Connected" : <span className="text-onyx-dim">— not linked</span>}
              </div>
              <div className="col-span-2 font-mono text-[11px] text-onyx-mute">{formatDate(c.created_at)}</div>
              <div className="col-span-1 text-right font-mono text-[10px] text-onyx-dim">
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
