import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { Sidebar } from "@/components/onyx/sidebar";
import { Topbar } from "@/components/onyx/topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentProfile();
  if (!user) redirect("/login");
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="onyx-shell min-h-screen flex">
      <Sidebar scope="admin" user={{ name: profile.full_name ?? "Admin", email: profile.email ?? "" }} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar scope="admin" />
        <main className="onyx-grain flex-1 px-6 lg:px-12 py-10 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
