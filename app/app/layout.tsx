import { redirect } from "next/navigation";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { getSessionProfile } from "@/lib/auth";
import { navForRole } from "@/lib/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");

  const { profile } = session;
  const items = navForRole(profile.role);

  return (
    <div className="flex min-h-screen">
      <Sidebar items={items} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={profile.full_name ?? "Usuário"} role={profile.role} />
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
