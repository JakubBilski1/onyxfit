"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type ClientLite = { id: string; full_name: string };

type Item = {
  label: string;
  hint?: string;
  href: string;
};

const COACH_ROUTES: Item[] = [
  { label: "Triage", hint: "today's field", href: "/dashboard" },
  { label: "Clients", hint: "the roster", href: "/dashboard/clients" },
  { label: "The Forge", hint: "programs & templates", href: "/dashboard/forge" },
  { label: "Nutrition", hint: "macros & phases", href: "/dashboard/nutrition" },
  { label: "Recovery", hint: "cardio & supps", href: "/dashboard/recovery" },
  { label: "Form Studio", hint: "video reviews", href: "/dashboard/form-checks" },
  { label: "Vault", hint: "subs, labs, library", href: "/dashboard/vault" },
  { label: "Storefront", hint: "your public page", href: "/dashboard/profile" },
];

const ADMIN_ROUTES: Item[] = [
  { label: "Command Center", href: "/admin" },
  { label: "Verification", href: "/admin/kyc" },
  { label: "Coaches", href: "/admin/coaches" },
  { label: "Disputes", href: "/admin/disputes" },
  { label: "Global DB", href: "/admin/exercises" },
  { label: "Broadcast", href: "/admin/broadcasts" },
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-onyx-mute hover:text-onyx-bone transition-colors"
        title="Search · ⌘K"
      >
        <Search size={16} strokeWidth={1.4} />
        <span className="hidden md:inline font-mono text-[10px] tracking-widest text-onyx-dim">
          ⌘K
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-[#0c0c0c] border border-onyx-line shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onPaletteKey}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-onyx-line">
              <Search size={14} strokeWidth={1.4} className="text-onyx-dim" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search routes & athletes…"
                className="flex-1 bg-transparent text-onyx-bone placeholder:text-onyx-dim text-[14px] focus:outline-none"
              />
              <kbd className="font-mono text-[10px] text-onyx-dim">ESC</kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <li className="px-5 py-6 text-[12px] text-onyx-dim">No matches.</li>
              ) : (
                items.map((it, i) => (
                  <li key={`${it.href}-${i}`}>
                    <button
                      type="button"
                      onClick={() => go(it.href)}
                      onMouseEnter={() => setActive(i)}
                      className={`w-full flex items-center justify-between gap-3 px-5 py-3 text-left ${
                        i === active
                          ? "bg-onyx-amber/10 text-onyx-bone"
                          : "text-onyx-mute hover:bg-white/[0.02]"
                      }`}
                    >
                      <span className="text-[13px] truncate">{it.label}</span>
                      {it.hint && (
                        <span className="font-mono text-[10px] text-onyx-dim shrink-0">
                          {it.hint}
                        </span>
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
