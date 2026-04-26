"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { updateClientLink, type ActionResult } from "./actions";

type Props = {
  clientId: string;
  defaults: {
    monthly_rate_cents: number | string;
    currency: string;
    notes: string;
  };
};

export function ClientLinkForm({ clientId, defaults }: Props) {
  const action = updateClientLink.bind(null, clientId);
  const [state, formAction] = useFormState<ActionResult | null, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monthly_rate_cents">Monthly rate (cents)</Label>
          <Input
            id="monthly_rate_cents"
            name="monthly_rate_cents"
            type="number"
            min={0}
            defaultValue={defaults.monthly_rate_cents}
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            name="currency"
            maxLength={3}
            defaultValue={defaults.currency}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Coach notes (private)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={5}
          maxLength={5000}
          defaultValue={defaults.notes}
          placeholder="Anything you need to remember about this athlete. Not visible to them."
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

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="signal" size="md" disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </Button>
  );
}
