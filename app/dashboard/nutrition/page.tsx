import { PageHeader } from "@/components/onyx/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/onyx/empty-state";
import { Button } from "@/components/ui/button";

export default async function NutritionPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="NUTRITION HUB"
        title={<span>Macros, <em className="not-italic onyx-signal">phases</em>, fuel.</span>}
        description="Toggle between flexible-diet macro targets and strict meal plans. BMR/TDEE auto-calculated via Mifflin-St Jeor."
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Phase</CardTitle></CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {["CUT", "BULK", "MAINTENANCE", "RECOMP"].map((p, i) => (
                <button
                  key={p}
                  className={`px-3 py-1.5 text-[11px] font-mono tracking-widest border ${i === 2 ? "border-onyx-amber text-onyx-amber" : "border-onyx-line text-onyx-mute hover:border-onyx-line2"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Engine · Mifflin-St Jeor</CardTitle></CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 gap-3 font-mono text-[12px]">
              <Stat label="BMR" value="1,720" />
              <Stat label="TDEE" value="2,580" />
              <Stat label="TARGET" value="2,200" highlight />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Diet mode</CardTitle></CardHeader>
          <CardBody>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 text-[11px] font-mono tracking-widest border border-onyx-amber text-onyx-amber">FLEXIBLE</button>
              <button className="flex-1 px-3 py-2 text-[11px] font-mono tracking-widest border border-onyx-line text-onyx-mute">MEAL PLAN</button>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MacroBig label="Calories" value="2200" unit="kcal" />
        <MacroBig label="Protein" value="180" unit="g" />
        <MacroBig label="Carbs" value="220" unit="g" />
        <MacroBig label="Fats" value="65" unit="g" />
      </section>

      <Card>
        <CardHeader><CardTitle>Coach&apos;s custom foods · meal templates</CardTitle><Button variant="ghost" size="sm">Search OFF →</Button></CardHeader>
        <CardBody>
          <EmptyState title="Build your food library." description="Save the foods your athletes actually eat — once. Reach for them across every meal plan." />
        </CardBody>
      </Card>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`border ${highlight ? "border-onyx-amber/40 bg-onyx-amber/5" : "border-onyx-line"} p-3`}>
      <div className="onyx-label">{label}</div>
      <div className={`mt-1 text-[18px] ${highlight ? "text-onyx-amber" : "text-onyx-bone"} font-mono`}>{value}</div>
    </div>
  );
}

function MacroBig({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="onyx-card p-7">
      <span className="onyx-label">{label}</span>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="onyx-display text-[64px] text-onyx-bone leading-none">{value}</span>
        <span className="font-mono text-[12px] text-onyx-dim">{unit}</span>
      </div>
    </div>
  );
}
