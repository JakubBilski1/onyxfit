import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { Sidebar } from "@/components/onyx/sidebar";
import { Topbar } from "@/components/onyx/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentProfile();
  if (!user) redirect("/login");

  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");
  if (profile.role === "coach" && profile.verification_status !== "active") redirect("/pending-verification");
  if (profile.role !== "coach") redirect("/login");

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
