"use client";

import type { ProgramStructure } from "../types";

export function AthletePreview({ structure }: { structure: ProgramStructure }) {
  if (structure.weeks.length === 0) {
    return (
      <div className="onyx-card p-10 text-center">
        <span className="onyx-label">Empty program</span>
        <p className="text-[13px] text-onyx-mute mt-3">
          Add some content in coach view first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="text-center">
        <span className="onyx-label">Athlete view · read-only mock</span>
        <p className="text-[12px] font-mono text-onyx-dim mt-2">
          This is roughly how the athlete will see the block in the mobile app.
        </p>
      </div>

      {structure.weeks.map((w) => (
        <section key={w.id} className="space-y-5">
          <h2 className="onyx-display text-3xl text-onyx-bone">{w.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {w.days.map((d) => (
              <div
                key={d.id}
                className="border border-onyx-line bg-[#0e0e0e] p-5 space-y-4"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[16px] text-onyx-bone">{d.name}</h3>
                  <span className="font-mono text-[10px] text-onyx-dim">
                    {d.blocks.reduce((s, b) => s + b.rows.length, 0)} EX
                  </span>
                </div>
                {d.blocks.length === 0 ? (
                  <p className="text-[12px] text-onyx-mute italic">
                    Rest day.
                  </p>
                ) : (
                  d.blocks.map((b, bi) => (
                    <div key={b.id} className="space-y-2">
                      {b.kind !== "STRAIGHT" && (
                        <span className="font-mono text-[9px] tracking-[0.32em] text-onyx-amber">
                          {b.kind} {bi + 1}
                        </span>
                      )}
                      {b.rows.length === 0 ? (
                        <p className="text-[11px] text-onyx-dim italic">
                          (no exercises set)
                        </p>
                      ) : (
                        <ul className="divide-y divide-onyx-line">
                          {b.rows.map((r) => (
                            <li key={r.id} className="py-2">
                              <div className="text-[13px] text-onyx-bone">
                                {r.name}
                              </div>
                              <div className="font-mono text-[11px] text-onyx-mute mt-0.5">
                                {r.sets} × {r.reps}
                                {r.rpe != null && ` · RPE ${r.rpe}`}
                                {r.rest_sec != null && ` · rest ${r.rest_sec}s`}
                              </div>
                              {r.notes && (
                                <div className="text-[11px] text-onyx-mute italic mt-1">
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
