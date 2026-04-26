import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { Bell, ArrowUpRight } from "lucide-react";

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

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  return (
    <header className="h-16 border-b border-line flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 bg-bg/85 backdrop-blur-xl">
      <div className="flex items-center gap-5">
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

        <Link
          href="/dashboard"
          className="relative inline-flex items-center justify-center h-9 w-9 rounded-full text-fg-2 hover:text-fg hover:bg-fg/[.05] transition-colors"
          title={
            redCount > 0
              ? `${redCount} open red flag${redCount === 1 ? "" : "s"}`
              : "All clear"
          }
        >
          <Bell size={16} strokeWidth={1.6} />
          {redCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose text-white text-[10px] font-semibold flex items-center justify-center shadow-soft">
              {redCount > 9 ? "9+" : redCount}
            </span>
          )}
        </Link>

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
