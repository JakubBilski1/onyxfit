"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveAchievements, type Achievement } from "./actions";

export function AchievementsEditor({
  initial,
}: {
  initial: Achievement[];
}) {
  const [items, setItems] = useState<Achievement[]>(initial);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [issuer, setIssuer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [busy, startTransition] = useTransition();

  function add() {
    const t = title.trim();
    if (!t) {
      setError("Title required.");
      return;
    }
    if (items.length >= 24) {
      setError("Max 24 achievements.");
      return;
    }
    const y = year.trim() ? Number(year) : undefined;
    if (y != null && (!Number.isInteger(y) || y < 1900 || y > 2100)) {
      setError("Year 1900–2100.");
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        title: t,
        ...(y != null ? { year: y } : {}),
        ...(issuer.trim() ? { issuer: issuer.trim() } : {}),
      },
    ]);
    setTitle("");
    setYear("");
    setIssuer("");
    setError(null);
  }

  function remove(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const r = await saveAchievements(items);
      if (!r.ok) setError(r.error);
      else {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1500);
      }
    });
  }

  return (
    <div className="space-y-5">
      <ul className="space-y-2">
        {items.length === 0 && (
          <li className="text-[13px] text-onyx-mute">
            No achievements yet. Add titles, podiums, certifications.
          </li>
        )}
        {items.map((a, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-3 border-b border-onyx-line pb-2"
          >
            <div className="min-w-0">
              <div className="text-[14px] text-onyx-bone truncate">{a.title}</div>
              {(a.year || a.issuer) && (
                <div className="font-mono text-[11px] text-onyx-dim truncate">
                  {[a.issuer, a.year].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-[10px] font-mono tracking-widest text-onyx-dim hover:text-onyx-red shrink-0"
            >
              REMOVE
            </button>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_90px_1fr_auto] gap-2 items-end">
        <Input
          placeholder="Title (e.g. IPF World Champion)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
        <Input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min={1900}
          max={2100}
        />
        <Input
          placeholder="Issuer (optional)"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          maxLength={80}
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
