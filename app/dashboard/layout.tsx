import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { Sidebar } from "@/components/onyx/sidebar";
import { Topbar } from "@/components/onyx/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, verification_status, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login");
  if (profile.role === "coach" && profile.verification_status !== "active") redirect("/pending-verification");
  if (profile.role !== "coach" && profile.role !== "admin") redirect("/login");

  return (
    <div className="onyx-shell min-h-screen flex">
      <Sidebar scope="coach" user={{ name: profile.full_name ?? "Coach", email: profile.email ?? "" }} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar scope="coach" />
        <main className="onyx-grain flex-1 px-6 lg:px-12 py-10 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
