"use client";

import { useTransition } from "react";
import { deleteGlobalExercise } from "./actions";

export function DeleteExerciseButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete "${name}" from the global DB?`)) return;
        start(async () => {
          const r = await deleteGlobalExercise(id);
          if (!r.ok) {
            alert(r.error);
            return;
          }
          window.location.reload();
        });
      }}
      className="text-[10px] font-mono text-onyx-dim hover:text-onyx-red transition-colors disabled:opacity-50"
      aria-label={`Delete ${name}`}
    >
      {pending ? "…" : "delete"}
    </button>
  );
}
