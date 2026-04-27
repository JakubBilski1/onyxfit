import {
  ActivitySquare,
  Apple,
  Banknote,
  Building2,
  CircleUserRound,
  Hammer,
  HeartPulse,
  Library,
  Megaphone,
  ScanLine,
  ShieldCheck,
  Users,
  Vault,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const COACH_GROUPS: NavGroup[] = [
  {
    label: "Today",
    items: [{ href: "/dashboard", label: "Triage", icon: ActivitySquare }],
  },
  {
    label: "Athletes",
    items: [
      { href: "/dashboard/clients", label: "Clients", icon: Users },
      { href: "/dashboard/form-checks", label: "Form Studio", icon: ScanLine },
    ],
  },
  {
    label: "Programming",
    items: [
      { href: "/dashboard/forge", label: "The Forge", icon: Hammer },
      { href: "/dashboard/nutrition", label: "Nutrition", icon: Apple },
      { href: "/dashboard/recovery", label: "Recovery", icon: HeartPulse },
    ],
  },
  {
    label: "Library",
    items: [
      { href: "/dashboard/vault", label: "Vault", icon: Vault },
      { href: "/dashboard/profile", label: "Storefront", icon: CircleUserRound },
    ],
  },
];

export const ADMIN_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Command Center", icon: Building2 }],
  },
  {
    label: "Coaches",
    items: [
      { href: "/admin/kyc", label: "Verification", icon: ShieldCheck },
      { href: "/admin/coaches", label: "Coaches", icon: Users },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/admin/disputes", label: "Disputes", icon: Banknote },
      { href: "/admin/exercises", label: "Global DB", icon: Library },
      { href: "/admin/broadcasts", label: "Broadcast", icon: Megaphone },
    ],
  },
];

export function isNavActive(currentPath: string, href: string): boolean {
  if (href === "/dashboard" || href === "/admin") return currentPath === href;
  return currentPath.startsWith(href);
}
