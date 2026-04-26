"use client";

import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { formatRelative } from "@/lib/utils";

export type LatestBroadcast = {
  id: string;
  title: string;
  body: string;
  audience: string;
  sent_at: string;
};

const STORAGE_PREFIX = "onyx-broadcast-dismissed:";

export function BroadcastBanner({ broadcast }: { broadcast: LatestBroadcast | null }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!broadcast) return;
    try {
      const v = localStorage.getItem(STORAGE_PREFIX + broadcast.id);
      setDismissed(v === "1");
    } catch {
      setDismissed(false);
    }
  }, [broadcast]);

  if (!broadcast || dismissed) return null;

  function dismiss() {
    if (!broadcast) return;
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_PREFIX + broadcast.id, "1");
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative rounded-xl border border-violet/30 bg-violet/[.06] p-4 sm:p-5 flex items-start gap-4 shadow-soft animate-slide-down">
      <span className="shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-lg bg-violet/15 text-violet">
        <Megaphone size={16} strokeWidth={1.8} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-violet">
            Broadcast from Onyx
          </span>
          <span className="text-[10.5px] text-fg-3">
            · {formatRelative(broadcast.sent_at)}
          </span>
        </div>
        <h3 className="text-[15px] font-semibold tracking-tight text-fg mt-1">
          {broadcast.title}
        </h3>
        <p className="text-[13px] text-fg-2 mt-1.5 leading-relaxed whitespace-pre-line">
          {broadcast.body}
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-md text-fg-3 hover:text-fg hover:bg-fg/[.06] transition-colors"
        aria-label="Dismiss"
        title="Dismiss"
      >
        <X size={14} strokeWidth={1.8} />
      </button>
    </div>
  );
}
