"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { saveNutritionProtocol, type ActionResult } from "./actions";

type Phase = "cut" | "bulk" | "maintenance" | "recomp";
type Mode = "flexible" | "strict_meal_plan";

export type ClientStats = {
  height_cm: number | null;
  weight_kg: number | null;
  date_of_birth: string | null;
  sex: string | null;
};

export type ProtocolDefaults = {
  phase: Phase;
  diet_mode: Mode;
  bmr_kcal: number | null;
  tdee_kcal: number | null;
  target_kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
  fiber_g: number | null;
  water_ml: number | null;
  notes: string;
};

const PHASES: { value: Phase; label: string; deltaPct: number }[] = [
  { value: "cut", label: "CUT", deltaPct: -0.18 },
  { value: "bulk", label: "BULK", deltaPct: 0.12 },
  { value: "maintenance", label: "MAINTENANCE", deltaPct: 0 },
  { value: "recomp", label: "RECOMP", deltaPct: -0.05 },
];

const ACTIVITY: { value: number; label: string }[] = [
  { value: 1.2, label: "Sedentary" },
  { value: 1.375, label: "Light" },
  { value: 1.55, label: "Moderate" },
  { value: 1.725, label: "Heavy" },
  { value: 1.9, label: "Athlete" },
];

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const t = Date.parse(dob);
  if (Number.isNaN(t)) return null;
  const ms = Date.now() - t;
  const yrs = ms / (365.25 * 24 * 60 * 60 * 1000);
  if (yrs < 5 || yrs > 100) return null;
  return Math.floor(yrs);
}

function mifflin(weightKg: number, heightCm: number, age: number, male: boolean): number {
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + (male ? 5 : -161));
}

export function NutritionEditor({
  clientId,
  stats,
  defaults,
}: {
  clientId: string;
  stats: ClientStats;
  defaults: ProtocolDefaults;
}) {
  const [phase, setPhase] = useState<Phase>(defaults.phase);
  const [dietMode, setDietMode] = useState<Mode>(defaults.diet_mode);
  const [activity, setActivity] = useState(1.55);

  const age = useMemo(() => ageFromDob(stats.date_of_birth), [stats.date_of_birth]);
  const sexMale = (stats.sex ?? "").toLowerCase().startsWith("m");

  const bmr = useMemo(() => {
    if (!stats.weight_kg || !stats.height_cm || !age) return null;
    return mifflin(Number(stats.weight_kg), Number(stats.height_cm), age, sexMale);
  }, [stats.weight_kg, stats.height_cm, age, sexMale]);

  const tdee = useMemo(() => (bmr != null ? Math.round(bmr * activity) : null), [bmr, activity]);
  const targetSuggest = useMemo(() => {
    if (tdee == null) return null;
    const delta = PHASES.find((p) => p.value === phase)?.deltaPct ?? 0;
    return Math.round(tdee * (1 + delta));
  }, [tdee, phase]);

  const [bmrField, setBmrField] = useState<string>(
    defaults.bmr_kcal != null ? String(defaults.bmr_kcal) : "",
  );
  const [tdeeField, setTdeeField] = useState<string>(
    defaults.tdee_kcal != null ? String(defaults.tdee_kcal) : "",
  );
  const [targetField, setTargetField] = useState<string>(
    defaults.target_kcal != null ? String(defaults.target_kcal) : "",
  );
  const [proteinField, setProteinField] = useState<string>(
    defaults.protein_g != null ? String(defaults.protein_g) : "",
  );
  const [carbsField, setCarbsField] = useState<string>(
    defaults.carbs_g != null ? String(defaults.carbs_g) : "",
  );
  const [fatsField, setFatsField] = useState<string>(
    defaults.fats_g != null ? String(defaults.fats_g) : "",
  );

  const action = saveNutritionProtocol.bind(null, clientId);
  const [state, formAction] = useFormState<ActionResult | null, FormData>(action, null);

  function applyEngine() {
    if (bmr) setBmrField(String(bmr));
    if (tdee) setTdeeField(String(tdee));
    if (targetSuggest) {
      setTargetField(String(targetSuggest));
      // recompute macros: protein 2g/kg, fats 25%, rest carbs
      if (stats.weight_kg) {
        const p = Math.round(Number(stats.weight_kg) * 2);
        const f = Math.round((targetSuggest * 0.25) / 9);
        const c = Math.max(0, Math.round((targetSuggest - p * 4 - f * 9) / 4));
        setProteinField(String(p));
        setFatsField(String(f));
        setCarbsField(String(c));
      }
    }
  }

  const canEngine = bmr != null && tdee != null;

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="phase" value={phase} />
      <input type="hidden" name="diet_mode" value={dietMode} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="onyx-card p-6">
          <span className="onyx-label">Phase</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {PHASES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPhase(p.value)}
                className={`px-3 py-1.5 text-[11px] font-mono tracking-widest border transition-colors ${
                  phase === p.value
                    ? "border-onyx-amber text-onyx-amber bg-onyx-amber/5"
                    : "border-onyx-line text-onyx-mute hover:border-onyx-line2"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="onyx-card p-6">
          <div className="flex items-center justify-between">
            <span className="onyx-label">Engine · Mifflin-St Jeor</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={applyEngine}
              disabled={!canEngine}
            >
              {canEngine ? "Apply →" : "Need stats"}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {ACTIVITY.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => setActivity(a.value)}
                className={`px-2 py-1 text-[10px] font-mono tracking-widest border ${
                  activity === a.value
                    ? "border-onyx-amber text-onyx-amber"
                    : "border-onyx-line text-onyx-dim hover:border-onyx-line2"
                }`}
              >
                {a.label.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 font-mono text-[12px]">
            <Stat label="BMR" value={bmr != null ? String(bmr) : "—"} />
            <Stat label="TDEE" value={tdee != null ? String(tdee) : "—"} />
            <Stat label="TARGET" value={targetSuggest != null ? String(targetSuggest) : "—"} highlight />
          </div>
          {!canEngine && (
            <p className="text-[11px] text-onyx-dim mt-3">
              Add height, weight, sex and DOB on the athlete file to enable.
            </p>
          )}
        </div>

        <div className="onyx-card p-6">
          <span className="onyx-label">Diet mode</span>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setDietMode("flexible")}
              className={`flex-1 px-3 py-2 text-[11px] font-mono tracking-widest border transition-colors ${
                dietMode === "flexible"
                  ? "border-onyx-amber text-onyx-amber"
                  : "border-onyx-line text-onyx-mute"
              }`}
            >
              FLEXIBLE
            </button>
            <button
              type="button"
              onClick={() => setDietMode("strict_meal_plan")}
              className={`flex-1 px-3 py-2 text-[11px] font-mono tracking-widest border transition-colors ${
                dietMode === "strict_meal_plan"
                  ? "border-onyx-amber text-onyx-amber"
                  : "border-onyx-line text-onyx-mute"
              }`}
            >
              MEAL PLAN
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <NumField
          label="BMR (kcal)"
          name="bmr_kcal"
          value={bmrField}
          onChange={setBmrField}
        />
        <NumField
          label="TDEE (kcal)"
          name="tdee_kcal"
          value={tdeeField}
          onChange={setTdeeField}
        />
        <NumField
          label="Target (kcal)"
          name="target_kcal"
          value={targetField}
          onChange={setTargetField}
          highlight
        />
        <NumField
          label="Protein (g)"
          name="protein_g"
          value={proteinField}
          onChange={setProteinField}
        />
        <NumField
          label="Carbs (g)"
          name="carbs_g"
          value={carbsField}
          onChange={setCarbsField}
        />
        <NumField
          label="Fats (g)"
          name="fats_g"
          value={fatsField}
          onChange={setFatsField}
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fiber_g">Fiber (g)</Label>
          <Input
            id="fiber_g"
            name="fiber_g"
            type="number"
            min={0}
            defaultValue={defaults.fiber_g ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="water_ml">Water (ml)</Label>
          <Input
            id="water_ml"
            name="water_ml"
            type="number"
            min={0}
            defaultValue={defaults.water_ml ?? ""}
          />
        </div>
      </section>

      <div>
        <Label htmlFor="notes">Coach notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={5000}
          defaultValue={defaults.notes}
          placeholder="Cycle context, refeed days, allergens, anything that shapes the plan."
        />
      </div>

      {state && !state.ok && (
        <p className="text-[12px] font-mono text-onyx-red">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-[12px] font-mono text-onyx-amber">Saved.</p>
      )}

      <SaveButton />
    </form>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`border ${
        highlight ? "border-onyx-amber/40 bg-onyx-amber/5" : "border-onyx-line"
      } p-3`}
    >
      <div className="onyx-label">{label}</div>
      <div
        className={`mt-1 text-[18px] ${
          highlight ? "text-onyx-amber" : "text-onyx-bone"
        } font-mono`}
      >
        {value}
      </div>
    </div>
  );
}

function NumField({
  label,
  name,
  value,
  onChange,
  highlight,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  highlight?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <input
        id={name}
        name={name}
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 w-full bg-transparent border-b ${
          highlight ? "border-onyx-amber" : "border-onyx-line"
        } text-onyx-bone placeholder:text-onyx-dim px-0 focus:outline-none focus:border-onyx-amber transition-colors text-[14px]`}
      />
    </div>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="signal" size="md" disabled={pending}>
      {pending ? "Saving…" : "Save protocol"}
    </Button>
  );
}
