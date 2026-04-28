"use client";

import type { ProgramStructure } from "../types";

const KIND_LABEL = {
  STRAIGHT: "Straight sets",
  SUPERSET: "Superset",
  DROPSET: "Drop set",
  CIRCUIT: "Circuit",
} as const;

export function AthletePreview({ structure }: { structure: ProgramStructure }) {
  if (structure.weeks.length === 0) {
    return (
      <div className="onyx-card p-10 text-center">
        <span className="onyx-label">Nothing to preview yet</span>
        <p className="text-[13px] text-fg-2 mt-3 max-w-md mx-auto leading-relaxed">
          Switch back to Coach view and add a week to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="text-center">
        <span className="onyx-label">Athlete view — preview only</span>
        <p className="text-[12.5px] text-fg-2 mt-2 leading-relaxed">
          This is how the program will look on the athlete&apos;s phone.
        </p>
      </div>

      {structure.weeks.map((w) => (
        <section key={w.id} className="space-y-5">
          <h2 className="onyx-headline text-[22px] text-fg">{w.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {w.days.map((d) => (
              <div
                key={d.id}
                className="rounded-lg border border-line bg-surface p-5 space-y-4"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[15px] font-semibold text-fg">
                    {d.name}
                  </h3>
                  <span className="text-[11.5px] text-fg-3">
                    {d.blocks.reduce((s, b) => s + b.rows.length, 0)} ex
                  </span>
                </div>
                {d.blocks.length === 0 ? (
                  <p className="text-[12.5px] text-fg-2">Rest day</p>
                ) : (
                  d.blocks.map((b, bi) => (
                    <div key={b.id} className="space-y-2">
                      {b.kind !== "STRAIGHT" && (
                        <span className="text-[11.5px] font-semibold text-primary">
                          {KIND_LABEL[b.kind]} {bi + 1}
                        </span>
                      )}
                      {b.rows.length === 0 ? (
                        <p className="text-[12.5px] text-fg-3">
                          No exercises yet
                        </p>
                      ) : (
                        <ul className="divide-y divide-line">
                          {b.rows.map((r) => (
                            <li key={r.id} className="py-2">
                              <div className="text-[14px] font-medium text-fg">
                                {r.name}
                              </div>
                              <div className="text-[12px] text-fg-3 mt-0.5">
                                {r.sets} × {r.reps}
                                {r.rpe != null && ` · RPE ${r.rpe}`}
                                {r.rest_sec != null && ` · rest ${r.rest_sec}s`}
                              </div>
                              {r.notes && (
                                <div className="text-[12.5px] text-fg-2 mt-1 leading-relaxed">
                                  {r.notes}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
