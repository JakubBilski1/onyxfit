"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_GROUPS, COACH_GROUPS, isNavActive } from "./nav-data";

export function Sidebar({
  scope,
  user,
}: {
  scope: "coach" | "admin";
  user: { name: string; email: string } | null;
}) {
  const path = usePathname();
  const groups = scope === "admin" ? ADMIN_GROUPS : COACH_GROUPS;

  return (
    <aside className="hidden lg:flex flex-col w-[260px] shrink-0 border-r border-line bg-surface">
      {/* Brand */}
      <div className="h-16 px-6 flex items-center border-b border-line">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-violet shadow-soft group-hover:shadow-glow-primary transition-shadow duration-300">
            <Sparkles size={16} strokeWidth={2} className="text-primary-fg" />
          </span>
          <div className="flex flex-col">
            <span className="text-[16px] font-semibold tracking-tight text-fg leading-none">
              Onyx
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-fg-3 mt-1">
              {scope === "admin" ? "God Mode" : "Coach Console"}
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 space-y-5">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-7 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-fg-3">
                {g.label}
              </span>
            </div>
            {g.items.map((it) => {
              const Icon = it.icon;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className="onyx-nav-item"
                  data-active={isNavActive(path, it.href)}
                >
                  <Icon size={16} strokeWidth={1.6} />
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </div>
        ))}

        {scope === "coach" && (
          <div className="px-5 pt-2">
            <Link
              href="/dashboard/clients"
              className={cn(
                "group flex items-center justify-between gap-3 px-4 py-3 rounded-md",
                "border border-dashed border-line text-fg-2",
                "hover:border-primary hover:text-primary hover:bg-primary/5",
                "transition-[color,border-color,background-color] duration-200 ease-out-expo",
              )}
            >
              <span className="text-[12px] font-medium">+ Invite athlete</span>
              <Plus
                size={14}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:rotate-90"
              />
            </Link>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-line p-4">
        {user ? (
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-fg/[.04] transition-colors">
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-violet to-primary text-primary-fg text-[12px] font-semibold uppercase">
              {(user.name || user.email || "?").trim().slice(0, 2)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-fg truncate">
                {user.name}
              </div>
              <div className="text-[11px] text-fg-3 truncate">{user.email}</div>
            </div>
            <form action="/api/auth/sign-out" method="post">
              <button
                type="submit"
                className="text-fg-3 hover:text-rose transition-colors p-1.5 rounded-md hover:bg-rose/10"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={14} strokeWidth={1.6} />
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-[12px] text-fg-2 hover:text-primary transition-colors"
          >
            Sign In →
          </Link>
        )}
      </div>
    </aside>
  );
}
