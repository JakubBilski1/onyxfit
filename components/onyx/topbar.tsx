import Link from "next/link";
import { Search, Bell } from "lucide-react";

export function Topbar({ scope }: { scope: "coach" | "admin" }) {
  return (
    <header className="h-16 border-b border-onyx-line flex items-center justify-between px-8 sticky top-0 z-10 bg-onyx-bg/80 backdrop-blur">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-onyx-mute font-mono text-[11px] tracking-widest">
          <span className="block h-1.5 w-1.5 rounded-full bg-onyx-amber animate-pulse" />
          <span>{scope === "admin" ? "ADMIN / GOD MODE" : "COACH / LIVE"}</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-onyx-dim font-mono text-[11px]">
          <span>{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }).toUpperCase()}</span>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <button type="button" className="text-onyx-mute hover:text-onyx-bone transition-colors">
          <Search size={16} strokeWidth={1.4} />
        </button>
        <button type="button" className="relative text-onyx-mute hover:text-onyx-bone transition-colors">
          <Bell size={16} strokeWidth={1.4} />
          <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-onyx-amber" />
        </button>
        <Link
          href={scope === "admin" ? "/dashboard" : "/admin"}
          className="onyx-label hover:text-onyx-amber transition-colors"
        >
          {scope === "admin" ? "↗ Coach View" : "↗ Admin"}
        </Link>
      </div>
    </header>
  );
}
