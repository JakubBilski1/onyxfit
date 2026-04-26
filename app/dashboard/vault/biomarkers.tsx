"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { addBiomarker, deleteBiomarker, type ActionResult } from "./actions";

export type BiomarkerRow = {
  id: string;
  category: string;
  marker: string;
  value: number;
  unit: string | null;
  reference_low: number | null;
  reference_high: number | null;
  recorded_at: string;
  notes: string | null;
  document_path: string | null;
};

const CATEGORIES = [
  "blood",
  "hormones",
  "vitamins",
  "minerals",
  "lipids",
  "metabolic",
  "other",
] as const;

export function Biomarkers({
  clientId,
  rows,
}: {
  clientId: string;
  rows: BiomarkerRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [docPath, setDocPath] = useState("");
  const [docName, setDocName] = useState("");
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const supabase = getSupabaseBrowser();

  const action = addBiomarker.bind(null, clientId);
  const [state, formAction] = useFormState<ActionResult | null, FormData>(
    async (prev, fd) => {
      fd.set("document_path", docPath);
      const r = await action(prev, fd);
      if (r.ok) {
        formRef.current?.reset();
        setDocPath("");
        setDocName("");
        setOpen(false);
        router.refresh();
      }
      return r;
    },
    null,
  );

  async function handleFile(file: File) {
    setUploadErr(null);
    if (file.size > 25 * 1024 * 1024) {
      setUploadErr("Plik za duży (≤25 MB).");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const path = `${clientId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("health-vault")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) {
      setUploadErr(error.message);
      return;
    }
    setDocPath(path);
    setDocName(file.name);
  }

  const grouped = useMemo(() => {
    const m = new Map<string, BiomarkerRow[]>();
    for (const r of rows) {
      const k = r.marker;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(r);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => +new Date(a.recorded_at) - +new Date(b.recorded_at));
    }
    return m;
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="onyx-label">Markery — {rows.length} rekord{rows.length === 1 ? "" : "ów"}</span>
        {!open ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
            + Dodaj wynik
          </Button>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[10px] font-mono text-onyx-dim hover:text-onyx-bone"
          >
            ANULUJ
          </button>
        )}
      </div>

      {open && (
        <form
          ref={formRef}
          action={formAction}
          className="border border-onyx-line p-4 space-y-3"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="bm-cat">Kategoria</Label>
              <select
                id="bm-cat"
                name="category"
                defaultValue="blood"
                className="h-11 w-full bg-transparent border-b border-onyx-line text-onyx-bone focus:outline-none focus:border-onyx-amber text-[14px]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="bm-marker">Marker *</Label>
              <Input
                id="bm-marker"
                name="marker"
                required
                maxLength={80}
                placeholder="Testosteron całkowity"
              />
            </div>
            <div>
              <Label htmlFor="bm-date">Data badania</Label>
              <Input id="bm-date" name="recorded_at" type="date" />
            </div>
            <div>
              <Label htmlFor="bm-value">Wartość *</Label>
              <Input id="bm-value" name="value" type="number" step="any" required />
            </div>
            <div>
              <Label htmlFor="bm-unit">Jednostka</Label>
              <Input id="bm-unit" name="unit" maxLength={20} placeholder="ng/dL" />
            </div>
            <div>
              <Label htmlFor="bm-low">Norma od</Label>
              <Input id="bm-low" name="reference_low" type="number" step="any" />
            </div>
            <div>
              <Label htmlFor="bm-high">Norma do</Label>
              <Input id="bm-high" name="reference_high" type="number" step="any" />
            </div>
          </div>

          <div>
            <Label htmlFor="bm-notes">Notatka</Label>
            <Textarea id="bm-notes" name="notes" rows={2} maxLength={2000} />
          </div>

          <div>
            <Label>Dokument (PDF/skan)</Label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="block w-full border border-dashed border-onyx-line2 hover:border-onyx-amber p-3 text-left text-[12px] font-mono"
            >
              {docName ? `📎 ${docName}` : "Dołącz plik (≤25 MB) — opcjonalnie"}
            </button>
            {uploadErr && (
              <p className="text-[11px] font-mono text-onyx-red mt-1">{uploadErr}</p>
            )}
          </div>

          {state && !state.ok && (
            <p className="text-[12px] font-mono text-onyx-red">{state.error}</p>
          )}
          <Submit />
        </form>
      )}

      {rows.length === 0 ? (
        <p className="text-[13px] text-onyx-mute py-4">
          Brak zapisanych markerów. Dodaj pierwszy wynik powyżej.
        </p>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([marker, points]) => (
            <MarkerBlock key={marker} marker={marker} points={points} />
          ))}
        </div>
      )}
    </div>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="signal" size="sm" disabled={pending}>
      {pending ? "Zapisywanie…" : "Zapisz wynik"}
    </Button>
  );
}

function MarkerBlock({
  marker,
  points,
}: {
  marker: string;
  points: BiomarkerRow[];
}) {
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove(id: string) {
    setError(null);
    start(async () => {
      const r = await deleteBiomarker(id);
      if (!r.ok) setError(r.error);
      else router.refresh();
    });
  }

  async function openDoc(path: string) {
    const { data, error } = await supabase.storage
      .from("health-vault")
      .createSignedUrl(path, 60 * 5);
    if (error) {
      setError(error.message);
      return;
    }
    window.open(data.signedUrl, "_blank", "noreferrer");
  }

  const last = points[points.length - 1];
  const unit = points.find((p) => p.unit)?.unit ?? "";

  return (
    <div className="border border-onyx-line p-4">
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <div className="onyx-label">{points[0].category}</div>
          <div className="text-[16px] text-onyx-bone mt-1">{marker}</div>
        </div>
        <div className="text-right font-mono">
          <div className="text-[20px] text-onyx-amber">
            {last.value}
            {unit ? <span className="text-[12px] text-onyx-mute ml-1">{unit}</span> : null}
          </div>
          <div className="text-[10px] text-onyx-dim">
            {new Date(last.recorded_at).toLocaleDateString("pl-PL")}
          </div>
        </div>
      </div>

      <Sparkline points={points} />

      <ul className="mt-4 divide-y divide-onyx-line">
        {[...points].reverse().map((p) => {
          const inRange =
            p.reference_low != null && p.reference_high != null
              ? p.value >= p.reference_low && p.value <= p.reference_high
              : null;
          return (
            <li key={p.id} className="py-2 grid grid-cols-12 gap-2 items-center">
              <span className="col-span-3 font-mono text-[11px] text-onyx-dim">
                {new Date(p.recorded_at).toLocaleDateString("pl-PL")}
              </span>
              <span className="col-span-3 font-mono text-[12px] text-onyx-bone">
                {p.value} {p.unit ?? ""}
              </span>
              <span className="col-span-3 font-mono text-[10px] text-onyx-dim">
                {p.reference_low != null && p.reference_high != null
                  ? `${p.reference_low}–${p.reference_high}`
                  : "—"}
              </span>
              <span className="col-span-1">
                {inRange === true && (
                  <span className="text-[10px] font-mono text-onyx-green">OK</span>
                )}
                {inRange === false && (
                  <span className="text-[10px] font-mono text-onyx-red">×</span>
                )}
              </span>
              <span className="col-span-2 text-right flex items-center justify-end gap-2">
                {p.document_path && (
                  <button
                    type="button"
                    onClick={() => openDoc(p.document_path!)}
                    className="text-[10px] font-mono text-onyx-bone hover:text-onyx-amber"
                  >
                    Plik →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  disabled={pending}
                  className="text-[10px] font-mono text-onyx-dim hover:text-onyx-red"
                >
                  ✕
                </button>
              </span>
            </li>
          );
        })}
      </ul>
      {error && <p className="text-[11px] font-mono text-onyx-red mt-2">{error}</p>}
    </div>
  );
}

function Sparkline({ points }: { points: BiomarkerRow[] }) {
  const W = 600;
  const H = 80;
  const PAD = 8;

  const values = points.map((p) => p.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const span = maxV - minV || 1;

  const ts = points.map((p) => +new Date(p.recorded_at));
  const minT = Math.min(...ts);
  const maxT = Math.max(...ts);
  const tspan = maxT - minT || 1;

  const xy = points.map((p, i) => {
    const x = points.length === 1 ? W / 2 : PAD + ((+new Date(p.recorded_at) - minT) / tspan) * (W - 2 * PAD);
    const y = PAD + (1 - (p.value - minV) / span) * (H - 2 * PAD);
    return { x, y, p, i };
  });

  const path = xy
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(" ");

  // reference band (use first row that has both bounds)
  const ref = points.find(
    (p) => p.reference_low != null && p.reference_high != null,
  );
  let refBand: { y1: number; y2: number } | null = null;
  if (ref && ref.reference_low != null && ref.reference_high != null) {
    const yLow = PAD + (1 - (ref.reference_low - minV) / span) * (H - 2 * PAD);
    const yHigh = PAD + (1 - (ref.reference_high - minV) / span) * (H - 2 * PAD);
    refBand = { y1: Math.min(yLow, yHigh), y2: Math.max(yLow, yHigh) };
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-20"
      preserveAspectRatio="none"
      role="img"
      aria-label="trend"
    >
      {refBand && (
        <rect
          x={0}
          y={refBand.y1}
          width={W}
          height={Math.max(2, refBand.y2 - refBand.y1)}
          fill="rgba(80,200,120,0.08)"
        />
      )}
      <path
        d={path}
        fill="none"
        stroke="#f0b958"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      {xy.map((pt) => (
        <circle key={pt.i} cx={pt.x} cy={pt.y} r={2.4} fill="#f0b958" />
      ))}
    </svg>
  );
}
