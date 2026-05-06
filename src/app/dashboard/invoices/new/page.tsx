import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import InvoiceForm from "../invoice-form";
import { createInvoiceAction } from "../actions";

export default async function NewInvoicePage() {
  const supabase = await createClient();

  const [clientsRes, settingsRes] = await Promise.all([
    supabase.from("clients").select("id, name, company").order("name"),
    supabase.from("user_settings").select("payment_terms_days").maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/dashboard/invoices" className="text-sm text-slate-600 hover:text-slate-900">
          ← Retour aux factures
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Nouvelle facture</h1>
        <p className="mt-1 text-sm text-slate-600">
          Le numéro est généré automatiquement (numérotation continue obligatoire).
        </p>
      </div>

      <InvoiceForm
        clients={clientsRes.data ?? []}
        defaultPaymentDays={settingsRes.data?.payment_terms_days ?? 30}
        action={createInvoiceAction}
        submitLabel="Créer la facture"
      />
    </div>
  );
}
