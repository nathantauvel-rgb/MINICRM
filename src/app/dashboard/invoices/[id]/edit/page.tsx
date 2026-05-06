import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InvoiceForm from "../../invoice-form";
import { updateInvoiceAction } from "../../actions";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [invoiceRes, clientsRes, settingsRes] = await Promise.all([
    supabase
      .from("invoices")
      .select("*, invoice_items(*)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("clients").select("id, name, company").order("name"),
    supabase.from("user_settings").select("payment_terms_days").maybeSingle(),
  ]);

  if (!invoiceRes.data) notFound();

  const invoice = invoiceRes.data;
  const items = ((invoice.invoice_items as Array<{ description: string; quantity: number; unit_price: number; position: number }>) ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((it) => ({
      description: it.description,
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
    }));

  const action = updateInvoiceAction.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href={`/dashboard/invoices/${id}`} className="text-sm text-slate-600 hover:text-slate-900">
          ← Retour à la facture
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Modifier {invoice.number}</h1>
      </div>

      <InvoiceForm
        clients={clientsRes.data ?? []}
        defaultPaymentDays={settingsRes.data?.payment_terms_days ?? 30}
        initial={{
          client_id: invoice.client_id,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          notes: invoice.notes,
          items,
        }}
        action={action}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
