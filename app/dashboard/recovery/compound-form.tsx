"use client";

import { useRef, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  addCompound,
  deleteCompound,
  type ActionResult,
} from "./actions";

export function CompoundForm({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const action = addCompound.bind(null, clientId);
  const [state, formAction] = useFormState<ActionResult | null, FormData>(
    async (prev, fd) => {
      const r = await action(prev, fd);
      if (r.ok) {
        formRef.current?.reset();
        setOpen(false);
        // Hard-nav so middleware sees the refreshed Supabase session cookies.
        window.location.reload();
      }
      return r;
    },
    null,
  );

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        + Compound
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add compound" size="lg">
        <form ref={formRef} action={formAction} className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <Label htmlFor="comp-name">Name *</Label>
          <Input id="comp-name" name="name" required maxLength={200} placeholder="Creatine monohydrate" />
        </div>
        <div>
          <Label htmlFor="comp-dosage">Dosage</Label>
          <Input id="comp-dosage" name="dosage" maxLength={100} placeholder="5g" />
        </div>
        <div>
          <Label htmlFor="comp-timing">Timing</Label>
          <Input id="comp-timing" name="timing" maxLength={100} placeholder="06:30" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="comp-brand">Brand</Label>
          <Input id="comp-brand" name="brand" maxLength={100} placeholder="MyProtein" />
        </div>
        <div className="md:col-span-2 flex items-center gap-2 mt-7">
          <input id="comp-food" name="with_food" type="checkbox" className="accent-onyx-amber" />
          <Label htmlFor="comp-food" className="!mb-0">With food</Label>
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
      </Modal>
    </>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="signal" size="sm" disabled={pending}>
      {pending ? "Adding…" : "Add compound"}
    </Button>
  );
}

export function CompoundRow({
  id,
  time,
  name,
  dose,
  withFood,
}: {
  id: string;
  time: string;
  name: string;
  dose: string;
  withFood?: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    setError(null);
    start(async () => {
      const r = await deleteCompound(id);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      // Hard-nav so middleware sees the refreshed Supabase session cookies.
      window.location.reload();
    });
  }

  return (
    <li className="flex items-start gap-5">
      <span className="shrink-0 w-28 font-mono text-[10px] tracking-widest text-onyx-amber">
        {time}
      </span>
      <div className="flex-1 border-b border-onyx-line pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[14px] text-onyx-bone">{name}</div>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-[10px] font-mono text-onyx-dim hover:text-onyx-red"
          >
            {pending ? "…" : "✕"}
          </button>
        </div>
        <div className="font-mono text-[11px] text-onyx-mute mt-0.5">
          {dose}
          {withFood ? " · with food" : ""}
        </div>
        {error && <p className="text-[10px] font-mono text-onyx-red">{error}</p>}
      </div>
    </li>
  );
}
