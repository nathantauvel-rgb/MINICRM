"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type QuoteItemInput = {
  description: string;
  quantity: number;
  unit_price: number;
};

type QuoteInput = {
  client_id: string;
  issue_date: string;
  valid_until: string | null;
  notes: string | null;
  items: QuoteItemInput[];
};

function parseFormData(formData: FormData): QuoteInput {
  const client_id = formData.get("client_id");
  if (typeof client_id !== "string" || !client_id) {
    throw new Error("Sélectionnez un client.");
  }

  const issue_date = String(formData.get("issue_date") || "").trim();
  if (!issue_date) throw new Error("Date d'émission requise.");

  const valid_until = String(formData.get("valid_until") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  const itemsRaw = formData.get("items_json");
  if (typeof itemsRaw !== "string") throw new Error("Aucune ligne de devis.");
  let items: QuoteItemInput[];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    throw new Error("Lignes de devis invalides.");
  }

  items = items
    .map((it) => ({
      description: String(it.description || "").trim(),
      quantity: Number(it.quantity) || 0,
      unit_price: Number(it.unit_price) || 0,
    }))
    .filter((it) => it.description.length > 0);

  if (items.length === 0) throw new Error("Ajoutez au moins une ligne.");

  return { client_id, issue_date, valid_until, notes, items };
}

function computeTotal(items: QuoteItemInput[]) {
  return Math.round(
    items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0) * 100,
  ) / 100;
}

export async function createQuoteAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const input = parseFormData(formData);

  const { data: numberData, error: numberError } = await supabase.rpc(
    "next_quote_number",
    { p_user_id: user.id },
  );
  if (numberError) throw new Error(numberError.message);

  const year = new Date(input.issue_date).getFullYear();
  const number = `DEV-${year}-${String(numberData).padStart(4, "0")}`;

  const { data: quote, error: qErr } = await supabase
    .from("quotes")
    .insert({
      user_id: user.id,
      client_id: input.client_id,
      number,
      status: "draft",
      issue_date: input.issue_date,
      valid_until: input.valid_until,
      notes: input.notes,
      total_ht: computeTotal(input.items),
    })
    .select("id")
    .single();

  if (qErr || !quote) throw new Error(qErr?.message || "Erreur création devis.");

  const itemsRows = input.items.map((it, i) => ({
    quote_id: quote.id,
    position: i,
    description: it.description,
    quantity: it.quantity,
    unit_price: it.unit_price,
  }));

  const { error: itemsErr } = await supabase.from("quote_items").insert(itemsRows);
  if (itemsErr) throw new Error(itemsErr.message);

  revalidatePath("/dashboard/quotes");
  redirect(`/dashboard/quotes/${quote.id}`);
}

export async function updateQuoteAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const input = parseFormData(formData);

  const { error: qErr } = await supabase
    .from("quotes")
    .update({
      client_id: input.client_id,
      issue_date: input.issue_date,
      valid_until: input.valid_until,
      notes: input.notes,
      total_ht: computeTotal(input.items),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (qErr) throw new Error(qErr.message);

  const { error: delErr } = await supabase
    .from("quote_items")
    .delete()
    .eq("quote_id", id);
  if (delErr) throw new Error(delErr.message);

  const itemsRows = input.items.map((it, i) => ({
    quote_id: id,
    position: i,
    description: it.description,
    quantity: it.quantity,
    unit_price: it.unit_price,
  }));
  const { error: insErr } = await supabase.from("quote_items").insert(itemsRows);
  if (insErr) throw new Error(insErr.message);

  revalidatePath("/dashboard/quotes");
  revalidatePath(`/dashboard/quotes/${id}`);
  redirect(`/dashboard/quotes/${id}`);
}

export async function deleteQuoteAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const { error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/quotes");
  redirect("/dashboard/quotes");
}

export async function updateQuoteStatusAction(
  id: string,
  status: "draft" | "sent" | "accepted" | "refused",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const { error } = await supabase
    .from("quotes")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/quotes");
  revalidatePath(`/dashboard/quotes/${id}`);
}
