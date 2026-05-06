"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ClientInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  siret?: string | null;
  notes?: string | null;
};

function parseFormData(formData: FormData): ClientInput {
  const get = (k: string) => {
    const v = formData.get(k);
    if (typeof v !== "string") return null;
    const trimmed = v.trim();
    return trimmed === "" ? null : trimmed;
  };
  const name = get("name");
  if (!name) throw new Error("Le nom est obligatoire.");
  return {
    name,
    email: get("email"),
    phone: get("phone"),
    company: get("company"),
    address: get("address"),
    siret: get("siret"),
    notes: get("notes"),
  };
}

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const input = parseFormData(formData);
  const { error } = await supabase
    .from("clients")
    .insert({ ...input, user_id: user.id });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients");
}

export async function updateClientAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const input = parseFormData(formData);
  const { error } = await supabase
    .from("clients")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${id}`);
  redirect("/dashboard/clients");
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients");
}
