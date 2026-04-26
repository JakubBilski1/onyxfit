"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { applyProgramToClient } from "../actions";

type ClientLite = { id: string; full_name: string };

export function ApplyToClient({
  programId,
  clients,
}: {
  programId: string;
  clients: ClientLite[];
}) {
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState<string>(clients[0]?.id ?? "");
  const [startsOn, setStartsOn] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (clients.length === 0) {
    return (
      <span
        className="font-mono text-[10px] tracking-widest text-onyx-dim"
        title="You don't have any active clients yet."
      >
        NO CLIENTS YET
      </span>
    );
  }

  if (!open) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Apply to client →
      </Button>
    );
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const r = await applyProgramToClient(programId, clientId, startsOn);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      // Hard-nav so middleware sees the refreshed Supabase session cookies.
      window.location.assign(`/dashboard/clients/${clientId}`);
    });
  }

  return (
    <div className="border border-onyx-line bg-onyx-surface p-3 flex items-end gap-2 flex-wrap">
      <div>
        <Label htmlFor="apply-client">Client</Label>
        <select
          id="apply-client"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="h-9 bg-transparent border-b border-onyx-line text-onyx-bone text-[13px] focus:outline-none focus:border-onyx-amber pr-6"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id} className="bg-onyx-surface">
              {c.full_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="apply-date">Starts</Label>
        <Input
          id="apply-date"
          type="date"
          value={startsOn}
          onChange={(e) => setStartsOn(e.target.value)}
        />
      </div>
      <div className="flex gap-2 self-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="signal"
          size="sm"
          onClick={submit}
          disabled={pending}
        >
          {pending ? "…" : "Confirm"}
        </Button>
      </div>
      {error && (
        <span className="w-full text-[11px] font-mono text-onyx-red">{error}</span>
      )}
    </div>
  );
}
