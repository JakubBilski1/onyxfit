"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Check,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { formatRelative } from "@/lib/utils";

type Scope = "active_coach" | "pending_coach" | "admin";

type BroadcastItem = {
  id: string;
  title: string;
  body: string;
  audience: string;
  sent_at: string;
};

type FlagItem = {
  id: string;
  title: string;
  detail: string | null;
  rule: string;
  created_at: string;
  // From the join
  client_name: string | null;
};

type NotificationsBellProps = {
  scope: Scope;
  initialBroadcasts: BroadcastItem[];
  initialFlags: FlagItem[];
};

const SEEN_PREFIX = "onyx-notif-seen:";

const ALLOWED_AUDIENCES: Record<Scope, string[]> = {
  active_coach: ["all", "coaches", "active_coaches"],
  pending_coach: ["all", "coaches", "pending_coaches"],
  admin: ["all", "coaches", "active_coaches", "pending_coaches", "clients"],
};

export function NotificationsBell({
  scope,
  initialBroadcasts,
  initialFlags,
}: NotificationsBellProps) {
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>(initialBroadcasts);
  const [flags, setFlags] = useState<FlagItem[]>(initialFlags);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [pulse, setPulse] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Hydrate "seen" set from localStorage on mount
  useEffect(() => {
    const next = new Set<string>();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(SEEN_PREFIX) && localStorage.getItem(k) === "1") {
          next.add(k.slice(SEEN_PREFIX.length));
        }
      }
    } catch {
      // ignore
    }
    setSeen(next);
  }, []);

  // Live: subscribe to admin_broadcasts inserts
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel("notif:broadcasts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_broadcasts" },
        (payload) => {
          const row = payload.new as BroadcastItem;
          if (!ALLOWED_AUDIENCES[scope].includes(row.audience)) return;
          setBroadcasts((prev) => {
            if (prev.some((b) => b.id === row.id)) return prev;
            return [row, ...prev].slice(0, 10);
          });
          firePulse();
          maybeNativeNotification("Onyx broadcast", row.title);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [scope]);

  // Live: subscribe to triage_flags inserts (coaches only, RLS filters by scope)
  useEffect(() => {
    if (scope !== "active_coach") return;
    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel("notif:flags")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "triage_flags",
        },
        (payload) => {
          const row = payload.new as any;
          // Only red flags drive a notification; greens just show in feed.
          if (row.kind !== "red" || row.resolved) return;
          const item: FlagItem = {
            id: row.id,
            title: row.title ?? "Flag raised",
            detail: row.detail ?? null,
            rule: row.rule ?? "rule",
            created_at: row.created_at,
            client_name: null,
          };
          setFlags((prev) => {
            if (prev.some((f) => f.id === item.id)) return prev;
            return [item, ...prev].slice(0, 10);
          });
          firePulse();
          maybeNativeNotification("Red flag raised", item.title);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [scope]);

  // Close on outside click + ESC
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", handle);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", handle);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function firePulse() {
    setPulse(true);
    window.setTimeout(() => setPulse(false), 1600);
  }

  function maybeNativeNotification(title: string, body: string) {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "granted") {
      try {
        new Notification(title, { body, silent: false });
      } catch {
        // ignore
      }
    }
  }

  function markSeen(id: string) {
    setSeen((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    try {
      localStorage.setItem(SEEN_PREFIX + id, "1");
    } catch {
      // ignore
    }
  }

  function markAllSeen() {
    const ids = [...broadcasts, ...flags].map((i) => i.id);
    setSeen((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
    try {
      ids.forEach((id) => localStorage.setItem(SEEN_PREFIX + id, "1"));
    } catch {
      // ignore
    }
  }

  function requestNativePermission() {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }

  const unseenCount = useMemo(() => {
    let c = 0;
    for (const b of broadcasts) if (!seen.has(b.id)) c++;
    for (const f of flags) if (!seen.has(f.id)) c++;
    return c;
  }, [broadcasts, flags, seen]);

  // Combine and sort by sent_at/created_at desc
  const items = useMemo(() => {
    type Row =
      | { kind: "broadcast"; at: string; data: BroadcastItem }
      | { kind: "flag"; at: string; data: FlagItem };
    const rows: Row[] = [
      ...broadcasts.map((b) => ({ kind: "broadcast" as const, at: b.sent_at, data: b })),
      ...flags.map((f) => ({ kind: "flag" as const, at: f.created_at, data: f })),
    ];
    rows.sort((a, b) => +new Date(b.at) - +new Date(a.at));
    return rows.slice(0, 12);
  }, [broadcasts, flags]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          requestNativePermission();
        }}
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-full text-fg-2 hover:text-fg hover:bg-fg/[.05] transition-colors"
        aria-label={`Notifications${unseenCount > 0 ? ` (${unseenCount} unseen)` : ""}`}
        title={
          unseenCount > 0
            ? `${unseenCount} new notification${unseenCount === 1 ? "" : "s"}`
            : "All caught up"
        }
      >
        <Bell
          size={16}
          strokeWidth={1.6}
          className={pulse ? "animate-bounce" : undefined}
        />
        {unseenCount > 0 && (
          <>
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose text-white text-[10px] font-semibold flex items-center justify-center shadow-soft z-10">
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
            <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-rose opacity-60 animate-ping" />
          </>
        )}
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-2rem)] origin-top-right z-40 rounded-xl border border-line-strong bg-surface shadow-lift overflow-hidden animate-scale-in"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <div>
              <div className="text-[14px] font-semibold tracking-tight text-fg">
                Notifications
              </div>
              <div className="text-[11px] text-fg-3">
                {unseenCount > 0
                  ? `${unseenCount} unseen · live`
                  : "All caught up · live"}
                <span className="inline-block ml-1.5 h-1.5 w-1.5 rounded-full bg-emerald onyx-dot-pulse" />
              </div>
            </div>
            {items.length > 0 && unseenCount > 0 && (
              <button
                type="button"
                onClick={markAllSeen}
                className="text-[11.5px] font-medium text-fg-2 hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-fg/[.04] inline-flex items-center gap-1"
              >
                <Check size={12} strokeWidth={2} />
                Mark all read
              </button>
            )}
          </div>

          <ul className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-5 py-10 text-center">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-emerald/10 text-emerald mb-3">
                  <Sparkles size={16} strokeWidth={1.6} />
                </span>
                <div className="text-[13px] text-fg-2">
                  Nothing new. Everything is calm.
                </div>
              </li>
            ) : (
              items.map((row) =>
                row.kind === "broadcast" ? (
                  <BroadcastRow
                    key={`b-${row.data.id}`}
                    item={row.data}
                    seen={seen.has(row.data.id)}
                    onMarkSeen={() => markSeen(row.data.id)}
                  />
                ) : (
                  <FlagRow
                    key={`f-${row.data.id}`}
                    item={row.data}
                    seen={seen.has(row.data.id)}
                    onMarkSeen={() => markSeen(row.data.id)}
                  />
                ),
              )
            )}
          </ul>

          {scope === "active_coach" && flags.length > 0 && (
            <div className="border-t border-line px-4 py-2.5 bg-card-2/40">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="text-[12px] font-medium text-primary hover:underline"
              >
                Open the triage queue →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BroadcastRow({
  item,
  seen,
  onMarkSeen,
}: {
  item: BroadcastItem;
  seen: boolean;
  onMarkSeen: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onMarkSeen}
        className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-line transition-colors ${
          seen ? "" : "bg-violet/[.04]"
        } hover:bg-fg/[.04]`}
      >
        <span className="shrink-0 mt-0.5 inline-flex items-center justify-center h-8 w-8 rounded-md bg-violet/15 text-violet">
          <Megaphone size={14} strokeWidth={1.8} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-violet">
              Broadcast
            </span>
            <span className="text-[10.5px] text-fg-3 shrink-0">
              {formatRelative(item.sent_at)}
            </span>
          </div>
          <div className="text-[13.5px] font-medium text-fg mt-0.5 truncate">
            {item.title}
          </div>
          <div className="text-[12px] text-fg-2 mt-0.5 line-clamp-2 leading-relaxed">
            {item.body}
          </div>
        </div>
        {!seen && (
          <span
            className="shrink-0 mt-1 h-2 w-2 rounded-full bg-violet"
            aria-label="Unread"
          />
        )}
      </button>
    </li>
  );
}

function FlagRow({
  item,
  seen,
  onMarkSeen,
}: {
  item: FlagItem;
  seen: boolean;
  onMarkSeen: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onMarkSeen}
        className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-line transition-colors ${
          seen ? "" : "bg-rose/[.04]"
        } hover:bg-fg/[.04]`}
      >
        <span className="shrink-0 mt-0.5 inline-flex items-center justify-center h-8 w-8 rounded-md bg-rose/15 text-rose">
          <AlertTriangle size={14} strokeWidth={1.8} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-rose">
              Red flag
            </span>
            <span className="text-[10.5px] text-fg-3 shrink-0">
              {formatRelative(item.created_at)}
            </span>
          </div>
          <div className="text-[13.5px] font-medium text-fg mt-0.5 truncate">
            {item.title}
          </div>
          {item.detail && (
            <div className="text-[12px] text-fg-2 mt-0.5 line-clamp-2 leading-relaxed">
              {item.detail}
            </div>
          )}
          {item.client_name && (
            <div className="text-[11px] text-fg-3 mt-1 font-medium">
              {item.client_name}
            </div>
          )}
        </div>
        {!seen && (
          <span
            className="shrink-0 mt-1 h-2 w-2 rounded-full bg-rose"
            aria-label="Unread"
          />
        )}
      </button>
    </li>
  );
}
