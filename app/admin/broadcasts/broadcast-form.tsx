"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { sendBroadcast, type BroadcastResult } from "./actions";

const AUDIENCES = [
  { id: "all", label: "Everyone" },
  { id: "coaches", label: "Coaches" },
  { id: "active_coaches", label: "Active coaches" },
  { id: "pending_coaches", label: "Pending coaches" },
  { id: "clients", label: "Clients" },
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
                className={`px-3 py-1.5 text-[12px] font-medium rounded-md border transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-line text-fg-2 hover:border-line-strong hover:text-fg"
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
        <p className="text-[11.5px] text-fg-3 mt-2">
          Each recipient gets an email immediately. Active coaches and pending
          coaches also see an in-app banner on their next page load.
        </p>
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
          placeholder="Plain text. Two newlines for a paragraph break."
        />
      </div>

      {state && !state.ok && (
        <p className="text-[12.5px] font-medium text-rose px-3 py-2 rounded-md bg-rose/10 border border-rose/30">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-[12.5px] font-medium text-emerald px-3 py-2 rounded-md bg-emerald/10 border border-emerald/30">
          Sent to {state.recipients} recipient{state.recipients === 1 ? "" : "s"}
          {state.failed > 0 ? ` · ${state.failed} failed (see logs)` : ""}.
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      name="intent"
      value="send"
      variant="primary"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Sending…
        </>
      ) : (
        <>
          <Send size={14} strokeWidth={1.8} />
          Send broadcast
        </>
      )}
    </Button>
  );
}
