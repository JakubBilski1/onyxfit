"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { resolveTriageFlag } from "./actions";

export function ResolveFlagButton({
  flagId,
  clientId,
}: {
  flagId: string;
  clientId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const r = await resolveTriageFlag(flagId, clientId);
            if (!r.ok) setError(r.error);
          });
        }}
        disabled={pending}
      >
        {pending ? "…" : "Resolve"}
      </Button>
      {error && (
        <span className="text-[10px] font-mono text-onyx-red">{error}</span>
      )}
    </div>
  );
}
