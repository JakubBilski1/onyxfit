"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approveKyc, rejectKyc } from "./actions";

export function KycRowActions({ profileId }: { profileId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  function onApprove() {
    setError(null);
    startTransition(async () => {
      const r = await approveKyc(profileId);
      if (!r.ok) setError(r.error);
    });
  }

  function onReject() {
    if (!reason.trim()) {
      setError("Reason required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await rejectKyc(profileId, reason);
      if (!r.ok) setError(r.error);
      else {
        setReason("");
        setShowReject(false);
      }
    });
  }

  if (showReject) {
    return (
      <div className="flex flex-col items-end gap-2 w-full">
        <Input
          placeholder="Rejection reason (visible to coach)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowReject(false);
              setReason("");
              setError(null);
            }}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            onClick={onReject}
            disabled={pending}
          >
            {pending ? "…" : "Confirm reject"}
          </Button>
        </div>
        {error && (
          <span className="text-[11px] font-mono text-onyx-red">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setShowReject(true)}
          disabled={pending}
        >
          Reject
        </Button>
        <Button
          type="button"
          size="sm"
          variant="signal"
          onClick={onApprove}
          disabled={pending}
        >
          {pending ? "…" : "Approve"}
        </Button>
      </div>
      {error && (
        <span className="text-[11px] font-mono text-onyx-red">{error}</span>
      )}
    </div>
  );
}
