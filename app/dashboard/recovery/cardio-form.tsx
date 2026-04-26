"use client";

import { useRef, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  addCardioBlock,
  deleteCardioBlock,
  type ActionResult,
} from "./actions";

const KINDS = ["liss", "hiit", "moderate", "sport"] as const;
type Kind = (typeof KINDS)[number];

export function CardioBlockForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState<Kind>("liss");

  const action = addCardioBlock.bind(null, clientId);
  const [state, formAction] = useFormState<ActionResult | null, FormData>(
    async (prev, fd) => {
      const r = await action(prev, fd);
      if (r.ok) {
        formRef.current?.reset();
        setOpen(false);
        setKind("liss");
        router.refresh();
      }
      return r;
    },
    null,
  );

  if (!open) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        + Block
      </Button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3 border border-onyx-line p-4 mt-3">
      <input type="hidden" name="kind" value={kind} />
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`px-2.5 py-1 text-[10px] font-mono tracking-widest border ${
              k === kind
                ? "border-onyx-amber text-onyx-amber"
                : "border-onyx-line text-onyx-mute"
            }`}
          >
            {k.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <Label htmlFor="duration_minutes">Duration (min)</Label>
          <Input id="duration_minutes" name="duration_minutes" type="number" min={1} max={600} required defaultValue={30} />
        </div>
        <div>
          <Label htmlFor="weekly_target_sessions">Per week</Label>
          <Input id="weekly_target_sessions" name="weekly_target_sessions" type="number" min={1} max={14} required defaultValue={3} />
        </div>
        <div>
          <Label htmlFor="target_hr_low">HR low</Label>
          <Input id="target_hr_low" name="target_hr_low" type="number" min={30} max={230} placeholder="130" />
        </div>
        <div>
          <Label htmlFor="target_hr_high">HR high</Label>
          <Input id="target_hr_high" name="target_hr_high" type="number" min={30} max={230} placeholder="145" />
        </div>
      </div>
      <div>
        <Label htmlFor="daily_steps_target">Daily steps</Label>
        <Input id="daily_steps_target" name="daily_steps_target" type="number" min={0} max={200000} placeholder="12000" />
      </div>
      <div>
        <Label htmlFor="cardio-notes">Notes</Label>
        <Textarea id="cardio-notes" name="notes" rows={2} maxLength={2000} />
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
      {pending ? "Adding…" : "Add block"}
    </Button>
  );
}

export function CardioRow({
  id,
  kind,
  meta,
}: {
  id: string;
  kind: string;
  meta: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    setError(null);
    start(async () => {
      const r = await deleteCardioBlock(id);
      if (!r.ok) setError(r.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between border-b border-onyx-line pb-3 last:border-0">
      <div className="font-mono text-[10px] tracking-[0.32em] text-onyx-amber">
        {kind}
      </div>
      <div className="flex items-center gap-3">
        <div className="font-mono text-[12px] text-onyx-mute">{meta}</div>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          title="Remove"
          className="text-[10px] font-mono text-onyx-dim hover:text-onyx-red"
        >
          {pending ? "…" : "✕"}
        </button>
      </div>
      {error && <span className="text-[10px] font-mono text-onyx-red ml-2">{error}</span>}
    </div>
  );
}
