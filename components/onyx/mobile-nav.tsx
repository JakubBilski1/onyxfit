"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ADMIN_GROUPS,
  COACH_GROUPS,
  isNavActive,
  type NavGroup,
} from "./nav-data";
import { ThemeToggle } from "./theme-toggle";

type Scope = "coach" | "admin" | "landing";

type LandingItem =
  | { kind: "anchor"; label: string; targetId: string }
  | { kind: "link"; label: string; href: string };

type LandingProps = {
  scope: "landing";
  authed: boolean | null;
  items: LandingItem[];
  onClaim: () => void;
};

type DashboardProps = {
  scope: "coach" | "admin";
  user: { name: string; email: string } | null;
};

type Props = (DashboardProps | LandingProps) & {
  /** Brand label override; defaults to scope-appropriate label */
  brandSubtitle?: string;
};

function smoothScrollTo(id: string) {
  if (typeof window === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * MobileNav — full-screen drawer that slides in from the top.
 *
 * Renders a hamburger button and, when open, a backdrop + panel. The panel
 * closes on backdrop click, Escape, link tap, or the X button. Body scroll is
 * locked while open. Focus is moved to the close button on open and returned
 * to the hamburger on close. Respects prefers-reduced-motion via the global
 * rule in app/globals.css.
 */
export function MobileNav(props: Props) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);

  // Body scroll lock + focus management
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Move focus into the drawer on open
    const t = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
      // Return focus to the trigger
      hamburgerRef.current?.focus();
    };
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Close drawer when route changes (covers Link taps inside the drawer)
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // Anchor handler for landing — close drawer first, then smooth-scroll after
  // the panel transition has had time to play (~220ms).
  function handleAnchor(e: MouseEvent<HTMLButtonElement>, id: string) {
    e.preventDefault();
    setOpen(false);
    window.setTimeout(() => smoothScrollTo(id), 220);
  }

  function handleClaim() {
    setOpen(false);
    if (props.scope === "landing") {
      window.setTimeout(() => props.onClaim(), 220);
    }
  }

  function handleNavLink(href: string) {
    // For dashboard scopes, Link prefetch + the path effect above handle
    // closing. For full-page transitions, fall back to a manual push.
    setOpen(false);
    window.setTimeout(() => router.push(href), 0);
  }

  const subtitle =
    props.brandSubtitle ??
    (props.scope === "admin"
      ? "God Mode"
      : props.scope === "coach"
        ? "Coach Console"
        : "Forged in iron");

  return (
    <>
      <button
        ref={hamburgerRef}
        type="button"
        onClick={onOpen}
        aria-label="Open navigation"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-md text-fg-2 hover:text-fg hover:bg-fg/[.05] transition-colors -ml-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <Menu size={20} strokeWidth={1.6} />
      </button>

      {open && (
        <Drawer
          onClose={onClose}
          closeRef={closeRef}
          titleId={titleId}
          subtitle={subtitle}
        >
          {props.scope === "landing" ? (
            <LandingBody
              items={props.items}
              authed={props.authed}
              onAnchor={handleAnchor}
              onClaim={handleClaim}
              onClose={onClose}
            />
          ) : (
            <DashboardBody
              scope={props.scope as Scope as "coach" | "admin"}
              user={props.user}
              path={path}
              onNavigate={handleNavLink}
              onClose={onClose}
            />
          )}
        </Drawer>
      )}
    </>
  );
}

// ─── Drawer chrome ─────────────────────────────────────────────────────────

function Drawer({
  onClose,
  closeRef,
  titleId,
  subtitle,
  children,
}: {
  onClose: () => void;
  closeRef: React.RefObject<HTMLButtonElement>;
  titleId: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none"
      />
      {/* Panel — slides down from top */}
      <div
        className={cn(
          "relative flex flex-col w-full max-h-[100dvh] h-[100dvh] bg-surface text-fg",
          "border-b border-line shadow-lift",
          "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
          "animate-slide-down motion-reduce:animate-none",
        )}
      >
        {/* Brand row */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <Link
            href="/"
            onClick={onClose}
            id={titleId}
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-md"
          >
            <span className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-violet">
              <Sparkles size={16} strokeWidth={2} className="text-primary-fg" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[16px] font-semibold tracking-tight text-fg">
                Onyx
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-fg-3 mt-0.5">
                {subtitle}
              </span>
            </div>
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex items-center justify-center h-11 w-11 rounded-md text-fg-2 hover:text-fg hover:bg-fg/[.05] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <X size={20} strokeWidth={1.6} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Dashboard body ────────────────────────────────────────────────────────

function DashboardBody({
  scope,
  user,
  path,
  onNavigate,
  onClose,
}: {
  scope: "coach" | "admin";
  user: { name: string; email: string } | null;
  path: string;
  onNavigate: (href: string) => void;
  onClose: () => void;
}) {
  const groups: NavGroup[] = scope === "admin" ? ADMIN_GROUPS : COACH_GROUPS;
  return (
    <div className="flex flex-col">
      <nav className="py-4">
        {groups.map((g) => (
          <div key={g.label} className="mb-3">
            <div className="px-7 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-fg-3">
                {g.label}
              </span>
            </div>
            {g.items.map((it) => {
              const Icon = it.icon;
              const active = isNavActive(path, it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(it.href);
                  }}
                  className="onyx-nav-item min-h-[44px]"
                  data-active={active}
                >
                  <Icon size={18} strokeWidth={1.6} />
                  <span className="text-[14px]">{it.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-5 py-4 flex items-center justify-between gap-3">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-fg-3">
          Theme
        </span>
        <ThemeToggle />
      </div>

      {user ? (
        <div className="border-t border-line px-5 py-4 flex items-center gap-3">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-violet to-primary text-primary-fg text-[12px] font-semibold uppercase">
            {(user.name || user.email || "?").trim().slice(0, 2)}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-fg truncate">{user.name}</div>
            <div className="text-[12px] text-fg-3 truncate">{user.email}</div>
          </div>
          <form action="/api/auth/sign-out" method="post">
            <button
              type="submit"
              onClick={onClose}
              className="inline-flex items-center justify-center h-11 w-11 rounded-md text-fg-3 hover:text-rose hover:bg-rose/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={16} strokeWidth={1.6} />
            </button>
          </form>
        </div>
      ) : (
        <div className="border-t border-line px-5 py-4">
          <Link
            href="/login"
            onClick={onClose}
            className="text-[14px] text-fg-2 hover:text-primary transition-colors"
          >
            Sign In →
          </Link>
        </div>
      )}

      <div className="px-5 pt-3 pb-5 text-[10px] font-mono uppercase tracking-[0.22em] text-fg-3">
        Onyx · v1
      </div>
    </div>
  );
}

// ─── Landing body ──────────────────────────────────────────────────────────

function LandingBody({
  items,
  authed,
  onAnchor,
  onClaim,
  onClose,
}: {
  items: LandingItem[];
  authed: boolean | null;
  onAnchor: (e: MouseEvent<HTMLButtonElement>, id: string) => void;
  onClaim: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col">
      <nav className="py-4">
        {items.map((it) =>
          it.kind === "anchor" ? (
            <button
              key={it.targetId}
              type="button"
              onClick={(e) => onAnchor(e, it.targetId)}
              className="w-full text-left flex items-center min-h-[44px] px-6 py-3 text-[15px] text-fg-2 hover:text-primary hover:bg-fg/[.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {it.label}
            </button>
          ) : (
            <Link
              key={it.href}
              href={it.href}
              onClick={onClose}
              className="w-full flex items-center min-h-[44px] px-6 py-3 text-[15px] text-fg-2 hover:text-primary hover:bg-fg/[.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {it.label}
            </Link>
          ),
        )}
      </nav>

      <div className="border-t border-line px-5 py-4 flex items-center justify-between gap-3">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-fg-3">
          Theme
        </span>
        <ThemeToggle />
      </div>

      <div className="border-t border-line px-5 py-4 space-y-3">
        {authed ? (
          <Link
            href="/dashboard"
            onClick={onClose}
            className="block w-full text-center min-h-[44px] inline-flex items-center justify-center px-4 py-3 rounded-md bg-primary text-primary-fg text-[14px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Open dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              onClick={onClose}
              className="block w-full text-center min-h-[44px] inline-flex items-center justify-center px-4 py-3 rounded-md border border-line text-fg text-[14px] font-medium hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              Coach login
            </Link>
            <button
              type="button"
              onClick={onClaim}
              className="block w-full text-center min-h-[44px] inline-flex items-center justify-center px-4 py-3 rounded-md bg-primary text-primary-fg text-[14px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              Claim a seat
            </button>
          </>
        )}
      </div>
    </div>
  );
}
