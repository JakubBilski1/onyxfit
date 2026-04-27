import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/onyx/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/onyx/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NutritionEditor, type ProtocolDefaults } from "./nutrition-editor";
import { CustomFoodForm } from "./custom-food-form";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NutritionPage({
  searchParams,
}: {
  searchParams: { client?: string };
}) {
  const { supabase, user } = await getCurrentUser();
  if (!user) return null;

  const { data: links } = await supabase
    .from("coaches_clients")
    .select("client:clients(id, full_name, avatar_url, height_cm, weight_kg, date_of_birth, sex)")
    .eq("coach_id", user.id)
    .eq("active", true)
    .order("started_at", { ascending: false });

  const clients = (links ?? [])
    .map((l: any) => (Array.isArray(l.client) ? l.client[0] : l.client))
    .filter(Boolean);

  const selectedId = searchParams.client;
  const selected = selectedId ? clients.find((c: any) => c.id === selectedId) : null;

  let defaults: ProtocolDefaults | null = null;
  if (selected) {
    const { data: proto } = await supabase
      .from("nutrition_protocols")
      .select(
        "phase, diet_mode, bmr_kcal, tdee_kcal, target_kcal, protein_g, carbs_g, fats_g, fiber_g, water_ml, notes",
      )
      .eq("coach_id", user.id)
      .eq("client_id", selected.id)
      .eq("active", true)
      .maybeSingle();

    defaults = {
      phase: (proto?.phase as ProtocolDefaults["phase"]) ?? "maintenance",
      diet_mode: (proto?.diet_mode as ProtocolDefaults["diet_mode"]) ?? "flexible",
      bmr_kcal: proto?.bmr_kcal ?? null,
      tdee_kcal: proto?.tdee_kcal ?? null,
      target_kcal: proto?.target_kcal ?? null,
      protein_g: proto?.protein_g ?? null,
      carbs_g: proto?.carbs_g ?? null,
      fats_g: proto?.fats_g ?? null,
      fiber_g: proto?.fiber_g ?? null,
      water_ml: proto?.water_ml ?? null,
      notes: proto?.notes ?? "",
    };
  }

  const { data: foods } = await supabase
    .from("foods")
    .select("id, name, brand, kcal_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g, created_at")
    .eq("owner_coach_id", user.id)
    .eq("source", "custom")
    .order("created_at", { ascending: false })
    .limit(40);

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="NUTRITION HUB"
        title={<span>Macros, <em className="not-italic onyx-signal">phases</em>, fuel.</span>}
        description="Pick an athlete, dial the engine, and persist their protocol. BMR/TDEE auto-calculated via Mifflin-St Jeor."
      />

      <Card>
        <CardHeader>
          <CardTitle>Athlete</CardTitle>
          {selected && (
            <Link href="/dashboard/nutrition" className="onyx-label hover:text-onyx-amber">
              Clear
            </Link>
          )}
        </CardHeader>
        <CardBody>
          {clients.length === 0 ? (
            <EmptyState
              title="No athletes yet."
              description="Invite an athlete on the Clients tab. Their nutrition protocol lives here."
            />
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {clients.map((c: any) => {
                const active = c.id === selectedId;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/dashboard/nutrition?client=${c.id}`}
                      className={`flex items-center gap-3 border p-3 transition-colors ${
                        active
                          ? "border-onyx-amber bg-onyx-amber/5"
                          : "border-onyx-line hover:border-onyx-line2"
                      }`}
                    >
                      <Avatar name={c.full_name} src={c.avatar_url} size={32} />
                      <span className="text-[13px] text-onyx-bone truncate">{c.full_name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      {selected && defaults ? (
        <Card>
          <CardHeader>
            <CardTitle>{selected.full_name} · protocol</CardTitle>
            <Badge>{defaults.phase}</Badge>
          </CardHeader>
          <CardBody>
            <NutritionEditor
              clientId={selected.id}
              stats={{
                height_cm: selected.height_cm,
                weight_kg: selected.weight_kg,
                date_of_birth: selected.date_of_birth,
                sex: selected.sex,
              }}
              defaults={defaults}
            />
          </CardBody>
        </Card>
      ) : clients.length > 0 ? (
        <Card>
          <CardBody>
            <p className="text-[13px] text-onyx-mute py-6 text-center">
              Pick an athlete above to dial in their phase, macros and notes.
            </p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Custom foods · meal-builder library</CardTitle>
          <CustomFoodForm />
        </CardHeader>
        <CardBody>
          {foods && foods.length > 0 ? (
            <ul className="divide-y divide-onyx-line">
              {foods.map((f: any) => (
                <li
                  key={f.id}
                  className="flex flex-col gap-1 py-3 text-[12px] font-mono md:grid md:grid-cols-12 md:gap-3 md:items-center"
                >
                  <span className="md:col-span-4 text-onyx-bone truncate">{f.name}</span>
                  <span className="md:col-span-2 text-onyx-dim truncate">{f.brand ?? "—"}</span>
                  <span className="md:col-span-1 text-onyx-bone md:text-left">
                    <span className="md:hidden text-onyx-dim">kcal </span>{f.kcal_per_100g}
                  </span>
                  <span className="md:col-span-1 text-onyx-mute">P {f.protein_per_100g}</span>
                  <span className="md:col-span-1 text-onyx-mute">C {f.carbs_per_100g}</span>
                  <span className="md:col-span-1 text-onyx-mute">F {f.fats_per_100g}</span>
                  <span className="md:col-span-2 text-onyx-dim md:text-right">
                    {formatDate(f.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Build your food library."
              description="Save the foods your athletes actually eat — once. Reach for them across every meal plan."
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
