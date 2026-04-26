"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { sendBroadcast, type BroadcastResult } from "./actions";

const AUDIENCES = [
  { id: "all", label: "ALL" },
  { id: "coaches", label: "COACHES" },
  { id: "clients", label: "CLIENTS" },
  { id: "active_coaches", label: "ACTIVE COACHES" },
  { id: "pending_coaches", label: "PENDING COACHES" },
] as const;

export function BroadcastForm() {
  const [audience, setAudience] = useState<string>("all");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useFormState<BroadcastResult | null, FormData>(
    async (prev, fd) => {
      const result = await sendBroadcast(prev, fd);
      if (result.ok) formRef.current?.reset();
      return result;
    },
    null,
  );

  return (
    <form action={action} ref={formRef} className="space-y-5">
      <input type="hidden" name="audience" value={audience} />

      <div>
        <Label>Audience</Label>
        <div className="flex flex-wrap gap-2">
          {AUDIENCES.map((a) => {
            const active = audience === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setAudience(a.id)}
                className={`px-3 py-1.5 text-[10px] font-mono tracking-widest border ${
                  active
                    ? "border-onyx-amber text-onyx-amber"
                    : "border-onyx-line text-onyx-mute hover:border-onyx-line2"
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={120}
          placeholder="One sharp line."
        />
      </div>

      <div>
        <Label htmlFor="body">Body</Label>
        <Textarea
          id="body"
          name="body"
          required
          maxLength={5000}
          rows={6}
          placeholder="The message. Plain text. Keep it editorial."
        />
      </div>

      {state && !state.ok && (
        <p className="text-[12px] font-mono text-onyx-red">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-[12px] font-mono text-onyx-amber">
          Broadcast queued.
        </p>
      )}

      <div className="flex justify-end gap-3">
        <SubmitButton intent="draft" variant="ghost">Save draft</SubmitButton>
        <SubmitButton intent="send" variant="signal">Send broadcast</SubmitButton>
      </div>
    </form>
  );
}

function SubmitButton({
  intent,
  variant,
  children,
}: {
  intent: "draft" | "send";
  variant: "ghost" | "signal";
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      name="intent"
      value={intent}
      variant={variant}
      disabled={pending}
    >
      {pending ? "…" : children}
    </Button>
  );
}
