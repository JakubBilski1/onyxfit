import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { CommandPalette } from "./command-palette";
import { Bell } from "lucide-react";

export async function Topbar({ scope }: { scope: "coach" | "admin" }) {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let redCount = 0;
  let clients: { id: string; full_name: string }[] = [];
  if (user && scope === "coach") {
    const [{ count }, { data: links }] = await Promise.all([
      supabase
        .from("triage_flags")
        .select("id", { count: "exact", head: true })
        .eq("kind", "red")
        .eq("resolved", false),
      supabase
        .from("coaches_clients")
        .select("client:clients(id, full_name)")
        .eq("coach_id", user.id)
        .eq("active", true)
        .order("started_at", { ascending: false })
        .limit(40),
    ]);
    redCount = count ?? 0;
    clients = (links ?? [])
      .map((l: any) => (Array.isArray(l.client) ? l.client[0] : l.client))
      .filter(Boolean);
  }

  return (
    <header className="h-16 border-b border-onyx-line flex items-center justify-between px-8 sticky top-0 z-10 bg-onyx-bg/80 backdrop-blur">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-onyx-mute font-mono text-[11px] tracking-widest">
          <span className="block h-1.5 w-1.5 rounded-full bg-onyx-amber animate-pulse" />
          <span>{scope === "admin" ? "ADMIN / GOD MODE" : "COACH / LIVE"}</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-onyx-dim font-mono text-[11px]">
          <span>
            {new Date()
              .toLocaleDateString("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })
              .toUpperCase()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <CommandPalette clients={clients} scope={scope} />
        <Link
          href="/dashboard"
          className="relative text-onyx-mute hover:text-onyx-bone transition-colors"
          title={redCount > 0 ? `${redCount} open red flag${redCount === 1 ? "" : "s"}` : "All clear"}
        >
          <Bell size={16} strokeWidth={1.4} />
          {redCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-onyx-amber text-onyx-ink text-[9px] font-mono font-bold flex items-center justify-center">
              {redCount > 9 ? "9+" : redCount}
            </span>
          )}
        </Link>
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
