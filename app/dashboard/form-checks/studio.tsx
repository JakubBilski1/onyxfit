"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  saveFormCheckDraft,
  sendFormCheck,
  setFormCheckVoiceover,
  type Annotation,
} from "./actions";

const SPEEDS = [
  { label: "0.25×", rate: 0.25 },
  { label: "0.5×", rate: 0.5 },
  { label: "1×", rate: 1 },
  { label: "2×", rate: 2 },
] as const;
const TOOLS = ["LINE", "ANGLE", "CIRCLE", "VOICE"] as const;
type Tool = (typeof TOOLS)[number];

export type ActiveClip = {
  id: string;
  clientId: string;
  title: string | null;
  exerciseName: string | null;
  clientName: string | null;
  videoUrl: string | null;
  voiceoverUrl: string | null;
  voiceoverPath: string | null;
  textFeedback: string;
  annotations: Annotation[];
  status: string;
};

export function Studio({ clip }: { clip: ActiveClip | null }) {
  const supabase = getSupabaseBrowser();
  const [speedIdx, setSpeedIdx] = useState(2);
  const [tool, setTool] = useState<Tool>("LINE");
  const [text, setText] = useState(clip?.textFeedback ?? "");
  const [annotations, setAnnotations] = useState<Annotation[]>(
    clip?.annotations ?? [],
  );
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  // ── recorder state ────────────────────────────────────────────────────
  const [recState, setRecState] = useState<"idle" | "recording" | "uploading">("idle");
  const [recError, setRecError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(clip?.voiceoverUrl ?? null);

  useEffect(() => {
    setText(clip?.textFeedback ?? "");
    setAnnotations(clip?.annotations ?? []);
    setVoiceUrl(clip?.voiceoverUrl ?? null);
    setSavedAt(null);
    setError(null);
  }, [clip?.id]); // reset when changing clips

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = SPEEDS[speedIdx].rate;
  }, [speedIdx, clip?.videoUrl]);

  function addAnnotation() {
    if (!clip) return;
    const id = `ann_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
    const v = videoRef.current;
    const t = v ? v.currentTime : 0;
    setAnnotations((arr) => [
      ...arr,
      {
        id,
        t: Math.max(0, Math.round(t * 10) / 10),
        kind: tool.toLowerCase() as Annotation["kind"],
        label: `${tool} marker`,
      },
    ]);
  }

  function updateAnnotation(id: string, patch: Partial<Annotation>) {
    setAnnotations((arr) => arr.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function removeAnnotation(id: string) {
    setAnnotations((arr) => arr.filter((a) => a.id !== id));
  }

  function jumpTo(t: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, t);
  }

  function saveDraft() {
    if (!clip) return;
    setError(null);
    start(async () => {
      const r = await saveFormCheckDraft(clip.id, {
        text_feedback: text,
        annotations,
      });
      if (!r.ok) setError(r.error);
      else setSavedAt(new Date());
    });
  }

  function send() {
    if (!clip) return;
    setError(null);
    start(async () => {
      const r = await sendFormCheck(clip.id, { text_feedback: text, annotations });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      // Hard-nav so middleware sees the refreshed Supabase session cookies.
      window.location.assign("/dashboard/form-checks");
    });
  }

  // ── voice recorder ────────────────────────────────────────────────────
  async function startRecord() {
    if (!clip) return;
    setRecError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setRecError("Mikrofon niedostępny w tej przeglądarce.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeCandidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
      const mime = mimeCandidates.find((m) =>
        typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(m),
      );
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => uploadRecording(rec.mimeType || "audio/webm");
      rec.start();
      recRef.current = rec;
      setRecState("recording");
    } catch (e: any) {
      setRecError(e?.message ?? "Brak dostępu do mikrofonu.");
    }
  }

  function stopRecord() {
    const rec = recRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function uploadRecording(mime: string) {
    if (!clip) return;
    setRecState("uploading");
    const blob = new Blob(chunksRef.current, { type: mime });
    chunksRef.current = [];
    const ext = mime.includes("mp4") ? "m4a" : "webm";
    const path = `${clip.clientId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("voiceovers")
      .upload(path, blob, { upsert: false, contentType: mime });
    if (upErr) {
      setRecError(upErr.message);
      setRecState("idle");
      return;
    }
    const r = await setFormCheckVoiceover(clip.id, path);
    if (!r.ok) {
      setRecError(r.error);
      await supabase.storage.from("voiceovers").remove([path]);
      setRecState("idle");
      return;
    }
    const { data, error: signErr } = await supabase.storage
      .from("voiceovers")
      .createSignedUrl(path, 60 * 60);
    if (!signErr && data?.signedUrl) {
      setVoiceUrl(data.signedUrl);
    }
    setRecState("idle");
    // No nav needed — local state already shows the new audio. Cookies were
    // refreshed by the action POST and are now in the browser jar.
  }

  async function clearVoice() {
    if (!clip) return;
    setRecError(null);
    start(async () => {
      const r = await setFormCheckVoiceover(clip.id, null);
      if (!r.ok) {
        setRecError(r.error);
        return;
      }
      setVoiceUrl(null);
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 min-h-[440px]">
      <div className="lg:col-span-3 bg-onyx-bg relative flex items-center justify-center border-r border-onyx-line">
        {clip?.videoUrl ? (
          <video
            ref={videoRef}
            src={clip.videoUrl}
            controls
            preload="metadata"
            playsInline
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = SPEEDS[speedIdx].rate;
            }}
            className="absolute inset-6 w-[calc(100%-3rem)] h-[calc(100%-3rem)] object-contain bg-black"
          />
        ) : (
          <div className="absolute inset-6 border border-onyx-line2 grid place-items-center">
            <div className="text-center">
              <div className="onyx-label">— Player canvas —</div>
              <div className="onyx-display text-3xl text-onyx-mute mt-2">
                {clip ? "Brak pliku wideo" : "Nie wczytano klipu"}
              </div>
              <p className="text-[12px] text-onyx-dim mt-3 max-w-xs">
                {clip
                  ? "To zgłoszenie nie ma jeszcze załączonego nagrania."
                  : "Wybierz nagranie z kolejki obok."}
              </p>
            </div>
          </div>
        )}

        <div className="absolute bottom-2 left-6 flex gap-2 font-mono text-[10px] z-10">
          {SPEEDS.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setSpeedIdx(i)}
              className={`${
                speedIdx === i
                  ? "text-onyx-amber border-b border-onyx-amber pb-0.5"
                  : "text-onyx-dim hover:text-onyx-bone"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="absolute top-6 right-6 flex flex-col gap-2 font-mono text-[10px] z-10">
          {TOOLS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTool(t)}
              className={tool === t ? "text-onyx-amber" : "text-onyx-dim hover:text-onyx-bone"}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 p-6 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="onyx-label">Adnotacje</span>
          {clip && (
            <button
              type="button"
              onClick={addAnnotation}
              className="text-[10px] font-mono tracking-widest text-onyx-amber hover:text-onyx-bone"
              title={`Złap czas z playera (${currentTime.toFixed(1)}s)`}
            >
              + {tool} @ {currentTime.toFixed(1)}s
            </button>
          )}
        </div>

        <ul className="mt-4 space-y-2 font-mono text-[12px] max-h-44 overflow-y-auto pr-1">
          {annotations.length === 0 && (
            <li className="text-onyx-dim text-[11px]">
              Brak adnotacji. Wybierz narzędzie i kliknij <em>+</em> w czasie odtwarzania.
            </li>
          )}
          {annotations.map((a) => (
            <li key={a.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => jumpTo(a.t)}
                className="w-12 text-right bg-transparent text-onyx-amber hover:text-onyx-bone text-[11px] font-mono"
                title="Skocz do tego momentu"
              >
                {a.t.toFixed(1)}s
              </button>
              <span className="text-onyx-dim text-[10px] tracking-widest uppercase w-12">
                {a.kind}
              </span>
              <input
                type="text"
                value={a.label}
                onChange={(e) => updateAnnotation(a.id, { label: e.target.value })}
                className="flex-1 bg-transparent border-b border-onyx-line text-onyx-mute focus:border-onyx-amber focus:outline-none text-[11px] px-0.5"
              />
              <button
                type="button"
                onClick={() => removeAnnotation(a.id)}
                className="text-[10px] font-mono text-onyx-dim hover:text-onyx-red"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <div className="onyx-rule my-5" />

        <span className="onyx-label">Voice memo</span>
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          {recState === "idle" && !voiceUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={startRecord}
              disabled={!clip}
            >
              ● Nagraj
            </Button>
          )}
          {recState === "recording" && (
            <Button type="button" variant="danger" size="sm" onClick={stopRecord}>
              ■ Stop
            </Button>
          )}
          {recState === "uploading" && (
            <span className="text-[11px] font-mono text-onyx-dim">Wgrywanie…</span>
          )}
          {voiceUrl && recState === "idle" && (
            <>
              <audio src={voiceUrl} controls className="h-8" />
              <Button type="button" variant="ghost" size="sm" onClick={startRecord}>
                Nagraj nowe
              </Button>
              <button
                type="button"
                onClick={clearVoice}
                disabled={pending}
                className="text-[10px] font-mono text-onyx-dim hover:text-onyx-red"
              >
                Usuń
              </button>
            </>
          )}
        </div>
        {recError && (
          <p className="text-[11px] font-mono text-onyx-red mt-1">{recError}</p>
        )}

        <div className="onyx-rule my-5" />

        <span className="onyx-label">Feedback tekstowy</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={5000}
          disabled={!clip}
          placeholder={
            clip
              ? "Notatki, które klient zobaczy obok adnotacji…"
              : "Wybierz klip, żeby zacząć."
          }
          className="w-full mt-2 bg-transparent border border-onyx-line text-onyx-bone p-3 focus:outline-none focus:border-onyx-amber text-[13px] disabled:opacity-50"
        />

        <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[11px] font-mono">
            {error && <span className="text-onyx-red">{error}</span>}
            {!error && savedAt && (
              <span className="text-onyx-dim">zapisano {savedAt.toLocaleTimeString()}</span>
            )}
            {!error && !savedAt && clip && (
              <span className="text-onyx-dim">{clip.status.toUpperCase()}</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={saveDraft}
              disabled={!clip || pending}
            >
              {pending ? "…" : "Zapisz szkic"}
            </Button>
            <Button
              type="button"
              variant="signal"
              size="sm"
              onClick={send}
              disabled={!clip || pending}
            >
              {pending ? "…" : "Wyślij do atlety"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
