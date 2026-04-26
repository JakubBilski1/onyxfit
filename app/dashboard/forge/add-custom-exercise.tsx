"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { addCustomExercise, type AddExerciseResult } from "./actions";

export function AddCustomExercise() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useFormState<AddExerciseResult | null, FormData>(
    async (prev, fd) => {
      const r = await addCustomExercise(prev, fd);
      if (r.ok) {
        formRef.current?.reset();
        router.refresh();
      }
      return r;
    },
    null,
  );

  return (
    <form
      ref={formRef}
      action={action}
      className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end"
    >
      <div>
        <Label htmlFor="ce-name">Name</Label>
        <Input id="ce-name" name="name" required maxLength={120} placeholder="Belt Squat" />
      </div>
      <div>
        <Label htmlFor="ce-muscle">Primary muscle</Label>
        <Input
          id="ce-muscle"
          name="primary_muscle"
          maxLength={60}
          placeholder="quadriceps"
        />
      </div>
      <div>
        <Label htmlFor="ce-equip">Equipment</Label>
        <Input
          id="ce-equip"
          name="equipment"
          maxLength={60}
          placeholder="machine"
        />
      </div>
      <SubmitButton />

      <div className="md:col-span-4 min-h-[16px]">
        {state && !state.ok && (
          <span className="text-[11px] font-mono text-onyx-red">{state.error}</span>
        )}
        {state?.ok && (
          <span className="text-[11px] font-mono text-onyx-amber">
            Added “{state.name}”.
          </span>
        )}
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" size="md" disabled={pending}>
      {pending ? "…" : "+ Add"}
    </Button>
  );
}
