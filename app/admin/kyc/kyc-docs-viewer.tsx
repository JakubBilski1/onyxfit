"use client";

import { useState, useTransition } from "react";
import { ChevronDown, FileText, ExternalLink, Loader2 } from "lucide-react";
import { getKycDocLinks, type KycDocLink } from "./actions";
import { formatRelative } from "@/lib/utils";

export function KycDocsViewer({
  profileId,
  count,
}: {
  profileId: string;
  count: number;
}) {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<KycDocLink[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (docs !== null) return; // already loaded
    start(async () => {
      const r = await getKycDocLinks(profileId);
      if (r.ok) {
        setDocs(r.docs);
        setError(null);
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggle}
        disabled={count === 0 && !open}
        className={`group inline-flex items-center gap-2 text-[12px] font-medium px-3 py-1.5 rounded-md border transition-colors ${
          count === 0
            ? "border-line text-fg-3 cursor-not-allowed opacity-60"
            : open
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-line text-fg-2 hover:border-primary/40 hover:text-primary hover:bg-primary/[.04]"
        }`}
      >
        <FileText size={13} strokeWidth={1.8} />
        <span>
          {count} {count === 1 ? "doc" : "docs"}
        </span>
        {count > 0 && (
          <ChevronDown
            size={13}
            strokeWidth={2}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && (
        <div className="rounded-lg border border-line bg-card-2/40 p-2 animate-slide-down">
          {pending && (
            <div className="flex items-center gap-2 px-2 py-3 text-[12px] text-fg-2">
              <Loader2 size={13} className="animate-spin" />
              Generating signed URLs…
            </div>
          )}
          {error && (
            <div className="px-3 py-2 text-[12px] text-rose font-medium">
              {error}
            </div>
          )}
          {!pending && !error && docs && docs.length === 0 && (
            <div className="px-3 py-2 text-[12px] text-fg-3">
              No documents uploaded.
            </div>
          )}
          {!pending && docs && docs.length > 0 && (
            <ul className="divide-y divide-line">
              {docs.map((d) => (
                <li
                  key={d.storage_path}
                  className="flex items-center justify-between gap-3 px-2 py-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText
                      size={14}
                      strokeWidth={1.6}
                      className="text-fg-3 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[13px] text-fg truncate">{d.name}</div>
                      <div className="text-[10.5px] text-fg-3 font-mono mt-0.5 flex items-center gap-2">
                        <span className="uppercase tracking-[0.18em]">
                          {d.kind}
                        </span>
                        {d.uploaded_at && (
                          <>
                            <span>·</span>
                            <span>uploaded {formatRelative(d.uploaded_at)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {d.signed_url ? (
                    <a
                      href={d.signed_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="shrink-0 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-primary hover:underline"
                    >
                      Open
                      <ExternalLink size={11} strokeWidth={2} />
                    </a>
                  ) : (
                    <span className="shrink-0 text-[11px] text-rose font-mono">
                      {d.error ?? "no url"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {!pending && docs && docs.length > 0 && (
            <p className="px-2 pt-2 text-[10.5px] text-fg-3 font-mono leading-relaxed">
              Links expire in 10 minutes. Re-open to refresh.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
