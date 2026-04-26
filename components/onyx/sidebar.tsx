"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActivitySquare,
  Users,
  Hammer,
  Apple,
  HeartPulse,
  Vault,
  ScanLine,
  CircleUserRound,
  Building2,
  ShieldCheck,
  Banknote,
  Megaphone,
  Library,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };

const COACH_NAV: NavItem[] = [
  { href: "/dashboard", label: "Triage", icon: ActivitySquare },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/forge", label: "The Forge", icon: Hammer },
  { href: "/dashboard/nutrition", label: "Nutrition", icon: Apple },
  { href: "/dashboard/recovery", label: "Recovery", icon: HeartPulse },
  { href: "/dashboard/form-checks", label: "Form Studio", icon: ScanLine },
  { href: "/dashboard/vault", label: "Vault", icon: Vault },
  { href: "/dashboard/profile", label: "Storefront", icon: CircleUserRound },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Command Center", icon: Building2 },
  { href: "/admin/kyc", label: "Verification", icon: ShieldCheck },
  { href: "/admin/coaches", label: "Coaches", icon: Users },
  { href: "/admin/disputes", label: "Disputes", icon: Banknote },
  { href: "/admin/exercises", label: "Global DB", icon: Library },
  { href: "/admin/broadcasts", label: "Broadcast", icon: Megaphone },
];

export function Sidebar({ scope, user }: { scope: "coach" | "admin"; user: { name: string; email: string } | null }) {
  const path = usePathname();
  const items = scope === "admin" ? ADMIN_NAV : COACH_NAV;
  const isActive = (href: string) => (href === "/dashboard" || href === "/admin" ? path === href : path.startsWith(href));

  return (
    <aside className="hidden lg:flex flex-col w-[260px] shrink-0 border-r border-onyx-line bg-[#0c0c0c]">
      <div className="px-7 pt-9 pb-7 border-b border-onyx-line">
        <Link href="/" className="block">
          <div className="onyx-display text-3xl text-onyx-bone leading-none">Onyx</div>
          <div className="onyx-label mt-2">{scope === "admin" ? "God Mode" : "Coach Console"}</div>
        </Link>
      </div>

      <nav className="flex-1 py-6">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link key={it.href} href={it.href} className="onyx-nav-item" data-active={isActive(it.href)}>
              <Icon size={15} strokeWidth={1.4} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-onyx-line px-6 py-5">
        {user ? (
          <div>
            <div className="text-[13px] text-onyx-bone truncate">{user.name}</div>
            <div className="text-[11px] text-onyx-dim font-mono truncate">{user.email}</div>
            <form action="/api/auth/sign-out" method="post" className="mt-4">
              <button type="submit" className={cn("onyx-label hover:text-onyx-amber transition-colors")}>
                Sign Out →
              </button>
            </form>
          </div>
        ) : (
          <Link href="/login" className="onyx-label hover:text-onyx-amber">Sign In →</Link>
        )}
      </div>
    </aside>
  );
}
