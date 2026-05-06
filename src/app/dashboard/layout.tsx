import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "./sidebar";
import UserMenu from "./user-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b border-slate-200 bg-white px-6">
          <UserMenu email={user.email ?? ""} />
        </header>
        <div className="flex-1 p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
