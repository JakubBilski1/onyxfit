import { PageHeader } from "@/components/onyx/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function RecoveryPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="ENGINE & RECOVERY"
        title={<span>The <em className="not-italic onyx-signal">other</em> half.</span>}
        description="Cardio prescriptions, NEAT step targets, supplement timing — recovery treated with the same rigour as the lifts."
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Cardio prescription</CardTitle><Button variant="ghost" size="sm">+ Block</Button></CardHeader>
          <CardBody>
            <div className="space-y-3">
              <PrescriptionRow kind="LISS" meta="3× / week · 35 min · HR 130-145" />
              <PrescriptionRow kind="HIIT" meta="1× / week · 12 min · 30/60 split · HR 165-180" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>NEAT target</CardTitle></CardHeader>
          <CardBody>
            <div className="flex items-baseline gap-3">
              <span className="onyx-display text-[80px] text-onyx-bone leading-none">12,000</span>
              <span className="font-mono text-[11px] text-onyx-dim">steps / day</span>
            </div>
            <p className="text-[13px] text-onyx-mute mt-3">Apple Health integration shows daily delivery vs. target as a hairline ribbon.</p>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader><CardTitle>Onyx supplement stack · timeline</CardTitle><Button variant="ghost" size="sm">+ Compound</Button></CardHeader>
        <CardBody>
          <ol className="space-y-4">
            <SuppRow time="06:30" name="Creatine monohydrate" dose="5g · with breakfast" />
            <SuppRow time="11:00" name="Vitamin D3 + K2" dose="4000 IU + 100mcg · with fats" />
            <SuppRow time="POST-WORKOUT" name="Whey isolate" dose="40g + 5g leucine" highlight />
            <SuppRow time="22:00" name="Ashwagandha KSM-66" dose="600mg · before bed" />
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}

function PrescriptionRow({ kind, meta }: { kind: string; meta: string }) {
  return (
    <div className="flex items-center justify-between border-b border-onyx-line pb-3 last:border-0">
      <div className="font-mono text-[10px] tracking-[0.32em] text-onyx-amber">{kind}</div>
      <div className="font-mono text-[12px] text-onyx-mute">{meta}</div>
    </div>
  );
}

function SuppRow({ time, name, dose, highlight }: { time: string; name: string; dose: string; highlight?: boolean }) {
  return (
    <li className="flex items-start gap-5">
      <span className={`shrink-0 w-28 font-mono text-[10px] tracking-widest ${highlight ? "text-onyx-amber" : "text-onyx-dim"}`}>{time}</span>
      <div className="flex-1 border-b border-onyx-line pb-3">
        <div className="text-[14px] text-onyx-bone">{name}</div>
        <div className="font-mono text-[11px] text-onyx-mute mt-0.5">{dose}</div>
      </div>
    </li>
  );
}
