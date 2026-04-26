import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ProfileForm } from "./profile-form";
import { ImageUpload } from "./image-upload";
import { AchievementsEditor } from "./achievements-editor";
import { SpecializationsEditor } from "./specializations-editor";
import type { Achievement } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: prof }, { data: cp }] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle(),
    supabase.from("coach_profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);

  const achievements = (cp?.achievements ?? []) as Achievement[];
  const specs = (cp?.specializations ?? []) as string[];

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="THE STOREFRONT"
        title={<span>Your <em className="not-italic onyx-signal">storefront</em>.</span>}
        description="The face presented to athletes browsing the OnyxFit app. Bio, philosophy, achievements — make it editorial."
        action={
          cp?.slug ? (
            <a
              href={`/c/${cp.slug}`}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "ghost", size: "md" })}
            >
              Preview public page →
            </a>
          ) : undefined
        }
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Identity</CardTitle></CardHeader>
          <CardBody className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar src={cp?.avatar_url} name={prof?.full_name} size={64} />
              <div>
                <div className="text-[16px] text-onyx-bone">{prof?.full_name ?? "Unnamed Coach"}</div>
                <div className="font-mono text-[11px] text-onyx-dim">@{cp?.slug ?? "set-your-handle"}</div>
              </div>
            </div>
            <div className="onyx-rule" />
            <div>
              <Label>Avatar</Label>
              <ImageUpload kind="avatar" initialUrl={cp?.avatar_url ?? null} userId={user.id} />
            </div>
            <div>
              <Label>Cover</Label>
              <ImageUpload kind="cover" initialUrl={cp?.cover_url ?? null} userId={user.id} />
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Bio · philosophy</CardTitle></CardHeader>
          <CardBody>
            <ProfileForm
              defaults={{
                slug: cp?.slug ?? "",
                bio: cp?.bio ?? "",
                philosophy: cp?.philosophy ?? "",
                years_experience: cp?.years_experience ?? "",
                monthly_rate_cents: cp?.monthly_rate_cents ?? "",
                currency: cp?.currency ?? "EUR",
                is_public: cp?.is_public ?? false,
              }}
            />
          </CardBody>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
          <CardBody>
            <AchievementsEditor initial={achievements} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Specializations</CardTitle></CardHeader>
          <CardBody>
            <SpecializationsEditor initial={specs} />
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
