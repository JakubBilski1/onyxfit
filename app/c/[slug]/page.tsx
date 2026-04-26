import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyCents } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Achievement = { title: string; year?: number; issuer?: string };

async function loadCoach(slug: string) {
  const supabase = getSupabaseServer();
  const { data: profile } = await supabase
    .from("coach_profiles")
    .select(
      "id, slug, bio, philosophy, specializations, achievements, avatar_url, cover_url, gallery_urls, years_experience, monthly_rate_cents, hourly_rate_cents, currency, rating_avg, rating_count, is_public",
    )
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();
  if (!profile) return null;

  // The coach's display name lives on profiles, which isn't anon-readable.
  // Service-role read is fine here: the coach has explicitly opted in via
  // is_public = true, and we only expose name + first letter of email.
  let displayName = `@${profile.slug ?? "coach"}`;
  try {
    const admin = getSupabaseAdmin();
    const { data: p } = await admin
      .from("profiles")
      .select("full_name, display_name")
      .eq("id", profile.id)
      .maybeSingle();
    displayName = p?.display_name || p?.full_name || displayName;
  } catch {
    // SUPABASE_SERVICE_ROLE_KEY not configured — fall back to handle.
  }

  return { profile, displayName };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await loadCoach(params.slug);
  if (!data) return { title: "Coach not found · Onyx" };
  const { profile, displayName } = data;
  const desc = profile.bio?.slice(0, 160) ?? "Onyx coach storefront.";
  return {
    title: `${displayName} · Onyx Coach`,
    description: desc,
    openGraph: {
      title: `${displayName} · Onyx Coach`,
      description: desc,
      type: "profile",
      images: profile.cover_url ? [{ url: profile.cover_url }] : undefined,
    },
  };
}

export default async function PublicCoachPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await loadCoach(params.slug);
  if (!data) notFound();
  const { profile, displayName } = data;
  const achievements = (profile.achievements ?? []) as Achievement[];
  const specs = (profile.specializations ?? []) as string[];
  const gallery = (profile.gallery_urls ?? []) as string[];

  return (
    <div className="min-h-screen bg-onyx-bg text-onyx-bone">
      <header className="border-b border-onyx-line">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 h-14 flex items-center justify-between">
          <Link href="/" className="onyx-display text-2xl">
            Onyx
          </Link>
          <Link href="/login" className="onyx-label hover:text-onyx-amber">
            Sign in →
          </Link>
        </div>
      </header>

      <section className="relative">
        {profile.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.cover_url}
            alt=""
            className="w-full h-[260px] md:h-[360px] object-cover"
          />
        ) : (
          <div className="w-full h-[200px] md:h-[280px] bg-gradient-to-br from-[#161616] to-[#0a0a0a]" />
        )}
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 -mt-16 relative">
          <div className="flex items-end gap-5 flex-wrap">
            <div className="rounded-full ring-2 ring-onyx-bg bg-onyx-bg">
              <Avatar src={profile.avatar_url} name={displayName} size={120} />
            </div>
            <div className="min-w-0 pb-2">
              <h1 className="onyx-display text-5xl text-onyx-bone leading-none">
                {displayName}
              </h1>
              <div className="flex items-center gap-3 mt-2 font-mono text-[12px] text-onyx-dim">
                <span>@{profile.slug}</span>
                {profile.years_experience != null && (
                  <span>· {profile.years_experience} yrs experience</span>
                )}
                {profile.rating_count > 0 && profile.rating_avg != null && (
                  <span>
                    · ★ {Number(profile.rating_avg).toFixed(1)} ({profile.rating_count})
                  </span>
                )}
              </div>
            </div>
            <div className="ml-auto pb-2 flex items-center gap-3">
              {profile.monthly_rate_cents != null && (
                <span className="font-mono text-[14px] text-onyx-bone">
                  {formatCurrencyCents(profile.monthly_rate_cents, profile.currency ?? "EUR")}
                  <span className="text-onyx-dim text-[10px] ml-1">/mo</span>
                </span>
              )}
              <Link
                href={`/login?coach=${profile.slug}`}
                className="inline-flex items-center justify-center h-10 px-5 text-[12px] uppercase tracking-[0.2em] bg-onyx-amber text-onyx-ink hover:bg-[#ffc14a]"
              >
                Apply to coach →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {profile.bio && (
            <section>
              <span className="onyx-label">About</span>
              <p className="mt-3 text-[16px] leading-relaxed text-onyx-bone whitespace-pre-wrap">
                {profile.bio}
              </p>
            </section>
          )}

          {profile.philosophy && (
            <section>
              <span className="onyx-label">Philosophy</span>
              <p className="mt-3 text-[16px] leading-relaxed text-onyx-mute whitespace-pre-wrap italic">
                {profile.philosophy}
              </p>
            </section>
          )}

          {achievements.length > 0 && (
            <section>
              <span className="onyx-label">Achievements</span>
              <ul className="mt-3 divide-y divide-onyx-line">
                {achievements.map((a, i) => (
                  <li key={i} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[14px] text-onyx-bone">{a.title}</div>
                      {a.issuer && (
                        <div className="font-mono text-[11px] text-onyx-dim">
                          {a.issuer}
                        </div>
                      )}
                    </div>
                    {a.year && (
                      <span className="font-mono text-[12px] text-onyx-amber">
                        {a.year}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {gallery.length > 0 && (
            <section>
              <span className="onyx-label">Gallery</span>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                {gallery.slice(0, 12).map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="w-full aspect-square object-cover border border-onyx-line"
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-8">
          {specs.length > 0 && (
            <section className="onyx-card p-6">
              <span className="onyx-label">Specializations</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {specs.map((s, i) => (
                  <Badge key={i}>{s}</Badge>
                ))}
              </div>
            </section>
          )}

          <section className="onyx-card p-6">
            <span className="onyx-label">Coaching</span>
            <ul className="mt-3 space-y-3 font-mono text-[13px]">
              {profile.monthly_rate_cents != null && (
                <li className="flex items-center justify-between border-b border-onyx-line pb-3">
                  <span className="text-onyx-mute">Monthly</span>
                  <span className="text-onyx-bone">
                    {formatCurrencyCents(profile.monthly_rate_cents, profile.currency ?? "EUR")}
                  </span>
                </li>
              )}
              {profile.hourly_rate_cents != null && (
                <li className="flex items-center justify-between">
                  <span className="text-onyx-mute">Hourly</span>
                  <span className="text-onyx-bone">
                    {formatCurrencyCents(profile.hourly_rate_cents, profile.currency ?? "EUR")}
                  </span>
                </li>
              )}
              {profile.monthly_rate_cents == null && profile.hourly_rate_cents == null && (
                <li className="text-onyx-dim">Pricing on request.</li>
              )}
            </ul>
            <Link
              href={`/login?coach=${profile.slug}`}
              className="mt-5 inline-flex items-center justify-center w-full h-11 text-[12px] uppercase tracking-[0.2em] bg-onyx-amber text-onyx-ink hover:bg-[#ffc14a]"
            >
              Apply to coach →
            </Link>
          </section>
        </aside>
      </main>

      <footer className="border-t border-onyx-line mt-12">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 h-14 flex items-center justify-between font-mono text-[10px] text-onyx-dim">
          <span>Onyx · forged in iron</span>
          <Link href="/" className="hover:text-onyx-amber">
            ← Onyx home
          </Link>
        </div>
      </footer>
    </div>
  );
}
