"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { inviteClient, type InviteResult } from "./actions";

export function InviteClient({
  variant = "signal",
  label = "+ New client",
}: {
  variant?: "signal" | "ghost" | "default";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useFormState<InviteResult | null, FormData>(
    async (prev, fd) => {
      const r = await inviteClient(prev, fd);
      if (r.ok) {
        formRef.current?.reset();
        setOpen(false);
        // Hard-nav so middleware sees the refreshed Supabase session cookies.
        window.location.assign(`/dashboard/clients/${r.clientId}`);
      }
      return r;
    },
    null,
  );

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size="md"
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Invite athlete">
        <form ref={formRef} action={action} className="space-y-4">
        <div>
          <Label htmlFor="invite-name">Full name *</Label>
          <Input
            id="invite-name"
            name="full_name"
            required
            maxLength={120}
            placeholder="Jane Doe"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              maxLength={200}
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <Label htmlFor="invite-phone">Phone</Label>
            <Input
              id="invite-phone"
              name="phone"
              type="tel"
              maxLength={40}
              placeholder="+48 600 000 000"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="invite-goals">Goals</Label>
          <Textarea
            id="invite-goals"
            name="goals"
            rows={3}
            maxLength={1000}
            placeholder="What are they here for?"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invite-rate">Monthly rate (cents)</Label>
            <Input
              id="invite-rate"
              name="monthly_rate_cents"
              type="number"
              min={0}
              step={1}
              placeholder="29900"
            />
          </div>
          <div>
            <Label htmlFor="invite-currency">Currency</Label>
            <Input
              id="invite-currency"
              name="currency"
              maxLength={3}
              defaultValue="EUR"
            />
          </div>
        </div>

        {state && !state.ok && (
          <p className="text-[12px] font-mono text-onyx-red">{state.error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Submit />
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => setOpen(false)}
          >
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
    <Button type="submit" variant="signal" size="md" disabled={pending}>
      {pending ? "Adding…" : "Add athlete →"}
    </Button>
  );
}
