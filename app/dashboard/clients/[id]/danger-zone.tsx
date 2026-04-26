"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  deactivateClientLink,
  markOnboardingComplete,
} from "./actions";

export function DangerZone({
  clientId,
  onboardingComplete,
}: {
  clientId: string;
  onboardingComplete: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  function complete() {
    setError(null);
    startTransition(async () => {
      const r = await markOnboardingComplete(clientId);
      if (!r.ok) setError(r.error);
    });
  }

  function deactivate() {
    setError(null);
    startTransition(async () => {
      const r = await deactivateClientLink(clientId);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.push("/dashboard/clients");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {!onboardingComplete && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={complete}
          disabled={pending}
        >
          {pending ? "…" : "Mark onboarding complete →"}
        </Button>
      )}

      {!confirming ? (
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setConfirming(true)}
          disabled={pending}
        >
          Remove from roster
        </Button>
      ) : (
        <div className="border border-onyx-red/40 p-4 space-y-3">
          <p className="text-[12px] text-onyx-red">
            This deactivates the link. The athlete record stays — you can re-add
            them later — but they leave your roster immediately.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={deactivate}
              disabled={pending}
            >
              {pending ? "…" : "Confirm remove"}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] font-mono text-onyx-red">{error}</p>
      )}
    </div>
  );
}
