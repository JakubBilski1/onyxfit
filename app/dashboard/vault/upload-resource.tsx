"use client";

import { useRef, useState, useTransition } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { createResource, deleteResource } from "./actions";

const ACCEPT = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.mp4,.mov";
const MAX_BYTES = 50 * 1024 * 1024;

export function UploadResource({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [busy, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [storagePath, setStoragePath] = useState<string>("");
  const [filename, setFilename] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const supabase = getSupabaseBrowser();

  async function handleFile(file: File) {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError("File too large (≤50 MB).");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("resources")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (upErr) {
      setError(upErr.message);
      return;
    }
    setStoragePath(path);
    setFilename(file.name);
  }

  async function submit(formData: FormData) {
    setError(null);
    formData.set("storage_path", storagePath);
    start(async () => {
      const r = await createResource(null, formData);
      if (!r.ok) {
        setError(r.error);
        // best-effort cleanup of just-uploaded file
        if (storagePath) {
          await supabase.storage.from("resources").remove([storagePath]);
        }
        return;
      }
      formRef.current?.reset();
      setStoragePath("");
      setFilename("");
      setOpen(false);
      // Hard-nav so middleware sees the refreshed Supabase session cookies.
      window.location.reload();
    });
  }

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        + Upload
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add resource">
        <form ref={formRef} action={submit} className="space-y-3">
          <div>
        <Label htmlFor="rf-title">Title *</Label>
        <Input id="rf-title" name="title" required maxLength={200} />
      </div>
      <div>
        <Label htmlFor="rf-desc">Description</Label>
        <Textarea id="rf-desc" name="description" rows={2} maxLength={2000} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="rf-kind">Kind</Label>
          <select
            id="rf-kind"
            name="kind"
            defaultValue="pdf"
            className="h-11 w-full bg-transparent border-b border-onyx-line text-onyx-bone focus:outline-none focus:border-onyx-amber text-[14px]"
          >
            <option value="pdf">PDF</option>
            <option value="doc">DOC</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
            <option value="discount_code">Discount code</option>
          </select>
        </div>
        <div>
          <Label htmlFor="rf-visibility">Visibility</Label>
          <select
            id="rf-visibility"
            name="visibility"
            defaultValue="paid_clients"
            className="h-11 w-full bg-transparent border-b border-onyx-line text-onyx-bone focus:outline-none focus:border-onyx-amber text-[14px]"
          >
            <option value="paid_clients">Paid clients</option>
            <option value="all_clients">All clients</option>
            <option value="private">Private (coach only)</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="rf-url">External URL (optional)</Label>
        <Input
          id="rf-url"
          name="external_url"
          type="url"
          maxLength={1000}
          placeholder="https://…"
        />
      </div>

      <div>
        <Label>File</Label>
        <input
          ref={fileRef}
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
          onClick={() => fileRef.current?.click()}
          className="block w-full border border-dashed border-onyx-line2 hover:border-onyx-amber p-3 text-left text-[12px] font-mono"
        >
          {filename ? `📎 ${filename}` : "Click to attach (≤50 MB)"}
        </button>
        {storagePath && (
          <div className="text-[10px] font-mono text-onyx-dim mt-1 truncate">
            stored: {storagePath}
          </div>
        )}
      </div>

          {error && <p className="text-[11px] font-mono text-onyx-red">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" variant="signal" size="sm" disabled={busy}>
              {busy ? "Saving…" : "Save resource"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function ResourceRow({
  id,
  storagePath,
  externalUrl,
}: {
  id: string;
  storagePath: string | null;
  externalUrl: string | null;
}) {
  const supabase = getSupabaseBrowser();
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function open() {
    if (externalUrl) {
      window.open(externalUrl, "_blank", "noreferrer");
      return;
    }
    if (!storagePath) return;
    const { data, error } = await supabase.storage
      .from("resources")
      .createSignedUrl(storagePath, 60 * 5);
    if (error) {
      setError(error.message);
      return;
    }
    window.open(data.signedUrl, "_blank", "noreferrer");
  }

  function remove() {
    setError(null);
    start(async () => {
      const r = await deleteResource(id);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      // Hard-nav so middleware sees the refreshed Supabase session cookies.
      window.location.reload();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={open}
        className="text-[11px] font-mono tracking-widest text-onyx-bone hover:text-onyx-amber"
      >
        Open →
      </button>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-[11px] font-mono tracking-widest text-onyx-dim hover:text-onyx-red"
        >
          Delete
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-[11px] font-mono text-onyx-dim hover:text-onyx-bone"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-[11px] font-mono text-onyx-red hover:text-onyx-bone"
          >
            {pending ? "…" : "Confirm"}
          </button>
        </>
      )}
      {error && <span className="text-[10px] font-mono text-onyx-red ml-2">{error}</span>}
    </div>
  );
}
