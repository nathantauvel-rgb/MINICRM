import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Paramètres</h1>
        <p className="mt-1 text-sm text-slate-600">
          Ces informations apparaîtront sur vos devis et factures.
        </p>
      </div>

      <SettingsForm initial={settings ?? null} />
    </div>
  );
}
