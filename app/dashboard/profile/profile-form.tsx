"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { saveCoachProfile, type ActionResult } from "./actions";

type Props = {
  defaults: {
    slug: string;
    bio: string;
    philosophy: string;
    years_experience: number | string;
    monthly_rate_cents: number | string;
    currency: string;
    is_public: boolean;
  };
};

export function ProfileForm({ defaults }: Props) {
  const [state, action] = useFormState<ActionResult | null, FormData>(
    saveCoachProfile,
    null,
  );

  return (
    <form action={action} className="space-y-8">
      <div className="space-y-5">
        <div>
          <Label htmlFor="slug">Public handle (used in /c/&lt;slug&gt;)</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={defaults.slug}
            placeholder="iron-forge-coaching"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={defaults.bio}
            rows={4}
            placeholder="Two sentences. Who you train, why it matters."
          />
        </div>
        <div>
          <Label htmlFor="philosophy">Philosophy</Label>
          <Textarea
            id="philosophy"
            name="philosophy"
            defaultValue={defaults.philosophy}
            rows={6}
            placeholder="Your training principles. Voice the athlete will be opting into."
          />
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div>
            <Label htmlFor="years_experience">Years of experience</Label>
            <Input
              id="years_experience"
              name="years_experience"
              type="number"
              min={0}
              max={80}
              defaultValue={defaults.years_experience}
            />
          </div>
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
              defaultValue={defaults.currency}
              maxLength={3}
            />
          </div>
        </div>
        <label className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            name="is_public"
            defaultChecked={defaults.is_public}
            className="h-4 w-4 accent-onyx-amber"
          />
          <span className="text-[13px] text-onyx-bone">
            Storefront is live · visible in the OnyxFit marketplace
          </span>
        </label>
      </div>

      {state && !state.ok && (
        <p className="text-[12px] font-mono text-onyx-red">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-[12px] font-mono text-onyx-amber">Saved.</p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="signal" size="md" disabled={pending}>
      {pending ? "Saving…" : "Save storefront"}
    </Button>
  );
}
