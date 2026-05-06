"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function s(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function n(formData: FormData, key: string, fallback: number): number {
  const v = formData.get(key);
  if (typeof v !== "string") return fallback;
  const num = parseInt(v, 10);
  return Number.isFinite(num) ? num : fallback;
}

export async function updateSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const payload = {
    user_id: user.id,
    company_name: s(formData, "company_name"),
    siret: s(formData, "siret"),
    address: s(formData, "address"),
    email: s(formData, "email"),
    phone: s(formData, "phone"),
    iban: s(formData, "iban"),
    vat_exempt: formData.get("vat_exempt") === "on",
    vat_number: s(formData, "vat_number"),
    payment_terms_days: n(formData, "payment_terms_days", 30),
  };

  const { error } = await supabase
    .from("user_settings")
    .upsert(payload, { onConflict: "user_id" });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/settings");
}
