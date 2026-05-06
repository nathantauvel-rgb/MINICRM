import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import QuoteForm from "../quote-form";
import { createQuoteAction } from "../actions";

export default async function NewQuotePage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, company")
    .order("name");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/dashboard/quotes" className="text-sm text-slate-600 hover:text-slate-900">
          ← Retour aux devis
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Nouveau devis</h1>
        <p className="mt-1 text-sm text-slate-600">
          Le numéro est généré automatiquement après enregistrement.
        </p>
      </div>

      <QuoteForm clients={clients ?? []} action={createQuoteAction} submitLabel="Créer le devis" />
    </div>
  );
}
