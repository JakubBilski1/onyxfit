"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { addCustomFood, type ActionResult } from "./actions";

export function CustomFoodForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useFormState<ActionResult | null, FormData>(
    async (prev, fd) => {
      const r = await addCustomFood(prev, fd);
      if (r.ok) {
        formRef.current?.reset();
        // Hard-nav so middleware sees the refreshed Supabase session cookies.
        window.location.reload();
      }
      return r;
    },
    null,
  );

  if (!open) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        + Custom food
      </Button>
    );
  }

  return (
    <form ref={formRef} action={action} className="space-y-3 border border-onyx-line p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="cf-name">Name</Label>
          <Input id="cf-name" name="name" required maxLength={200} placeholder="Skyr 0%" />
        </div>
        <div>
          <Label htmlFor="cf-brand">Brand</Label>
          <Input id="cf-brand" name="brand" maxLength={200} placeholder="Piątnica" />
        </div>
        <div>
          <Label htmlFor="cf-kcal">Kcal / 100g</Label>
          <Input id="cf-kcal" name="kcal_per_100g" type="number" min={0} step="0.1" required />
        </div>
        <div>
          <Label htmlFor="cf-protein">Protein / 100g</Label>
          <Input id="cf-protein" name="protein_per_100g" type="number" min={0} step="0.1" required />
        </div>
        <div>
          <Label htmlFor="cf-carbs">Carbs / 100g</Label>
          <Input id="cf-carbs" name="carbs_per_100g" type="number" min={0} step="0.1" required />
        </div>
        <div>
          <Label htmlFor="cf-fats">Fats / 100g</Label>
          <Input id="cf-fats" name="fats_per_100g" type="number" min={0} step="0.1" required />
        </div>
      </div>
      {state && !state.ok && (
        <p className="text-[11px] font-mono text-onyx-red">{state.error}</p>
      )}
      <div className="flex gap-2">
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
      {pending ? "Adding…" : "Add food"}
    </Button>
  );
}
