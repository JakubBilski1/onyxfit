"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveSpecializations } from "./actions";

export function SpecializationsEditor({
  initial,
}: {
  initial: string[];
}) {
  const [items, setItems] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [busy, startTransition] = useTransition();

  function add() {
    const v = draft.trim();
    if (!v) return;
    if (v.length > 60) {
      setError("Tag too long (max 60 chars).");
      return;
    }
    if (items.includes(v)) {
      setDraft("");
      return;
    }
    if (items.length >= 24) {
      setError("Max 24 tags.");
      return;
    }
    setItems((prev) => [...prev, v]);
    setDraft("");
    setError(null);
  }

  function remove(value: string) {
    setItems((prev) => prev.filter((v) => v !== value));
    setError(null);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const r = await saveSpecializations(items);
      if (!r.ok) setError(r.error);
      else {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1500);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 min-h-[28px]">
        {items.length === 0 && (
          <span className="text-[13px] text-onyx-mute">
            e.g. powerlifting, hypertrophy, post-injury rehab.
          </span>
        )}
        {items.map((s) => (
          <span key={s} className="inline-flex items-center gap-2">
            <Badge>{s}</Badge>
            <button
              type="button"
              onClick={() => remove(s)}
              className="text-[10px] font-mono text-onyx-dim hover:text-onyx-red -ml-1"
              aria-label={`Remove ${s}`}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          maxLength={60}
          placeholder="Add a tag, press Enter"
          className="flex-1 h-9 bg-transparent border-b border-onyx-line text-onyx-bone placeholder:text-onyx-dim text-[13px] focus:outline-none focus:border-onyx-amber"
        />
        <Button type="button" size="sm" variant="ghost" onClick={add}>
          + Add
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-onyx-dim">
          {error ?? (savedFlash ? "Saved." : `${items.length} / 24`)}
        </span>
        <Button
          type="button"
          size="sm"
          variant="signal"
          onClick={save}
          disabled={busy}
        >
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
