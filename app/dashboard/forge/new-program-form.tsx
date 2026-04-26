"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createProgram, type ActionResult } from "./actions";

export function NewProgramForm({ template = false }: { template?: boolean }) {
  const [state, action] = useFormState<ActionResult | null, FormData>(
    createProgram,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="is_template" value={template ? "on" : ""} />
      <div>
        <Label htmlFor={`name-${template}`}>Name</Label>
        <Input
          id={`name-${template}`}
          name="name"
          required
          maxLength={120}
          placeholder={template ? "Powerbuilding · 12wk template" : "Athlete X · Block 3"}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor={`weeks-${template}`}>Weeks</Label>
          <Input
            id={`weeks-${template}`}
            name="weeks"
            type="number"
            min={1}
            max={52}
            defaultValue={template ? 12 : 4}
            required
          />
        </div>
        <div>
          <Label htmlFor={`dpw-${template}`}>Days / wk</Label>
          <Input
            id={`dpw-${template}`}
            name="days_per_week"
            type="number"
            min={1}
            max={7}
            defaultValue={4}
          />
        </div>
        <div>
          <Label htmlFor={`goal-${template}`}>Goal</Label>
          <Input
            id={`goal-${template}`}
            name="goal"
            maxLength={60}
            placeholder="powerbuilding"
          />
        </div>
      </div>
      {state && !state.ok && (
        <p className="text-[12px] font-mono text-onyx-red">{state.error}</p>
      )}
      <SubmitButton template={template} />
    </form>
  );
}

function SubmitButton({ template }: { template: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="signal" size="md" disabled={pending}>
      {pending ? "Creating…" : template ? "Create template →" : "Create program →"}
    </Button>
  );
}
