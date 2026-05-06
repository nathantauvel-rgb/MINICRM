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

  const { data: settings } = await supabase
    .from("user_settings")
    .select("subscription_status, trial_ends_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        subscriptionStatus={settings?.subscription_status ?? "trialing"}
        trialEndsAt={settings?.trial_ends_at ?? null}
      />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b border-slate-200 bg-white px-6">
          <UserMenu email={user.email ?? ""} />
        </header>
        <div className="flex-1 p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
