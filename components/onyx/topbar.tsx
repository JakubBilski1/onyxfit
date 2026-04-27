import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { NotificationsBell } from "./notifications-bell";
import { MobileNav } from "./mobile-nav";
import { ArrowUpRight } from "lucide-react";

export async function Topbar({ scope }: { scope: "coach" | "admin" }) {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let clients: { id: string; full_name: string }[] = [];
  let initialBroadcasts: any[] = [];
  let initialFlags: any[] = [];
  let profileForNav: { name: string; email: string } | null = null;

  if (user) {
    // Audience filter for the bell — coach sees broadcasts targeted at them,
    // admin sees everything (they're the senders).
    const audiences =
      scope === "coach"
        ? ["all", "coaches", "active_coaches"]
        : ["all", "coaches", "active_coaches", "pending_coaches", "clients"];

    const broadcastsQ = supabase
      .from("admin_broadcasts")
      .select("id, title, body, audience, sent_at")
      .in("audience", audiences)
      .order("sent_at", { ascending: false })
      .limit(10);

    const profileQ = supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (scope === "coach") {
      const [{ data: links }, { data: broadcasts }, { data: flags }, { data: profile }] =
        await Promise.all([
          supabase
            .from("coaches_clients")
            .select("client:clients(id, full_name)")
            .eq("coach_id", user.id)
            .eq("active", true)
            .order("started_at", { ascending: false })
            .limit(40),
          broadcastsQ,
          supabase
            .from("triage_flags")
            .select(
              "id, title, detail, rule, created_at, client:clients(full_name)",
            )
            .eq("kind", "red")
            .eq("resolved", false)
            .order("created_at", { ascending: false })
            .limit(10),
          profileQ,
        ]);
      clients = (links ?? [])
        .map((l: any) => (Array.isArray(l.client) ? l.client[0] : l.client))
        .filter(Boolean);
      initialBroadcasts = broadcasts ?? [];
      initialFlags = (flags ?? []).map((f: any) => ({
        id: f.id,
        title: f.title,
        detail: f.detail,
        rule: f.rule,
        created_at: f.created_at,
        client_name: f.client?.full_name ?? null,
      }));
      profileForNav = profile
        ? { name: profile.full_name ?? "Coach", email: profile.email ?? "" }
        : null;
    } else {
      const [{ data: broadcasts }, { data: profile }] = await Promise.all([
        broadcastsQ,
        profileQ,
      ]);
      initialBroadcasts = broadcasts ?? [];
      profileForNav = profile
        ? { name: profile.full_name ?? "Admin", email: profile.email ?? "" }
        : null;
    }
  }

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  const bellScope = scope === "coach" ? "active_coach" : "admin";

  return (
    <header className="h-16 border-b border-line flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 bg-bg/85 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-3 sm:gap-5">
        <MobileNav scope={scope} user={profileForNav} />
        <div className="hidden md:flex items-center gap-2.5 text-fg-2 text-[13px]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald" />
          </span>
          <span className="font-medium">{today}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <CommandPalette clients={clients} scope={scope} />

        <NotificationsBell
          scope={bellScope}
          initialBroadcasts={initialBroadcasts}
          initialFlags={initialFlags}
        />

        <ThemeToggle />

        <Link
          href={scope === "admin" ? "/dashboard" : "/admin"}
          className="hidden md:inline-flex items-center gap-1.5 text-[12px] font-medium text-fg-2 hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-fg/[.04]"
        >
          {scope === "admin" ? "Coach view" : "Admin"}
          <ArrowUpRight size={13} strokeWidth={1.8} />
        </Link>
      </div>
    </header>
  );
}
