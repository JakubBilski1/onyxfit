"use client";

import { useRef, useState, useTransition } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { setCoachImage } from "./actions";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

type Kind = "avatar" | "cover";

// Existing storage buckets: `avatars` is shared (public) for both profile
// pictures and cover images — we just prefix the filename.
const BUCKET: Record<Kind, string> = {
  avatar: "avatars",
  cover: "avatars",
};

export function ImageUpload({
  kind,
  initialUrl,
  userId,
  className,
}: {
  kind: Kind;
  initialUrl: string | null;
  userId: string;
  className?: string;
}) {
  const supabase = getSupabaseBrowser();
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("JPEG, PNG or WebP only.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File must be ≤5 MB.");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${kind}-${Date.now()}.${ext}`;
    const bucket = BUCKET[kind];

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false, contentType: file.type });
    if (upErr) {
      setError(upErr.message);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const newUrl = data.publicUrl;

    startTransition(async () => {
      const r = await setCoachImage(kind, newUrl);
      if (!r.ok) {
        setError(r.error);
        // best-effort cleanup of the orphan we just uploaded
        await supabase.storage.from(bucket).remove([path]);
        return;
      }
      setUrl(newUrl);
      // best-effort: prune older files of THIS kind in the user's folder
      // (the bucket may be shared with the other kind).
      const justUploaded = path.split("/").pop();
      const { data: list } = await supabase.storage
        .from(bucket)
        .list(userId);
      const old = (list ?? [])
        .filter((f) => f.name.startsWith(`${kind}-`) && f.name !== justUploaded)
        .map((f) => `${userId}/${f.name}`);
      if (old.length > 0) {
        await supabase.storage.from(bucket).remove(old);
      }
    });
  }

  async function handleClear() {
    setError(null);
    startTransition(async () => {
      const r = await setCoachImage(kind, null);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      // best-effort: remove only files of this kind in the user's folder
      const { data: list } = await supabase.storage
        .from(BUCKET[kind])
        .list(userId);
      const toRemove = (list ?? [])
        .filter((f) => f.name.startsWith(`${kind}-`))
        .map((f) => `${userId}/${f.name}`);
      if (toRemove.length > 0) {
        await supabase.storage.from(BUCKET[kind]).remove(toRemove);
      }
      setUrl(null);
    });
  }

  const isAvatar = kind === "avatar";

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={
          isAvatar
            ? "w-full border border-dashed border-onyx-line2 p-4 text-center hover:border-onyx-amber transition-colors"
            : "block w-full h-24 border border-dashed border-onyx-line2 hover:border-onyx-amber transition-colors relative overflow-hidden"
        }
      >
        {url ? (
          isAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              className="mx-auto h-20 w-20 rounded-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )
        ) : (
          <span className="onyx-label">
            {busy ? "Uploading…" : isAvatar ? "Drop an image or click to upload" : "Drop cover"}
          </span>
        )}
      </button>

      <div className="flex items-center justify-between mt-2">
        {error ? (
          <span className="text-[11px] font-mono text-onyx-red">{error}</span>
        ) : (
          <span className="text-[11px] font-mono text-onyx-dim">
            JPEG / PNG / WebP · ≤5 MB
          </span>
        )}
        {url && !busy && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] font-mono tracking-widest text-onyx-dim hover:text-onyx-red"
          >
            REMOVE
          </button>
        )}
      </div>
    </div>
  );
}
