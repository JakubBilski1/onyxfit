"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

type ClientLite = { id: string; full_name: string };

type Item = {
  label: string;
  hint?: string;
  href: string;
  group?: string;
};

const COACH_ROUTES: Item[] = [
  { label: "Triage", hint: "today's field", href: "/dashboard", group: "Pages" },
  { label: "Clients", hint: "the roster", href: "/dashboard/clients", group: "Pages" },
  { label: "The Forge", hint: "programs & templates", href: "/dashboard/forge", group: "Pages" },
  { label: "Nutrition", hint: "macros & phases", href: "/dashboard/nutrition", group: "Pages" },
  { label: "Recovery", hint: "cardio & supps", href: "/dashboard/recovery", group: "Pages" },
  { label: "Form Studio", hint: "video reviews", href: "/dashboard/form-checks", group: "Pages" },
  { label: "Vault", hint: "subs, labs, library", href: "/dashboard/vault", group: "Pages" },
  { label: "Storefront", hint: "your public page", href: "/dashboard/profile", group: "Pages" },
];

const ADMIN_ROUTES: Item[] = [
  { label: "Command Center", href: "/admin", group: "Pages" },
  { label: "Verification", href: "/admin/kyc", group: "Pages" },
  { label: "Coaches", href: "/admin/coaches", group: "Pages" },
  { label: "Disputes", href: "/admin/disputes", group: "Pages" },
  { label: "Global DB", href: "/admin/exercises", group: "Pages" },
  { label: "Broadcast", href: "/admin/broadcasts", group: "Pages" },
];

export function CommandPalette({
  clients,
  scope,
}: {
  clients: ClientLite[];
  scope: "coach" | "admin";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const routes = scope === "admin" ? ADMIN_ROUTES : COACH_ROUTES;
    const clientItems: Item[] = clients.map((c) => ({
      label: c.full_name,
      hint: "athlete",
      href: `/dashboard/clients/${c.id}`,
      group: "Athletes",
    }));
    const all = [...routes, ...clientItems];
    const query = q.trim().toLowerCase();
    if (!query) return all.slice(0, 24);
    return all
      .filter(
        (i) =>
          i.label.toLowerCase().includes(query) ||
          (i.hint ?? "").toLowerCase().includes(query),
      )
      .slice(0, 24);
  }, [clients, q, scope]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [q]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onPaletteKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[active];
      if (item) go(item.href);
    }
  }

  return (
    <>
      {/* Trigger — search bar style */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2.5 h-9 pl-3 pr-2.5 rounded-md border border-line bg-card-2/60 hover:bg-card-2 hover:border-line-strong text-fg-2 hover:text-fg transition-colors"
        title="Search · Ctrl+K"
      >
        <Search size={14} strokeWidth={1.8} />
        <span className="hidden md:inline text-[13px]">Quick find…</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono text-fg-3 border border-line bg-bg">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 onyx-enter"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-card border border-line-strong shadow-lift rounded-xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onPaletteKey}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
              <Search size={16} strokeWidth={1.6} className="text-fg-3" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search routes & athletes…"
                className="flex-1 bg-transparent text-fg placeholder:text-fg-3 text-[15px] focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex font-mono text-[10px] text-fg-3 px-1.5 py-0.5 rounded border border-line">
                ESC
              </kbd>
            </div>
            <ul className="max-h-[60vh] overflow-y-auto py-2">
              {items.length === 0 ? (
                <li className="px-5 py-8 text-[13px] text-fg-3 text-center">
                  No matches.
                </li>
              ) : (
                items.map((it, i) => (
                  <li key={`${it.href}-${i}`}>
                    <button
                      type="button"
                      onClick={() => go(it.href)}
                      onMouseEnter={() => setActive(i)}
                      className={`w-full flex items-center justify-between gap-3 px-4 mx-2 py-2.5 rounded-md text-left transition-colors ${
                        i === active
                          ? "bg-primary/10 text-fg"
                          : "text-fg-2 hover:bg-fg/[.04]"
                      }`}
                      style={{ width: "calc(100% - 1rem)" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[14px] truncate">{it.label}</span>
                        {it.hint && (
                          <span className="text-[11px] text-fg-3 shrink-0">
                            · {it.hint}
                          </span>
                        )}
                      </div>
                      {i === active && (
                        <ArrowRight
                          size={14}
                          strokeWidth={1.8}
                          className="text-primary shrink-0"
                        />
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="border-t border-line px-4 py-2.5 flex items-center justify-between text-[10.5px] font-mono text-fg-3">
              <span>↑↓ navigate · ↵ open</span>
              <span>{items.length} result{items.length === 1 ? "" : "s"}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
