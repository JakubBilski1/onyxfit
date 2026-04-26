"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  addGlobalExercise,
  CATEGORY_OPTIONS,
  EQUIPMENT_OPTIONS,
  MUSCLE_OPTIONS,
  type ActionResult,
} from "./actions";

export function AddExerciseForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useFormState<ActionResult | null, FormData>(
    async (prev, fd) => {
      const r = await addGlobalExercise(prev, fd);
      if (r.ok) {
        formRef.current?.reset();
        window.location.reload();
      }
      return r;
    },
    null,
  );

  if (!open) {
    return (
      <Button type="button" variant="signal" onClick={() => setOpen(true)}>
        + Add exercise
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="space-y-4 border border-onyx-line p-5 bg-[#0c0c0c] w-full max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="ex-name">Name</Label>
          <Input id="ex-name" name="name" required maxLength={120} placeholder="Cable Crossover" />
        </div>
        <div>
          <Label htmlFor="ex-primary">Primary muscle</Label>
          <Select id="ex-primary" name="primary_muscle" options={MUSCLE_OPTIONS} />
        </div>
        <div>
          <Label htmlFor="ex-equipment">Equipment</Label>
          <Select id="ex-equipment" name="equipment" options={EQUIPMENT_OPTIONS} />
        </div>
        <div>
          <Label htmlFor="ex-category">Category</Label>
          <Select id="ex-category" name="category" options={CATEGORY_OPTIONS} />
        </div>
        <div>
          <Label htmlFor="ex-secondary">Secondary muscles (comma-separated)</Label>
          <Input
            id="ex-secondary"
            name="secondary_muscles"
            placeholder="triceps, shoulders"
            maxLength={200}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="ex-cues">Cues</Label>
          <textarea
            id="ex-cues"
            name="cues"
            maxLength={1000}
            rows={3}
            placeholder="One short coaching cue per movement."
            className="w-full bg-transparent border border-onyx-line px-3 py-2 text-[13px] text-onyx-bone placeholder:text-onyx-dim focus:outline-none focus:border-onyx-amber"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="ex-video">Video URL (optional)</Label>
          <Input
            id="ex-video"
            name="video_url"
            type="url"
            placeholder="https://youtu.be/..."
            maxLength={500}
          />
        </div>
      </div>
      {state && !state.ok && (
        <p className="text-[11px] font-mono text-onyx-red">{state.error}</p>
      )}
      <div className="flex gap-2 pt-2 border-t border-onyx-line">
        <Submit />
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="signal" size="sm" disabled={pending}>
      {pending ? "Adding…" : "Add to global DB"}
    </Button>
  );
}

function Select({
  id,
  name,
  options,
}: {
  id: string;
  name: string;
  options: readonly string[];
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue=""
      className="w-full bg-transparent border border-onyx-line px-3 py-2 text-[13px] text-onyx-bone focus:outline-none focus:border-onyx-amber"
    >
      <option value="">— pick —</option>
      {options.map((o) => (
        <option key={o} value={o} className="bg-[#0c0c0c]">
          {o}
        </option>
      ))}
    </select>
  );
}
