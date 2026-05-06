"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getResend, RESEND_FROM } from "@/lib/email/resend";
import { buildReminderEmail } from "@/lib/email/templates";
import { InvoicePDF, type InvoiceData } from "@/lib/pdf/InvoicePDF";
import { formatEUR, formatDate } from "@/lib/format";

type ItemInput = {
  description: string;
  quantity: number;
  unit_price: number;
};

type InvoiceInput = {
  client_id: string;
  issue_date: string;
  due_date: string;
  notes: string | null;
  items: ItemInput[];
};

function parseFormData(formData: FormData): InvoiceInput {
  const client_id = formData.get("client_id");
  if (typeof client_id !== "string" || !client_id) {
    throw new Error("Sélectionnez un client.");
  }

  const issue_date = String(formData.get("issue_date") || "").trim();
  if (!issue_date) throw new Error("Date d'émission requise.");

  const due_date = String(formData.get("due_date") || "").trim();
  if (!due_date) throw new Error("Date d'échéance requise.");

  const notes = String(formData.get("notes") || "").trim() || null;

  const itemsRaw = formData.get("items_json");
  if (typeof itemsRaw !== "string") throw new Error("Aucune ligne.");
  let items: ItemInput[];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    throw new Error("Lignes invalides.");
  }
  items = items
    .map((it) => ({
      description: String(it.description || "").trim(),
      quantity: Number(it.quantity) || 0,
      unit_price: Number(it.unit_price) || 0,
    }))
    .filter((it) => it.description.length > 0);
  if (items.length === 0) throw new Error("Ajoutez au moins une ligne.");

  return { client_id, issue_date, due_date, notes, items };
}

const computeTotal = (items: ItemInput[]) =>
  Math.round(
    items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0) * 100,
  ) / 100;

export async function createInvoiceAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const input = parseFormData(formData);
  const quote_id = (formData.get("quote_id") as string | null) || null;

  const { data: numberData, error: numberErr } = await supabase.rpc(
    "next_invoice_number",
    { p_user_id: user.id },
  );
  if (numberErr) throw new Error(numberErr.message);

  const year = new Date(input.issue_date).getFullYear();
  const number = `FAC-${year}-${String(numberData).padStart(4, "0")}`;

  const { data: invoice, error: iErr } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      client_id: input.client_id,
      quote_id,
      number,
      status: "draft",
      issue_date: input.issue_date,
      due_date: input.due_date,
      notes: input.notes,
      total_ht: computeTotal(input.items),
    })
    .select("id")
    .single();
  if (iErr || !invoice) throw new Error(iErr?.message || "Erreur création facture.");

  const itemsRows = input.items.map((it, i) => ({
    invoice_id: invoice.id,
    position: i,
    description: it.description,
    quantity: it.quantity,
    unit_price: it.unit_price,
  }));
  const { error: itemsErr } = await supabase.from("invoice_items").insert(itemsRows);
  if (itemsErr) throw new Error(itemsErr.message);

  revalidatePath("/dashboard/invoices");
  redirect(`/dashboard/invoices/${invoice.id}`);
}

export async function updateInvoiceAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const input = parseFormData(formData);

  const { error: iErr } = await supabase
    .from("invoices")
    .update({
      client_id: input.client_id,
      issue_date: input.issue_date,
      due_date: input.due_date,
      notes: input.notes,
      total_ht: computeTotal(input.items),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (iErr) throw new Error(iErr.message);

  const { error: delErr } = await supabase
    .from("invoice_items")
    .delete()
    .eq("invoice_id", id);
  if (delErr) throw new Error(delErr.message);

  const itemsRows = input.items.map((it, i) => ({
    invoice_id: id,
    position: i,
    description: it.description,
    quantity: it.quantity,
    unit_price: it.unit_price,
  }));
  const { error: insErr } = await supabase.from("invoice_items").insert(itemsRows);
  if (insErr) throw new Error(insErr.message);

  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${id}`);
  redirect(`/dashboard/invoices/${id}`);
}

export async function deleteInvoiceAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoiceStatusAction(
  id: string,
  status: "draft" | "sent" | "paid" | "cancelled",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const patch: { status: string; paid_at?: string | null } = { status };
  if (status === "paid") {
    patch.paid_at = new Date().toISOString().slice(0, 10);
  } else {
    patch.paid_at = null;
  }

  const { error } = await supabase
    .from("invoices")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${id}`);
}

export async function convertQuoteToInvoiceAction(quoteId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const { data: quote, error: qErr } = await supabase
    .from("quotes")
    .select("*, quote_items(*)")
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (qErr || !quote) throw new Error("Devis introuvable.");

  const { data: settings } = await supabase
    .from("user_settings")
    .select("payment_terms_days")
    .maybeSingle();
  const paymentDays = settings?.payment_terms_days ?? 30;

  const issueDate = new Date().toISOString().slice(0, 10);
  const due = new Date();
  due.setDate(due.getDate() + paymentDays);
  const dueDate = due.toISOString().slice(0, 10);

  const { data: numberData, error: numberErr } = await supabase.rpc(
    "next_invoice_number",
    { p_user_id: user.id },
  );
  if (numberErr) throw new Error(numberErr.message);

  const year = new Date(issueDate).getFullYear();
  const number = `FAC-${year}-${String(numberData).padStart(4, "0")}`;

  const { data: invoice, error: iErr } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      client_id: quote.client_id,
      quote_id: quote.id,
      number,
      status: "draft",
      issue_date: issueDate,
      due_date: dueDate,
      notes: quote.notes,
      total_ht: quote.total_ht,
    })
    .select("id")
    .single();
  if (iErr || !invoice) throw new Error(iErr?.message || "Erreur création facture.");

  const items = (quote.quote_items as Array<{ description: string; quantity: number; unit_price: number; position: number }>) ?? [];
  const itemsRows = items
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((it, i) => ({
      invoice_id: invoice.id,
      position: i,
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unit_price,
    }));

  if (itemsRows.length > 0) {
    const { error: insErr } = await supabase.from("invoice_items").insert(itemsRows);
    if (insErr) throw new Error(insErr.message);
  }

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/quotes");
  redirect(`/dashboard/invoices/${invoice.id}`);
}

export async function sendInvoiceReminderAction(invoiceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const { data: invoice, error: iErr } = await supabase
    .from("invoices")
    .select("*, clients(*), invoice_items(*)")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (iErr || !invoice) throw new Error("Facture introuvable.");

  const client = invoice.clients as {
    name: string;
    company: string | null;
    email: string | null;
    address: string | null;
    siret: string | null;
  } | null;

  if (!client?.email) {
    throw new Error(
      "Ce client n'a pas d'email. Ajoutez-en un avant d'envoyer un rappel.",
    );
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .maybeSingle();

  if (!settings?.company_name) {
    throw new Error(
      "Renseignez le nom de votre entreprise dans Paramètres avant d'envoyer un rappel.",
    );
  }

  const items = ((invoice.invoice_items as Array<{ description: string; quantity: number; unit_price: number; position: number }>) ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((it) => ({
      description: it.description,
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
    }));

  const pdfData: InvoiceData = {
    number: invoice.number,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    paid_at: invoice.paid_at,
    notes: invoice.notes,
    total_ht: Number(invoice.total_ht),
    client: {
      name: client.name,
      company: client.company,
      email: client.email,
      address: client.address,
      siret: client.siret,
    },
    items,
    settings,
  };

  const pdfBuffer = await renderToBuffer(<InvoicePDF data={pdfData} />);

  const today = new Date();
  const due = new Date(invoice.due_date);
  const daysLate = Math.max(
    0,
    Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const email = buildReminderEmail({
    clientName: client.company || client.name,
    invoiceNumber: invoice.number,
    amount: formatEUR(Number(invoice.total_ht)),
    issueDate: formatDate(invoice.issue_date),
    dueDate: formatDate(invoice.due_date),
    daysLate,
    companyName: settings.company_name,
    iban: settings.iban,
    reminderCount: invoice.reminder_count ?? 0,
  });

  const resend = getResend();
  const { error: sendErr } = await resend.emails.send({
    from: RESEND_FROM,
    to: client.email,
    replyTo: settings.email ?? undefined,
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments: [
      {
        filename: `${invoice.number}.pdf`,
        content: Buffer.from(pdfBuffer).toString("base64"),
      },
    ],
  });

  if (sendErr) {
    throw new Error(`Échec envoi : ${sendErr.message}`);
  }

  await supabase
    .from("invoices")
    .update({
      last_reminder_at: new Date().toISOString(),
      reminder_count: (invoice.reminder_count ?? 0) + 1,
      status: invoice.status === "draft" ? "sent" : invoice.status,
    })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${invoiceId}`);
}
